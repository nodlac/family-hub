# Family Hub

A family app in development. Its first feature is the **Adventure Bucket List**: a Salt Lake City-area list of family trips, national parks, and off-road adventures.

The long-term plan is an invite-only app with multiple groups and group-specific lists, shared voting rounds, Keycloak sign-in, a Go API, and a future iOS client. See [PLAN.md](PLAN.md) for the project plan and [NOTES.md](NOTES.md) for working notes.

## Current prototype

The current version is a local Go/SQLite prototype. It has activity cards, categories, voting, completion tracking, and the ability to add or generate activities.

Requires Go 1.22 or later:

```bash
go run ./cmd/family-hub
```

Then open <http://127.0.0.1:8000>. The SQLite database is created as `adventure-bucket-list.sqlite3` in this directory. Set `DB_PATH` to change its location or `LISTEN_ADDR` to change the listening address.

**Security:** this prototype has no authentication or authorization and is not ready to expose to the internet or family members over a network. The API allows local users to add activities, vote, and change completion status. It listens on localhost by default; keep it there until authentication and API authorization are implemented.

## Adventure safety

Verify current land access, closures, permits, weather, and route conditions before visiting or riding. Motorcycle suggestions are intended for dirt/adventure bikes on legal dirt roads and trails, rather than paved-road touring.
