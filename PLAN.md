# Family App Plan

## Purpose

Build a private, invite-only family app that can grow over time. The first feature is an Adventure Bucket List with group-specific lists and shared voting rounds. The website and a future iOS app will use the same API and identity system.

This plan assumes “shared/public votes” means that results are visible to members of the relevant group, **not** that the polls are anonymously available to everyone on the internet.

## Product requirements

### Accounts, groups, and permissions
- Family members sign in with Google through Keycloak.
- Being able to sign in is not enough to use the app: an app administrator must invite/approve the person, and the API must verify their group membership.
- A person can belong to multiple groups.
- Each group has its own members, lists, and list activity. One group must not be able to read or modify another group's private data.
- Start with three roles:
  - **App admin:** manage app-level settings and groups.
  - **Group admin:** invite/remove group members and manage that group's lists and rounds.
  - **Member:** view group lists and participate in rounds.
- Decide whether group admins can be ordinary participants in votes (recommended: yes).

### Adventure Bucket List feature
- A group can have multiple lists (for example, family trips, motorcycle rides, or a particular event).
- Lists contain activities/destinations, initially entered as seed data and later editable through the app if desired.
- A list can run multiple voting rounds/polls.
- A round contains an “on deck” set of activities and has a lifecycle such as draft → open → closed → archived.
- Members can vote while a round is open. Results are shared with eligible members; closed rounds retain their results.
- Group/list administrators can create a round, select its on-deck activities, open/close it, and record the activity selected/planned.
- Keep past rounds and results rather than overwriting them.
- Add links to destinations later. TODO: add official park/land-management, access, reservation, road-condition, and safety links as applicable.

### Voting rule to decide before implementation
Recommended simple first version: **each member chooses one activity per open round**. The API enforces one vote per member per round; members can change that choice until the round closes. If instead people should vote for multiple activities, choose a maximum number per member and encode that limit in the API/database. Do not leave the rule implicit.

## Architecture

```text
Web browser ─┐
             ├── HTTPS via Caddy ── App/API ── App database
Future iOS ──┘                       │
                                     └── Keycloak (OIDC) ── PostgreSQL
                                           └── Google sign-in
```

- **Caddy:** HTTPS, reverse proxy, and any agreed IP/network access restrictions.
- **Keycloak:** self-hosted OIDC identity provider; Google is an upstream sign-in option.
- **PostgreSQL:** production database for Keycloak. The app can use a separate PostgreSQL database/role, or SQLite if the single-instance/low-write tradeoff is deliberately chosen.
- **App/API:** owns the app's data and authorization. Clients never connect directly to either database.
- Keep services on a private server/container network where possible; expose only the required HTTPS endpoints.

## Authentication and network access

1. Choose stable HTTPS hostnames (for example `auth.example.net` and `app.example.net`) and confirm they resolve/reach the homelab as needed.
2. Configure Caddy to proxy the Keycloak hostname and app/API. Configure Keycloak's public hostname and trusted proxy headers correctly for the deployed version.
3. Create a dedicated Keycloak realm for the family app; do not use the `master` realm for application users.
4. Configure Google as a Keycloak identity provider. Register Keycloak's broker callback URL with Google; it will resemble:
   `https://auth.example.net/realms/<realm>/broker/google/endpoint`
5. Disable unrestricted app registration or otherwise enforce invitations. The API must check group membership on every protected operation; Google login alone must not grant app access.
6. For the web client, prefer an API/backend-for-frontend OIDC flow with a server-side session and `Secure`, `HttpOnly`, appropriately `SameSite` cookies. Protect state-changing cookie-authenticated requests against CSRF.
7. For the future iOS app, register a separate public OIDC client and use Authorization Code with PKCE. Do not embed a client secret in the app.
8. Validate issuer, signature, expiry, and audience/client claims server-side. Use the stable OIDC subject (`sub`) as the identity key, not email as the permanent identifier.

### IP restriction decision
The requested IP restriction needs a deliberate scope:
- Restricting **only administration** (Keycloak admin and app admin endpoints) by IP/VPN is compatible with family members using the app remotely.
- Restricting **the entire app/login service to one public IP** will prevent use from cellular networks and other homes, and residential IPs may change. That would conflict with convenient future iOS use.
- Alternatives for a private family service are an IP allowlist for administration plus invite-only app access, or a private VPN/overlay such as Tailscale/WireGuard for all app access.

Record which option is selected before opening the service to family members. Do not assume “Google sign-in” makes an otherwise public endpoint private.

## Data model (initial proposal)

Use database foreign keys and constraints so group isolation and voting rules are enforced below the UI.

- `users`: internal ID, OIDC issuer/subject, display name, email (profile/contact attribute).
- `groups`: name and metadata.
- `group_memberships`: group, user, role, status; unique group/user membership.
- `invitations`: group, inviter, invitation token hash, expiry, redemption/status (only if implementing in-app invitations).
- `lists`: owning group, name, description, visibility/settings.
- `activities`: list, title, notes, location/season/links and optional archive state.
- `rounds`: list, title, status, open/close timestamps, selected/planned activity.
- `round_activities`: activities placed “on deck” in a particular round.
- `votes`: round, user, chosen activity, timestamp. Add a uniqueness constraint for one vote per user per round if using the recommended voting rule.

All API queries must scope data by authenticated user membership in the relevant group. A client-provided group/list ID is not proof of access.

## Database choice and backups

### Recommendation
Use PostgreSQL for Keycloak; Keycloak's supported production database choices include PostgreSQL, and SQLite is not a supported production Keycloak database. Do not use its development/in-memory database for the family service.

For the app database:
- **Simplest overall operations:** use the same PostgreSQL server but create a separate database and least-privilege database role for the app. Keep Keycloak and app data/credentials separate. This gives one database service to secure, start, monitor, and back up.
- **SQLite is viable for the app** if it remains a single API instance with modest write concurrency. It can be easy to back up, but copying a live database file is not always a consistent backup (particularly with WAL mode). Use SQLite's online backup API/CLI or a tool such as Litestream. Moving to multiple app instances or higher concurrent writes is a reason to use PostgreSQL.

### Backup plan
- Back up PostgreSQL database contents (for example, scheduled `pg_dump` for Keycloak and the app databases), app data if SQLite is chosen, Keycloak realm/configuration, Caddy configuration, app configuration, and the secrets needed for recovery.
- Use an encrypted backup tool such as Restic or Borg. Store backups off the homelab, and optionally keep a separate local/NAS copy. A copy only on the same server does not protect against server or disk failure.
- Keep backup credentials/keys separate from the host being backed up. Protect secrets and database dumps as sensitive data.
- Set schedule and retention, then test restoring into a clean environment. A backup is not proven until restore has been tested.
- Define acceptable data loss (RPO) and recovery time (RTO). For an initial family app, daily database backups plus a restore test may be sufficient; tighten the schedule if needed.

## Homelab reliability and security

- Ensure the host's service manager starts Docker (if used) on boot. Set Caddy, Keycloak, PostgreSQL, and the app/API to start automatically after restart (systemd units or Compose restart policies such as `unless-stopped`).
- Use health checks and make the app/API retry database/Keycloak dependencies during startup; container start order alone does not guarantee a dependency is ready.
- Store database files and service state in persistent volumes, not disposable container filesystems.
- Pin stable service image versions and plan updates. Keep a rollback path and do not automatically adopt untested major upgrades.
- Use strong unique admin credentials, MFA for administrators where practical, least-privilege database users, and private networking between services.
- Keep OAuth client secrets, database passwords, signing/configuration secrets, and backup credentials out of Git and out of browser/mobile code.
- Limit Caddy exposure to required ports/services. Restrict administrative endpoints by IP/VPN if possible; log authentication/admin events without logging tokens or secrets.
- Test reboot recovery and backup restoration before relying on the platform.

## Implementation milestones and acceptance criteria

### Milestone 1 — Decisions and inventory
- [ ] Confirm group roles and invitation/approval process.
- [ ] Confirm one-vote-per-round rule (or selected alternative).
- [ ] Confirm whether results are visible to all members of the group (recommended) and how ties/round closure work.
- [ ] Decide IP restriction scope versus VPN/overlay access.
- [ ] Inventory current Caddy deployment, domain/DNS, Docker/systemd setup, storage, and backup destination.
- [ ] Choose PostgreSQL for both services or PostgreSQL for Keycloak plus SQLite for the app.

**Done when:** these decisions and hostnames are recorded before implementation.

### Milestone 2 — Reliable base services
- [ ] Set up persistent PostgreSQL for Keycloak; create separate credentials/databases for each application.
- [ ] Deploy a pinned Keycloak version with persistent configuration/state.
- [ ] Configure Caddy HTTPS/reverse proxy and Keycloak's external URL/proxy settings.
- [ ] Add automatic boot/restart behavior, health checks, and startup retries.
- [ ] Verify a full host reboot brings services back without manual steps.

**Done when:** Keycloak and its database survive a reboot and are reachable only over the intended network paths.

### Milestone 3 — Identity and membership
- [ ] Create the family-app realm and Google identity provider.
- [ ] Set up the web client and narrowly scoped redirect URLs.
- [ ] Disable open registration; create/approve a test family user.
- [ ] Implement API token/session verification and group membership checks.
- [ ] Verify a signed-in but uninvited user is denied by the API.

**Done when:** an invited user can sign in, an uninvited user cannot access app data, and identity/session behavior is verified server-side.

### Milestone 4 — App foundations and groups
- [ ] Create schema/migrations for users, groups, memberships, lists, activities, rounds, and votes.
- [ ] Implement group and list APIs with authorization checks on every operation.
- [ ] Add the web app shell as a subsection of the larger family app.
- [ ] Seed the current Adventure Bucket List activities.

**Done when:** members of one group cannot see or alter another group's lists by changing request IDs.

### Milestone 5 — Voting rounds
- [ ] Implement on-deck activity selection, draft/open/closed/archived round lifecycle, voting, result display, and selected/planned activity.
- [ ] Enforce vote limits and round state in the API and database, not just in the UI.
- [ ] Replace current browser-local votes/completion state with API persistence.
- [ ] Add clear loading, empty, error, and closed-round states.

**Done when:** votes are shared among authorized group members, vote rules cannot be bypassed with direct API requests, and old rounds/results remain available.

### Milestone 6 — Backups, operations, and family rollout
- [ ] Automate encrypted off-host backups with documented retention.
- [ ] Perform a restore test for the database, Keycloak configuration, app configuration, and Caddy configuration.
- [ ] Test boot recovery, dependency restart, expired sessions, loss of internet/Google availability, and Keycloak downtime.
- [ ] Review Caddy exposure, admin IP/VPN restriction, logs, updates, and secret handling.
- [ ] Add activity links later as a separate content task.

**Done when:** the service can be recovered from backup and family members can use it with the intended network restrictions.

### Milestone 7 — iOS client (later)
- [ ] Build a native iOS app using the existing API and a separate Keycloak OIDC client with PKCE.
- [ ] Reuse group/list/round authorization on the API; do not duplicate trust decisions in the app.
- [ ] Test sign-in, sign-out, token renewal, and account/group removal on device.

## Explicitly deferred

- Adding destination/official/safety links (recorded TODO above).
- Public internet access to polls or unauthenticated results.
- Editing all activity metadata in the app (unless desired during the first release).
- iOS app implementation until the API, identity, and web experience are established.
- High availability or multi-server deployment; this is initially a single homelab host, so backups and recovery are the priority.
