package app

import (
	"database/sql"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	_ "modernc.org/sqlite"
)

func TestInitializeAndVoteActivity(t *testing.T) {
	db, err := sql.Open("sqlite", "file:"+t.TempDir()+"/test.sqlite")
	if err != nil {
		t.Fatal(err)
	}
	defer db.Close()
	if err := InitializeDatabase(db); err != nil {
		t.Fatal(err)
	}
	handler := NewHandler(db, t.TempDir())

	seed := `{"seed":{"family":[{"id":"segocanyon","title":"Sego Canyon","notes":"Rock art"}]}}`
	request := httptest.NewRequest(http.MethodPost, "/api/initialize", strings.NewReader(seed))
	response := httptest.NewRecorder()
	handler.ServeHTTP(response, request)
	if response.Code != http.StatusOK {
		t.Fatalf("initialize status = %d, want %d: %s", response.Code, http.StatusOK, response.Body.String())
	}

	request = httptest.NewRequest(http.MethodPost, "/api/activities/segocanyon/vote", nil)
	response = httptest.NewRecorder()
	handler.ServeHTTP(response, request)
	if response.Code != http.StatusOK {
		t.Fatalf("vote status = %d, want %d: %s", response.Code, http.StatusOK, response.Body.String())
	}
	if !strings.Contains(response.Body.String(), `"votes":1`) {
		t.Fatalf("vote response should contain one vote, got %s", response.Body.String())
	}
}
