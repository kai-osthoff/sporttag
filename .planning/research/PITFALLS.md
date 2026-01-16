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
