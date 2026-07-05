# Hill Climbing — Auditable Requirements (Draft v0.1)

**Purpose.** This document closes gaps in `CONSTRAINTS.md` that need to be specific and stable for an audit (privacy review, safety review, governance review, regulator engagement). It is deliberately narrower than `CONSTRAINTS.md` — it documents only what *must not be malleable*. Tuning constants, feature ideas, UI copy, and roadmap items remain in `BACKLOG.md` where iteration is healthy.

This document binds. Amendments follow `CONSTRAINTS.md §6` (supermajority + 30-day public comment + clinical-advisor sign-off where safety-relevant + published rationale).

Items marked **[FOUNDER-PENDING]** are proposed defaults awaiting explicit founder ratification at incorporation. Items marked **[TBD-TIER-N]** become required at the named tier and are gating prerequisites to advance into that tier (see §5).

---

## 1. Data Inventory and Retention

Every item the app stores or transmits, where, for how long, and how it's deleted.

### 1.1 On-device storage (persistent, on user device only)

**Browser localStorage:**

| Key | Contents | Size | Retention | Deletion mechanism |
|---|---|---|---|---|
| `stillness-game` | Game state: `duration`, `threshold`, `wins`, `best`, `round`, `totalWins`, `todayKey`, `todaySecs`, `todayWins` | < 1 KB | Until user clears | Browser settings; future "delete all my data" button (Tier ≥ 2 prerequisite) |
| `hill-combing-acknowledged-v1` | Safety-modal acknowledgment flag (`'1'`) | ~10 B | Until user clears | Same as above |
| `hill-combing-reports` | Adverse-event reports: list of `{timestamp, text (≤2000 chars), snapshot {round, duration, todaySecs, phase, tier}}`. Capped at 50 entries. | < 100 KB max | Until user clears or 50-cap rotation | Same as above |
| `hill-combing-last-trajectory` | Most recent round's audio trajectory: `{timestamp, mode, duration, held, won, samples: [{t, s, m}]}` | < 50 KB | Overwritten by next round-end | Same as above |
| `hill-climbing-introduced-v1` | Onboarding completion flag (`'1'`) | ~10 B | Until user clears | Same as above |
| `hill-climbing-usage` | Per-app daily usage flags: `{ "v": 1, "meditate": { "YYYY-MM-DD": 1, … }, "breathe": { … }, "nourish": { … }, "climb": { … } }`. Written by `meditate.html` (on entering settling phase), `breathe.html` (on session start), `nourish.html` (when the user commits to cook a challenge), and `climb.html` (on the first state-changing action of a page load, not page-open); read by `index.html` hub dashboard. Reflect usage is derived separately from the journal IndexedDB. No session content, no user-identifiable data — only boolean day-flags. | < 10 KB (grows ~3 KB/yr) | Until user clears; no auto-pruning (streak requires full history) | Browser settings; future "delete all my data" button (Tier ≥ 2 prerequisite) |
| `hill-climbing-timed-minutes` | Meditate timed-mode session length preference (minutes, integer) | ~10 B | Until user clears | Same as above |
| `breathe-session-duration` | Breathe session length preference (minutes, integer) | ~10 B | Until user clears | Same as above |
| `hill-climbing-install-dismissed` | Hub PWA install-banner dismissal timestamp (ms since epoch); re-prompts 5 days after dismissal | ~15 B | Until user clears | Same as above |
| `hill-climbing-nourish` | Nourish cooking-ladder state: `{ v, level, streak, cleared {id→outcome}, history [{id, outcome, ts}], active, recent[] }`. Challenge ids and self-reported outcomes only; no free text, no identity. | < 20 KB (grows slowly) | Until user clears | Same as above |
| `hill-climbing-climb` | Climb goals + tasks state: `{ v, rootId, goals {id → {title, parentId, order, status active/resting, created, updated, restedAt}}, tasks {id → {goalId, title, done, created, updated, doneAt}}, focusId }`. `rootId` names the single editable root goal every other goal hangs under. Goal and task titles are short user-authored text and may be personal (they name what the user is working toward). | grows with use; typically < 100 KB | Until user clears or uses Climb's in-app "Delete everything" | In-app Delete everything (present today); browser settings; future "delete all my data" button (Tier ≥ 2 prerequisite) |

The `hill-combing-*` keys retain the legacy prefix to preserve user state across the v1.19 rename. New keys may use `hill-climbing-*`.

**Browser IndexedDB:**

| Database / store | Contents | Size | Retention | Deletion mechanism |
|---|---|---|---|---|
| `journal` / `entries` (written by `reflect.html`) | Journal entries: `{ id, created, updated, text (free-form, user-written), mood (1–7 or null), satisfaction (1–7 or null), embedding (reserved, currently null), embModel (null) }` | grows with use; `text` is user-authored prose | Until the user deletes an entry (in-app, per-entry) or clears browser data | In-app per-entry delete; browser settings; future "delete all my data" button (Tier ≥ 2 prerequisite) |
| `climb` / `events` (written by `climb.html`) | Append-only event log of every Climb state change: `{ id, ts, type, …payload }` — 14 types covering goal add/rename/reorder/move/archive/restore, focus set/clear, task add/rename/complete/uncomplete/delete, plus baseline snapshots. Payloads include goal/task titles (before/after on renames), so the log carries the same short user-authored text as the state blob. For the user's own local analysis only; exportable as JSON; never transmitted. | grows with use (append-only) | Until Climb's in-app "Delete everything" or browser clear | In-app Delete everything (removes the whole database); browser settings; future "delete all my data" button (Tier ≥ 2 prerequisite) |

The `journal` store is the only one holding **free-form personal prose** — the most sensitive data in the suite. Climb's goal/task titles (in both its localStorage blob and its event log) are short user-authored labels: personal, but bounded and not prose. The hub (`index.html`) opens the journal database **read-only and version-less** to derive Reflect's usage dots, and never writes to it (see the IndexedDB-gotcha note in `CLAUDE.md §7`).

### 1.2 Browser memory (transient)

- Live camera video stream — displayed on positioning and meditation screens; never persisted.
- Analysis-canvas pixel data — overwritten every frame; never persisted.
- Frame ring-buffer (10 × 80×60×4-byte frames ≈ 192 KB) — in-memory only.
- Audio-context oscillator state — in-memory only.
- Motion-window for smoothness scoring (60 floats) — in-memory only.

### 1.3 Network transmission

- **Tier 0–1: zero outbound network traffic** at any time (other than the initial HTML/JS load), **except the opt-in Web Push reminders below.** No analytics, telemetry, ads, error reporting, or third-party scripts.
- **Opt-in Web Push reminders (all tiers, off by default; added v1.76).** If — and only if — the user explicitly enables reminders on the hub, the browser registers a push subscription with its platform push service (Google / Apple / Mozilla) and receives pushes sent by the project's own GitHub Actions sender. This is user-initiated, revocable at any time ("Turn off"), and carries no analytics or behavioural data — the payload is a fixed practice prompt drawn from a hand-authored rotation. The subscription endpoint is the user's to copy into the sender's GitHub Actions secret. This is the single exception to "nothing leaves the device," and it exists only at the user's explicit request.
- **Tier ≥ 2: adverse-event reports may POST to a backend** *with explicit per-report consent at submission time*. No silent transmission.
- **All tiers: no microphone, no audio recording, no behavioral telemetry, no fingerprinting, no cookies for tracking.**

### 1.4 Deletion

- **Now (Tier 0):** user clears via browser DevTools → Application → Local Storage. Documented as a known gap.
- **Tier ≥ 2 prerequisite:** in-app "delete all my data" button that removes all `hill-combing-*` and `hill-climbing-*` localStorage keys, the `stillness-game` and `breathe-session-duration` keys, and the Reflect `journal` and Climb `climb` IndexedDB databases, with confirmation and acknowledgment. (Reflect already offers per-entry delete today, and Climb already offers a full in-app "Delete everything" covering its own key + database; a future control should also unsubscribe any active Web Push reminder.)
- **Tier ≥ 2:** server-side report-deletion endpoint with same SLA as data-export (24 h).

---

## 2. Privacy and Consent

### 2.1 What we collect

Nothing leaves the device at Tier ≤ 1, **except an opt-in Web Push subscription if the user turns on daily reminders** (user-initiated and revocable; see §1.3). At Tier ≥ 2, additionally only adverse-event reports the user explicitly submits via the in-product form.

### 2.2 What we never collect

- Identity (no accounts, no email, no name, no phone)
- Location
- Device fingerprints
- Behavioral analytics
- Cookies for cross-site or third-party tracking
- Microphone audio
- Camera images (only motion summary statistics inform the score)

### 2.3 Consent boundaries

- **Camera access:** browser-level permission required before any capture. Re-prompted if revoked.
- **localStorage usage:** standard browser storage; not transmitted.
- **Audio:** synthesised in-browser; no microphone access requested.
- **Backend submission (Tier ≥ 2):** explicit opt-in at each report; never default-on.
- **Outcome surveys (Tier ≥ 2 future):** explicit opt-in; one-click unsubscribe.

### 2.4 Sharing

The company does not, and structurally cannot, sell or share user data with third parties. Charter clauses required at Tier ≥ 2 prohibit data-sale and ad-targeted business models.

---

## 3. Adverse-Event Response Runbook

### 3.1 Capture

In-product `this didn't feel right` link, always visible during practice. Local storage capture is always-on (Tier 0 onwards). Server-side submission is Tier ≥ 2.

### 3.2 Response SLAs

| Tier | Response time | Triage time | Escalation rule |
|---|---|---|---|
| 0 (solo) | Best effort, reviewed at session boundary | n/a | Operator self-judgment |
| 1 (friends & family) | Written response within 72 h | Initial category within 24 h | Safety-relevant → operator + clinical advisor (when contracted) |
| 2 (open beta) | Written response within 72 h | Initial category within 24 h | Safety-relevant → clinical advisor immediately; severe → release-freeze consideration |
| 3 (public) | Written response within 48 h | Initial category within 12 h | Safety-relevant → clinical advisor + ethics board; severe → automatic feature freeze pending RCA |

### 3.3 Triage categories

Every report is classified within the SLA above into one of:

- **Bug** — product behaved incorrectly.
- **Tuning** — product worked as designed but the design is wrong (route to backlog).
- **Concern** — user surfaced unease about the practice itself; clinical-relevant.
- **Safety-relevant** — user reported acute distress, dissociation, panic, or other adverse psychological event.
- **Unclear** — not enough information; reach back to user (with consent).

### 3.4 Severe-event handling

A "severe" event is any of: acute distress, prolonged dissociation, panic attack, suicidal ideation, or any report indicating the user felt the product caused or contributed to harm.

- Tier ≥ 2: triggers immediate clinical-advisor review.
- Tier ≥ 2: if clinical advisor judges product-attributable harm credible → automatic feature freeze pending root-cause analysis; consideration of rollback.
- Tier ≥ 3: notification to ethics board within 24 h; consideration of regulator notification if pattern emerges.
- All tiers: reporter receives priority follow-up (≤ 24 h) with offer of resources and, with consent, warm-handoff to clinical care.

### 3.5 Publication

Quarterly aggregate incident-rate report at Tier ≥ 2. Specific reports never published without reporter's explicit consent. Format: total reports / active users / category breakdown / actions taken. Published whether or not the rate is non-zero.

### 3.6 Trigger thresholds (binding)

- Adverse-event rate > **5%** of active users per quarter (Britton baseline) → automatic feature freeze pending RCA.
- Three or more severe events of the same type within 30 days → automatic clinical review of the implicated feature.
- Single user-attributed serious harm → immediate clinical review.

---

## 4. Tier Transition Criteria

Tiers do not advance automatically. Each transition requires all listed prerequisites to be met. Operator must explicitly attest, in writing (commit message acceptable for solo dev), that the prerequisites are satisfied before flipping the `TIER` constant.

### 4.1 TIER 0 → TIER 1 (developer → friends & family, ≤ ~50 users)

Implementation prerequisites (already in place):

- Onboarding modal on first run ✓
- Safety modal on first run (Tier ≥ 1 auto-show) ✓
- Adverse-event capture mechanism ✓
- Hard duration cap of 5 min ✓
- Esc / click-anywhere neutral abort ✓
- Failure grace window ≥ 0.5 s ✓
- Settling timeout ≤ 90 s ✓
- Camera-disconnect handling ✓
- Idle-pause safety (≤ 5 min trigger) ✓
- Minimum break between rounds ≥ 10 s ✓
- Motion interlude every N wins ✓
- Posture / session-cap reminders ✓

Process prerequisites:

- This document (REQUIREMENTS.md) ratified.
- Operator commits to reviewing localStorage reports at least weekly.

### 4.2 TIER 1 → TIER 2 (friends & family → open beta)

- Backend report submission with documented SLA per §3.2.
- Pre-screening questionnaire on first run (validated short forms — DES-II for dissociation, GAD-7 for anxiety; specific instrument set ratified separately).
- Onboarding ramp: first 14 days of any new user has reduced caps (max round duration 60 s, no auto-escalation past 90 s).
- Clinical advisor under contract with veto authority on safety-relevant changes per §3.4.
- Responsibility-copy variant active in safety modal (already implemented; auto-activates at Tier 2).
- Quarterly incident-rate publication mechanism live (publishes even if rate is 0).
- In-app "delete all my data" button.
- Public-benefit corporation (or charter clause progressing toward steward ownership) in place.
- User pool ≤ 1,000 active monthly users.

### 4.3 TIER 2 → TIER 3 (open beta → public launch)

- Age gate (18+).
- Geo-localised crisis-resource lookup.
- Daily session count cap (initial: 3).
- Cool-down between sessions for users with self-identified high-risk profiles.
- External accountability board with publication authority and budget independence.
- Independent safety audit completed and published.
- Charter / governance structure formalised (perpetual purpose trust + employee stake + capped outside capital per `CONSTRAINTS.md §3`).
- Insurance coverage for psychological adverse events.
- Compliance review of HIPAA-adjacent considerations (even if not legally required).
- Demonstrated quarter-over-quarter adverse-event rate ≤ 5%.

### 4.4 Reverting

If any current-tier prerequisite fails or becomes uncertain, the operator must either (a) restore it within 30 days, or (b) revert `TIER` to the prior level. Reversion is not a failure mode — it's the system working as intended.

---

## 5. Verification Procedures

For each binding constraint, how compliance is verified.

| Constraint | Verification method | Cadence |
|---|---|---|
| Round duration ≤ 5 min | `MAX_DURATION` constant in code; manual review | Every release |
| Esc / click neutral abort | Manual test | Every release touching phase logic |
| Failure grace ≥ 0.5 s | `FAIL_GRACE_SECS` constant; manual review | Every release |
| Settling timeout ≤ 90 s | `SETTLING_TIMEOUT` constant; manual review | Every release |
| Idle pause ≤ 5 min | `IDLE_PAUSE_SECS` constant; manual review | Every release |
| Motion interlude every N wins | `BREAK_AFTER_WINS` + onWin logic; manual review | Every release |
| Min break between rounds ≥ 10 s | `MIN_BREAK_SECS` constant; manual review | Every release |
| No engagement-metric tracking | Code review; grep for analytics/telemetry imports | Every release |
| No advertising revenue | Code review + dependency audit + revenue-source attestation | Every release + quarterly |
| No data sale or sharing | Operator written attestation | Quarterly |
| Data export ≤ 24 h | Manual test (when implemented) | Every release |
| Zero outbound network traffic at Tier 0–1 (except opt-in Web Push reminders) | Network tab inspection during full session | Every release |
| Adverse-event rate ≤ 5% / quarter | Aggregate count from reports / active users | Quarterly |
| Investor concentration ≤ 20% | Cap-table review | Every funding event |
| Open-source safety research published | Repo review | Quarterly |
| Tier-prerequisite compliance | Operator written attestation | At every tier transition |

Failures discovered during verification are logged in `BACKLOG.md` under Bugs and addressed at the cadence appropriate to severity.

---

## 6. Change Management

### 6.1 Versioning

- Production iterations within v1: `v1.X` (linear count, single-file deploys).
- Major version bump (v2.0) reserved for fundamental changes to the practice model (different game, different detection method, different audio paradigm).

### 6.2 What counts as breaking

- **Storage schema changes without migration** — breaking. Avoid; if unavoidable, ship migration code that preserves user state.
- **Loosening of any binding constraint in this document** — breaking; requires `CONSTRAINTS.md §6` amendment process.
- **Tightening of constraints** — not breaking; always allowed.
- **New data fields collected** — breaking; requires re-consent at the next user interaction.

### 6.3 Deployment record

Each released version:

- Logged in `BACKLOG.md` under "Done."
- Carries a version label visible in the product (`v1.X · hill climbing · tier N`).
- Localstorage schema version implicit via key suffix (e.g., `hill-climbing-introduced-v1`).

### 6.4 Rollback

- Tier 0: each release is in git history; rollback is `git checkout <prior tag>` and reload.
- Tier ≥ 2 prerequisite: documented deployment / rollback procedure; 90-day retention of every released version.
- localStorage schema must be backward-compatible across rollback windows (one minor version = one rollback capability minimum).

---

## 7. Decision Register (Proposed Defaults — [FOUNDER-PENDING])

Resolved values for `[DECISION]` markers in `CONSTRAINTS.md`. Defaults below are proposed by drafter, calibrated against domain practice; *binding* upon explicit founder ratification at incorporation. Each entry: marker location, proposed value, rationale.

| Source | Marker | Default | Rationale |
|---|---|---|---|
| C1.3 | Data export response time | 24 h | Industry baseline for non-bulk export |
| C1.3 | Adverse-event written response time | 72 h (Tier 1–2), 48 h (Tier 3) | Reasonable for non-form, individualised response |
| S3 | Daily session cap | 3 sessions/day | Above this is uncommon for healthy practice |
| S3 | Cool-down between sessions | 1 h for first 14 days; 0 thereafter | Onboarding ramp |
| S3 | Pre-screened high-risk max round duration | 60 s | Conservative cap until rapport with practice established |
| P3.3 | Max revenue concentration from any single customer | 10% | Avoids single-customer dependency |
| P5 | Outside-investor return cap | 5× | Matches OpenAI's original capped-profit structure |
| P10 | Investor concentration ceiling | 20% | Resists single-investor capture |
| P7 | Employee economic ownership target by Year 5 | 30% | Substantive worker stake without diluting mission control |
| Anti-pattern | CEO term limit | 7 years renewable | Two-term presidential model |
| §6 | Supermajority threshold | 75% | High enough to bind, low enough to be reachable |
| Onboarding ramp | Duration | 14 days | Reasonable adjustment period |
| Pre-screening | Item set | DES-II (dissociation), GAD-7 (anxiety), PHQ-9 (depression), single screen for psychosis history | Validated short forms; specific cut-offs ratified separately at Tier 2 prep |

These defaults are *starting positions for ratification*, not unilateral commitments. The founder may adjust each before signing.

---

## 8. Status

- **Version:** 0.1 (draft)
- **Author:** First draft assembled by AI (Claude Sonnet 4.6) at founder request, October 2025.
- **Status:** Working draft. Becomes binding upon ratification by founding governing body at incorporation.
- **Review cadence:**
  - Annual full review.
  - Quarterly verification of §5 constraints.
  - Immediate review on any tier transition or any severe adverse event.
- **Relation to other documents:**
  - `CONSTRAINTS.md` — first principles and bindable rules.
  - This document — concrete operational requirements with verification.
  - `BACKLOG.md` — work tracking; deliberately malleable.
  - In case of conflict: `CONSTRAINTS.md` > this document > `BACKLOG.md`.

This document is intended to be slightly *uncomfortable* — every entry should commit the company to something it will sometimes find inconvenient. A document that is comfortable is decorative.
