# Domain Pitfalls

**Domain:** School Event Registration Platform with Lottery Allocation
**Project:** Sporttag-Anmeldeplattform (~250 students, ~7 events, 3 priorities)
**Researched:** 2026-01-16
**Confidence:** HIGH (multiple authoritative sources cross-referenced)

---

## Critical Pitfalls

Mistakes that cause rewrites, data integrity issues, or loss of trust.

### Pitfall 1: Race Conditions in Capacity Limits

**What goes wrong:** Multiple registrations submit simultaneously, each sees "1 slot available," both succeed, event becomes overbooked.

**Why it happens:** Naive implementation reads capacity, checks availability, then writes registration without atomic transactions. The "check-then-act" pattern is inherently vulnerable to race conditions.

**Consequences:**
- Events overbooked beyond capacity
- Manual intervention required to fix
- Loss of trust in system fairness
- Potential legal/policy violations

**Prevention:**
- Use database-level constraints (unique constraint on student+event for final assignments)
- Implement pessimistic locking with `SELECT FOR UPDATE` during registration
- For higher scale: use optimistic locking with version numbers
- Consider temporary reservation pattern with expiry (hold slot for N minutes during form completion)

**Detection (warning signs):**
- Multiple users registering at same time
- Count queries return different results than actual row counts
- "Impossible" states in database (more assignments than capacity)

**Phase to address:** Phase 1 (Core Registration) - build correct concurrency handling from the start

**Sources:**
- [Concurrency Conundrum in Booking Systems](https://medium.com/@abhishekranjandev/concurrency-conundrum-in-booking-systems-2e53dc717e8c)
- [Handling Double-Booking Problem in Databases](https://adamdjellouli.com/articles/databases_notes/07_concurrency_control/04_double_booking_problem)
- [How to Prevent Overbooking in SQL](https://karhdo.dev/blog/how-to-prevent-overbooking-in-sql-with-multiple-methods)

---

### Pitfall 2: Non-Reproducible Lottery Results

**What goes wrong:** Lottery runs, produces results, but cannot be re-verified. Parents challenge outcome, school cannot prove fairness.

**Why it happens:** Using system time as implicit seed, not storing seed, or using non-deterministic random sources without audit trail.

**Consequences:**
- Cannot verify results were fair
- Cannot prove compliance with lottery requirements
- Disputes escalate without resolution mechanism
- Loss of institutional trust

**Prevention:**
- Store the random seed explicitly before each lottery run
- Use deterministic PRNG (e.g., Mersenne Twister) that can reproduce exact sequence from seed
- Log: seed, timestamp, input data hash, output assignments
- Provide "verify" function that re-runs lottery with stored seed and confirms same output
- Consider public seed derivation (hash of multiple inputs) for transparency

**Detection (warning signs):**
- No seed stored in database/logs
- Different results when "re-running" lottery
- Inability to answer "why did student X get event Y?"

**Phase to address:** Phase 2 (Lottery Algorithm) - core lottery implementation must include audit trail

**Sources:**
- [World Lottery Association on Random Chance](https://world-lotteries.org/insights/editorial/blog/random-chance-is-the-essence-of-the-lottery)
- [adessoDraws: Transparent, Reproducible Lottery Draws](https://www.adesso.de/en/adesso-branch-solutions/lotteriegesellschaften/sonderthemen/adesso-draws/index.jsp)
- [Random Seeds and Reproducibility](https://medium.com/data-science/random-seeds-and-reproducibility-933da79446e3)

---

### Pitfall 3: Silent Failure on "All Choices Full" Edge Case

**What goes wrong:** Student lists 3 preferences, all events reach capacity before lottery reaches them, system either crashes, assigns nothing silently, or randomly assigns to non-preferred event.

**Why it happens:** Algorithm assumes at least one preference will be available. Edge case not explicitly handled in design.

**Consequences:**
- Students assigned to events they never chose (violates project requirement)
- Students left with no assignment and no notification
- Data integrity issues (null assignments vs special status)
- Manual cleanup required

**Prevention:**
- Explicit "unassigned" status distinct from "not yet processed"
- Project-specific requirement: create separate "special list" for manual handling
- Never auto-assign to non-preferred events
- Clear workflow: lottery completes -> special list generated -> admin notified -> manual resolution
- Database schema must support this state (not just null)

**Detection (warning signs):**
- Null/empty values in assignment fields after lottery
- Students missing from all event lists AND special list
- Count mismatch: registered students != (assigned + special_list)

**Phase to address:** Phase 2 (Lottery Algorithm) - explicit handling in algorithm design

---

### Pitfall 4: No Audit Trail for Allocation Decisions

**What goes wrong:** Parent asks "Why wasn't my child assigned to their first choice?" Administrator cannot explain.

**Why it happens:** Only storing final assignments, not the decision process. Lottery runs as black box.

**Consequences:**
- Cannot answer legitimate questions
- Cannot identify bugs in algorithm
- Cannot defend against accusations of unfairness
- Compliance issues for public institutions

**Prevention:**
- Log each allocation decision with reason:
  - "Assigned to Event A (1st choice): available capacity"
  - "Not assigned to Event A (1st choice): capacity 25/25"
  - "Assigned to Event B (2nd choice): available capacity"
  - "Unassigned: all 3 choices at capacity -> added to special list"
- Store lottery order (random sequence) for each student
- Make decision log queryable per student

**Detection (warning signs):**
- Questions from parents that cannot be answered
- Debug sessions requiring lottery re-runs
- Disputes with no resolution path

**Phase to address:** Phase 2 (Lottery Algorithm)

**Sources:**
- [How Education Technology Enhances Transparency in School Lotteries](https://schoolpathways.com/how-education-technology-enhances-transparency-school-lotteries/)
- [What Parents Want to Know About Your School Lottery Process](https://schoolpathways.com/school-lottery-parents-want-know-answer-them/)

---

## Moderate Pitfalls

Mistakes that cause delays, rework, or degraded user experience.

### Pitfall 5: Priority Order Ambiguity

**What goes wrong:** System stores priorities as 1, 2, 3 but unclear if 1 = highest or lowest. Algorithm interprets opposite of data entry.

**Why it happens:** No explicit definition of priority semantics. Different team members assume different meanings.

**Consequences:**
- Students get least-preferred events
- Requires re-run of entire lottery
- Data migration if stored incorrectly

**Prevention:**
- Explicit naming: `priority_rank` where 1 = most preferred (like race finishing position)
- Document in schema comments
- Validation: ensure exactly 3 distinct priorities per student
- UI labels: "1st choice (most wanted)"

**Detection (warning signs):**
- Confusion during code review about priority direction
- Test results seem "backwards"
- User complaints about getting wrong events

**Phase to address:** Phase 1 (Data Model Design)

---

### Pitfall 6: Duplicate Registrations

**What goes wrong:** Same student registers twice (browser back button, refresh, multiple tabs). System creates duplicate records.

**Why it happens:** No unique constraint on student identifier. No idempotency handling on form submission.

**Consequences:**
- Student appears twice in lottery (unfair advantage or duplicate assignments)
- Capacity counts wrong
- Confusing admin interface

**Prevention:**
- Database unique constraint: one registration per student per event period
- Idempotency key on form submission (hidden token)
- Check for existing registration before insert
- Clear UI feedback: "You have already registered"

**Detection (warning signs):**
- Same name appearing multiple times in lists
- Student count exceeds expected enrollment
- Conflicting assignments for same student

**Phase to address:** Phase 1 (Core Registration)

---

### Pitfall 7: Print Output Not Accessible or Usable

**What goes wrong:** Generated PDF for posting has:
- Tiny fonts unreadable when posted
- No clear grouping by event
- Missing student identifiers
- Not accessible (no text layer, screen readers fail)

**Why it happens:** "Print to PDF" from screen layout, not designed for physical posting context.

**Consequences:**
- Teachers cannot use output
- Re-work to create usable format
- Accessibility compliance issues

**Prevention:**
- Design print layout specifically for posting context
- Large fonts (14pt+ for names)
- Clear section headers per event
- Include class/grade for disambiguation
- Test by actually printing and posting
- Use proper PDF generation (not "Print to PDF") to preserve accessibility tags

**Detection (warning signs):**
- Teachers asking for different format
- Complaints about readability
- Manual re-typing of results

**Phase to address:** Phase 3 (Print Output)

**Sources:**
- [Creating Accessible PDFs - Harvard](https://accessibility.huit.harvard.edu/pdf)
- [PDF Issues & Recommendations - Penn State](https://accessibility.psu.edu/pdf/pdfissues/)
- [How to Make PDFs Accessible - Finalsite](https://www.finalsite.com/blog/p/~board/b/post/how-to-make-your-website-pdfs-accessible)

---

### Pitfall 8: Form Validation UX That Causes Abandonment

**What goes wrong:** Teacher enters 20 students, makes one error, submits, gets generic error, all data lost.

**Why it happens:** Server-side only validation, no inline feedback, no data persistence on error.

**Consequences:**
- Frustrated teachers
- Incomplete registrations
- Re-entry of lost data

**Prevention:**
- Inline validation as fields are completed (not while typing, after blur)
- Preserve form data on validation failure
- Specific error messages next to problematic fields
- Client-side validation for immediate feedback
- "Save draft" for bulk entry scenarios

**Detection (warning signs):**
- Support requests about "lost data"
- Abandoned registrations
- Teacher complaints about form usability

**Phase to address:** Phase 1 (Registration Interface)

**Sources:**
- [Form Validation UX Best Practices](https://userpeek.com/blog/form-validation-ux-and-best-practices/)
- [10 Design Guidelines for Reporting Errors in Forms - NN/g](https://www.nngroup.com/articles/errors-forms-design-guidelines/)
- [Inline Validation UX - Smashing Magazine](https://www.smashingmagazine.com/2022/09/inline-validation-web-forms-ux/)

---

### Pitfall 9: Waitlist/Reassignment Confusion

**What goes wrong:** Student drops out after lottery, slot opens, system has no clear process for reassignment.

**Why it happens:** Only designed for one-shot lottery, not ongoing changes.

**Consequences:**
- Empty slots in events
- No fair way to fill spots
- Manual processes become arbitrary

**Prevention:**
- Design waitlist from start (ordered by lottery number)
- When student removed: next on waitlist auto-promoted OR admin notified
- Track status changes: assigned -> dropped -> slot reopened -> reassigned
- Consider: re-run partial lottery vs. use original lottery order

**Detection (warning signs):**
- Events with empty slots after drops
- Ad-hoc manual reassignments
- Complaints about unfair late assignments

**Phase to address:** Phase 2 (Lottery Algorithm) - design waitlist handling upfront

**Sources:**
- [How Waitlists Work - My School DC](https://www.myschooldc.org/how-waitlists-work)
- [FAQ: Lottery & Waitlist Management - SchoolMint](https://schoolmint6.zendesk.com/hc/en-us/articles/360033030871-FAQ-Lottery-Waitlist-Management)

---

## Minor Pitfalls

Mistakes that cause annoyance but are recoverable.

### Pitfall 10: Inconsistent Student Identification

**What goes wrong:** "Max Muller" vs "Max Mueller" vs "Max M." - same student appears as different people.

**Why it happens:** Free-text name entry without standardization or unique ID.

**Consequences:**
- Duplicate registrations not detected
- Merging records manually
- Confusion in print output

**Prevention:**
- Use student ID/class as primary identifier, name as display only
- Standardize input: trim whitespace, consistent capitalization
- For v1 (teacher entry): dropdown or autocomplete from class list
- For v2 (student self-entry): authenticate against school system

**Detection (warning signs):**
- Same student appearing with slight name variations
- More registrations than students in class

**Phase to address:** Phase 1 (Registration Interface)

---

### Pitfall 11: Timezone and Date Handling

**What goes wrong:** Registration deadline set as "December 15" but unclear if that's midnight start or end of day. Different interpretations cause missed registrations.

**Why it happens:** Dates stored without time component, displayed ambiguously.

**Consequences:**
- Students miss deadline by hours
- Disputes about cutoff time
- Inconsistent enforcement

**Prevention:**
- Store all timestamps in UTC with full datetime
- Display with explicit time: "Registration closes December 15, 2026 at 23:59"
- Server-side deadline enforcement (not client-side)
- Grace period consideration

**Detection (warning signs):**
- Questions about "is it still open?"
- Registrations accepted after announced deadline
- Time-based bugs around date boundaries

**Phase to address:** Phase 1 (Core Registration)

---

### Pitfall 12: Missing Confirmation/Receipt

**What goes wrong:** Teacher submits registration, no confirmation shown, unsure if it worked. Submits again.

**Why it happens:** No explicit success state in UI, no email/notification.

**Consequences:**
- Duplicate submissions
- Uncertainty and support requests
- Lost registrations go unnoticed

**Prevention:**
- Clear success message after submission
- Confirmation number or receipt
- "View my registrations" page
- Optional: email confirmation (if email available)

**Detection (warning signs):**
- "Did my registration go through?" support requests
- Multiple submissions from same teacher
- Surprised teachers at lottery results

**Phase to address:** Phase 1 (Registration Interface)

---

## Phase-Specific Warnings

| Phase | Likely Pitfall | Mitigation |
|-------|----------------|------------|
| Phase 1: Data Model | Priority order ambiguity (#5) | Document semantics explicitly in schema |
| Phase 1: Registration | Race conditions (#1), Duplicates (#6) | Database constraints from day 1 |
| Phase 1: Registration | Form validation UX (#8) | Inline validation, preserve data on error |
| Phase 2: Lottery | Non-reproducible results (#2) | Store seed, log decisions |
| Phase 2: Lottery | All-choices-full edge case (#3) | Explicit special list handling |
| Phase 2: Lottery | No audit trail (#4) | Log each decision with reason |
| Phase 2: Lottery | Waitlist confusion (#9) | Design reassignment flow upfront |
| Phase 3: Print | Accessibility/usability (#7) | Design for posting context, test physically |
| Phase 4 (v2): Student Entry | Student identification (#10) | Integrate with school auth system |

---

## Data Privacy Considerations (School Context)

**GDPR/DSGVO applies to German schools.** Key requirements:

- **Data minimization:** Only collect what's needed (name, class, preferences)
- **Purpose limitation:** Cannot reuse data for other purposes without consent
- **Access control:** Only authorized teachers/admins see data
- **Retention:** Delete data after event period ends
- **Student rights:** Right to access, rectify, erasure

**Specific risks for this project:**
- Posting results publicly: only names, not full personal data
- Storing preferences: legitimate interest for allocation purpose
- No unnecessary data: don't collect email/phone unless needed

**Phase to address:** Phase 1 (Data Model) - design with minimal data from start

**Sources:**
- [GDPR for Schools and Teachers](https://www.schooleducationgateway.eu/en/pub/resources/tutorials/brief-gdpr-guide-for-schools.htm)
- [EdTech SaaS Compliance Guide](https://complydog.com/blog/edtech-saas-compliance-student-privacy-gdpr-implementation)
- [Protecting Student Data - GDPR Guide](https://dataprivacymanager.net/gdpr-protecting-student-data-the-educators-guide-to-data-privacy-and-security/)

---

## Summary: Top 5 Pitfalls to Avoid

1. **Race conditions in registration** - Use database constraints and locking
2. **Non-reproducible lottery** - Store seed, log everything
3. **Silent failure on edge cases** - Explicit handling for "all choices full"
4. **No audit trail** - Cannot answer "why this assignment?"
5. **Print output unusable** - Design for posting context, not screen

---

## Verification Checklist

Before each phase is considered complete:

- [ ] Race conditions tested (concurrent submissions)
- [ ] Lottery reproducible with stored seed
- [ ] Edge cases explicitly handled (all choices full, no preferences, duplicates)
- [ ] Audit log captures all decisions
- [ ] Print output tested on actual paper/board
- [ ] GDPR compliance reviewed (minimal data, access control)

---
---

# macOS Desktop Distribution Pitfalls (v2.0 Milestone)

**Domain:** Packaging Next.js web app for macOS distribution to non-technical users
**Researched:** 2026-01-17
**Context:** Unsigned app, curl-based installation, SQLite persistence, ARM/Intel compatibility
**Confidence:** HIGH (official Apple documentation + community patterns verified)

---

## Critical Distribution Pitfalls

Mistakes that cause complete failure to launch, data loss, or user abandonment.

### Pitfall D1: Gatekeeper Blocks Unsigned App (macOS Sequoia)

**What goes wrong:** Users double-click the app and see "This app can't be opened because it's from an unidentified developer" or worse, "App is damaged and can't be opened. You should move it to the Bin."

**Why it happens:** macOS Sequoia (15.x) removed the simple Control-click bypass for Gatekeeper. Unsigned apps now require users to navigate to System Settings > Privacy & Security > click "Open Anyway" > enter admin password. The quarantine extended attribute (`com.apple.quarantine`) is attached to all downloaded files.

**Consequences:**
- Non-technical teachers will assume the app is broken/malicious
- Support burden increases dramatically
- Users may give up before ever launching the app

**Prevention:**
1. **Installation script removes quarantine:** Include `xattr -cr /Applications/Sporttag.app` in the curl installer
2. **Clear documentation with screenshots:** Step-by-step guide (in German) showing System Settings > Privacy & Security path
3. **Consider ad-hoc signing:** Use Tauri's ad-hoc signing (`-` identity) for Apple Silicon - still shows warning but avoids "damaged" message
4. **First-run helper dialog:** If possible, detect first launch and show in-app guidance before Gatekeeper blocks

**Detection:** Test installation on clean macOS Sequoia VM. Try both direct download and curl installation.

**Phase to address:** Phase 1 (Desktop Packaging) - Must solve before any user testing

**Sources:**
- [macOS Sequoia Gatekeeper changes](https://www.idownloadblog.com/2024/08/07/apple-macos-sequoia-gatekeeper-change-install-unsigned-apps-mac/)
- [Gatekeeper and runtime protection - Apple](https://support.apple.com/guide/security/gatekeeper-and-runtime-protection-sec5599b66df/web)
- [Quarantine, MACL and provenance](https://eclecticlight.co/2025/12/05/quarantine-macl-and-provenance-what-are-they-up-to/)

---

### Pitfall D2: Database Lost on App Update

**What goes wrong:** User updates to new version, all student registrations and event data disappear.

**Why it happens:**
- Database stored inside app bundle (`/Applications/Sporttag.app/Contents/...`) gets replaced on update
- Database stored in wrong location (working directory, temp folder)
- Update script doesn't preserve user data directory
- Different wrapper framework (Electron vs Tauri) uses different default paths

**Consequences:**
- Complete data loss for school event
- Teachers must re-enter all registrations manually
- Loss of trust in the application

**Prevention:**
1. **Store database in Application Support:** Use `~/Library/Application Support/Sporttag/sporttag.db` - this survives app updates
2. **Never store user data in app bundle:** The `.app` directory is replaced entirely on update
3. **Backup before update:** Installation script should backup existing database before replacing app
4. **Migration script:** Include version-aware database migration that preserves data
5. **First-launch detection:** Check if database exists in old location and migrate automatically

**Detection:**
- Run update simulation: install v1.0, add data, install v1.1, verify data persists
- Test both clean install and upgrade paths

**Phase to address:** Phase 1 (Desktop Packaging) - Database location must be correct from first release

**Code example (Tauri):**
```rust
// Get correct data directory
let data_dir = app_handle.path_resolver().app_data_dir().unwrap();
// Results in: ~/Library/Application Support/com.sporttag.app/
```

**Sources:**
- [Persistent state in Tauri apps](https://aptabase.com/blog/persistent-state-tauri-apps)
- [Tauri data storage discussion](https://github.com/tauri-apps/tauri/discussions/5557)
- [Moving from Electron to Tauri: Local Data Storage](https://www.umlboard.com/blog/moving-from-electron-to-tauri-2/)

---

### Pitfall D3: ARM vs Intel Architecture Mismatch

**What goes wrong:** App won't launch on user's Mac with cryptic error, or runs extremely slowly via Rosetta 2.

**Why it happens:**
- Building only for one architecture (ARM-only or Intel-only)
- User has older Intel Mac but receives ARM binary
- Apple Silicon Mac without Rosetta 2 installed receives Intel binary
- Universal binary not properly created with `lipo`

**Consequences:**
- App completely fails to launch (wrong architecture without Rosetta)
- Severe performance degradation (20%+ slower via emulation)
- Support confusion ("works on my Mac")

**Prevention:**
1. **Build Universal Binary:** Use `lipo` to create Universal Binary 2 containing both architectures
2. **Separate downloads:** Offer both `Sporttag-arm64.dmg` and `Sporttag-x64.dmg` with detection
3. **Installer detection:** curl script detects `uname -m` and downloads correct binary
4. **Test both architectures:** CI/CD must test on both Intel and Apple Silicon

**Detection:**
```bash
# Check binary architecture
file /Applications/Sporttag.app/Contents/MacOS/sporttag
# Should show: "Mach-O universal binary with 2 architectures"
```

**Timeline context:** macOS Tahoe (2025) is last Intel-supported version. macOS 27 (2026) drops Intel support. Rosetta 2 features removed in macOS 28 (2027). For 2026 release, Universal Binary strongly recommended.

**Phase to address:** Phase 1 (Desktop Packaging) - Architecture decision affects entire build pipeline

**Sources:**
- [Building a universal macOS binary - Apple](https://developer.apple.com/documentation/apple-silicon/building-a-universal-macos-binary)
- [Mac transition to Apple silicon](https://en.wikipedia.org/wiki/Mac_transition_to_Apple_silicon)
- [Build native installers for Apple Silicon and Intel](https://www.componentsource.com/news/2025/07/23/build-native-installers-apple-silicon-and-intel-macs)

---

## Moderate Distribution Pitfalls

Mistakes that cause significant friction, support burden, or technical debt.

### Pitfall D4: curl | bash Security Concerns

**What goes wrong:** Security-conscious users or IT departments block installation, or script fails silently/partially.

**Why it happens:**
- Schools may have IT policies against running arbitrary scripts
- Network interruption causes partial script execution
- No verification that download succeeded
- Script runs with user privileges but needs admin for /Applications

**Consequences:**
- IT department blocks deployment
- Partial installation leaves broken state
- Users don't trust the installation method

**Prevention:**
1. **Use HTTPS:** Always `curl https://...` never `curl http://...`
2. **Wrap in function:** Prevent partial execution on network failure:
   ```bash
   #!/bin/bash
   set -euo pipefail
   main() {
       # All installation logic here
   }
   main "$@"
   ```
3. **Verify download:** Check hash or file size before executing
4. **Idempotent script:** Safe to run multiple times
5. **Provide alternative:** Offer direct .dmg download for those who prefer it
6. **Clear error messages:** German-language errors for teachers

**Detection:** Test installation with network interruption, test re-running script on already-installed system

**Phase to address:** Phase 2 (Installation Script) - After core packaging works

**Sources:**
- [Is curl|bash insecure? - Sandstorm](https://sandstorm.io/news/2015-09-24-is-curl-bash-insecure-pgp-verified-install)
- [How to write idempotent Bash scripts](https://arslan.io/2019/07/03/how-to-write-idempotent-bash-scripts/)
- [Friends don't let friends curl|bash](https://www.sysdig.com/blog/friends-dont-let-friends-curl-bash)

---

### Pitfall D5: First-Launch Confusion

**What goes wrong:** User gets past Gatekeeper but app doesn't work as expected on first launch.

**Why it happens:**
- Database not initialized
- Required directories not created
- Port conflict with other app (if using local server)
- Firewall blocks local server communication
- No onboarding flow explains what to do

**Consequences:**
- User assumes app is broken
- Support requests for "empty" app
- Confusion about where data is stored

**Prevention:**
1. **Auto-initialize:** Create database and directories on first launch
2. **Welcome screen:** Show German-language onboarding explaining workflow
3. **Avoid network:** Use file:// protocol, not localhost server if possible
4. **Health check:** Verify database connection on startup, show clear error if fails
5. **Sample data option:** Offer to load example event/students for exploration

**Detection:** Test on fresh macOS user account with no previous installation

**Phase to address:** Phase 2 (First-Run Experience) - After basic packaging works

---

### Pitfall D6: Update Mechanism Failures

**What goes wrong:** Auto-update corrupts installation, fails silently, or leaves app in broken state.

**Why it happens:**
- Update downloaded but not applied (permission issues)
- Update applied while app running
- Network failure during update download
- Version mismatch between update server and client
- Signature validation fails for new version

**Consequences:**
- User stuck on old version
- App won't launch after failed update
- Data corruption during mid-update crash

**Prevention:**
1. **Manual updates initially:** For v1.0, don't implement auto-update - just notify and link to download
2. **Atomic updates:** Download complete update to temp, verify, then swap atomically
3. **Rollback capability:** Keep previous version in case new version fails
4. **Version check endpoint:** Simple JSON endpoint returning current version
5. **Update on next launch:** Never update while running

**Detection:** Simulate update failures (network drop, permission denied, disk full)

**Phase to address:** Phase 3 (Updates) - After initial release stability proven

**Sources:**
- [Electron vs Tauri - DoltHub](https://www.dolthub.com/blog/2025-11-13-electron-vs-tauri/)
- [Tauri auto-update discussion](https://github.com/tauri-apps/tauri/discussions/2776)

---

## Minor Distribution Pitfalls

Mistakes that cause annoyance but are recoverable.

### Pitfall D7: WebView Rendering Inconsistencies (Tauri-specific)

**What goes wrong:** UI looks different on different macOS versions, CSS bugs appear only on some machines.

**Why it happens:** Tauri uses system WebKit (Safari's engine), which varies by macOS version. Unlike Electron which bundles Chromium, Tauri inherits whatever WebKit version the user has.

**Prevention:**
1. **Test on multiple macOS versions:** Monterey, Ventura, Sonoma, Sequoia
2. **Avoid bleeding-edge CSS:** Stick to well-supported features
3. **Add Safari-specific fallbacks:** Especially for flexbox/grid edge cases
4. **Document minimum macOS version:** e.g., "Requires macOS 12 or later"

**Phase to address:** Phase 1 (Desktop Packaging) - Ongoing during development

**Sources:**
- [Comparing Electron and Tauri](https://blog.openreplay.com/comparing-electron-tauri-desktop-applications/)
- [Tauri vs Electron real world](https://www.levminer.com/blog/tauri-vs-electron)

---

### Pitfall D8: DMG vs PKG Installer Choice

**What goes wrong:** Users confused by installation process, or installer doesn't meet IT requirements.

**Why it happens:**
- DMG requires manual drag-to-Applications (users forget)
- PKG requires admin password (users don't have it)
- Enterprise deployment needs PKG but consumer users prefer DMG

**Prevention:**
1. **Use DMG with background image:** Shows arrow pointing to Applications folder
2. **Document both methods:** Provide .dmg for teachers, .pkg for IT deployment
3. **curl script handles it:** Script downloads and installs automatically

**Phase to address:** Phase 2 (Installation Polish) - Nice-to-have after core works

**Sources:**
- [DMG vs PKG comparison](https://85ideas.com/blog/dmg-vs-pkg-file-formats-key-differences-and-how-to-use-them-on-mac/)
- [Why DMGs aren't enterprise-ready](https://apptimized.com/en/news/dmg-vs-pkg-why-dmgs-arent-enterprise-ready/)

---

### Pitfall D9: Next.js SSR Features Don't Work

**What goes wrong:** Server-side rendering, API routes, or other Next.js server features fail in desktop context.

**Why it happens:** Desktop wrappers (Tauri especially) expect static files. Next.js SSR requires a running Node.js server. API routes need a backend.

**Prevention:**
1. **Use `output: 'export'`:** Configure Next.js for static site generation
2. **Move API routes to Tauri commands:** Use Rust backend instead of Next.js API routes
3. **Avoid SSR dependencies:** Use client-side data fetching
4. **Test static build early:** Run `next build && next export` before integrating with wrapper

**Detection:** Build fails or runtime errors when accessing API routes or SSR pages

**Phase to address:** Phase 1 (Initial Integration) - Must solve before any other work

**Sources:**
- [Next.js with Tauri - Official docs](https://v2.tauri.app/start/frontend/nextjs/)
- [Bye-bye Electron: Tauri and Next.js](https://devamitch.medium.com/bye-bye-electron-building-a-feature-rich-to-do-app-with-tauri-and-next-js-b158f6d80a04)

---

## Distribution Phase-Specific Warnings

| Phase | Likely Pitfall | Mitigation |
|-------|---------------|------------|
| Desktop Packaging | Gatekeeper blocks (D1) | Remove quarantine in installer, provide clear docs |
| Desktop Packaging | Architecture mismatch (D3) | Build Universal Binary from start |
| Desktop Packaging | SSR features fail (D9) | Configure static export immediately |
| Data Layer | Database location (D2) | Use Application Support from day one |
| Installation | curl security (D4) | HTTPS, idempotent script, error handling |
| First Launch | Empty/broken state (D5) | Auto-initialize, health check, onboarding |
| Updates | Data loss (D2) | Backup before update, test upgrade path |
| Updates | Broken state (D6) | Start with manual updates, add auto-update later |

---

## Distribution Risk Matrix

| Pitfall | Likelihood | Impact | Detection Difficulty | Prevention Cost |
|---------|------------|--------|---------------------|-----------------|
| D1: Gatekeeper blocks | HIGH | CRITICAL | LOW | LOW |
| D2: Database lost | MEDIUM | CRITICAL | LOW | LOW |
| D3: Architecture mismatch | MEDIUM | HIGH | LOW | MEDIUM |
| D4: curl failures | LOW | MEDIUM | MEDIUM | LOW |
| D5: First-launch issues | MEDIUM | MEDIUM | LOW | LOW |
| D6: Update failures | LOW | HIGH | HIGH | HIGH |
| D7: WebView inconsistency | LOW | LOW | MEDIUM | LOW |
| D8: DMG/PKG confusion | LOW | LOW | LOW | LOW |
| D9: SSR incompatibility | HIGH | HIGH | LOW | LOW |

---

## Confidence Assessment (Distribution)

| Area | Confidence | Reason |
|------|------------|--------|
| Gatekeeper behavior | HIGH | Multiple authoritative sources, recent macOS Sequoia documentation from Apple |
| Database persistence | HIGH | Official Tauri docs, community patterns well-documented |
| Architecture compatibility | HIGH | Apple official documentation, clear timeline |
| Installation security | MEDIUM | General best practices, specific macOS school environment untested |
| Update mechanisms | MEDIUM | Framework docs available, specific failure modes vary |
| WebView rendering | MEDIUM | Known issue in community, but varies by use case |

---

## Open Questions for Desktop Distribution Research

1. **Code signing economics:** Is $99/year Apple Developer account worth it for this use case?
2. **IT deployment:** Do German schools have MDM that would prefer PKG format?
3. **Offline operation:** How to handle updates when school network blocks external downloads?
4. **Multi-user machines:** How to handle shared computer labs where multiple teachers use same Mac?
5. **Windows version:** Should v2.0 target Windows as well, or macOS-only initially?

---

## Distribution Sources Summary

### Gatekeeper & Security
- [macOS Sequoia Gatekeeper changes - iDownloadBlog](https://www.idownloadblog.com/2024/08/07/apple-macos-sequoia-gatekeeper-change-install-unsigned-apps-mac/)
- [Apple Gatekeeper documentation](https://support.apple.com/guide/security/gatekeeper-and-runtime-protection-sec5599b66df/web)
- [Quarantine extended attributes - Eclectic Light](https://eclecticlight.co/2025/12/05/quarantine-macl-and-provenance-what-are-they-up-to/)
- [Electron unsigned app workarounds](https://github.com/daltonmenezes/electron-app/blob/main/docs/UNSIGNED_APPS.md)
- [Tauri macOS code signing](https://v2.tauri.app/distribute/sign/macos/)

### Architecture & Compatibility
- [Apple Universal Binary documentation](https://developer.apple.com/documentation/apple-silicon/building-a-universal-macos-binary)
- [Mac transition to Apple silicon - Wikipedia](https://en.wikipedia.org/wiki/Mac_transition_to_Apple_silicon)

### Data Persistence
- [Persistent state in Tauri apps - Aptabase](https://aptabase.com/blog/persistent-state-tauri-apps)
- [Tauri Store plugin](https://v2.tauri.app/plugin/store/)
- [SQLite versioning strategies](https://www.sqliteforum.com/p/sqlite-versioning-and-migration-strategies)

### Installation & Updates
- [curl|bash security - Sandstorm](https://sandstorm.io/news/2015-09-24-is-curl-bash-insecure-pgp-verified-install)
- [Idempotent bash scripts](https://arslan.io/2019/07/03/how-to-write-idempotent-bash-scripts/)
- [Electron vs Tauri comparison - DoltHub](https://www.dolthub.com/blog/2025-11-13-electron-vs-tauri/)
- [DMG vs PKG comparison](https://85ideas.com/blog/dmg-vs-pkg-file-formats-key-differences-and-how-to-use-them-on-mac/)

### Next.js Desktop Integration
- [Next.js with Tauri - Official docs](https://v2.tauri.app/start/frontend/nextjs/)
- [Tauri vs Electron comparison](https://blog.openreplay.com/comparing-electron-tauri-desktop-applications/)
