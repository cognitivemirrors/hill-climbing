# Hill Climbing — Observation Backlog

A flat list of observations, bugs, ideas, and open decisions. Add an item the moment you notice it; triage at session boundaries. Cheaper to keep than to recover from "I had a thought during a round and now I can't remember it."

Sections are categories, not status. Status is a leading marker on each item:
- `[ ]` — open
- `[~]` — in progress
- `[x]` — done (kept for history; archive periodically)
- `[?]` — needs more thought / observation before action
- `[!]` — concern reported via in-app modal, awaits triage

Move items between sections freely. The order within a section is rough priority — top is more urgent.

---

## Inbox

Things noticed but not yet sorted into a category. Empty this regularly.

- [ ]

---

## Bugs

Things that don't work as intended.

- [x] Report modal shown on page load (missing default `display: none`) — fixed v1.17
- [x] Cancel button in report modal did nothing (no `.show` to remove) — fixed v1.17
- [x] Report link invisible at Tier 0 (over-gated) — fixed v1.18
- [x] Detection always read 0 (hidden video frame-pause optimization) — fixed v1.4
- [x] Stillness climbed to 100% and stayed (consecutive-frame comparison too sensitive to noise) — fixed v1.3

---

## Features / Enhancements

Things to build.

### High-leverage
- [ ] Improve and validate the framing passthrough on the positioning screen — verify head and shoulders actually fall within the silhouette guide; surface corrective feedback ("step back," "centre yourself," "lower the camera," "more light"). Approaches to evaluate: browser `FaceDetector` API (limited support but free), a small WASM/MediaPipe face-and-pose model, or a simple bounding-box heuristic over high-contrast regions in the analysis canvas. Tradeoff is dependency weight vs. accuracy. Also: tune the silhouette overlay itself — current circle-and-curve may be optically wrong for a 4:3 frame at typical laptop distance.
- [ ] Backend submission for adverse-event reports (Tier ≥ 2) — currently localStorage only
- [ ] Pre-screening questionnaire on first run (Tier ≥ 2)
- [ ] Trajectory history list — currently only the last round is saved
- [ ] Session summary view (today's rounds, longest hold, total practice) accessible from re-frame screen
- [ ] Camera framing auto-check during positioning (luma sample, warn on too-dark / too-bright)

### Polish
- [ ] Audio test step during positioning (let user adjust system volume before round 1)
- [ ] Differentiated visuals for smoothness vs. stillness rounds (warmer color palette during smoothness?)
- [ ] Reflection prompts after long rounds (gentle, opt-out-able)
- [ ] Streak tracking (consecutive days practiced) — only if shame-mechanic risk is mitigated
- [ ] Welcome screen hint about the `d` key for the debug overlay (or remove it now that detection works)

### Tier-gated future work
- [ ] Age gate (Tier 3)
- [ ] Geo-localized crisis-resources lookup (Tier 3)
- [ ] Daily session count cap (Tier 3)
- [ ] Cool-down between sessions (Tier 3)
- [ ] Onboarding ramp — first 14 days have lower duration cap (Tier 2)

---

## Tuning / Calibration

Numbers that need empirical adjustment based on actual practice.

- [?] Smoothness target band `[0.15, 0.55]` — verify after a few smoothness rounds
- [?] Smoothness max std-dev `0.12` — same
- [?] `MIN_BREAK_SECS = 10` — might want proportional to round duration (e.g. `max(10, 0.15 × duration)`)
- [?] `FAIL_GRACE_SECS = 0.5` — does this feel forgiving enough on a long round?
- [?] `STILLNESS_THRESHOLD = 0.60` — try 0.55 or 0.65 and feel the difference
- [?] `MOTION_SCALE = 0.03` — sensitivity ceiling for the threshold-based detector
- [?] `PIXEL_THRESHOLD = 8` — luma-diff floor that counts as "moved"
- [?] Sub-bass at 110 Hz — likely inaudible on laptop speakers; consider dropping or making conditional
- [?] Dissonance max detune of 90 cents — might be unpleasant at peak motion
- [?] Initial round duration of 30 s — too long for first-time users? Try 20 s
- [?] Step-up of +15 s — too aggressive? Maybe scale: +10 s below 60 s, +20 s above
- [?] Audio fade-in of 2.5 s — too long? Too short?

---

## Experiments — multiplayer / complex-adaptive-system framing

Treating the app as two coupled complex adaptive systems (user + engine) and as a multiplayer game (user vs. past self, user with others). These are *experiments*, not features — each one has a hypothesis worth testing, a measurement, and a reason it might generate insight beyond what we'd see by just adding capability. Run them because the answer is interesting, not because we already know what to build.

### Category A — Engine ↔ user coupling (mutual modeling)

- [ ] **A1. Personalised difficulty curve beyond 2-up/1-down.** Hypothesis: each user has a characteristic failure pattern (minute-3 fade, post-meal slump, first-round-of-day jitter). Engine builds a per-user model of when failures happen and adjusts the staircase shape to find their *specific* sweet spot rather than a population sweet spot. Measure: success-rate stability over 4 weeks vs. baseline staircase. Risk: model overfits to noise; user gets a confused experience.
- [ ] **A2. Plateau detection and probing.** Hypothesis: a user whose `game.threshold` has been static for 7+ days is either truly plateaued or has adapted to game-the-detection. Engine introduces a controlled variation (slightly different mode, varied detection sensitivity, different starting duration) and observes whether performance survives. Probes whether progress is real or local-maximum.
- [ ] **A3. Calibration-reconciliation dialog.** Periodically the engine asks: *"I think you're working at the right level. Agree?"* User responds yes/no/explain. Engine's internal model of the user updates. Generates a long-running record of user-vs-engine model alignment.
- [ ] **A4. User builds an explicit engine-model.** *"Predict whether the next round will succeed."* The user makes a calibrated forecast; the engine records actual outcome. Brier-score the user's calibration over time. Hypothesis: better self-model → better practice; the metric is internally meaningful.

### Category B — User vs. past self (asynchronous self-multiplayer)

- [ ] **B1. Ghost runner.** Replay the user's best round as a visible faint trace on the ring + audio overlay during a current round. Are they stiller than yesterday? Hypothesis: visible self-comparison improves engagement *without* the shame mechanics of streak counters, because the comparator is just past-you. Risk: introduces competition into a non-competitive practice.
- [ ] **B2. Aggregate-trajectory comparison.** End-of-week reflection shows this week's stillness curves overlaid on previous weeks. The shape — not the score — is the artefact. Hypothesis: shape changes (faster settle-in, smaller dips, longer plateaus at high stillness) are more meaningful than peak scores.
- [ ] **B3. "Today vs. last Tuesday."** Specific time-of-day comparison. Tests whether circadian / weekly rhythm dominates.

### Category C — Inter-user multiplayer (real other users)

*All Tier ≥ 2; involves data leaving the device. Sketch only — implementation gated by user-council ratification per CONSTRAINTS.md §3.*

- [ ] **C1. Anonymous aggregate currently-practising.** *"Right now, 7 people are practising. Here's the median stillness curve."* Faint overlay during your own practice. Tests whether community presence affects sustained-attention quality.
- [ ] **C2. Asynchronous dyadic.** Two consenting users practise independently; their stillness curves are visible to each other after the fact. Tests whether knowing-someone-else-saw-mine affects honesty/effort.
- [ ] **C3. Synchronised dyadic.** Two users in real time, each seeing the other's score. Hypothesis: co-regulation is real and measurable as cross-correlation of stillness traces. If true, this is a meaningful add for therapy-adjacent contexts.
- [ ] **C4. Cooperative group session.** N users, shared aggregate score. The group succeeds together or fails together. Tests whether collective accountability improves or degrades individual practice.

### Category D — Emergent CAS dynamics

- [ ] **D1. Identify attractors.** Across many users / many sessions, are there stable points the system gravitates toward (specific threshold + duration combinations)? Are they distributed naturally or clustered around the staircase parameters? Tells us whether the staircase is finding equilibria or imposing them.
- [ ] **D2. Detect phase transitions.** Is there a stillness-threshold above which the practice changes character? (e.g., after 0.85 the user reports qualitatively different experience.) Hypothesis: there's a non-linear regime change, not a smooth gradient.
- [ ] **D3. Anti-Goodhart probes.** Periodically vary detection sensitivity, threshold, or audio behaviour by ±5%. If performance drops, the user was overfit to the specific implementation. If it holds, calibration generalises. Tests whether they're cultivating real stillness or game-specific behaviour.
- [ ] **D4. Compulsion early-warning.** Engine watches for patterns associated with compulsive use: rapid re-attempts after losses, ignoring break prompts, late-night sessions, escalating session counts. Triggers a gentler intervention than the existing soft cap.
- [ ] **D5. Fatigue and recovery modelling.** Within-session degradation curves, between-session recovery times. Does the user have a measurable "stillness budget" per day? If so, surface it.

### Category E — Mutual information flow

- [ ] **E1. Predictive failure cue.** From the last 200 ms of motion samples, predict whether the user is *about* to drop below threshold. Issue an audio cue — a single soft tone — *before* failure. Hypothesis: predictive feedback shortens the closed-loop, lets the user catch drift before it becomes a loss. Risk: cue creates anxiety; users learn to dread the tone.
- [ ] **E2. Pre/post-session mood correlation.** Optional 1-question rating before settling and after the round. Longitudinal pattern is the signal: pre→post lift indicates immediate value; absent lift means habit but not benefit. (Already discussed; this entry tracks the experiment rather than the implementation.)
- [ ] **E3. Reflective pattern surfacing.** *"You tend to do best in the morning. Your worst rounds follow long sitting periods. Your stillness is correlated with sleep quality."* Engine generates these from the data and surfaces them at long intervals. Hypothesis: reflection beats reactive feedback for skill development.
- [ ] **E4. Open-ended journal coupling.** Free-text note on entry/exit; engine looks for language-outcome correlations over weeks. Hypothesis: the things users write about emotionally have measurable effect on practice quality.

### Category F — Safety as a CAS property

- [ ] **F1. Trance-detection probes.** Periodically during long idle/won states, introduce a brief stimulus (a click, a faint flash) and measure user response — they should react within X seconds. Dampened or absent response is a signal of altered state. Engine reduces stimulus intensity and surfaces a check-in.
- [ ] **F2. Dissociation-risk model from interaction patterns.** Reaction-time distributions, eye-blink rate (if camera permits), motion-stillness derivative. Build a probabilistic estimator and validate against self-reports.
- [ ] **F3. Resilience testing.** Adversarial inputs: simulated camera failure, user reporting acute distress, extreme network latency, extended session that approaches limits. Does the system degrade gracefully? Does the safety surface stay intact under all of these?

### Category G — User-as-system (long-horizon)

- [ ] **G1. Skill curve characterisation.** Over 12 weeks, what does a successful user's trajectory look like? Linear improvement, step-function, plateau-and-jump? Compare to a non-engaged user. The shape distinguishes "this practice worked for them" from "they got better at the game."
- [ ] **G2. Self-similarity analysis.** Are individual rounds fractal? Does a 30-second round look like a scaled 5-minute round? If yes, micro-practice is meaningfully equivalent to macro-practice and short sessions are valuable.
- [ ] **G3. Off-app spill-over.** Self-reported measures of attention/calm/well-being in everyday life vs. in-app metrics. Hypothesis: in-app skill is necessary but not sufficient; some users transfer, some don't. What predicts transfer?

### Notes on running these experiments

- **Most are Tier ≥ 2.** They require either backend infrastructure (C-series), tracking that exceeds Tier 0 ethics (D, E, G), or population data (D1).
- **Pre-register hypotheses.** Without it, post-hoc analysis becomes pattern-matching on noise. Write down the prediction and the kill criterion before instrumenting.
- **Most experiments will fail.** That's the point. The goal is generating real evidence, not confirming designs.
- **Some experiments are themselves safety-relevant.** F-series in particular needs clinical-advisor sign-off before instrumenting.

---

## Design Questions

Open decisions, not yet resolved. Many flagged in `CONSTRAINTS.md` §7 already; tracking the most live ones here.

- [?] Co-founder requirement: solo at Tier 0 OK; what's the trigger to require disciplinary diversity (clinician/ethicist) on the team?
- [?] Tier transition triggers — at what user count, revenue level, or duration does TIER 0 → 1 → 2 → 3 advance? Pre-commit before reaching them.
- [?] Pre-screening questionnaire content — which validated items, what false-positive vs. false-negative tradeoff
- [?] User council mechanism — how are members selected? Self-nomination, randomized, by tenure?
- [?] Crisis pathway specifics — which hotlines, which warm-handoff partners, what consent flow
- [?] Revenue model — direct subscription, donation, sliding scale; each has different power-distribution implications
- [?] Should consecutive-loss tracking exist anywhere? (Currently no. Risk of shame-mechanic if surfaced.)
- [?] Smoothness rounds use the same staircase as stillness rounds — should they?
- [?] Should re-framing reset the cooldown if mid-cooldown?

---

## Reported Concerns

Items captured via the in-app `this didn't feel right` link. Pull from `localStorage.hill-combing-reports` periodically and triage here. Each entry should keep its timestamp and the round-state snapshot from when it was reported.

- [!] (none yet)

---

## Done

Items completed in recent versions, kept for context. Archive to a CHANGELOG when this gets noisy.

- [x] v1.18 — Report link visible at all tiers (capture always on; backend POST tier-gated)
- [x] v1.17 — Modal CSS bug fix (report modal hidden by default; Cancel works)
- [x] v1.16 — Audio trajectory save & replay
- [x] v1.15 — Minimum 10s break between rounds with countdown
- [x] v1.14 — Cap pill in round-info; start-screen mentions 5-min ceiling
- [x] v1.13 — Smoothness-round mode (alternates after each interlude)
- [x] v1.12 — Tier system (TIER 0–3); local adverse-event capture; responsibility-copy variant
- [x] v1.11 — Personalised welcome; ambient bells idle-only; settling timeout; camera-disconnect detection
- [x] v1.10 — Failure grace window; round-start audio cue; re-frame link
- [x] v1.9 — Debug overlay toggle (d key); positioning step with silhouette guide; today-stat tracking
- [x] v1.8 — Motion interlude every 3 wins (untimed, breathing pacer)
- [x] v1.7 — Safety modal; hard duration cap; Esc abort; reframed loss copy; reminders
- [x] v1.6 — Renamed to Hill Combing
- [x] v1.5 — Game with 2-up/1-down staircase
- [x] v1.4 — Switched detection to live `cameraPreview` element (frame-pause bug fix)
- [x] v1.3 — Threshold-based pixel-counting detection; debug overlay
- [x] v1.2 — Adaptive motion calibration (replaced in v1.3 with simpler approach)
- [x] v1.1 — Initial fundamental-tone audio + ring + game scaffolding
- [x] v1.0 — Camera-based stillness measurement with ambient audio feedback

---

## How to triage

When you sit down to triage:

1. Empty the **Inbox** by sorting items into the right section.
2. Scan **Reported Concerns** — read each note, decide if it's a bug, a tuning issue, a design question, or noise. Move it.
3. Pick at most **3 items from anywhere** to mark `[~]` for the next session. Resist the urge to take more.
4. Move completed items to **Done** (or archive to a changelog when this section gets long).
5. If an item has been `[?]` for more than two triage sessions without action, either commit to investigating it or delete it. Indecision compounds.

The backlog is most useful when it's slightly *embarrassing* to look at — full of things you haven't done yet. A clean backlog usually means you've stopped noticing.
