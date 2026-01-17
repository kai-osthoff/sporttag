# Phase 9: Update Notification - Context

**Gathered:** 2026-01-17
**Status:** Ready for planning

<domain>
## Phase Boundary

In-app notification when a newer version exists on GitHub Releases. Users see a non-blocking banner, can dismiss it (returns next launch), and click through to the releases page. No auto-update, no background downloads.

</domain>

<decisions>
## Implementation Decisions

### Version check timing
- Check on app launch only (no periodic checks, no manual button)
- Non-blocking: app loads immediately, banner appears after check completes in background
- Use GitHub Releases API: `api.github.com/repos/kai-osthoff/sporttag/releases/latest`
- Semantic version comparison (parse major.minor.patch, compare properly)

### Banner appearance
- Full-width banner at top of page, pushes content down
- Version-specific message: "Version X.Y.Z ist verfuegbar"
- Minimal text, no inline instructions — link leads to details
- Position: topmost element when visible

### User interaction
- Link opens GitHub Releases page in browser (not direct download)
- Dismissable with X button
- Dismiss state: React state only (no persistence)
- After dismiss: banner reappears on next app launch (session-scoped)

### Network behavior
- Show error banner if API check fails: "Konnte nicht nach Updates pruefen"
- Error banner dismissable same as update banner
- No caching — always check API fresh on launch

### Claude's Discretion
- Banner color/style (match existing app design)
- API request timeout value
- Exact German wording refinements
- Loading state (if any) during check

</decisions>

<specifics>
## Specific Ideas

- Keep it simple: one check, one banner, one action
- Teachers don't need technical details — just "update available, click here"
- Error state is informational, not alarming (they can continue using the app)

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 09-update-notification*
*Context gathered: 2026-01-17*
