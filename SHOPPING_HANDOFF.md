# Shopping service deployment / reverse-proxy handoff

## Purpose
Temporary standalone shopping page at **shopping.nodlac.com**, implemented inside Family Hub's existing Go module. SQLite is the source of truth; later Family Hub can reuse the schema and handlers. No changes to the notes repository or Work Notes.

## Build and run
From repository root:
```sh
go test ./...
go build -o shopping ./cmd/shopping
mkdir -p /srv/shopping/data
SHOPPING_ADDR=127.0.0.1:8097 SHOPPING_DB=/srv/shopping/data/shopping.db ./shopping
```
For Docker, bind a persistent volume for the DB and set SHOPPING_ADDR=0.0.0.0:8097 **only on a private Docker network**, never publish the service directly to the internet.

## Reverse proxy agent tasks
1. Point DNS for shopping.nodlac.com to the existing Cloudflare Tunnel / Caddy setup; use existing patterns and avoid modifying secrets or .env files.
2. Proxy to the shopping service at port 8097, keeping it private behind Caddy/Tunnel.
3. **REQUIRED before public exposure:** enforce authenticated access (Cloudflare Access or equivalent) for all paths, including POST endpoints. Restrict to approved household identities. Do not rely on obscurity or the built-in origin check.
4. Preserve Host and HTTPS forwarding. Test GET /, POST /items, toggle, delete, and GET /healthz.
5. Ensure SQLite file directory is writable by the service user and persists across deployments. Back up the database using SQLite online backup, not unsafe live file copying.
6. Test authentication bypass attempts and confirm unauthorized POST requests are blocked. Restrict /healthz to internal access if desired.
7. Record deployment details and rollback instructions in the infrastructure repository, without committing credentials.

## Existing list migration
After first startup, insert the current GitHub list entries **once**, using sqlite3 against the stopped service or a migration tool:
```sql
INSERT INTO items(name,quantity,done) SELECT 'Salt',1,0 WHERE NOT EXISTS(SELECT 1 FROM items WHERE lower(name)='salt');
INSERT INTO items(name,quantity,done) SELECT 'Pectin',1,0 WHERE NOT EXISTS(SELECT 1 FROM items WHERE lower(name)='pectin');
```
Do not delete or modify the original GitHub shopping-list.md automatically.

## Follow-on integration
Add API authentication and a stable JSON endpoint for future ChatGPT/agent access; the current endpoints are HTML/HTMX only. Add multi-user/list support and a schema migration strategy before merging into the full Family Hub UI.

## Current limitations
Not deployed; DNS, reverse proxy, authentication and data migration are pending. HTMX currently loads from a pinned CDN URL, so self-host it if offline use or tighter CSP is desired.
