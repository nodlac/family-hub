# Family Hub

A private family app in development. The first feature is an **Adventure Pinboard**: each idea captures **where** to go, **when**, **who** is interested, and **what to do there**. Family members can add a `+1` to show interest.

The pinboard is intended to become a section of the larger Family Hub, with separate boards for family groups. The longer-term plan includes invite-only sign-in, group membership, and a possible theme-based trip generator. See [PLAN.md](PLAN.md) for scope and next steps.

## Run the local prototype

Requires Go 1.22 or later:

```bash
go run ./cmd/family-hub
```

Then open <http://127.0.0.1:8000>. Pins and +1 counts are stored in SQLite. The database defaults to `adventure-bucket-list.sqlite3` in the project directory; set `DB_PATH` to choose another location.

Existing SQLite databases from the earlier activity-list prototype are copied into the pinboard table automatically on startup. Existing activity notes become “What to do there,” location/distance becomes “Where,” and votes become +1 counts.

**Security:** this prototype has no authentication or authorization and is not ready to expose to the internet or family members over a network. It listens on localhost by default. Do not change that or expose it through Caddy until authentication and API authorization are implemented.

## Adventure safety

Verify current land access, closures, permits, weather, and route conditions before visiting or riding. The initial ideas include remote destinations and off-road routes; verify that a suggested activity is legal, suitable, and current before planning it.
