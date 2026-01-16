# Features Research: Sporttag Registration Platform

**Domain:** School event registration with capacity-limited lottery allocation
**Researched:** 2026-01-16
**Confidence:** MEDIUM (based on WebSearch findings from multiple sources, cross-verified patterns)

---

## Table Stakes

Features users expect. Missing = product feels incomplete or unusable.

### Registration & Data Input

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Student data entry** (name, class) | Core identification | Low | v1: Teacher enters; v2: Student self-entry |
| **3-priority selection** | Core requirement per spec | Low | Mandatory selection of exactly 3 events |
| **Event listing with capacity display** | Users need to see options and availability | Low | Show event name, description, max capacity |
| **Form validation** | Prevents incomplete/invalid submissions | Low | All 3 priorities required, no duplicates |
| **Confirmation feedback** | User needs to know submission succeeded | Low | Simple success message post-submission |
| **Edit/update before deadline** | Users make mistakes | Medium | Allow changes until registration closes |

**Source:** Event registration best practices from [Bizzabo](https://www.bizzabo.com/blog/event-registration-system-features-guide), [Sched](https://sched.com/blog/event-registration-software-for-schools-guide/)

### Allocation Engine

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Random lottery mechanism** | Fairness when demand exceeds capacity | Medium | Random ordering prevents gaming |
| **Priority-respecting allocation** | Core requirement - honor student preferences | Medium | Try 1st choice first, then 2nd, then 3rd |
| **Capacity enforcement** | Prevents overbooking | Low | Hard limit per event |
| **Unassigned student detection** | Critical edge case handling | Medium | Students where all 3 choices are full |

**Source:** [MIT ESP Lottery FAQ](https://esp.mit.edu/learn/lotteryFAQ.html), [Wikipedia - Fair Random Assignment](https://en.wikipedia.org/wiki/Fair_random_assignment), [Avela Match](https://avela.org/match)

### Output & Reporting

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Event roster lists** | Teachers need to know who's in their event | Low | List of students per event |
| **Class lists** | Class teachers need overview | Low | List per class showing each student's assigned event |
| **Unassigned students list** | Manual handling required | Low | Special list for admin intervention |
| **Export to CSV/Excel** | Integration with other school systems | Low | Standard export format |
| **Print-friendly format** | Physical distribution in schools | Low | Clean layout for printing |

**Source:** [ClassJuggler](https://www.classjuggler.com/cj/pub/poweruser.html), [University of Illinois Registrar](https://registrar.illinois.edu/faculty-staff/class-list-roster/)

### Administration

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Event management** (CRUD) | Admin must configure available events | Low | Create, edit, delete events with capacities |
| **Registration deadline control** | Prevents late submissions | Low | Open/close registration period |
| **Run allocation button** | Trigger the lottery | Low | One-click allocation execution |
| **View all registrations** | Admin oversight | Low | Dashboard of submitted preferences |
| **Basic statistics** | Understanding demand | Low | Count registrations, preferences per event |

---

## Differentiators

Features that add value but are not expected. Nice-to-have for v2+.

### Enhanced User Experience

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Real-time capacity indicators** | Students see remaining slots while selecting | Medium | Updates as others register (requires live data) |
| **Drag-and-drop priority ordering** | More intuitive than dropdowns | Medium | UX improvement for priority selection |
| **Multi-language support** | Accessibility for diverse student body | Medium | German + English at minimum |
| **Mobile-responsive design** | Access from any device | Medium | Important for student self-registration (v2) |
| **Email confirmations** | Professional touch, paper trail | Medium | Automated emails on registration and allocation |

### Advanced Allocation

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Allocation preview/simulation** | Admin can see results before publishing | Medium | "Dry run" mode |
| **Re-run allocation** | Handle mistakes or changes | Medium | Clear and re-allocate |
| **Partial manual override** | Handle special cases | Medium | Admin assigns specific students manually |
| **Waitlist management** | When students drop out | High | Auto-promote from waitlist |
| **Fairness metrics display** | Transparency about allocation | Medium | Show % got 1st/2nd/3rd choice |

**Source:** [RWTHmoodle Fair Allocation](https://help.itc.rwth-aachen.de/en/service/8d9eb2f36eea4fcaa9abd0e1ca008b22/article/13834895b26249519666ce52457f676c/)

### Enhanced Reporting

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Visual analytics dashboard** | Quick insights for admin | Medium | Charts showing preference distribution |
| **Historical comparison** | Track trends year over year | High | Compare with previous Sporttag events |
| **Audit trail** | Accountability | Medium | Log who changed what when |

### Data Management

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **CSV import of student roster** | Faster setup than manual entry | Medium | Bulk upload students from school system |
| **Integration with school management system** | Eliminate duplicate data entry | High | API connection to existing student database |
| **QR code check-in on event day** | Modern attendance tracking | High | Separate concern from registration |

**Source:** [Age of Learning CSV Import](https://support.aofl.com/hc/en-us/articles/22902204065421-How-to-Roster-Students-and-Classes-via-Spreadsheet-CSV-Import)

---

## Anti-Features

Features to deliberately NOT build. Common mistakes in this domain.

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
| **Multi-event registration** | Over-engineered for single Sporttag | One event per student |
| **Notification push system** | Over-engineering for annual event | Email sufficient |
| **Complex role hierarchy** | YAGNI - one admin role enough for v1 | Single admin role initially |
| **User accounts with passwords** | Friction for one-time annual use | Session-based or teacher-mediated |

**Rationale:** These anti-features come from observing enterprise registration systems ([Cvent](https://www.saasworthy.com/list/event-registration-ticketing-software), [Bizzabo](https://www.bizzabo.com/blog/event-registration-system-features-guide)) that solve different problems at different scale. A school Sporttag needs simplicity and transparency, not enterprise features.

---

## Feature Dependencies

```
Registration Flow Dependencies:
  Events configured → Registration opens → Students register → Deadline → Allocation runs → Results published

Specific Dependencies:
  Event CRUD ──────────────────┐
                               ├──→ Registration Form ──→ Allocation Engine ──→ Output Lists
  Student Data Entry ──────────┘

v1 → v2 Dependencies:
  v1: Teacher data entry ──→ v2: Student self-registration (requires user management)
  v1: Basic auth ──→ v2: School SSO integration (optional enhancement)

Export Dependencies:
  Allocation complete → Event lists exportable
  Allocation complete → Class lists exportable
  Allocation complete → Unassigned list exportable
```

### Dependency Matrix

| Feature | Depends On | Blocks |
|---------|------------|--------|
| Event listing | Event CRUD | Registration form |
| Registration form | Event listing, student data | Allocation |
| Allocation engine | All registrations submitted, deadline passed | Output lists |
| Event roster export | Allocation complete | - |
| Class list export | Allocation complete | - |
| Unassigned list | Allocation complete | Manual handling |
| Statistics | Registrations exist | - |

---

## MVP Recommendation

Based on research, recommended MVP scope for v1:

### Must Include (Table Stakes)

1. **Event management** - Admin creates ~7 events with name, description, capacity
2. **Registration form** - Teacher enters student name, class, 3 priorities
3. **Form validation** - Ensures all fields complete, no duplicate priorities
4. **Basic allocation engine** - Random lottery respecting priorities and capacities
5. **Unassigned detection** - Identifies students who couldn't be placed
6. **Three output lists** - Per event, per class, unassigned students
7. **CSV export** - All three lists exportable

### Defer to v2

- **Student self-registration** - Requires user management, adds complexity
- **Email notifications** - Nice but not critical for teacher-mediated flow
- **CSV import** - Teachers can enter ~250 students manually for v1
- **Real-time capacity display** - Polling/websockets add complexity
- **Audit trail** - Not critical for v1
- **Multi-language** - German-only acceptable for v1

### Explicitly Exclude (Anti-Features)

- Payment processing
- Complex user authentication
- Gamification
- ML-based allocation
- Waitlist auto-management
- Push notifications

---

## Allocation Algorithm Approaches

Research identified several approaches for fair allocation:

### Recommended: Random Serial Dictatorship (Simplified)

**How it works:**
1. Randomize student order (lottery)
2. For each student in order:
   - Try to assign to 1st choice (if capacity available)
   - Else try 2nd choice
   - Else try 3rd choice
   - Else mark as unassigned

**Why this approach:**
- Simple to implement
- Simple to explain to stakeholders
- Provably fair (random order = equal chance)
- Handles the spec's edge case naturally (unassigned list)

**Source:** [Wikipedia - Fair Random Assignment](https://en.wikipedia.org/wiki/Fair_random_assignment)

### Alternative: Deferred Acceptance (DA)

More sophisticated, used by Philadelphia schools and Wharton (CourseMatch). Guarantees "stable" matching but more complex to implement. **Not recommended** for MVP given simple requirements.

**Source:** [Philadelphia School District](https://www.philasd.org/studentplacement/school-selection/), [MIT - Lotteries in Student Assignment](https://economics.mit.edu/sites/default/files/publications/Lotteries%20in%20Student%20Assignment%20The%20Equivalence%20of.pdf)

---

## Edge Cases to Handle

| Edge Case | Handling Strategy |
|-----------|-------------------|
| All 3 choices full | Add to unassigned list for manual handling |
| Student submits twice | Later submission overwrites (or prevent) |
| Event capacity = 0 | Validation prevents or hide event |
| No events configured | Block registration, show error |
| Registration after deadline | Reject submission |
| < 3 priorities selected | Form validation prevents submission |
| Duplicate priorities | Form validation prevents |
| More students than total event capacity | Math guarantees some unassigned; surface clearly |

---

## Sources

### High Confidence (Official Documentation)
- [MIT ESP Lottery FAQ](https://esp.mit.edu/learn/lotteryFAQ.html)
- [Wikipedia - Fair Random Assignment](https://en.wikipedia.org/wiki/Fair_random_assignment)
- [Wikipedia - Course Allocation](https://en.wikipedia.org/wiki/Course_allocation)
- [RWTHmoodle Fair Allocation](https://help.itc.rwth-aachen.de/en/service/8d9eb2f36eea4fcaa9abd0e1ca008b22/article/13834895b26249519666ce52457f676c/)

### Medium Confidence (Industry Sources)
- [Sched - Event Registration for Schools](https://sched.com/blog/event-registration-software-for-schools-guide/)
- [Bizzabo - Event Registration Features](https://www.bizzabo.com/blog/event-registration-system-features-guide)
- [Avela Match - Lottery Software](https://avela.org/match)
- [ClassJuggler - Admin Features](https://www.classjuggler.com/cj/pub/poweruser.html)

### Low Confidence (General Web Search)
- Various blog posts on registration best practices
- Stack Overflow discussions on allocation algorithms
