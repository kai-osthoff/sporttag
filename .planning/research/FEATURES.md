# Features Research: Sporttag Registration Platform

**Domain:** School event registration with capacity-limited lottery allocation
**Researched:** 2026-01-16 (v1.0), 2026-01-17 (v2.0 Desktop Distribution)
**Confidence:** MEDIUM (based on WebSearch findings from multiple sources, cross-verified patterns)

---

## v1.0 Features (Shipped)

### Table Stakes (Delivered)

| Feature | Status | Notes |
|---------|--------|-------|
| Student data entry (name, class) | Done | Teacher enters students |
| 3-priority selection | Done | Mandatory selection of exactly 3 events |
| Event listing with capacity display | Done | Event name, description, max capacity |
| Form validation | Done | All 3 priorities required, no duplicates |
| Confirmation feedback | Done | Success message post-submission |
| Random lottery mechanism | Done | Mulberry32 PRNG for reproducibility |
| Priority-respecting allocation | Done | Try 1st choice first, then 2nd, then 3rd |
| Capacity enforcement | Done | Hard limit per event |
| Unassigned student detection | Done | "Sonderliste" for students with all full choices |
| Event roster lists | Done | Per-event participant lists |
| Class lists | Done | Per-class assignment overview |
| Unassigned students list | Done | Sonderliste for manual handling |
| Export to CSV | Done | German UTF-8 BOM format |
| Print-friendly format | Done | A4 portrait, 1.5cm margins |
| Event management (CRUD) | Done | Create, edit, delete events |
| Run allocation button | Done | One-click allocation execution |
| Basic statistics | Done | 1./2./3. Wahl distribution |

### Differentiators (Delivered in v1.0)

| Feature | Status | Notes |
|---------|--------|-------|
| Re-run allocation | Done | Clear and re-allocate with new seed |
| Manual reassignment | Done | Admin assigns specific students manually |
| Fairness metrics display | Done | Show % got 1st/2nd/3rd choice |

---

## v2.0 Features: macOS Desktop Distribution

**Focus:** Packaging existing web app as native macOS desktop application for non-technical teacher users.

### Table Stakes

Features users expect. Missing = product feels incomplete or unprofessional.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **App icon in Dock** | Basic macOS app behavior - users expect to see the app in Dock when running | Low | Standard with Tauri/Electron |
| **App appears in /Applications** | Mac users install apps here; anything else feels "not a real app" | Low | DMG drag-and-drop handles this |
| **Window close (X) hides, Cmd+Q quits** | macOS convention: closing window != quitting app | Medium | Configure LSUIElement correctly |
| **Window state persistence** | App remembers size/position between launches | Low | Built into Tauri window config |
| **Standard menu bar** | File, Edit, Window, Help menus expected | Low | Default with desktop wrappers |
| **Retina display support** | Sharp text/icons on modern Macs | Low | Web content auto-scales |
| **Native file dialogs** | Save/Open dialogs should look native | Low | Tauri provides native dialogs |
| **App works offline** | No internet should not break core functionality | Low | Already works - SQLite local DB |
| **Code signed app** | No scary "unidentified developer" warnings | Medium | Requires Apple Developer Account ($99/year) |
| **Notarized app** | No "Apple couldn't verify" dialogs | Medium | Required for smooth first launch |
| **Data in ~/Library/Application Support/** | Standard location for app data on macOS | Low | Configure at build time |
| **Graceful first launch** | App opens directly to usable state, no setup wizard | Low | Existing app already does this |

**Sources:**
- [Apple Human Interface Guidelines - Designing for macOS](https://developer.apple.com/design/human-interface-guidelines/designing-for-macos)
- [Apple - Notarizing macOS software](https://developer.apple.com/documentation/security/notarizing-macos-software-before-distribution)

### Differentiators

Features that set product apart. Not expected, but valued.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **In-app update notification** | Teacher doesn't need to check GitHub manually | Medium | Check GitHub Releases API on launch |
| **One-click update download** | Opens browser to download new DMG | Low | Simple link to GitHub release |
| **Visual installation instructions in DMG** | Background image showing drag-to-Applications | Low | Standard DMG customization |
| **Automatic database migration** | App handles schema changes silently | Medium | Drizzle migrations on startup |
| **Data backup/export** | Teacher can backup their data before updates | Medium | Export SQLite file |
| **"Hilfe" menu with documentation link** | Quick access to README/docs | Low | Menu item linking to GitHub wiki |
| **German system integration** | Respects macOS language settings | Low | App already fully German |
| **Quick launch from Spotlight** | Type "Sporttag" to find app | Low | Automatic with /Applications install |

### Anti-Features for v2.0

Features to explicitly NOT build. Common mistakes in this domain.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **Automatic background updates** | Non-transparent; teachers want control; adds complexity | In-app notification + manual download |
| **Menu bar-only app** | Confusing for non-technical users; app needs visible window | Standard Dock app with window |
| **Auto-start on login** | Annoys users; app used once/year | Let teachers add to Login Items manually if desired |
| **Crash reporting telemetry** | Privacy concerns; German schools sensitive about data | None, or explicit opt-in only |
| **Cloud sync** | Adds complexity; data should stay local | Local SQLite only |
| **License key/activation** | Creates friction; app is free | No licensing |
| **Installer wizard (.pkg)** | Overkill for simple app; DMG drag-drop is friendlier | DMG with visual instructions |
| **Custom window chrome** | Looks non-native; confuses users | Use standard macOS title bar |
| **Multiple windows** | App is single-purpose; multiple windows add confusion | Single window app |
| **Touch Bar support** | Deprecated; not worth effort | Skip entirely |
| **System tray/menu bar icon** | App doesn't need persistent background presence | Dock icon only |
| **Windows/Linux in v2.0** | Splits focus; teachers have Macs | macOS-only, defer others |
| **Self-signed certificate** | Users see scary warnings; defeats purpose of "professional app" | Proper Apple Developer signing |

---

## First-Launch Experience

### What Users Expect

Based on [Apple Human Interface Guidelines - Launching](https://developers.apple.com/design/human-interface-guidelines/patterns/launching):

1. **Instant usability**: App opens to main screen, not a welcome wizard
2. **No permission dialogs** (unless absolutely necessary)
3. **No sign-in required**: Single-user local app
4. **State from previous session**: If app was open before, restore window position
5. **Quick win opportunity**: User can immediately start adding events

### Sporttag-Specific First Launch

For v2.0, the first launch should:
- Open to the main dashboard (same as current web app)
- Database created silently in ~/Library/Application Support/Sporttag/
- No onboarding tour needed (UI is self-explanatory)
- Window appears centered, reasonable default size (1024x768 or similar)

### What NOT to Do

- No "What's New" popup on first launch
- No tour/walkthrough (teachers discover by doing)
- No analytics opt-in dialog
- No "Rate this app" prompts

**Source:** [macOS User Onboarding Best Practices](https://screencharm.com/blog/user-onboarding-best-practices)

---

## Installation Experience

### The DMG Standard

[Standard macOS installation pattern](https://www.howtogeek.com/177619/how-to-install-applications-on-a-mac-everything-you-need-to-know/):

1. User downloads .dmg file
2. Double-click opens Finder window
3. Window shows: App icon + arrow + Applications folder alias
4. User drags app to Applications
5. User ejects DMG (optional)
6. User launches from /Applications or Spotlight

### For Non-Technical Teachers

The curl installation script (as specified in PROJECT.md) should:

```bash
# Example: curl -fsSL https://github.com/user/sporttag/releases/latest/download/install.sh | bash
```

What the script does:
1. Download latest .dmg from GitHub Releases
2. Mount DMG silently
3. Copy .app to /Applications (may need admin password)
4. Unmount DMG
5. Delete downloaded DMG
6. Print success message with "Open Sporttag from Applications or Spotlight"

### Gatekeeper Considerations

Without proper signing/notarization, users see:
- "Sporttag can't be opened because Apple cannot verify it"
- Requires System Settings > Privacy & Security > Open Anyway

**Recommendation**: Pay for Apple Developer Program ($99/year) to avoid this friction entirely. The target users (non-technical teachers) will be confused by security warnings.

**Sources:**
- [Tauri DMG Distribution](https://v2.tauri.app/distribute/dmg/)
- [Apple Developer ID](https://developer.apple.com/developer-id/)

---

## App Behavior Expectations

### Dock Behavior

- App icon appears in Dock when running
- Clicking Dock icon brings window to front
- Right-click Dock icon shows standard options (Options > Keep in Dock)
- Badge: Not needed (no notifications to show)

### Window Behavior

- Single window application
- Close button (red X) should hide window, not quit app (macOS convention)
- Cmd+Q quits the app
- Cmd+H hides the app
- Cmd+M minimizes to Dock
- Window position/size remembered between sessions
- Full screen support (green button works)

**Source:** [Apple Support - Manage windows on your Mac](https://support.apple.com/guide/mac-help/work-with-app-windows-mchlp2469/mac)

### Menu Bar

Standard macOS menu bar with:

| Menu | Items |
|------|-------|
| **Sporttag** | About Sporttag, Check for Updates..., Quit Sporttag |
| **File** | (empty or disabled - no file operations) |
| **Edit** | Undo, Redo, Cut, Copy, Paste, Select All |
| **View** | (optional: zoom controls) |
| **Window** | Minimize, Zoom, Close Window |
| **Hilfe** | Sporttag Hilfe (opens GitHub README) |

---

## Update Notification UX

### Non-Intrusive Pattern

Based on [Smashing Magazine - Notification UX Design](https://www.smashingmagazine.com/2025/07/design-guidelines-better-notifications-ux/):

1. **On app launch**: Check GitHub Releases API for newer version
2. **If update available**: Show subtle banner at top of app
   - "Version X.Y verfuegbar. [Jetzt herunterladen]"
   - Banner dismissible (X button)
   - Does NOT block app usage
3. **Click downloads**: Opens browser to GitHub release page
4. **User manually**: Downloads new DMG, drags to /Applications (overwrites)
5. **Restart app**: New version running

### What NOT to Do

- No modal dialogs blocking work
- No forced updates
- No auto-download in background
- No "Update now or later" nagging
- No badge count on Dock icon

### Update Check Frequency

- On app launch only (not periodically in background)
- Cache result for 24 hours (don't spam GitHub API)
- Graceful failure if offline (silently skip check)

**Source:** [Tauri Updater Plugin](https://v2.tauri.app/plugin/updater/)

---

## Data Persistence

### Location

```
~/Library/Application Support/Sporttag/
  sporttag.db          # SQLite database
  sporttag.db-wal      # WAL file (if using WAL mode)
  sporttag.db-shm      # Shared memory file
```

### Migration from Web App

If teachers used the web app locally (npm run dev), their data is in project directory:
- Provide migration: Copy sporttag.db from old location on first launch
- Or: Document manual migration in README

### Backup

Consider adding "Datenbank exportieren" menu item:
- Copies sporttag.db to user-chosen location
- Provides peace of mind before updates

---

## Feature Dependencies for v2.0

```
Code Signing ─────────────────────────────┐
                                          ▼
Notarization ──────────────────────► Smooth First Launch
                                          ▲
DMG with Visual Instructions ─────────────┘

GitHub Releases ──► Update Check ──► Update Notification Banner

Database in Application Support ──► Automatic Migration ──► Data Persistence
```

---

## MVP Recommendation for v2.0

### Must Have (Week 1-2)

1. **Tauri wrapper** packaging existing Next.js app
2. **Proper code signing** (Apple Developer Program)
3. **Notarization** (automated via CI)
4. **DMG with drag-to-Applications visual**
5. **Database in ~/Library/Application Support/**
6. **Single window, standard menu bar**
7. **curl install script**
8. **GitHub README with installation instructions**

### Should Have (Week 2-3)

9. **Update notification banner** (GitHub Releases API check)
10. **"Hilfe" menu item** linking to documentation
11. **Window state persistence**

### Defer to Post-v2.0

- Windows/Linux support
- Auto-updater (full Tauri updater plugin)
- Database backup UI
- Data migration from web app
- Localization beyond German

---

## Confidence Assessment

| Area | Confidence | Reason |
|------|------------|--------|
| Table stakes features | HIGH | Based on Apple HIG and standard macOS conventions |
| Installation experience | HIGH | DMG pattern is well-documented, curl scripts common |
| Update notification UX | MEDIUM | Pattern clear, implementation details vary |
| Code signing requirements | HIGH | Apple documentation explicit |
| Anti-features list | MEDIUM | Based on project scope, could be revisited |

---

## Sources

### Apple Official

- [Apple Human Interface Guidelines - Launching](https://developers.apple.com/design/human-interface-guidelines/patterns/launching)
- [Designing for macOS](https://developer.apple.com/design/human-interface-guidelines/designing-for-macos)
- [Notarizing macOS software](https://developer.apple.com/documentation/security/notarizing-macos-software-before-distribution)
- [Developer ID signing](https://developer.apple.com/developer-id/)
- [Apple Support - Manage windows](https://support.apple.com/guide/mac-help/work-with-app-windows-mchlp2469/mac)

### Framework Documentation

- [Tauri DMG Distribution](https://v2.tauri.app/distribute/dmg/)
- [Tauri macOS Code Signing](https://v2.tauri.app/distribute/sign/macos/)
- [Tauri Updater Plugin](https://v2.tauri.app/plugin/updater/)

### UX Research

- [Smashing Magazine - Notification UX Design](https://www.smashingmagazine.com/2025/07/design-guidelines-better-notifications-ux/)
- [macOS User Onboarding Best Practices](https://screencharm.com/blog/user-onboarding-best-practices)
- [How to Install Applications on Mac](https://www.howtogeek.com/177619/how-to-install-applications-on-a-mac-everything-you-need-to-know/)

### Comparison Resources

- [Tauri vs Electron 2025](https://www.raftlabs.com/blog/tauri-vs-electron-pros-cons/)
- [DoltHub - Electron vs Tauri](https://www.dolthub.com/blog/2025-11-13-electron-vs-tauri/)

---

## v1.0 Original Research (Reference)

### Registration & Data Input (v1.0)

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Student data entry** (name, class) | Core identification | Low | v1: Teacher enters; v2: Student self-entry |
| **3-priority selection** | Core requirement per spec | Low | Mandatory selection of exactly 3 events |
| **Event listing with capacity display** | Users need to see options and availability | Low | Show event name, description, max capacity |
| **Form validation** | Prevents incomplete/invalid submissions | Low | All 3 priorities required, no duplicates |
| **Confirmation feedback** | User needs to know submission succeeded | Low | Simple success message post-submission |
| **Edit/update before deadline** | Users make mistakes | Medium | Allow changes until registration closes |

**Source:** Event registration best practices from [Bizzabo](https://www.bizzabo.com/blog/event-registration-system-features-guide), [Sched](https://sched.com/blog/event-registration-software-for-schools-guide/)

### Allocation Engine (v1.0)

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Random lottery mechanism** | Fairness when demand exceeds capacity | Medium | Random ordering prevents gaming |
| **Priority-respecting allocation** | Core requirement - honor student preferences | Medium | Try 1st choice first, then 2nd, then 3rd |
| **Capacity enforcement** | Prevents overbooking | Low | Hard limit per event |
| **Unassigned student detection** | Critical edge case handling | Medium | Students where all 3 choices are full |

**Source:** [MIT ESP Lottery FAQ](https://esp.mit.edu/learn/lotteryFAQ.html), [Wikipedia - Fair Random Assignment](https://en.wikipedia.org/wiki/Fair_random_assignment), [Avela Match](https://avela.org/match)

### Output & Reporting (v1.0)

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Event roster lists** | Teachers need to know who's in their event | Low | List of students per event |
| **Class lists** | Class teachers need overview | Low | List per class showing each student's assigned event |
| **Unassigned students list** | Manual handling required | Low | Special list for admin intervention |
| **Export to CSV/Excel** | Integration with other school systems | Low | Standard export format |
| **Print-friendly format** | Physical distribution in schools | Low | Clean layout for printing |

**Source:** [ClassJuggler](https://www.classjuggler.com/cj/pub/poweruser.html), [University of Illinois Registrar](https://registrar.illinois.edu/faculty-staff/class-list-roster/)

### v1.0 Anti-Features (Still Applicable)

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **Real-time bidding/auction system** | Over-complex for school use case; fairness concerns | Simple lottery with priorities |
| **Points/credits system** | Adds complexity, creates gaming incentives | Equal treatment - pure lottery |
| **Complex preference weighting** | Confuses users, hard to explain fairness | Simple 1st/2nd/3rd priority |
| **Social login (Google/Facebook)** | Privacy concerns for minors; school policy issues | Simple form or school account |
| **Payment processing** | Not needed for school Sporttag; adds compliance burden | Remove scope entirely |
| **Chat/messaging features** | Scope creep; use existing school communication | Link to existing channels |
| **Gamification (badges, leaderboards)** | Inappropriate for registration task | Keep functional, not fun |
| **Machine learning "smart" allocation** | Unnecessary complexity; hard to explain | Transparent random lottery |
