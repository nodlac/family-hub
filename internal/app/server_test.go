package app

import (
	"database/sql"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	_ "modernc.org/sqlite"
)

func openTestDB(t *testing.T) *sql.DB {
	t.Helper()
	db, err := sql.Open("sqlite", "file:"+t.TempDir()+"/test.sqlite")
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { _ = db.Close() })
	return db
}

func TestInitializeAndPlusPin(t *testing.T) {
	db := openTestDB(t)
	if err := InitializeDatabase(db); err != nil {
		t.Fatal(err)
	}
	handler := NewHandler(db, t.TempDir())

	seed := `{"pins":[{"id":"segocanyon","title":"Sego Canyon","where":"Thompson Springs","when":"Spring/Fall","who":"Family","what":"See the rock art"}]}`
	request := httptest.NewRequest(http.MethodPost, "/api/initialize", strings.NewReader(seed))
	response := httptest.NewRecorder()
	handler.ServeHTTP(response, request)
	if response.Code != http.StatusOK {
		t.Fatalf("initialize status = %d, want %d: %s", response.Code, http.StatusOK, response.Body.String())
	}

	request = httptest.NewRequest(http.MethodPost, "/api/pins/segocanyon/plus", nil)
	response = httptest.NewRecorder()
	handler.ServeHTTP(response, request)
	if response.Code != http.StatusOK {
		t.Fatalf("plus status = %d, want %d: %s", response.Code, http.StatusOK, response.Body.String())
	}
	if !strings.Contains(response.Body.String(), `"pluses":1`) {
		t.Fatalf("plus response should contain one plus, got %s", response.Body.String())
	}
}

func TestMigrateActivitiesToPins(t *testing.T) {
	db := openTestDB(t)
	_, err := db.Exec(`CREATE TABLE activities (
		id TEXT PRIMARY KEY, category TEXT NOT NULL, title TEXT NOT NULL,
		details TEXT NOT NULL, completed INTEGER NOT NULL DEFAULT 0,
		votes INTEGER NOT NULL DEFAULT 0,
		created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
	)`)
	if err != nil {
		t.Fatal(err)
	}
	_, err = db.Exec(`INSERT INTO activities (id, category, title, details, votes)
		VALUES ('segocanyon', 'family', 'Sego Canyon',
		'{"location":"Thompson Springs","season":"Spring/Fall","time":"Half Day","notes":"See rock art"}', 2)`)
	if err != nil {
		t.Fatal(err)
	}
	if err := InitializeDatabase(db); err != nil {
		t.Fatal(err)
	}

	server := &Server{db: db}
	pin, err := server.getPin("segocanyon")
	if err != nil {
		t.Fatal(err)
	}
	if pin.Where != "Thompson Springs" || pin.When != "Spring/Fall · Half Day" || pin.What != "See rock art" || pin.Pluses != 2 {
		t.Fatalf("legacy activity was not migrated as expected: %+v", pin)
	}
}
