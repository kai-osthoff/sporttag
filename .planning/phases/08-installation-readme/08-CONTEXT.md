# Phase 8: Installation + README - Context

**Gathered:** 2026-01-17
**Status:** Ready for planning

<domain>
## Phase Boundary

One-command installation experience for non-technical teachers. A curl command downloads, installs, and prepares the app. A German README explains everything clearly with screenshots.

</domain>

<decisions>
## Implementation Decisions

### Installer behavior
- Show progress output: 'Lade herunter...', 'Installiere...', 'Fertig!'
- Overwrite existing installation silently (simple update path)
- Auto-detect architecture (ARM vs Intel) using $(uname -m)
- Download correct DMG for detected architecture

### Gatekeeper handling
- xattr integrated into curl script (one command does everything)
- README includes detailed explanation of why xattr is needed (Gatekeeper, code signing, $99/year context)
- Show progress step: 'Sicherheitssperre wird entfernt...'

### README copy style
- Friendly informal Du-Form: warmherzig, einfach
- Step-by-step Terminal instructions with screenshots (Cmd+Space, Terminal, Enter)
- Brief intro section explaining what the app does (fare Zuteilung, Losverfahren)
- All German: code comments, output messages, everything

### Post-install experience
- Auto-open app after installation
- Auto-cleanup: delete temp DMG after install
- Don't modify Dock (user can add manually)

### Claude's Discretion
- Exact error message wording for download/installation failures
- xattr failure handling (warn but continue vs fail)
- Final success message format

</decisions>

<specifics>
## Specific Ideas

- Target audience: German teachers with no Terminal experience
- Should feel like "Ein Befehl — fertig!" simplicity
- README explains the $99/year code signing cost context for transparency
- Progress output gives confidence that something is happening

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 08-installation-readme*
*Context gathered: 2026-01-17*
