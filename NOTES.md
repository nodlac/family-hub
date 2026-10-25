# Family App — Product & Homelab Notes

## Product scope

Build a private, invite-only family app. The Adventure Bucket List is one feature/subsection of the larger app, not a standalone site.

### Groups and lists
- Support multiple groups within the app (for example, different branches of the family or activity groups).
- A user can belong to more than one group.
- Each group can have separate lists; lists and their content are only visible to that group's members.
- Decide whether group admins can invite/remove members and manage lists; ordinary members can participate.

### Adventure bucket list / voting
- Trips/activities belong to a list.
- Each list can have voting rounds/polls.
- Each round has a set of "on deck" activities available to vote on, a start/end or open/closed state, and shared results.
- Votes are shared and visible to members of that list/group (not publicly available on the internet unless explicitly changed later).
- Decide whether each member gets one vote per activity, a limited number of votes per round, or ranked-choice voting.
- After a round, allow a result to be selected/planned and retain an archive of previous rounds and results.
- Add links to activities later. TODO: add useful official/access/safety links for each destination.
- Keep trip descriptions in the app initially; consider editing them through the app later.

## Authentication and access
- Use Keycloak as the self-hosted identity provider, with Google sign-in as an option.
- App access is invite-only. Google sign-in alone must not grant access: the API must check the user's group membership/invitation.
- Use Keycloak OIDC. Web app/API: prefer a backend-for-frontend session with Secure, HttpOnly cookies. Future iOS client: Authorization Code + PKCE.
- The API owns authorization and data access; clients must not connect directly to the database.
- Restrict access by IP as requested. Revisit this for family mobile use: public IPs can change, and cellular networks will not match a home-IP allowlist. Consider restricting the Keycloak admin interface by IP/VPN while using authenticated, invite-only access for family members, or use Tailscale/WireGuard for the whole app.

## Hosting and service reliability
- Caddy, Keycloak, the database, and the app/API must start automatically after server boot/restart.
- Use systemd-managed Docker/Compose services, restart policies, persistent volumes, and health checks. Verify Docker itself is enabled at boot.
- Use Caddy for HTTPS and reverse proxying; configure Keycloak's external hostname and trusted proxy headers correctly.
- Keep secrets out of the repository. Pin service image versions and document upgrade/rollback steps.
- Test a full server reboot and confirm services recover without manual intervention.

## Backend and database decisions
- Use Go for the app API. Keep Caddy and Keycloak as separate services; use a maintained OIDC/JWT library rather than implementing OAuth yourself.
- The current local prototype uses SQLite via the pure-Go `modernc.org/sqlite` driver.
- Keycloak must use a supported production database such as PostgreSQL. Do **not** use Keycloak's development/in-memory database or SQLite for production Keycloak.
- Before family deployment, decide whether the app moves to PostgreSQL too. PostgreSQL for both services is operationally simple, with separate databases and roles. SQLite remains viable for one low-volume API instance, using its online backup mechanism instead of copying a live file blindly.
- Never have Keycloak and the app share database/schema credentials. Database data, secrets, Caddy config, and app configuration need separate backup consideration.

## Backup and recovery
- Back up database data, Keycloak configuration/realm exports, app configuration, Caddy configuration, and required secrets/restore instructions.
- Store encrypted backups off the homelab (and optionally on a separate local/NAS target); a backup on the same server alone is not sufficient.
- Possible tools: Restic or Borg for encrypted, deduplicated scheduled backups. For SQLite, use the SQLite backup API/CLI or a tool such as Litestream for replication. For PostgreSQL, use scheduled `pg_dump`; add WAL archiving/continuous recovery only if the recovery requirements justify it.
- Set a schedule and retention policy. Test restoring to a clean environment before relying on the backups.
- Record recovery goals: acceptable data loss (RPO) and time to restore (RTO).

## Suggested implementation order
1. Finalize group roles, who can invite members, voting rules, and whether results are visible to all group members.
2. Choose network access model (IP allowlist vs VPN/overlay network) and stable HTTPS hostnames.
3. Set up Caddy + Keycloak + PostgreSQL with persistent storage and automatic startup.
4. Configure Google identity provider, invite-only access, and a family-app realm/client.
5. Build the API and app data model: users, groups, memberships, lists, activities, rounds, votes, and results. Add database constraints for voting rules.
6. Add API authentication/authorization and the website login flow; replace localStorage-only votes/completions with API persistence.
7. Add backup automation, restore test, reboot test, and basic monitoring before family use.
8. Build the iOS client later against the same API and Keycloak realm using PKCE.
