#!/usr/bin/env python3
"""Local web server and SQLite API for the Family Hub adventure bucket-list prototype."""
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import json
import re
import sqlite3
import uuid

ROOT = Path(__file__).resolve().parent
DB_PATH = ROOT / "adventure-bucket-list.sqlite3"
VALID_CATEGORIES = {"family", "parks", "motoDay", "motoOvernight"}


def connect():
    connection = sqlite3.connect(DB_PATH)
    connection.row_factory = sqlite3.Row
    return connection


def initialize_database():
    with connect() as db:
        db.execute("""CREATE TABLE IF NOT EXISTS activities (
            id TEXT PRIMARY KEY,
            category TEXT NOT NULL,
            title TEXT NOT NULL,
            details TEXT NOT NULL DEFAULT '{}',
            completed INTEGER NOT NULL DEFAULT 0,
            votes INTEGER NOT NULL DEFAULT 0,
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        )""")


def activity_from_row(row):
    item = json.loads(row["details"])
    item.update({"id": row["id"], "category": row["category"], "title": row["title"],
                 "completed": bool(row["completed"]), "votes": row["votes"]})
    return item


def get_activity(db, activity_id):
    row = db.execute("SELECT * FROM activities WHERE id = ?", (activity_id,)).fetchone()
    return activity_from_row(row) if row else None


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def send_json(self, data, status=200):
        body = json.dumps(data, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def read_json(self):
        length = int(self.headers.get("Content-Length", "0"))
        if length > 1_000_000:
            raise ValueError("Request is too large")
        return json.loads(self.rfile.read(length) or b"{}")

    def do_GET(self):
        if self.path == "/api/activities":
            with connect() as db:
                items = [activity_from_row(row) for row in db.execute("SELECT * FROM activities ORDER BY created_at, rowid")]
            return self.send_json(items)
        if self.path == "/":
            self.path = "/index.html"
        return super().do_GET()

    def do_POST(self):
        try:
            payload = self.read_json()
            if self.path == "/api/initialize":
                seed = payload.get("seed", {})
                with connect() as db:
                    for category, items in seed.items():
                        if category not in VALID_CATEGORIES:
                            continue
                        for item in items:
                            details = {key: value for key, value in item.items() if key not in {"id", "title"}}
                            db.execute("INSERT OR IGNORE INTO activities (id, category, title, details) VALUES (?, ?, ?, ?)",
                                       (str(item["id"]), category, str(item["title"]), json.dumps(details, ensure_ascii=False)))
                    result = [activity_from_row(row) for row in db.execute("SELECT * FROM activities ORDER BY created_at, rowid")]
                return self.send_json(result)

            if self.path == "/api/activities":
                category = payload.get("category")
                title = str(payload.get("title", "")).strip()
                notes = str(payload.get("notes", "")).strip()
                if category not in VALID_CATEGORIES:
                    return self.send_json({"error": "Choose a valid activity category."}, 400)
                if not title or not notes:
                    return self.send_json({"error": "An activity name and notes are required."}, 400)
                if len(title) > 120 or len(notes) > 1000:
                    return self.send_json({"error": "Activity name or notes are too long."}, 400)
                slug = re.sub(r"[^a-z0-9]+", "-", title.lower()).strip("-")[:48] or "activity"
                activity_id = slug + "-" + uuid.uuid4().hex[:8]
                details = {key: value for key, value in payload.items() if key not in {"id", "category", "title", "completed", "votes"}}
                with connect() as db:
                    db.execute("INSERT INTO activities (id, category, title, details) VALUES (?, ?, ?, ?)",
                               (activity_id, category, title, json.dumps(details, ensure_ascii=False)))
                    created = get_activity(db, activity_id)
                return self.send_json(created, 201)

            match = re.fullmatch(r"/api/activities/([^/]+)/(vote|complete)", self.path)
            if match:
                activity_id, action = match.groups()
                with connect() as db:
                    existing = get_activity(db, activity_id)
                    if existing is None:
                        return self.send_json({"error": "Activity not found."}, 404)
                    if action == "vote":
                        db.execute("UPDATE activities SET votes = votes + 1 WHERE id = ?", (activity_id,))
                    else:
                        db.execute("UPDATE activities SET completed = 1 - completed WHERE id = ?", (activity_id,))
                    updated = get_activity(db, activity_id)
                return self.send_json(updated)

            return self.send_json({"error": "Not found."}, 404)
        except (ValueError, KeyError, json.JSONDecodeError) as error:
            return self.send_json({"error": str(error) or "Invalid request."}, 400)

    def log_message(self, fmt, *args):
        print("%s - %s" % (self.address_string(), fmt % args))


if __name__ == "__main__":
    initialize_database()
    server = ThreadingHTTPServer(("127.0.0.1", 8000), Handler)
    print("Family Hub — Adventure Bucket List prototype: http://127.0.0.1:8000")
    print("SQLite database:", DB_PATH)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down")
        server.server_close()
