# Hill Climbing — Known Risks Inventory

**Ranking principle: user safety is the primary axis.** Items are sorted by potential impact on user welfare. Gameplay integrity, scoring accuracy, and code quality are *only* HIGH/MEDIUM if they materially defeat or could defeat a safety mechanism. Otherwise they drop to LOW regardless of how much they break.

This is a deliberate re-prioritisation. An earlier version of this file used "defeats a feature or safety claim" as the HIGH bar, which was the wrong standard.

Categories:
- **Severity** — high (could directly harm user welfare), medium (defeats or could defeat a safety mechanism), low (functional, code, gameplay, or UX issues with no safety impact).
- **Confidence** — confirmed (mechanism analysis suffices), likely (I'd bet money), suspected (worth verifying).

Update this file as items are verified, fixed, or proven false.

---

## HIGH (could directly harm user welfare)

*(none currently identified at Tier 0)*

The most likely future entries here would be: a code path that disables the idle-pause without the user noticing, a case where the report-a-concern flow silently fails, or a regression in the failure-grace logic that punishes users for unavoidable motion.

---

## MEDIUM (defeats or could defeat a safety mechanism)

### S1. Replay clears the cooldown timer, allowing the minimum-break safety to be skipped
- **Confidence:** confirmed (noted in v1.16 ship notes; not fixed)
- **Where:** `startReplay()` sets `breakStart = 0`. Replaying during the 10-second post-round cooldown effectively skips the rest of the break.
- **Safety impact:** the cooldown exists to prevent rapid-fire grinding. Bypassing it enables compulsive-use patterns. Action requires user intent (clicking replay), but the safety property of "always 10s minimum between rounds" is broken.
- **Fix:** track and restore `breakStart` across replay; or pause its countdown during replay.

### S2. Mute toggle during idle-pause partially defeats trance prevention
- **Confidence:** suspected
- **Where:** when paused, `master.gain` is at 0. If the user un-mutes during pause, `setMuted(false)` raises gain to `MASTER_VOLUME`, defeating the audio-mute side of the trance-prevention pause. The visual ring stays dimmed, so the most hypnotic element is still suppressed — but the drone audio resumes.
- **Safety impact:** the 5-minute idle-pause is the app's primary mechanism against sustained-observation trance states. Having it bypassable by an accidental mute toggle is a real defect in a primary safety mechanism.
- **Fix:** track auto-mute separately from user mute; suppress mute toggle while idle-paused, or have idle-pause hold gain at 0 regardless of user-mute state.

### S3. No error boundary — a JS error could silently disable time-based safety checks  ✅ verified fixed in v1.25
- **Confidence:** confirmed
- **Where:** the loop runs all checks (idle-pause, settling timeout, cooldown countdown, recording, etc.) inside a single `requestAnimationFrame` body. A throw in any of them stops `rAF` and the entire loop dies. None of the safety mechanisms recover.
- **Safety impact:** if a safety check itself throws (or any code before it), all time-based safeguards stop firing — silently. The user wouldn't know the trance-pause won't fire, that the round timer won't expire, that adverse-event capture is broken, etc.
- **Fix applied (v1.25):** loop body wrapped in `try { ... } catch { ... } finally { rAF }`. The `finally` block guarantees the next frame is scheduled regardless of throws. Errors are logged. After 5 consecutive errors, a user-visible "Something went wrong. Please refresh." message is surfaced and the audio fades out, so the user is not left practising on a silently-broken safety surface. Error counter resets on each clean frame so transient throws don't lock the user out. Subsumes L11 (loopRunning recovery).

### S4. Sticky safety reminders — posture / session-cap fire at most once per page load
- **Confidence:** confirmed
- **Where:** `postureReminded` and `sessionCapReminded` are set true on first fire and never reset. They reset only on page reload.
- **Safety impact:** a user who practises for 3+ hours in a single page-load session sees the cap reminder once at minute 30 and never again. Posture reminder same: fires at minute 5 and never again. Both are advisory rather than blocking, but they're the only nudges toward postural and total-time hygiene at Tier 0.
- **Fix:** reset on a meaningful boundary — date rollover, after a long break (e.g., 2+ hours of inactivity), or replace single-fire flags with cooldown-style "fire again after N minutes."

### S5. Adverse-event reports stored locally with no surfaced review path
- **Confidence:** confirmed (process gap, not code bug)
- **Where:** the `this didn't feel right` link writes to `localStorage.hill-combing-reports`. There is no in-app way to view stored reports. The operator must open DevTools → Application → Local Storage to read them.
- **Safety impact:** if the user submits a concern and the operator forgets to check DevTools, the report goes unread. The capture half of the safety loop works; the response half is informal and easy to skip.
- **Fix:** at minimum, surface a "view reports" link visible to the operator (could be hidden behind the same `d` debug toggle or its own keyboard shortcut). At Tier ≥ 2: backend submission + a real triage queue per `REQUIREMENTS.md §3.2`.

### S6. The 5-minute idle-pause is a coarse time-based heuristic
- **Confidence:** confirmed (design limitation)
- **Where:** `IDLE_PAUSE_SECS = 300`. The pause fires after 5 minutes of being in idle/won/lost regardless of what the user is actually doing — could be reading the modal, away from the device, in a deep absorption state, or just paused for tea.
- **Safety impact:** trance-prevention works on a wall-clock timer with no signal of user state. If 5 minutes is too long for someone vulnerable to dissociation, the safeguard fires too late. If it's too short for healthy use, it interrupts a normal pause.
- **Fix:** Tier ≥ 2 — consider per-user tunability based on pre-screening; integrate face-detection signals if camera is active. Tier 0: accept the heuristic but verify 5 min is the right number empirically.

---

## LOW (gameplay, scoring, UX, or code-quality issues — no safety impact)

### L1. Tab-switching can complete a round without the user being still
- **Confidence:** confirmed
- **Was:** previously labelled HIGH. Re-categorised: this is a gameplay-integrity issue, not a safety issue. A user who exploits this gets inflated stats; nobody is harmed.
- **Where:** `requestAnimationFrame` pauses on tab hide. On return, `performance.now() - roundStart` exceeds the duration target and the round is marked won.
- **Impact:** corrupts staircase calibration upward; misleading stats. No physical/psychological harm.
- **Fix (if motivated):** detect dt anomaly and abort, or listen for `visibilitychange` and abort active rounds.

### L2. `setPhase` reassignment via wrapper
- Code quality. Works in non-strict mode. Replace with direct `updateReplayButton()` call inside `setPhase`.

### L3. Camera disconnect leaves the loop running
- Loop reads `readyState < 2` → motion 0 → stillness rises to 100% → audio gets louder. Confusing, not harmful.

### L4. Idle-pause may fire when the onboarding modal is re-opened mid-session
- Modal content gets overlaid by "Long pause detected." Cosmetic.

### L5. Motion window for smoothness scoring not reset between settling and active
- First second of an active smoothness round may use stale frames. Scoring accuracy issue. No safety impact.

### L6. Threshold-mark coordinates untested at extreme threshold values
- Math works in tested range (0.50–0.95). Visual QA only.

### L7. Trajectory recording includes settling lead-in
- Design choice, not bug. Replay starts with the climb to threshold.

### L8. Dead code: `cappedOut` variable in `onWin`; unused `scoreDisplay` reference
- Cleanup.

### L9. Inconsistent localStorage key prefixes (`hill-combing-*` legacy, `hill-climbing-*` current)
- Documented in REQUIREMENTS.md §1.1. Cosmetic.

### L10. `postRoundReminder` returns strings with leading space
- Style fragility.

### L11. `loopRunning` is one-way — no recovery if the loop dies  ✅ verified fixed in v1.25 (subsumed by S3)
- Resilience. The S3 try/catch/finally wrapper means the loop body errors no longer prevent the next frame from scheduling, so even if the loop "dies" inside the body, `rAF` keeps firing. The original `loopRunning` flag is now belt-and-braces; the safety property holds without it.

### L12. No accessibility considerations
- Welfare for users with visual/motor impairments. Tier 2+ prerequisite.

### L13. Mobile / narrow-viewport layout breakage  🟡 partially addressed in v1.29
- UX. Single 640px breakpoint added in v1.29: round-info wraps, ring shrinks to 240px, timer moves below the ring, corner buttons tighten. Verified visually for typical phone widths. Not yet tested below ~360px (very small phones), and not a full mobile-first redesign — Tier 2+ public launch would still need a more thorough pass.

### L14. Smoothness rounds use the same threshold as stillness rounds
- Tuning question. As threshold rises, smoothness becomes very hard.

### L15. Onboarding Skip button on the last page is functionally redundant with Begin
- Cosmetic.

### L16. Frame ring buffer corruption after long tab-hide (chained from L1)
- Self-corrects within ~10 frames.

### L17. Audio context resume after long backgrounding untested
- Browsers may auto-suspend `AudioContext`. Engine has resume guard but not verified.

### L18. No data export or delete-all-my-data button
- Privacy. Tier 2+ prerequisite per REQUIREMENTS.md §1.4.

### L20. Weekly streak display and CONSTRAINTS §5 anti-pattern tension
- **Confidence:** confirmed (design choice, not a bug)
- **Where:** `index.html` dashboard, added v1.64.
- **Description:** CONSTRAINTS §5 explicitly rejects "streak mechanics that punish absence" and "streak counts displayed prominently." The weekly streak counter is designed to avoid those patterns: it is weekly rather than daily, placed below the practice cards (not the first thing on the page), uses a rule where an inactive current week does not break the streak (it only grows or holds), and there are no notifications or loss-aversion triggers. The risk is that future changes (making it daily, moving it above the cards, adding push notifications) drift it into the anti-pattern.
- **Mitigation:** `STREAK_MIN_DAYS` and `WEEK_START` are named constants; the "what makes a week count" predicate is isolated in `weekIsActive()`. Any change to the streak mechanic should be reviewed against CONSTRAINTS §5 before shipping.

### L21. `hill-climbing-usage` localStorage key not in REQUIREMENTS.md §1.1 data inventory
- **Confidence:** confirmed (documentation gap, not code bug)
- **Where:** REQUIREMENTS.md §1.1 claims to document every localStorage key the apps store. The new key added in v1.64 — `hill-climbing-usage` — is missing from that table.
- **Shape:** `{ "v": 1, "meditate": { "YYYY-MM-DD": 1, … }, "breathe": { "YYYY-MM-DD": 1, … } }`. Stores only date-flags; no session content, no text, no user-identifiable data.
- ✅ **Resolved:** added to REQUIREMENTS.md §1.1 with founder confirmation (v1.64).

### L22. REQUIREMENTS.md §1.1 data inventory and §1.3 network claims are stale after the multi-app + Web Push growth
- **Confidence:** confirmed (documentation / audit-readiness gap, not a code bug; found in the v1.77 doc audit)
- **Where:** REQUIREMENTS.md §1.1 ("every item the app stores or transmits") and §1.3 / §2.1 ("zero outbound network traffic at Tier 0–1" / "nothing leaves the device").
- **§1.1 missing localStorage keys:** `breathe-session-duration` (breathe pref), `hill-climbing-install-dismissed` (hub install banner, v1.73), `hill-climbing-nourish` (nourish ladder state, v1.77), `hill-climbing-timed-minutes` (meditate timed-mode pref). The `hill-climbing-usage` row also predates Nourish — it is now written by `meditate.html`, `breathe.html`, **and** `nourish.html`.
- **§1.1 missing store entirely:** the Reflect **`journal` IndexedDB** (entries with free-text notes + mood/satisfaction ratings) — the most sensitive data in the suite, and §1.1 currently documents only localStorage. A privacy auditor would expect this inventoried.
- **§1.3 / §2.1 network claim inaccurate:** the v1.76 opt-in Web Push reminders register a push subscription with a third-party push service and receive pushes — outbound/inbound traffic beyond the initial HTML/JS load, available at Tier 0. The "zero outbound network at Tier 0–1" and "nothing leaves the device" statements are no longer strictly true for users who enable reminders; §5's verification row inherits the same gap.
- **Impact:** REQUIREMENTS.md is the binding auditable doc. An external privacy/safety auditor relying on it would find §1.1 incomplete and the §1.3 network claim inaccurate. No user harm — a governance / audit-readiness gap (same class as L21).
- **Fix:** amend §1.1 (add the four keys + an IndexedDB subsection for `journal`), update the `hill-climbing-usage` row to name Nourish, and carve out the opt-in Web Push exception in §1.3 / §2.1 / §5. **Binding doc → requires founder ratification** (CONSTRAINTS §6).
- ✅ **Resolved:** all of the above amended with founder confirmation in the v1.77 doc audit — §1.1 gained the four keys + a Browser IndexedDB subsection for `journal`, the `hill-climbing-usage` row now names Nourish, §1.3/§2.1/§5 carve out the opt-in Web Push exception, and §1.4's delete-all scope now covers the full key set + the `journal` DB.

### L23. Nourish's level / progression mechanic sits near the anti-gamification line
- **Confidence:** confirmed (design consideration, not a bug)
- **Where:** `nourish.html`, added v1.77.
- **Description:** CONSTRAINTS §3.1 names "gamification beyond the user's interest" as a power-over-behaviour concern, and §5 rejects progression mechanics whose purpose is to drive engagement. Nourish has explicit levels, a climbing ladder, a 2-up/1-down staircase, and skill "unlocks." These serve pedagogy (keeping the cook at their learning edge, ~71% success) rather than time-in-app — but the line is real and worth watching.
- **Mitigation (already in place):** free skips on every challenge; non-shaming outcome copy ("Struggled" → "that's how cooking is learned," no red/fail language); no points, badges, or scores beyond the level number; no notifications; progress framed for orientation, not as a number to maximise; the hub streak is weekly not daily (see L20). Any future change adding points, daily streaks, or push nudges to Nourish should be reviewed against CONSTRAINTS §3.1/§5 before shipping.

### L19. GitHub Pages legacy build trigger occasionally drops pushes
- **Confidence:** observed (v1.57 and v1.58 push events both failed to auto-trigger builds; v1.56 was the last commit Pages built before manual intervention)
- **Where:** the repo is on `build_type: "legacy"` Pages (per `gh api .../pages`), which auto-builds on push to `main`. The trigger isn't 100% reliable — quick successive pushes occasionally land without firing a build, leaving the deployed site behind the repo head.
- **Impact:** "I pushed" and "the deployed site reflects what I pushed" are not the same statement. Without a check, the agent can confidently report "shipped" while the user is still seeing yesterday's build.
- **Detection:** `gh api repos/cognitivemirrors/hill-climbing/pages/builds/latest --jq '.commit'` returns the most recent built commit. Compare to local `git rev-parse HEAD`.
- **Recovery:** `gh api -X POST repos/cognitivemirrors/hill-climbing/pages/builds` queues a manual build; takes ~30–60 s.
- **Cache caveat:** the Fastly edge in front of Pages has `max-age=600` — even after a successful new build, the user's browser may serve cached HTML for up to 10 minutes. Hard refresh bypasses; otherwise it self-clears.
- **Workflow upgrade path:** migrating to GitHub Actions Pages (build_type: "workflow") gives explicit, observable build runs and would surface trigger drops as failed/missing runs rather than silent stale-deploys.
- **Recurred at v1.77 (2026-06-20):** the push of commit `26d069e` did not auto-trigger a build — the latest *built* commit remained `6880d2b` (v1.76). The documented recovery (`POST .../pages/builds`) was attempted but blocked by the environment's auto-mode classifier as an out-of-scope production action, so the rebuild was deferred to the operator. Confirms the trigger is unreliable and that "pushed v1.77" ≠ "v1.77 is live" until the build is verified.

### L24. Council sends personal situation text off-device — contradicts REQUIREMENTS §1.3/§2.1 "nothing leaves the device"
- **Confidence:** confirmed (by design; `council.html`, added v1.90)
- **Severity:** LOW *as coded* at Tier 0 (user-initiated, disclosed, on the user's own key, no operator server) — but it touches a **binding** claim, so it needs founder attention before any tier advance or before Council is promoted to the hub.
- **Where:** `council.html` `callClaude()` POSTs the user's free-text situation (and the four directors' replies) to `https://api.anthropic.com/v1/messages` using a bring-your-own Anthropic key. REQUIREMENTS §1.3 and §2.1 assert "zero outbound network traffic at Tier 0–1" / "Nothing leaves the device at Tier ≤ 1," with the opt-in Web Push reminder as the *single* stated exception (L22). Council is a second, larger exception: it transmits the most sensitive content in the suite (free-form personal decisions), comparable to the Reflect journal but **off-device**.
- **Why it's still defensible at Tier 0:** it is strictly user-initiated (only on "Convene"), only sends what the user types, uses the user's own API key (no operator intermediary — consistent with CONSTRAINTS §3 power-distribution: the user owns the relationship with the model), stores nothing server-side, keeps sessions in local storage only, and is disclosed plainly on first run and in the crisis footer/disclaimer.
- **Binding-doc gap (needs founder ratification — do NOT self-amend):**
  - §1.1 data inventory omits the two new localStorage keys: `hill-climbing-council-key` (the user's Anthropic API key — a **credential**, the first stored in the suite; note browser localStorage is not a secure secret store) and `hill-climbing-council` (saved deliberations: free-text situations + generated advice, cap 30).
  - §1.3/§2.1's "nothing leaves the device (except opt-in Web Push)" is now false; Council is a second exception and should be documented as such, with the off-device data-flow and third-party (Anthropic) processing named.
  - §2.4 "sharing" and §2.2 "what we never collect" should acknowledge that convening transmits user content to Anthropic under the user's own account/terms.
- **Open questions for the founder:** (a) is bring-your-own-key the right power-distribution posture, or should Council stay off the hub until a data-flow/consent design is ratified? (b) does an app that sends personal content to a third-party LLM belong under the same care/safety constraints as the sensor apps, or does it need its own section? (c) API-key-in-localStorage risk acceptance.

### L25. Climb's goal/todo mechanics sit near the anti-gamification line — and its event log is a mirror that could become a scoreboard
- **Confidence:** confirmed (design consideration, not a bug)
- **Where:** `climb.html`, added v1.94.
- **Description:** Todo trackers are the canonical guilt machines — due dates, overdue reds, completion percentages, and streaks are the standard engagement toolkit CONSTRAINTS §3.1 ("power over user behaviour") and §5 (streak mechanics, loss-aversion) explicitly reject. Climb additionally keeps an **append-only event log of the user's own follow-through**, which is designed as a self-owned mirror for reflection but could read (or later be surfaced) as self-surveillance or a report card.
- **Mitigation (already in place):** no due dates at all in v1 (dates are the todo-app guilt engine); no points, badges, streaks, or completion percentages; archive copy is "resting" / "Let it rest" / "Pick it back up" — never failed, abandoned, or overdue; the focus card is framed as attention ("Current focus"), not obligation; History is a flat chronological mirror with no aggregates beyond a raw event count; the log is local-only, exportable, and honestly deletable in-app ("Delete everything" removes both the state blob and the event database); no notifications; hub usage feeds only the existing weekly (not daily) dots (L20 rationale applies).
- **Watch-items:** any future analytics view over the event log must present rates and "attention gravity" as neutral mirrors for the user's own curiosity — the moment a derived number starts functioning as a target (velocity, completion rate, goals-per-week), it should be reviewed against §3.1/§5 before shipping. Same review applies before adding due dates, reminders, or any surfacing of "you haven't touched X in N days."
- **Sub-note (log completeness):** the IndexedDB append is best-effort *after* the localStorage state write — in a browser where IDB persistently fails (some private modes), state changes occur that the log misses. On the next healthy load, `log.snapshot` rebaselines the log from current state, so analysis has an honest "gap + baseline" rather than silent divergence.

### L26. Levity and Council storage still missing from REQUIREMENTS §1.1 (pre-existing; observed while adding Climb's rows)
- **Confidence:** confirmed
- **Where:** REQUIREMENTS.md §1.1. Climb's rows were added in v1.94 with founder sign-off, which makes the remaining gaps conspicuous: `hill-climbing-levity` (Levity ladder + notebook state, added v1.92) has no row and Levity is absent from the `hill-climbing-usage` writer list; Council's two keys are already flagged in L24. Binding doc → founder ratification required; not self-amended in v1.94.
- **Resolved (v1.99):** §1.1 now carries `hill-climbing-levity`, `hill-climbing-council`, `hill-climbing-council-key`, and `hill-climbing-train` rows, and the `hill-climbing-usage` row lists the Levity and Train writers — folded into the founder-ratified v1.99 sync amendment.

### L27. Nourish's Chef mode sends pantry text off-device — third egress feature; extends the L24 binding-doc gap
- **Confidence:** confirmed (by design; `nourish.html` Chef mode, added v0.13 / global line v1.97-track)
- **Severity:** LOW *as coded* at Tier 0 (user-initiated, gated behind an explicit consent checkbox + a bring-your-own key, on the user's own account, no operator server) — but, like Council (L24), it touches a **binding** claim and needs founder attention before any tier advance.
- **Where:** `nourish.html` `callChef()` POSTs the user's free-text pantry list + preferences (and the current cooking level + learned-skill labels) to `https://api.anthropic.com/v1/messages` using a bring-your-own Anthropic key and structured output. This is the **third** off-device path in the suite (after opt-in Web Push, L22, and Council, L24) and the **first inside a previously fully-offline sensor-adjacent app** — Nourish was 100% local before this.
- **Why it's still defensible at Tier 0:** strictly user-initiated (only on "Write me a recipe"), gated behind a first-run consent checkbox that names the data flow and the third party (Anthropic) in plain language, uses the user's own key (no operator intermediary — consistent with CONSTRAINTS §3 power-distribution), sends nothing beyond the pantry/preferences/level context, stores nothing server-side, and keeps the key + recipe history in local storage only. The pantry list is far less sensitive than Council's personal decisions or the Reflect journal.
- **Binding-doc gap (needs founder ratification — do NOT self-amend):**
  - §1.1 data inventory omits the new localStorage key `hill-climbing-nourish-chef` (holds the user's Anthropic API key — a **credential**, kept **out of the Nourish data export** on purpose; plus `history`: recipe titles + self-reported outcomes, cap 20). This is the second API key stored in the suite (cf. `hill-climbing-council-key`, L24); browser localStorage is not a secure secret store.
  - §1.3/§2.1's "nothing leaves the device (except opt-in Web Push)" now has a **third** exception. The L24 amendment should be widened to name Nourish Chef alongside Council as an off-device, third-party-processed (Anthropic) data flow.
  - §2.4 "sharing" / §2.2 "what we never collect" should acknowledge that generating a recipe transmits user content to Anthropic under the user's own account/terms.
- **Open questions for the founder:** (a) same bring-your-own-key posture question as L24 — ratify once for both, or treat cooking (low-sensitivity) differently from Council (high-sensitivity)? (b) is it acceptable that a previously-offline practice now has an opt-in online mode, or should online modes live in a separate clearly-labelled surface? (c) two API keys now sit in localStorage across the suite — worth a shared, documented key-handling stance.

### L28. Opt-in E2EE sync — residual risks of the first operator-held store (v1.99)
- **Confidence:** confirmed (by design; `hc-sync.js` + `climb.html`, added v1.99)
- **Severity:** LOW at Tier 0 (opt-in, off by default; the operator is the user; zero-knowledge, so the operator cannot read content) — but it is the suite's **first operator-held store** and first *required-schema* dependency, so the sub-risks below deserve watching before any tier advance.
- **Where:** `hc-sync.js` (envelope + sync loop), `climb.html` (wiring), Supabase `sync_docs` / `sync_keybundle` + RLS.
- **Residual risks:**
  - **RLS is the only guard.** The anon/publishable key is public by design; if `supabase-schema.sql` is applied without RLS enabled (or a policy is later dropped), every user's rows become readable to anyone with the key. Content stays unreadable (zero-knowledge), but the *metadata* (emails, sizes, counts, timestamps, doc keys) would leak. **Verify RLS is on for both tables after any schema change** (checked live via the Supabase security advisor on the v1.99 deploy — clean). This is the one item that would rise to MEDIUM if misconfigured.
  - **Passphrase loss = data loss, by design.** If both the passphrase and the recovery code are lost, the synced copy is unrecoverable — no operator reset is possible (that is the point). Setup shows the recovery code once; a user who dismisses it without saving it is at risk. Local device data is unaffected.
  - **Metadata leakage (accepted, documented).** Even with content encrypted, the operator sees email, ciphertext sizes, row counts (≈ activity volume), timestamps, and doc keys (REQUIREMENTS §1.5). Padding / batching / key-hashing are follow-ups, not shipped.
  - **Concurrent-edit loss under whole-blob LWW.** Two devices editing `hill-climbing-climb` within one sync window: the later push replaces the whole blob, so the earlier device's *state* changes are dropped (the immutable event log still preserves both in History). Fine for one user across their own devices; a per-entity/CRDT merge is the documented fix before multi-user.
- **Watch-items:** confirm RLS after any Supabase change; add full **account deletion** (removing the `auth.users` row) before a tier advance; when extending sync to the **Reflect journal** (the most sensitive store), re-review the metadata-leakage acceptance and use a per-entry merge, not whole-blob. Any change that would sync a **credential** (e.g. Council's API key) must be a separate explicit opt-in — never bundled with normal data.

### L29. Companion sends goals + journal + activity off-device — the broadest personal-content egress in the suite (binding docs amended + founder-ratified)
- **Confidence:** confirmed (by design; `companion.html`, added v0.1 · companion)
- **Severity:** LOW *as coded* at Tier 0 (user-initiated, disclosed behind an explicit key gate, on the user's own key, no operator server) — but it is the **widest-scope** of the BYOK egress paths (L24 Council, L27 Nourish), so it is the most consequential to re-review before any tier advance.
- **Where:** `companion.html` `gatherContext()` reads the user's *current* Climb goals (`hill-climbing-climb`), most-recent Reflect journal entries (up to 25 — free-text truncated ~700 chars each, plus mood/satisfaction, read via the hub's safe version-less IndexedDB open), and recent activity (`hill-climbing-usage` + Nourish level), assembles them into a digest, and `callClaudeRaw()` POSTs it — folded into the system prompt, alongside the running conversation — to `https://api.anthropic.com/v1/messages` on the user's own key. Unlike Council (sends only typed text) and Nourish (pantry text), Companion sends the **journal — the most sensitive store — automatically on every reply, by default**, because the design (founder's choice) shows the agent all three sources always-on with no per-conversation toggle.
- **E2EE does NOT cover this (scope correction, stated plainly):** the end-to-end encryption (`hc-sync.js`) protects the **saved conversation at rest and in cross-device sync** — Supabase holds only ciphertext; the operator cannot read it. It does **not** protect the LLM call: the goals/journal/activity digest reaches Anthropic **readable** (TLS in transit, but plaintext to Anthropic under the user's API terms). So E2EE is the right risk-manager for the *conversation store*; the risk-manager for the *off-device send* is BYOK + explicit gate + the verbatim transparency panel, not encryption.
- **Why it's defensible at Tier 0:** strictly user-initiated (only when the user sends a message), gated behind an explicit key setup that names the data flow and Anthropic in plain language, uses the user's own key (no operator intermediary — CONSTRAINTS §3 power-distribution: the user owns the model relationship), stores nothing operator-readable server-side, and is uniquely transparent — the menu → *What the companion sees* shows the **exact** digest sent. The raw digest is never written into the saved conversation (only the dialogue is), so no second plaintext copy of the journal is created on-device or in the synced blob. (Caveat: the companion's *replies* may paraphrase journal/goal content, and those replies are saved + E2EE-synced — so L28's journal-sensitivity note applies to the conversation blob too.)
- **Key handling — unified across the hub (founder-requested):** the per-app API keys (`hill-climbing-council-key`, `hill-climbing-companion-key`, and the `key` field inside `hill-climbing-nourish-chef`) were consolidated into a single shared `hill-climbing-api-key`, migrated once then deleted, so one BYOK setup serves Council, Companion, and Nourish. This *reduces* the credential-store surface (three copies → one) — a net improvement over the per-app keys — though it does not change the underlying "API key in localStorage is not a secure secret store" caveat (L24/L27); removing the key in any app now clears it hub-wide. Nourish's separate *consent* gate for its off-device send is unchanged.
- **Binding-doc amendment — APPLIED and founder-ratified (this change, not deferred):** §1.1 now carries `hill-climbing-companion` (saved conversations), `hill-climbing-nourish-chef` (now keyless), and the shared `hill-climbing-api-key` credential rows; §1.3 replaces the brittle "three flows" count with a dedicated BYOK-AI-apps bullet naming Council, Nourish, and Companion, and states the Anthropic egress is Anthropic-readable (vs. E2EE sync); §2.1 adds Companion to the opt-in egress list; §1.4 folds the two keys + conversation store into the Tier ≥ 2 delete-all scope; §5's verification row is updated. Hub copy changed from "private · on-device" to "private by default"; Companion is now listed on the hub and precached (`sw.js` `hc-v2.01`).
- **Watch-items before Tier 1 (friends & family):** (a) the always-on default means a non-technical user might not intuit that *conversing* ships their journal — the setup gate discloses it, but consider a one-time "this shares your journal with Anthropic" confirmation before the first send; (b) ensure the future "delete all my data" control actually removes `hill-climbing-companion*`; (c) prompt-injection via the user's own journal/goal text is possible but low-consequence here — no privilege boundary is crossed (single user, own data, advice back to themselves). *(As of v0.2 the companion has read-only web search/fetch — still no state-changing tools; the injection surface it adds is covered in L30.)*; (d) if a per-conversation source toggle is ever added, default-on is fine but the *off* state must be honoured in `gatherContext()`, not just the UI.

### L30. Companion has live internet access — a second off-device pathway (web queries) beyond the digest send (v0.2)
- **Confidence:** confirmed (by design; `companion.html` v0.2 · companion)
- **Severity:** LOW at Tier 0 (user-initiated, on the user's own key, read-only tools, disclosed in-product) — but it is a **distinct new egress channel** layered on top of L29's digest send, so re-review it alongside L29 before any tier advance.
- **Where:** `callClaudeRaw()` now passes Anthropic's server-side `web_search_20260209` + `web_fetch_20260209` tools (`WEB_TOOLS`, `max_uses: 5` each) on every reply. These run inside Anthropic's own agent loop: the model writes a search query, Anthropic executes it (search infrastructure → third-party search providers / the fetched site), and the results return in the same `/v1/messages` response. The browser still only talks to `api.anthropic.com`. A long tool turn can return `stop_reason: "pause_turn"`; the call resumes up to `MAX_TOOL_HOPS` (4) times, re-sending the partial assistant turn.
- **New egress vs L29:** L29 is about *what personal content leaves the device in the request* (the goals/journal/activity digest). L30 is about *new traffic the model generates* — search queries and page fetches — that leaves Anthropic on the user's behalf. This is additional off-device activity that the "only your own data leaves" framing didn't previously cover.
- **Privacy guardrail is a soft (prompt-level) control, not enforced in code:** `COMPANION_SYSTEM` instructs the model to search only with plain, general queries and to *never* put the person's private details (name, journal lines, situation specifics) into a search. This is the right mechanism for a single-user own-data tool, but it is model-obedience, not a hard filter — a model slip could put a private detail into a query. If this app ever advances toward multi-user or higher stakes, consider a harder control (e.g. a query-inspection/redaction step, or gating web access behind a per-conversation toggle).
- **New untrusted-input surface (indirect prompt injection from the web):** web search/fetch pull external, attacker-influenceable content into the model's context. Blast radius stays low here — the only tools are *read-only* web search/fetch, the model only advises the user (no state-changing actions, no privilege boundary), and it's single-user own-data — so a malicious page can at worst skew the advice in one reply, which the transparency + "weigh the source, don't launder a shaky result into confidence" instruction partly mitigates. Watch it if tools with side effects are ever added.
- **Binding-doc tension — flagged, not silently amended:** following the same pattern as L24/L27/L29, this adds an off-device pathway that sits against REQUIREMENTS §1.3/§2.1's opt-in-egress framing (which enumerates the BYOK LLM sends but not model-generated web traffic). Disclosed plainly in-product (lede, setup card, menu note, composer note, *What the companion sees* panel, About), and surfaced here for founder ratification of a REQUIREMENTS amendment — the binding docs are not edited unilaterally.
- **Cost note:** each reply can now trigger up to 5 web searches + 5 fetches on the user's key (server-tool usage is billed on top of tokens). `max_uses` caps it per reply; the user owns the key and the bill, consistent with the BYOK posture. *(v0.3: transient failures auto-retry up to 3× with backoff. A network error usually means the request never completed, so re-billing is unlikely — but a failure that lands **after** Anthropic has already billed the turn would re-charge on retry. Bounded (≤3) and rare; the alternative was a silently-lost reply.)*

### L31. Companion now persists a cross-conversation memory — the first at-rest personal *summary*, and a break from the "for this conversation only" framing (v0.5, founder-requested)
- **Confidence:** confirmed (by design; `companion.html` v0.5 · companion — founder request: "context about me shouldn't be lost across conversations")
- **Severity:** LOW at Tier 0 (user-initiated, on the user's own key, on-device + E2EE-synced, erasable) — but it changes *what the app keeps about the person*, so re-review it with L29/L30 before any tier advance.
- **What changed:** to stop losing context between conversations, the companion now carries its own dialogue forward — the last 3 past conversations verbatim, plus a **rolling summary** of everything older that a separate tool-free background call (`maybeUpdateMemory()` → `SUM_SYSTEM`) distils and updates. The summary is stored in `store.memory.summary` inside the existing `hill-climbing-companion` blob and synced E2E-encrypted like the dialogue.
- **Two honest shifts this introduces:**
  - **(a) New personal data at rest.** L29 could truthfully say "the raw digest is never written into the saved conversation — no second plaintext copy of the journal." That still holds for the *suite digest* (goals/journal/activity are still read fresh and forgotten), but the companion now *does* persist a distilled, model-written **summary of the person's conversations** — which will paraphrase whatever they discussed, potentially including journal/goal-derived content the model surfaced. It's on-device and E2EE-synced (operator sees only ciphertext, same as the dialogue — L28/L29's conversation-blob sensitivity note already covers this class), but it is a *new kind* of at-rest content: an evolving profile, not a transcript.
  - **(b) "For this conversation only" is no longer literally true.** Prior copy (menu note, About, *What the companion sees*, and the system prompt's hard-limit line) told the user their data was used "for that reply only" and "then forgotten." That was accurate when only the transient digest was sent; it is not accurate for the conversation memory, which is the whole point of the feature. All of that copy was rewritten in v0.5 to say plainly that conversations *are* kept and carried forward, that the memory lives on-device (and syncs), and that **"Clear all conversations" erases the memory too** (the forget path — verified: `clear-btn` now resets `store.memory` via `emptyMemory()`).
- **Egress:** no *new* egress channel. The memory is sent to Anthropic on the user's own key exactly as the dialogue + digest already are (L29), and the background summarizer call passes **no web tools** (`callClaudeRaw(..., [])`), so it cannot trigger L30's web traffic. What's new is at-rest persistence, not a new destination.
- **Binding-doc amendment — APPLIED and founder-ratified (this change, not deferred):** REQUIREMENTS §1.1's `hill-climbing-companion` row now documents the persisted `memory: { summary, folded, ts }` (the model-written rolling distillation, not just dialogue); §1.3's BYOK bullet and §2.1's opt-in-egress list now name the cross-conversation memory send plus the separate tool-free background summarizer call; §1.4 notes the memory shares the one blob and already has a Tier-0 delete path ("Clear all conversations"); §5 adds a verification row (memory bounded + erasable + summarizer carries `tools: []`). The in-product copy was corrected in the same v0.5 change. (Ratified alongside this entry, following the L29 pattern rather than the L30 "flagged for later" one.)
- **Watch-items before Tier 1:** (a) confirm any future "delete all my data" control removes the memory, not just the conversation list (today's `emptyMemory()` reset covers the in-app clear); (b) the summary is model-written and could in principle over-retain or mischaracterize — it's shown verbatim in *What the companion sees*, so the user can inspect it, but there's no per-item edit yet (consider an "edit/forget this" affordance if the profile grows sensitive); (c) prompt-injection from the person's own conversation text into the summarizer is low-consequence (single-user own-data, advice back to themselves), same posture as L29(c).
- **Cost note:** the background summarizer is an extra Opus call on the user's key, but only fires when a conversation newly ages out of the verbatim window (or a revived one grows) — not on every reply. `FOLD_BATCH` (8) bounds how much one pass sends; a failed pass is silent and simply retried next time.

---

## How to use this list

1. **Fix safety items first.** S1–S6 are the only items the user-welfare argument requires us to address. Everything else can wait.
2. **Re-evaluate when the tier changes.** What's a LOW issue at Tier 0 may become MEDIUM or HIGH at Tier 2 (e.g., L12 accessibility, L13 mobile, L18 data export all become real safety/welfare concerns at scale).
3. **Each fix gets a verification step.** Especially for the safety items — the whole point of fixing them is to *know* they're fixed.
4. **Update this file as items resolve.** Mark items `✅ verified fixed in vX.Y` and date them.
5. **New risks discovered while fixing one item belong here too.** Don't lose them in commit messages.

**Recommended first action:** S3 (no error boundary) is the highest-leverage safety fix — adding a try/catch around the loop body protects every other safety mechanism from silent failure. Roughly 10 lines of code, shields S1, S2, S4, and the entire time-based safeguard suite.
