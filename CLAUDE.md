# Hill Climbing — Agent Handoff

**For the next AI instance.** Read this file first, in full, before acting. Then read the files listed in §3 in the order given. Then ask the user §6's confirmation question before making any change.

This is a working solo-developer project. The user is building a stillness-meditation web app. The git baseline is `v1.32`; this handoff has been kept current through to that version.

---

## 1. Project state

- **Single-file HTML web app** at `/Users/kevinchan/stillness/index.html`. No build system, no dependencies, no backend. Open the file in a browser to run.
- **Current version:** v1.32. Tier 0 (solo developer).
- **Git is initialised** at v1.32 baseline. Each version bump should be its own commit + tag. See §4 for workflow.
- **The app:** measures user stillness via webcam motion detection, plays synthesised sound that responds to stillness, and runs a 2-up/1-down staircase game that adapts both round duration and stillness threshold to keep the user near a ~71% success rate.
- **Two round modes** alternate: "stillness" rounds (the default) and "smoothness" rounds (after every motion interlude — the user maintains slow continuous motion instead of stillness).
- **TIER constant** at the top of the JS gates safety features: 0 (solo dev), 1 (friends & family), 2 (open beta), 3 (public). Higher tiers activate more safety scaffolding; user is at 0 for now.
- **Audio paradigm at v1.32:** at peak stillness the harmonic drone fades to silence and is replaced by occasional pentatonic bell strikes (the "temple atmosphere" model). The user explicitly likes the bell character; the sustained drone at high volume was reported as fatiguing across multiple iterations.

---

## 2. Files in the repo

| File | Purpose | Read first? |
|---|---|---|
| `index.html` | The app — single-file HTML/CSS/JS, ~2200 lines | Yes (skim, don't memorise) |
| `CONSTRAINTS.md` | Founding principles: care, safety, balanced power distribution. Contains `[DECISION]` markers for unresolved values. | Yes |
| `REQUIREMENTS.md` | Auditable specifics: data inventory, adverse-event runbook, tier transition criteria, verification procedures, decision register | Yes |
| `BACKLOG.md` | Work tracking. Categorised by Bugs / Features / Tuning / Design Questions / Done | Yes |
| `KNOWN_RISKS.md` | Self-flagged uncertainties, ranked by user-safety severity (S = safety, L = low) | Yes |
| `CLAUDE.md` | This file | (You're here) |

**Document precedence** in case of conflict: CONSTRAINTS > REQUIREMENTS > BACKLOG. KNOWN_RISKS doesn't bind — it captures uncertainty.

---

## 3. Recommended reading order for next instance

1. `CLAUDE.md` (this file) — collaboration norms and history
2. `CONSTRAINTS.md` — the principles
3. `REQUIREMENTS.md` — what's auditable/binding
4. `KNOWN_RISKS.md` — what's known-broken or suspect, ordered by user-safety
5. `BACKLOG.md` — what's open
6. `index.html` — skim CSS, skim JS state machine, deep-read whatever's relevant to the task

---

## 4. Collaboration norms (inferred from the user)

These are how the user has consistently operated. Default to these unless told otherwise.

- **Auto mode is on.** Execute autonomously, make reasonable assumptions, prefer action over planning. The user provides course corrections rather than approving every step.
- **User pushes back when wrong.** Take corrections seriously and re-evaluate framing, not just the specific item. Example from session: I labelled "tab-switching exploit" as HIGH severity; user correctly flagged that this was gameplay-integrity, not safety, and insisted *user safety is the primary axis* for all risk assessment. That reframing should propagate to all future severity calls.
- **User prefers concrete over theoretical.** When asked exploratory questions, give a recommendation and the main tradeoff (2–3 sentences for small questions, longer for substantive ones), not a survey of possibilities.
- **Bias toward shipping but pause-for-inspection default.** After a substantive change, the default is to wait for user verification. The user overrides with "keep going" when they want continuation. Bigger refactors and aesthetic changes especially deserve a pause.
- **One feature per iteration when iteration is risky.** The user explicitly noted "you ideate and ship faster than I can inspect" — slow down for things touching state machine, persistence, audio engine, or safety mechanisms.
- **The version-label is `vX.Y · hill climbing · tier N`.** Bump version on user-visible changes. Update both the HTML literal and the JS dynamic line.
- **localStorage keys keep the `hill-combing-*` prefix for v1 stability** even though the app was renamed. New keys may use `hill-climbing-*`. Do not rename existing keys without a migration shim — user state would be lost.
- **The IDE / preview panel auto-publishes after each edit, with a hook reminder to mention it.** When you edit `index.html`, the system reminder says "is now visible in the preview panel" — your response should briefly acknowledge that.
- **The `TodoWrite` tool reminder appears periodically.** It's a gentle nudge — ignore unless tracking work would actually help. Never mention the reminder itself to the user.
- **No documentation files unless asked.** Markdown files like CONSTRAINTS.md, REQUIREMENTS.md, BACKLOG.md, KNOWN_RISKS.md, and this CLAUDE.md were each created at explicit user request. Don't proliferate docs unprompted.
- **Git workflow.** The repo was initialised at v1.32 (baseline commit `4683660`). Convention going forward: every version bump = one commit + one tag. Commit subject uses the same format as the version label: `vX.Y · brief summary`. Use a HEREDOC for the body and include the `Co-Authored-By: Claude Sonnet 4.6` trailer. Revert is `git checkout vX.Y` followed by reload. Never `git push` or run destructive operations (`reset --hard`, force push, branch deletion) without explicit user instruction. Commits should match the per-iteration cadence — small enough that each one is reviewable, big enough that each represents a real unit of change.

---

## 5. The user's values, as established in this session

The user has been thoughtful and explicit about what matters. Carry these forward.

- **Care, safety, balanced power distribution** are the three founding constraints. Care is active beneficence; safety is harm prevention; power distribution is resisting concentration (over user attention, user data, user behavior, market position, internal company power).
- **User safety is the primary axis** for risk assessment. Gameplay integrity, code quality, accuracy, and feature completeness are secondary. A bug that makes the game less fun is LOW severity; a bug that defeats a safety mechanism is MEDIUM severity even if it requires deliberate user action to trigger.
- **Engagement metrics are explicitly rejected.** Don't optimise for time-spent, daily active use, streak length, or retention. The CONSTRAINTS doc names these as anti-patterns.
- **"Not therapy or medical care" alone is a cop-out** — the user pushed back when I used it as a disclaimer. The responsibility-copy variant of the safety modal (Tier 2+) reflects this: take responsibility for the harm the practice might cause, don't disclaim it away.
- **Audit-readiness matters.** REQUIREMENTS.md was written specifically because the user wanted documented commitments that an external auditor (privacy, safety, governance) could verify. Don't drift from that doc's specifics; if you change a binding constraint, update REQUIREMENTS.md.
- **Tier-gating is real.** The TIER constant at the top of JS controls escalating safety. Don't hardcode safety features at tier 0 that should escalate; don't gate things that should always-on (capture is always-on, backend submission is tier-gated — a distinction the user explicitly drew).

---

## 6. The first question to ask the user

Before making any change, ask:

> "I've read CLAUDE.md, CONSTRAINTS.md, REQUIREMENTS.md, KNOWN_RISKS.md, and BACKLOG.md. The repo's at v1.32 baseline (`git log` should show that). Before I do anything, can you confirm: (a) are we still at TIER 0; (b) is the highest-leverage next item still S1 (replay clears cooldown) or S4 (sticky reminder flags); and (c) any context the prior session missed?"

Wait for the answer. Then proceed.

---

## 7. Critical decisions made in the prior session that don't fully appear in other docs

These came up in conversation and informed code, but the reasoning isn't fully captured in CONSTRAINTS or REQUIREMENTS.

- **The motion-interlude (light-version alternation) was chosen over a full smoothness-scored mode initially, then the smoothness-scored mode was added later in v1.13.** The interlude is now followed by exactly one smoothness round per cycle.
- **The 2-up/1-down staircase was chosen because it converges to ~71% success rate** (Levitt 1971 — the engagement-zone result from psychophysics). Both duration AND threshold staircase together as of v1.22.
- **Audio is parameter-replay, not signal-replay.** Trajectory recording captures `(stillness, audioMotion)` samples at 10 Hz; replay feeds these back to the live audio engine. Faithful to "what was sent to the audio engine," not a microphone capture. The audio engine's smoothing (~0.5s time constants) means replay is approximate.
- **Onboarding modal shows on first run regardless of tier.** This is universal orientation. Safety modal is tier-gated (≥1). They're separate.
- **The 5-minute idle-pause is a coarse heuristic.** The user accepted it as the trance-prevention safeguard at Tier 0; at higher tiers, more sophisticated detection is on the roadmap.
- **Smoothness rounds and stillness rounds share `game.threshold`.** This is intentional but flagged as L14 in KNOWN_RISKS — at very high thresholds, smoothness rounds become hard.
- **The error boundary in v1.25 was the highest-leverage safety fix** because it protects every other safety mechanism from silent failure via JS errors in the loop. Subsumes the loopRunning recovery item.
- **The audio went through a multi-iteration paradigm shift (v1.26 → v1.32).** The user said the high-stillness sound was unpleasant across multiple iterations of incremental volume reduction. After exhausting "tune the same knobs" (peaks, curves, plateau, fade-out windows), the design moved to a paradigm where peak stillness has *no sustained drone* — just occasional pentatonic bell strikes. Trigger frequencies, scale, volume, and interval are all configurable. The user explicitly likes the bell character; sustained sine-tone drones do not work for them.
- **Detection sensitivity tightened in v1.28.** `MOTION_SCALE: 0.03 → 0.018`. User said it was too easy to settle into a high stillness score. Combined with the rise-alpha-decays-with-stillness change, climbing past 90% now takes real sustained stillness rather than a few seconds.
- **The reward at peak stillness is space, not sound.** This is the v1.30/v1.32 design philosophy. The "rich" zone is around 75–82% (where the harmonic stack peaks); 100% is sparser. Approaching is rewarded, arriving is gentle.
- **Mobile responsive in v1.29.** Single breakpoint at 640px. Round-info wraps; ring shrinks to 240px; timer moves below ring; corner buttons tighten. Not a full mobile-first redesign; it's a "doesn't break" pass.

---

## 8. Discussion threads worth preserving (not in any file)

These shaped the project's direction. If a future user wants to revisit any of these, the next instance should be aware they happened.

- **AI-lab funding & governance** (anthropological / political-science / economics lenses): how to fund a tech company under care + safety + power-distribution constraints. The user is genuinely building something analogous and asked for serious treatment. Layered structure recommendation: perpetual purpose trust + worker cooperative + capped non-voting outside capital + user council + external accountability board. Concrete funder categories suggested. This conversation is the source of CONSTRAINTS.md §3 (power distribution).
- **AI safety as organisational culture** (~60–70% of practical safety outcome): hiring filter, founder embodiment, costly signals, pre-commitment mechanisms, ritualised dissent, demographic diversity, comp tied to outcomes, welcomed whistleblowers, external accountability, near-miss documentation. The user accepted these as binding for their own org.
- **Trance-state risk and the ring's role.** The user asked specifically about hypnotic risk; the answer was the 5-minute idle-pause. KNOWN_RISKS S6 captures the residual coarseness.
- **What a north-star metric would look like for this app.** Conclusion: not engagement, not capability — qualitative monthly self-reflection + pre/post-session 1-question rating + one external canary metric. Implementation deferred; user was deciding whether to build the in-app rating or just keep a journal.

---

## 9. Active open questions (live as of v1.32)

- **S1 (replay clears cooldown)** and **S4 (sticky reminder flags)** are the next safety items to fix. Either is a reasonable choice; user hasn't picked yet.
- **The 12 [DECISION] markers in CONSTRAINTS.md** have proposed defaults in REQUIREMENTS.md §7 but await explicit founder ratification. Don't unilaterally treat them as resolved.
- **Aesthetic polish via design tokens** was discussed but not started. Backlog has it as a high-value future task.
- **The journal-vs-in-app-rating question** for measuring app value in user's life — user was leaning toward journal first; nothing built yet.
- **Audio tuning of v1.32 is fresh.** The user approved the temple-atmosphere paradigm but it's only had one feedback cycle. Be ready for further tuning of: ambient bell interval (currently 6–14s), volume (currently 35%), pentatonic scale, and the fade-out range for anchor layers (currently 0.85–1.0).

---

## 10. My (prior session's) known weaknesses

For the benefit of the next instance, knowing what to be cautious about:

- **I tend to ship too fast for solo-dev verification.** Default to one feature per iteration with a pause for the user to inspect.
- **I conflated feature-integrity with user-safety in earlier risk assessments.** User explicitly corrected this — *user safety is the primary axis*, not feature correctness.
- **I sometimes propose features the user didn't ask for.** Default to small polish and explicit asks, not roadmap-style additions.
- **I over-cited a specific "3–5%" stat for adverse meditation events** that I couldn't actually verify. The honest framing is "documented across studies of regular meditation" without a specific number. (Already corrected in onboarding copy in v1.24.)
- **I used a hacky `setPhase` reassignment pattern** in the replay code that should be cleaned up to call `updateReplayButton()` inline. Logged as H2 / L-rank in KNOWN_RISKS.

---

## 11. How to verify this handoff is current

Before relying on anything in this file, verify:

1. The version label in `index.html` matches what this doc claims (v1.32 at write time).
2. The files listed in §2 still exist with the same purposes.
3. The TIER constant at the top of the JS is still `0`.
4. None of the §9 open questions has been answered without this doc being updated.
5. `git log` shows the v1.32 baseline commit is still the earliest in the history.

If any of those are out of date, treat this file as stale and ask the user to update or re-handoff.

---

## 12. Final note from the prior instance

The user is building this as both a personal practice tool and the seed of a values-constrained organisation. They're thoughtful, push back well, and care about safety as a binding constraint rather than a marketing claim. Treat the work seriously. When in doubt, prioritise their welfare over feature velocity. Read the docs. Match the existing voice in CONSTRAINTS.md and REQUIREMENTS.md (specific, slightly uncomfortable, refuses to disclaim away responsibility) when adding to those documents.

The hardest thing is keeping the structure honest as it grows. Most of my best work in this session came from being explicit about what's binding versus what's malleable — that distinction is the load-bearing one. Carry it forward.
