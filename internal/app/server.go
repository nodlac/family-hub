package app

import (
	"crypto/rand"
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"path/filepath"
	"regexp"
	"strings"
)

var validCategories = map[string]bool{
	"family": true, "parks": true, "motoDay": true, "motoOvernight": true,
}

var slugPattern = regexp.MustCompile(`[^a-z0-9]+`)

type Server struct {
	db        *sql.DB
	staticDir string
}

func InitializeDatabase(db *sql.DB) error {
	_, err := db.Exec(`CREATE TABLE IF NOT EXISTS activities (
		id TEXT PRIMARY KEY,
		category TEXT NOT NULL,
		title TEXT NOT NULL,
		details TEXT NOT NULL DEFAULT '{}',
		completed INTEGER NOT NULL DEFAULT 0,
		votes INTEGER NOT NULL DEFAULT 0,
		created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
	)`)
	return err
}

func NewHandler(db *sql.DB, staticDir string) http.Handler {
	s := &Server{db: db, staticDir: staticDir}
	mux := http.NewServeMux()
	mux.HandleFunc("GET /api/activities", s.listActivities)
	mux.HandleFunc("POST /api/initialize", s.initializeActivities)
	mux.HandleFunc("POST /api/activities", s.createActivity)
	mux.HandleFunc("POST /api/activities/{id}/{action}", s.updateActivity)
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

func (s *Server) listActivities(w http.ResponseWriter, _ *http.Request) {
	items, err := s.getActivities()
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Could not load activities.")
		return
	}
	writeJSON(w, http.StatusOK, items)
}

func (s *Server) initializeActivities(w http.ResponseWriter, r *http.Request) {
	var payload struct {
		Seed map[string][]map[string]any `json:"seed"`
	}
	if err := decodeJSON(w, r, &payload); err != nil {
		writeError(w, http.StatusBadRequest, "Invalid JSON request.")
		return
	}

	tx, err := s.db.Begin()
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Could not initialize activities.")
		return
	}
	defer tx.Rollback()

	for category, items := range payload.Seed {
		if !validCategories[category] {
			continue
		}
		for _, item := range items {
			id, _ := item["id"].(string)
			title, _ := item["title"].(string)
			if id == "" || title == "" {
				writeError(w, http.StatusBadRequest, "Seed activities need an id and title.")
				return
			}
			details := activityDetails(item)
			encoded, err := json.Marshal(details)
			if err != nil {
				writeError(w, http.StatusBadRequest, "Invalid activity details.")
				return
			}
			if _, err := tx.Exec(`INSERT OR IGNORE INTO activities (id, category, title, details) VALUES (?, ?, ?, ?)`, id, category, title, string(encoded)); err != nil {
				writeError(w, http.StatusInternalServerError, "Could not save seed activities.")
				return
			}
		}
	}
	if err := tx.Commit(); err != nil {
		writeError(w, http.StatusInternalServerError, "Could not initialize activities.")
		return
	}

	items, err := s.getActivities()
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Could not load activities.")
		return
	}
	writeJSON(w, http.StatusOK, items)
}

func (s *Server) createActivity(w http.ResponseWriter, r *http.Request) {
	var item map[string]any
	if err := decodeJSON(w, r, &item); err != nil {
		writeError(w, http.StatusBadRequest, "Invalid JSON request.")
		return
	}
	category, _ := item["category"].(string)
	title, _ := item["title"].(string)
	notes, _ := item["notes"].(string)
	title = strings.TrimSpace(title)
	notes = strings.TrimSpace(notes)
	if !validCategories[category] {
		writeError(w, http.StatusBadRequest, "Choose a valid activity category.")
		return
	}
	if title == "" || notes == "" {
		writeError(w, http.StatusBadRequest, "An activity name and notes are required.")
		return
	}
	if len(title) > 120 || len(notes) > 1000 {
		writeError(w, http.StatusBadRequest, "Activity name or notes are too long.")
		return
	}

	id := makeID(title)
	details := activityDetails(item)
	encoded, err := json.Marshal(details)
	if err != nil {
		writeError(w, http.StatusBadRequest, "Invalid activity details.")
		return
	}
	if _, err := s.db.Exec(`INSERT INTO activities (id, category, title, details) VALUES (?, ?, ?, ?)`, id, category, title, string(encoded)); err != nil {
		writeError(w, http.StatusInternalServerError, "Could not save activity.")
		return
	}
	created, err := s.getActivity(id)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Could not load the saved activity.")
		return
	}
	writeJSON(w, http.StatusCreated, created)
}

func (s *Server) updateActivity(w http.ResponseWriter, r *http.Request) {
	id, action := r.PathValue("id"), r.PathValue("action")
	var result sql.Result
	var err error
	switch action {
	case "vote":
		result, err = s.db.Exec(`UPDATE activities SET votes = votes + 1 WHERE id = ?`, id)
	case "complete":
		result, err = s.db.Exec(`UPDATE activities SET completed = CASE completed WHEN 0 THEN 1 ELSE 0 END WHERE id = ?`, id)
	default:
		writeError(w, http.StatusNotFound, "Not found.")
		return
	}
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Could not update activity.")
		return
	}
	rows, err := result.RowsAffected()
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Could not update activity.")
		return
	}
	if rows == 0 {
		writeError(w, http.StatusNotFound, "Activity not found.")
		return
	}
	updated, err := s.getActivity(id)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Could not load the updated activity.")
		return
	}
	writeJSON(w, http.StatusOK, updated)
}

func (s *Server) getActivities() ([]map[string]any, error) {
	rows, err := s.db.Query(`SELECT id, category, title, details, completed, votes FROM activities ORDER BY created_at, rowid`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	items := make([]map[string]any, 0)
	for rows.Next() {
		item, err := scanActivity(rows)
		if err != nil {
			return nil, err
		}
		items = append(items, item)
	}
	return items, rows.Err()
}

func (s *Server) getActivity(id string) (map[string]any, error) {
	row := s.db.QueryRow(`SELECT id, category, title, details, completed, votes FROM activities WHERE id = ?`, id)
	return scanActivity(row)
}

type rowScanner interface {
	Scan(dest ...any) error
}

func scanActivity(row rowScanner) (map[string]any, error) {
	var id, category, title, detailsJSON string
	var completed, votes int
	if err := row.Scan(&id, &category, &title, &detailsJSON, &completed, &votes); err != nil {
		return nil, err
	}
	var item map[string]any
	if err := json.Unmarshal([]byte(detailsJSON), &item); err != nil {
		return nil, fmt.Errorf("decode activity details: %w", err)
	}
	item["id"] = id
	item["category"] = category
	item["title"] = title
	item["completed"] = completed != 0
	item["votes"] = votes
	return item, nil
}

func activityDetails(item map[string]any) map[string]any {
	details := make(map[string]any, len(item))
	for key, value := range item {
		switch key {
		case "id", "category", "title", "completed", "votes":
			continue
		default:
			details[key] = value
		}
	}
	return details
}

func makeID(title string) string {
	slug := strings.Trim(slugPattern.ReplaceAllString(strings.ToLower(title), "-"), "-")
	if len(slug) > 48 {
		slug = strings.Trim(slug[:48], "-")
	}
	if slug == "" {
		slug = "activity"
	}
	var random [4]byte
	if _, err := rand.Read(random[:]); err != nil {
		return slug + "-activity"
	}
	return fmt.Sprintf("%s-%x", slug, random)
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
