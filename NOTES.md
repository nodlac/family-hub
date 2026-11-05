# Family Hub — Notes

## Direction
- Family Hub is the larger private, invite-only family app.
- Adventure Pinboard is the first feature/subsection; it is not a standalone poll app.
- A pin has **Where**, **When**, **Who**, and **What to do there**.
- Members can add a **+1** to show interest. Decide later whether a member can +1 once or multiple times; current local prototype counts each click.
- Separate pinboards should be available to separate family groups. Pinboard data is visible only to its group.

## Stretch goal
- Theme-based trip generator (e.g. beach, national park, camping, museum, easy day trip).
- Generate a draft pin; let someone review it and choose whether to save it.
- Validate generated destination, season, access, reservations, and safety details. Keep this out of the initial scope.

## Tech and security
- Go API, Caddy reverse proxy, Keycloak OIDC with Google sign-in, future iOS client using PKCE.
- Current Go/SQLite prototype is localhost-only and has no authentication. Do not expose it over Caddy/network yet.
- Keycloak needs PostgreSQL in production. Decide whether the app should also move from SQLite to PostgreSQL before family rollout; if using one PostgreSQL service, keep separate databases and roles.
- Invite approval and group membership must be enforced by the API; Google login alone is not authorization.
- Decide whether IP restriction applies to the full app or only admin access. A home-IP-only rule can block mobile/out-of-home family use; consider Tailscale/WireGuard.
- Services should start automatically on reboot. Use persistent storage, health checks, encrypted off-host backups, and tested restores.

## Content TODO
- Add useful official/access/safety/reservation links to pins later.
- Verify activity details and route access before planning trips.
