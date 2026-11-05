package app

import (
	"crypto/rand"
	"database/sql"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"path/filepath"
	"strings"
)

type Pin struct {
	ID     string `json:"id"`
	Title  string `json:"title"`
	Where  string `json:"where"`
	When   string `json:"when"`
	Who    string `json:"who"`
	What   string `json:"what"`
	Pluses int    `json:"pluses"`
}

type Server struct {
	db        *sql.DB
	staticDir string
}

func InitializeDatabase(db *sql.DB) error {
	if _, err := db.Exec(`CREATE TABLE IF NOT EXISTS pins (
		id TEXT PRIMARY KEY,
		title TEXT NOT NULL,
		where_text TEXT NOT NULL DEFAULT '',
		when_text TEXT NOT NULL DEFAULT '',
		who_text TEXT NOT NULL DEFAULT '',
		what_text TEXT NOT NULL DEFAULT '',
		pluses INTEGER NOT NULL DEFAULT 0,
		created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
	)`); err != nil {
		return err
	}

	var legacyTableExists bool
	if err := db.QueryRow(`SELECT EXISTS(SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = 'activities')`).Scan(&legacyTableExists); err != nil {
		return err
	}
	if legacyTableExists {
		_, err := db.Exec(`INSERT OR IGNORE INTO pins (id, title, where_text, when_text, who_text, what_text, pluses, created_at)
			SELECT id, title,
				COALESCE(json_extract(details, '$.location'), json_extract(details, '$.distance'), ''),
				trim(COALESCE(json_extract(details, '$.season'), '') ||
					CASE WHEN COALESCE(json_extract(details, '$.time'), '') = '' THEN ''
					ELSE ' · ' || json_extract(details, '$.time') END),
				'', COALESCE(json_extract(details, '$.notes'), ''), votes, created_at
			FROM activities`)
		if err != nil {
			return fmt.Errorf("migrate existing activities to pins: %w", err)
		}
	}
	return nil
}

func NewHandler(db *sql.DB, staticDir string) http.Handler {
	s := &Server{db: db, staticDir: staticDir}
	mux := http.NewServeMux()
	mux.HandleFunc("GET /api/pins", s.listPins)
	mux.HandleFunc("POST /api/initialize", s.initializePins)
	mux.HandleFunc("POST /api/pins", s.createPin)
	mux.HandleFunc("POST /api/pins/{id}/plus", s.plusPin)
	mux.HandleFunc("GET /", s.index)
	mux.Handle("GET /css/", http.StripPrefix("/css/", http.FileServer(http.Dir(filepath.Join(staticDir, "css")))))
	mux.Handle("GET /js/", http.StripPrefix("/js/", http.FileServer(http.Dir(filepath.Join(staticDir, "js")))))
	return mux
}

func (s *Server) index(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path != "/" {
		http.NotFound(w, r)
		return
	}
	http.ServeFile(w, r, filepath.Join(s.staticDir, "index.html"))
}

func (s *Server) listPins(w http.ResponseWriter, _ *http.Request) {
	pins, err := s.getPins()
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Could not load pins.")
		return
	}
	writeJSON(w, http.StatusOK, pins)
}

func (s *Server) initializePins(w http.ResponseWriter, r *http.Request) {
	var payload struct {
		Pins []Pin `json:"pins"`
	}
	if err := decodeJSON(w, r, &payload); err != nil {
		writeError(w, http.StatusBadRequest, "Invalid JSON request.")
		return
	}

	tx, err := s.db.Begin()
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Could not initialize pins.")
		return
	}
	defer tx.Rollback()

	for _, pin := range payload.Pins {
		pin.ID = strings.TrimSpace(pin.ID)
		pin.Title = strings.TrimSpace(pin.Title)
		if pin.ID == "" || pin.Title == "" {
			writeError(w, http.StatusBadRequest, "Seed pins need an id and title.")
			return
		}
		if _, err := tx.Exec(`INSERT OR IGNORE INTO pins (id, title, where_text, when_text, who_text, what_text)
			VALUES (?, ?, ?, ?, ?, ?)`, pin.ID, pin.Title, pin.Where, pin.When, pin.Who, pin.What); err != nil {
			writeError(w, http.StatusInternalServerError, "Could not save seed pins.")
			return
		}
	}
	if err := tx.Commit(); err != nil {
		writeError(w, http.StatusInternalServerError, "Could not initialize pins.")
		return
	}

	pins, err := s.getPins()
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Could not load pins.")
		return
	}
	writeJSON(w, http.StatusOK, pins)
}

func (s *Server) createPin(w http.ResponseWriter, r *http.Request) {
	var pin Pin
	if err := decodeJSON(w, r, &pin); err != nil {
		writeError(w, http.StatusBadRequest, "Invalid JSON request.")
		return
	}
	pin.Title = strings.TrimSpace(pin.Title)
	pin.Where = strings.TrimSpace(pin.Where)
	pin.When = strings.TrimSpace(pin.When)
	pin.Who = strings.TrimSpace(pin.Who)
	pin.What = strings.TrimSpace(pin.What)
	if pin.Title == "" {
		writeError(w, http.StatusBadRequest, "An activity or place name is required.")
		return
	}
	if len(pin.Title) > 120 || len(pin.Where) > 240 || len(pin.When) > 160 || len(pin.Who) > 200 || len(pin.What) > 1200 {
		writeError(w, http.StatusBadRequest, "One or more pin fields are too long.")
		return
	}
	var err error
	pin.ID, err = makeID()
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Could not create a pin ID.")
		return
	}
	if _, err := s.db.Exec(`INSERT INTO pins (id, title, where_text, when_text, who_text, what_text)
		VALUES (?, ?, ?, ?, ?, ?)`, pin.ID, pin.Title, pin.Where, pin.When, pin.Who, pin.What); err != nil {
		writeError(w, http.StatusInternalServerError, "Could not save pin.")
		return
	}
	created, err := s.getPin(pin.ID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Could not load the saved pin.")
		return
	}
	writeJSON(w, http.StatusCreated, created)
}

func (s *Server) plusPin(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	result, err := s.db.Exec(`UPDATE pins SET pluses = pluses + 1 WHERE id = ?`, id)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Could not plus this pin.")
		return
	}
	rows, err := result.RowsAffected()
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Could not plus this pin.")
		return
	}
	if rows == 0 {
		writeError(w, http.StatusNotFound, "Pin not found.")
		return
	}
	pin, err := s.getPin(id)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Could not load the updated pin.")
		return
	}
	writeJSON(w, http.StatusOK, pin)
}

func (s *Server) getPins() ([]Pin, error) {
	rows, err := s.db.Query(`SELECT id, title, where_text, when_text, who_text, what_text, pluses
		FROM pins ORDER BY created_at DESC, rowid DESC`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	pins := make([]Pin, 0)
	for rows.Next() {
		var pin Pin
		if err := rows.Scan(&pin.ID, &pin.Title, &pin.Where, &pin.When, &pin.Who, &pin.What, &pin.Pluses); err != nil {
			return nil, err
		}
		pins = append(pins, pin)
	}
	return pins, rows.Err()
}

func (s *Server) getPin(id string) (Pin, error) {
	var pin Pin
	err := s.db.QueryRow(`SELECT id, title, where_text, when_text, who_text, what_text, pluses FROM pins WHERE id = ?`, id).
		Scan(&pin.ID, &pin.Title, &pin.Where, &pin.When, &pin.Who, &pin.What, &pin.Pluses)
	return pin, err
}

func makeID() (string, error) {
	var random [16]byte
	if _, err := rand.Read(random[:]); err != nil {
		return "", err
	}
	return "pin-" + hex.EncodeToString(random[:]), nil
}

func decodeJSON(w http.ResponseWriter, r *http.Request, target any) error {
	r.Body = http.MaxBytesReader(w, r.Body, 1_000_000)
	decoder := json.NewDecoder(r.Body)
	if err := decoder.Decode(target); err != nil {
		return err
	}
	if err := decoder.Decode(new(any)); !errors.Is(err, io.EOF) {
		return errors.New("request must contain a single JSON value")
	}
	return nil
}

func writeJSON(w http.ResponseWriter, status int, data any) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.Header().Set("Cache-Control", "no-store")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(data)
}

func writeError(w http.ResponseWriter, status int, message string) {
	writeJSON(w, status, map[string]string{"error": message})
}
