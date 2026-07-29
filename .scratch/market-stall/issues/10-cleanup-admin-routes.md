# 10 — Cleanup Admin Routes

**What to build:** The old `/admin` sidebar layout and redundant routing are removed, leaving a clean, single-user mobile architecture.

**Blocked by:** 09-mobile-dashboard

**Status:** ready-for-agent

- [ ] The `src/app/admin/layout.tsx` file (desktop sidebar) is deleted.
- [ ] Any old dashboard pages that are no longer used are safely removed.
- [ ] The application relies entirely on the unified mobile shell for navigation.
