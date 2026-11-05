# Family Hub — Plan

## Product direction

Family Hub is the broader invite-only app. **Adventure Pinboard** is its first feature, not a separate voting or bucket-list product. The goal is to make family ideas easy to save and discuss.

Each pin answers:
- **Where**: place, area, or route.
- **When**: a date, season, or best time to go.
- **Who**: the people interested or invited.
- **What to do there**: activities, notes, and eventually useful links.

A member can add a **+1** to show interest. The current local prototype counts every click; once accounts exist, decide whether each member can +1 a pin once or whether repeated +1s are intentional. No voting rounds, rankings, completion tracking, or itinerary workflow are needed for the initial feature.

Support separate pinboards for separate groups in the larger Family Hub. Pins and +1s are visible to that board's members, not to the public internet.

## Current prototype

- Static HTML/CSS/JavaScript pinboard UI.
- Go `net/http` API and SQLite storage.
- Starter adventure ideas are seeded into the board the first time the UI loads.
- The previous activity-list SQLite data is migrated to pins on startup.
- The API listens on `127.0.0.1:8000` by default.
- There is no authentication or authorization yet. Do not expose the prototype through Caddy or to family members over a network.

## Stretch goal: themed trip generator

Add a generator that takes a theme—such as beach, national park, camping, museum, or easy day trip—and suggests a family trip. The generated suggestion should be reviewable as a pin with Where, When, Who, and What to do there, then added to the board only when a family member chooses to save it.

Keep this as a stretch goal. Begin with curated suggestions or a simple rule-based generator; consider an external data/AI service only if it adds real value. Generated destination, access, safety, season, and reservation details must be checked before treating them as reliable.

## Architecture

```text
Web app (later iOS app) ── HTTPS via Caddy ── Go API ── App database
                                                   │
                                                   └── Keycloak (OIDC) ── PostgreSQL
                                                        └── Google sign-in
```

- **Caddy:** HTTPS and reverse proxy; apply the chosen network/IP restrictions.
- **Go API:** serves the app, owns pin data, +1 behavior, group access checks, and app authorization.
- **Keycloak:** self-hosted identity provider; Google is an upstream sign-in option.
- **PostgreSQL:** production database for Keycloak. Before family deployment, decide whether the app moves from SQLite to PostgreSQL too. If both use PostgreSQL, use separate databases and least-privilege roles.
- **iOS:** a later client that calls the same API and uses OIDC Authorization Code with PKCE.

## Authentication, groups, and access

1. Choose stable HTTPS hostnames and confirm family members can reach them.
2. Configure Caddy to proxy the app and Keycloak; configure Keycloak's external hostname and trusted proxy headers for the deployed version.
3. Create a dedicated Keycloak realm for Family Hub; do not use the `master` realm for application users.
4. Configure Google as a Keycloak identity provider. Google needs Keycloak's broker callback URL, similar to `https://auth.example.net/realms/<realm>/broker/google/endpoint`.
5. Make access invite-only. Google sign-in alone must not grant app access; the API must check group membership on every protected request.
6. Use a server-side OIDC/session flow for the web app, with `Secure` and `HttpOnly` cookies and CSRF protection for state-changing requests. Use a separate iOS client with PKCE later.
7. Identify users by the stable OIDC subject (`sub`), not email as a permanent identifier.

### Network restriction

Decide whether the IP restriction applies to the entire app or only administration. A single-home-IP restriction can block family members on cellular or at other homes, and residential IPs can change. Restricting admin access by IP/VPN while keeping the family app invite-only is usually more compatible with future iOS use. Tailscale/WireGuard is another option for keeping all family access private.

## Initial data model

Keep it small for the first feature:
- `users`: OIDC issuer/subject and profile information.
- `groups` and `group_memberships`: group membership and role.
- `pinboards`: group-owned board metadata.
- `pins`: board, title, where, when, who, what, timestamps.
- `pin_pluses`: pin and member, if the decided rule is one +1 per person.

The API must scope every pinboard query by the authenticated user's membership. A board ID from the client does not establish access.

## Data and backups

- Keycloak must use a supported production database such as PostgreSQL; SQLite is not a supported production Keycloak database.
- The current Go prototype uses SQLite, suitable for one local API instance and modest write volume. It migrates the old activity records into a new pins table without discarding their text or count.
- For the homelab deployment, PostgreSQL for the app as well as Keycloak is a reasonable default, with separate database names and roles. Retaining SQLite for the app is also possible for one API instance, but use SQLite's online backup mechanism or a tool such as Litestream; do not blindly copy a live WAL database file.
- Back up database data, Keycloak configuration, Caddy/app configuration, and required secrets. Use encrypted off-host backups (for example Restic or Borg), set retention, and test restoration.

## Homelab operations and security

- Start Caddy, Keycloak, database, and app automatically after host reboot using systemd or Docker Compose restart policies.
- Use persistent volumes, health checks, and application retry behavior; container start order alone does not guarantee database readiness.
- Pin service versions, keep secrets out of Git and clients, use strong admin credentials/MFA, and limit exposed ports.
- Test a complete reboot and a backup restore before inviting family members.
- The current prototype has no auth: keep its default localhost binding until authentication and API authorization are implemented.

## Implementation order

1. Finish the pinboard experience: Where/When/Who/What fields, add a pin, list pins, and +1. Keep the initial interface simple and mobile-friendly.
2. Finalize +1 semantics and which family groups/boards are needed.
3. Inventory the homelab, Caddy, DNS, service manager, storage, and desired IP/VPN access.
4. Set up persistent Keycloak + PostgreSQL behind Caddy, configure Google sign-in, and establish invite-only family access.
5. Add user/group/board authorization and persistent member-aware +1s to the Go API. Replace SQLite with PostgreSQL if selected for family deployment.
6. Configure automatic service startup, encrypted off-host backups, restore tests, and reboot tests.
7. Integrate the pinboard into the broader Family Hub navigation; build an iOS client later against the same API.
8. Stretch goal: add the themed trip generator, then let users save a reviewed suggestion as a pin.

## Explicitly deferred

- Poll rounds, rankings, trip scheduling, and completed-trip workflows.
- Public, unauthenticated boards or results.
- A native iOS app until the API and access model are ready.
- The themed trip generator until the basic pinboard, groups, and authentication work.
- Fully editable trip-planning links and external data integration; links can be added to pin content as a later improvement.
