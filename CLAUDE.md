# Hill Climbing — Agent Handoff

**For the next AI instance.** Read this file first, in full, before acting. Then read the files listed in §3 in the order given. Read **§0 (default posture)** before you touch anything, then ask the user what they want to work on.

This is a working solo-developer project. The user is building a suite of contemplative/practice web apps under the "Hill Climbing" name (it began as a single stillness-meditation app). The git baseline is `v1.32`; this handoff was last hand-updated around **v1.77**, but **the repo has moved past that** — treat every version number, "current version," and open-item list in this file as possibly stale. The source of truth is `git log` / `git tag` and the `TIER` constant in the code, not this prose. §§5–10 were largely written during the single-app era and still describe the meditation app specifically; they remain accurate *for `meditate.html`*.

---

## 0. Default posture and scope discipline

Read this before deciding what to do.

- **Default to the user's stated task.** Don't go looking for governance, audit, or doc-amendment work. The user steers; you execute. If you find yourself proposing a roadmap, a constraints rewrite, or a "while we're here, let's also fix the docs" detour that the user didn't ask for, stop.
- **CONSTRAINTS.md and REQUIREMENTS.md are mostly forward-looking scaffolding.** They specify obligations calibrated for a future multi-user, possibly-incorporated org. **At the current `TIER` (check the constant in the code — it's 0, solo developer, effectively a single user), the subset that actually binds *now* is small.** A requirement gated above the current tier (`[TBD-TIER-N]`, anything in §4 tier-transition lists, clinical advisor, pre-screening, user council, backend submission, breach runbooks) is a *future commitment, not a present task*. Do not act on it, and do not be alarmed by a "gap" in it, unless the user is explicitly doing tier-transition work.
- **If you spot a doc gap, a misspecified clause, or a contradiction** (e.g. a binding statement that the shipped code no longer matches): log it in **one terse line** in BACKLOG.md or KNOWN_RISKS.md and keep moving. **Check KNOWN_RISKS first** — it's very likely already logged and deliberately deferred, and re-litigating it is the exact distraction this section exists to prevent.
- **Binding-doc edits still need explicit user confirmation** (see §4). Noticing a problem ≠ a license to fix it inline. Surface it terse; let the user decide whether and when.

The point: the elaborate risk apparatus in the binding docs is *designed* to escalate with real exposure via the tier system. Front-loading it for an app only the founder uses is the over-engineering the tiers exist to prevent.

---

## 1. Project state

> **⚠️ STRUCTURE (updated through v1.77 — read before editing files).** The project is **four apps behind a hub**, not one. `index.html` is a static **hub/landing page** (Meditate · Breathe · Reflect · Nourish cards + a weekly-usage dashboard + opt-in Web Push reminders). The meditation app — everything this handoff calls "the app" / "index.html" below — lives in **`meditate.html`** (its own in-product label reads `v1.75`; the global git tag line is `v1.77`). The other three practices are `breathe.html` (breathwork + nervous-system training, was `nervous-system.html`), `reflect.html` (journal, IndexedDB-backed, was `journal.html`), and `nourish.html` (learn-to-cook via the staircase, added v1.77). Each app links back to the hub via a top-left `#home-link`. **When the prose below says `index.html`, it means `meditate.html`.** §§5–10 predate the multi-app split and are pinned to the meditation app — treat their file references accordingly.

- **Single-file HTML apps**, one per practice, plus the hub. No build system, no dependencies, no backend. Open any file in a browser to run.
- **Current version:** v1.77 committed (Nourish, the fourth practice). Tier 0 (solo developer). Each app carries its own in-product version label; the git tag line (`vX.Y`) is global across the suite.
- **Git is initialised** at v1.32 baseline. Each version bump should be its own commit + tag. See §4 for workflow.
- **The app:** measures user stillness via webcam motion detection, plays synthesised sound that responds to stillness, and runs a 2-up/1-down staircase game that adapts both round duration and stillness threshold to keep the user near a ~71% success rate.
- **Two round modes** alternate: "stillness" rounds (the default) and "smoothness" rounds (after every motion interlude — the user maintains slow continuous motion instead of stillness).
- **TIER constant** at the top of the JS gates safety features: 0 (solo dev), 1 (friends & family), 2 (open beta), 3 (public). Higher tiers activate more safety scaffolding; user is at 0 for now.
- **Audio paradigm at v1.32:** at peak stillness the harmonic drone fades to silence and is replaced by occasional pentatonic bell strikes (the "temple atmosphere" model). The user explicitly likes the bell character; the sustained drone at high volume was reported as fatiguing across multiple iterations.

---

## 2. Files in the repo

| File | Purpose | Read first? |
|---|---|---|
| `index.html` | **Hub/landing page** (~720 lines) — four cards + weekly usage dashboard (added v1.64; Nourish row added v1.77) + install banner (v1.73) + opt-in Web Push reminders (v1.76). Added 2026-05-30. | Yes (quick skim) |
| `meditate.html` | **The meditation app** — single-file HTML/CSS/JS, ~3,140 lines. This is what the rest of this doc calls "index.html". Was `index.html` until 2026-05-30. | Yes (skim, don't memorise) |
| `breathe.html` | Breathwork + nervous-system training app (~710 lines). Was `nervous-system.html`. | If relevant |
| `reflect.html` | Journal app, IndexedDB-backed (~620 lines). Was `journal.html`. | If relevant |
| `nourish.html` | Cooking app (~940 lines). Adaptive 2-up/1-down staircase over a 10-level ladder of cooking challenges; success is self-reported. State in `hill-climbing-nourish` localStorage. Added v1.77 (2026-06-20). | If relevant |
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
- **When the user says "completely different," believe them.** Across the v1.26–v1.31 audio iterations I kept tuning the same architecture even though the user was reporting the same complaint each round. They had to explicitly say "we may have maxed out on these knobs" before I shifted paradigm. **Heuristic: if the same user complaint persists after 2+ rounds of incremental fixes, the issue is paradigm-level, not parameter-level.** Stop tuning, propose alternative paradigms, ask the user to choose before implementing.
- **User prefers concrete over theoretical.** When asked exploratory questions, give a recommendation and the main tradeoff (2–3 sentences for small questions, longer for substantive ones), not a survey of possibilities.
- **Bias toward shipping but pause-for-inspection default.** After a substantive change, the default is to wait for user verification. The user overrides with "keep going" when they want continuation. Bigger refactors and aesthetic changes especially deserve a pause.
- **One user-stated outcome per iteration when iteration is risky.** The user explicitly noted "you ideate and ship faster than I can inspect" — slow down for things touching state machine, persistence, audio engine, or safety mechanisms. Note: "one outcome" allows bundling multiple coordinated code changes that all address the same user complaint (e.g., three coordinated knob tweaks for a single "audio is harsh" fix). The rule is about the unit of verification, not the unit of code change.
- **The version-label is `vX.Y · hill climbing · tier N`.** Bump version on user-visible changes. Update both the HTML literal and the JS dynamic line.
- **localStorage keys keep the `hill-combing-*` prefix for v1 stability** even though the app was renamed. New keys may use `hill-climbing-*`. Do not rename existing keys without a migration shim — user state would be lost.
- **The IDE / preview panel auto-publishes after each edit, with a hook reminder to mention it.** When you edit `index.html`, the system reminder says "is now visible in the preview panel" — your response should briefly acknowledge that.
- **The `TodoWrite` tool reminder appears periodically.** It's a gentle nudge — ignore unless tracking work would actually help. Never mention the reminder itself to the user.
- **No documentation files unless asked.** Markdown files like CONSTRAINTS.md, REQUIREMENTS.md, BACKLOG.md, KNOWN_RISKS.md, and this CLAUDE.md were each created at explicit user request. Don't proliferate docs unprompted.
- **CONSTRAINTS.md and REQUIREMENTS.md amendments need explicit user confirmation.** These docs bind. BACKLOG.md, KNOWN_RISKS.md, and this CLAUDE.md can grow freely; the binding docs need a specific user ask before changes. The precedence ordering (CONSTRAINTS > REQUIREMENTS > BACKLOG > KNOWN_RISKS) is the trigger: anything in the top two requires confirmation, anything in the bottom two can be edited as work proceeds.
- **Reuse existing infrastructure before building new.** When extending the app, ask *"can the existing code be extended to handle this?"* before writing new structure. Default to extension; build new only when conflation would actually hurt readability or correctness. The bias toward new is one of my consistent failure modes — example: when adding ambient bells in v1.32, I considered both a new scheduler and extending the milestone-bell code; the new scheduler happened to be the right call but the deliberation should be the default, not the exception.
- **Git workflow — "shipped" means pushed.** The repo was initialised at v1.32 (baseline commit `4683660`) and is hosted at `github.com/cognitivemirrors/hill-climbing`, deploying to GitHub Pages at `https://cognitivemirrors.github.io/hill-climbing/` on every push to `main` (~1–2 minute redeploy). **A local edit is not a ship.** When you say "shipped vX.Y" in chat, that claim must be backed by a commit + tag + push, otherwise the user is testing one thing and your statement claims another. This drifted in the v1.50–v1.53 cycle (four version bumps, zero commits) and required a retroactive consolidated commit. Don't repeat it.

  **Per-version checklist (run end-to-end before saying "shipped"):**
  1. Bump both version locations in `meditate.html` (the `#version-label` HTML literal and the `document.getElementById(...).textContent` line). The hub (`index.html`) does not currently carry a version label.
  2. Add a `Done` entry to BACKLOG.md (top of the list, terse).
  3. `git add` the files; `git commit -m "vX.Y · brief summary"` with a HEREDOC body and `Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>` trailer.
  4. `git tag -a vX.Y -m "..."` — annotated, not lightweight.
  5. `git push --follow-tags origin main`.
  6. In your reply to the user, say "Pushed v1.X to main, tagged. GitHub Pages will redeploy in ~1–2 min." — not "shipped" without that confirmation.

  **One commit per version is the cadence.** If you're iterating quickly and tempted to batch, resist; a paradigm-shift session that produces 3+ versions and one fat commit erases the per-version revert path the tagging convention was built to give. Pause to commit *between* versions, not at the end.

  - **Tag push gotcha:** `git tag vX.Y` creates a *lightweight* tag, which `git push --follow-tags` does **not** push. Either use annotated tags (`git tag -a vX.Y -m "..."`) so `--follow-tags` works, or explicitly run `git push origin vX.Y` after each tag. Lightweight tags created locally without explicit push will not exist on the remote.
  - Revert path: `git checkout vX.Y` for local; `git revert HEAD --no-edit && git push` for the deployed version (avoid force-push to main).
  - Never run destructive operations (`reset --hard`, force push, branch deletion) without explicit user instruction.

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

Open by asking **what the user wants to work on** — don't lead with a checklist of open safety/doc items (an earlier version of this section did exactly that, which front-loaded governance before the user had stated a goal; see §0). Orient yourself from `git log` / `git tag` and the `TIER` constant, confirm the tier if it matters to the task, and surface relevant context only once you know what they're doing. Keep open-item lists out of the opening — they go stale, and naming them invites a detour into work the user didn't ask for.

A serviceable opener: *"Caught up on the docs and the current state (verified against git). What would you like to work on?"* — then narrow with task-specific questions.

---

## 7. Critical decisions made in the prior session that don't fully appear in other docs

These came up in conversation and informed code, but the reasoning isn't fully captured in CONSTRAINTS or REQUIREMENTS.

- **The motion-interlude (light-version alternation) was chosen over a full smoothness-scored mode initially, then the smoothness-scored mode was added later in v1.13.** The interlude is now followed by exactly one smoothness round per cycle.
- **The 2-up/1-down staircase was chosen because it converges to ~71% success rate** (Levitt 1971 — the engagement-zone result from psychophysics). Both duration AND threshold staircase together as of v1.22.
- **Nourish (v1.77) reuses the staircase with a self-reported success signal.** The cooking app has no sensor, so the user reports the outcome themselves (Nailed it / Came together / Struggled): two clears step the level up, one struggle steps it down, over a 10-level ladder of 25 cooking challenges. State is one localStorage blob (`hill-climbing-nourish`: level, streak, cleared dishes, history, in-progress cook). Usage logs `markUsage('nourish')` when the user commits to cook — the analog of meditate's `setPhase('settling')`. Watch the gamification line: levels/progression are exactly what CONSTRAINTS §3.1/§5 are wary of — kept honest by free skips, non-shaming outcome copy, no points/badges, and the weekly (not daily) hub streak. Flagged for review in KNOWN_RISKS L23.
- **Audio is parameter-replay, not signal-replay.** Trajectory recording captures `(stillness, audioMotion)` samples at 10 Hz; replay feeds these back to the live audio engine. Faithful to "what was sent to the audio engine," not a microphone capture. The audio engine's smoothing (~0.5s time constants) means replay is approximate.
- **Onboarding modal shows on first run regardless of tier.** This is universal orientation. Safety modal is tier-gated (≥1). They're separate.
- **The 5-minute idle-pause is a coarse heuristic.** The user accepted it as the trance-prevention safeguard at Tier 0; at higher tiers, more sophisticated detection is on the roadmap.
- **Smoothness rounds and stillness rounds share `game.threshold`.** This is intentional but flagged as L14 in KNOWN_RISKS — at very high thresholds, smoothness rounds become hard.
- **The error boundary in v1.25 was the highest-leverage safety fix** because it protects every other safety mechanism from silent failure via JS errors in the loop. Subsumes the loopRunning recovery item.
- **The audio went through a multi-iteration paradigm shift (v1.26 → v1.32).** The user said the high-stillness sound was unpleasant across multiple iterations of incremental volume reduction. After exhausting "tune the same knobs" (peaks, curves, plateau, fade-out windows), the design moved to a paradigm where peak stillness has *no sustained drone* — just occasional pentatonic bell strikes. Trigger frequencies, scale, volume, and interval are all configurable. The user explicitly likes the bell character; sustained sine-tone drones do not work for them.
- **Detection sensitivity tightened in v1.28.** `MOTION_SCALE: 0.03 → 0.018`. User said it was too easy to settle into a high stillness score. Combined with the rise-alpha-decays-with-stillness change, climbing past 90% now takes real sustained stillness rather than a few seconds.
- **The reward at peak stillness is space, not sound.** This is the v1.30/v1.32 design philosophy. The "rich" zone is around 75–82% (where the harmonic stack peaks); 100% is sparser. Approaching is rewarded, arriving is gentle.
- **Mobile responsive in v1.29.** Single breakpoint at 640px. Round-info wraps; ring shrinks to 240px; timer moves below ring; corner buttons tighten. Not a full mobile-first redesign; it's a "doesn't break" pass.
- **Audio aesthetic preference: sparse + bell-like over sustained-tonal.** Established across the v1.26–v1.32 arc with multiple feedback rounds. When in doubt about audio (a new mode, a new effect, a tuning question), lean toward fewer simultaneous tones with natural decay rather than dense sustained synthesis. The temple-atmosphere paradigm at v1.32 is the touchstone — sub-bass + fundamental fade out at peak stillness, leaving room for occasional pentatonic bell strikes. Deviations from this principle should be deliberate experiments with explicit user ask, not assumed.
- **Hub usage dashboard (v1.64) — data model.** Usage tracking uses a new localStorage key `hill-climbing-usage` written by `meditate.html` and `breathe.html`; the hub reads that log plus the journal's IndexedDB directly (same origin). `reflect.html` is not modified — its full entry history counts retroactively for free. The hybrid approach was confirmed with the user over merging onto IndexedDB: localStorage is right-sized for tiny day-flags; IDB would require cross-page version coordination (a `VersionError`/`blocked` footgun). Migration trigger: if usage tracking ever grows into per-session records with timestamps, move to a dedicated IDB `usage` store (separate from the journal DB to avoid schema coupling).
- **Hub usage dashboard (v1.64) — canonical day key.** `hcDayKey()` in every writer file and the hub uses zero-padded `YYYY-MM-DD` (e.g. `"2026-05-30"`). This is **deliberately different** from meditate's `todayKey()` (unpadded, `getMonth()+1`) and reflect's internal `dayKey()` (0-indexed month). Do not mix these formats — only `hcDayKey` feeds the usage log. Future maintainers: never "reuse" either app's existing date helper for the dashboard.
- **Hub usage dashboard (v1.64) — hook points.** meditate: `setPhase('settling')` — the moment a sit begins (not page-open, not first win). Guarded by `hcLoggedToday` flag per page-load to avoid redundant writes across rounds. breathe: `startBreathwork()` and `startRecovery()` — the two session-start functions. Do **not** hook `tick()`, `enterPhase()`, `advanceRecovery()`, or `startExercise()` — those run per-frame/per-cycle.
- **Hub usage dashboard (v1.64) — IndexedDB gotcha.** The hub opens the journal's IDB with **no version number** and **no `onupgradeneeded`**. If you open it at `version: 1` with a store-creating `onupgradeneeded`, and the user visits the hub before ever opening reflect.html, a storeless `journal` DB gets created — reflect's later `open('journal', 1)` won't fire `onupgradeneeded` (same version, already exists) and the `entries` store is **never created**, silently breaking the journal. If our versionless open creates the DB (detectable: `onupgradeneeded` fired), delete it immediately and return an empty set.
- **Weekly streak rule (v1.64).** ≥1 active day/week (any app). Changed from ≥3 at user request. Isolated in `STREAK_MIN_DAYS` constant and `weekIsActive()` predicate — easy to change. Weekly not daily to avoid daily-streak shame mechanics (CONSTRAINTS §5). Current week never breaks the streak; it only adds +1 if already active.
- **"No audio on iPhone" debugging order.** Always ask in this order before shipping code: (1) is the iPhone hardware silent switch off? Safari respects it for web audio. (2) is the volume up? (3) is the device in a low-power mode that might suspend audio? Only after the user has confirmed all three should you start changing AudioContext / unlock code. v1.33 and v1.34 shipped iOS-specific Web Audio unlock changes when the actual cause was the silent switch — a real-world physical toggle that no code change could have fixed. Lesson: physical-world causes are simpler and more common than they look. Ask first.

---

## 8. Discussion threads worth preserving (not in any file)

These shaped the project's direction. If a future user wants to revisit any of these, the next instance should be aware they happened.

- **AI-lab funding & governance** (anthropological / political-science / economics lenses): how to fund a tech company under care + safety + power-distribution constraints. The user is genuinely building something analogous and asked for serious treatment. Layered structure recommendation: perpetual purpose trust + worker cooperative + capped non-voting outside capital + user council + external accountability board. Concrete funder categories suggested. This conversation is the source of CONSTRAINTS.md §3 (power distribution).
- **AI safety as organisational culture** (~60–70% of practical safety outcome): hiring filter, founder embodiment, costly signals, pre-commitment mechanisms, ritualised dissent, demographic diversity, comp tied to outcomes, welcomed whistleblowers, external accountability, near-miss documentation. The user accepted these as binding for their own org.
- **Trance-state risk and the ring's role.** The user asked specifically about hypnotic risk; the answer was the 5-minute idle-pause. KNOWN_RISKS S6 captures the residual coarseness.
- **What a north-star metric would look like for this app.** Conclusion: not engagement, not capability — qualitative monthly self-reflection + pre/post-session 1-question rating + one external canary metric. Implementation deferred; user was deciding whether to build the in-app rating or just keep a journal.

---

## 9. Active open questions (live as of v1.77)

- **Meditation safety items S1 (replay clears cooldown), S2 (mute during idle-pause), S4 (sticky reminder flags), S5 (no surfaced report-review path)** remain open in KNOWN_RISKS. User hasn't picked a priority.
- **REQUIREMENTS.md §1.1 data inventory is materially incomplete after the multi-app + reminders growth** (found in the v1.77 doc audit, KNOWN_RISKS L22). Missing: `breathe-session-duration`, `hill-climbing-install-dismissed`, `hill-climbing-nourish`, `hill-climbing-timed-minutes`, the Reflect `journal` IndexedDB (free-text entries — the most sensitive store in the suite), and the v1.76 Web Push subscription. **Also: §1.3/§2.1's "zero outbound network at Tier 0–1 / nothing leaves the device" claim is now contradicted by the opt-in Web Push reminders.** REQUIREMENTS.md is binding — these need founder ratification to amend; proposed edits were surfaced in the v1.77 audit, not yet applied.
- **Nourish gamification vs CONSTRAINTS §3.1/§5** — the cooking ladder's levels/progression sit near the anti-gamification line; flagged for review in KNOWN_RISKS L23.
- **The 12 [DECISION] markers in CONSTRAINTS.md** have proposed defaults in REQUIREMENTS.md §7 but await explicit founder ratification. Don't unilaterally treat them as resolved.
- **The journal-vs-in-app-rating question** for measuring app value in user's life — user was leaning toward journal first; nothing built yet. The hub's Reflect dot-strip surfaces journal usage but doesn't add ratings.
- **Audio tuning (temple-atmosphere paradigm from v1.32)** has been stable across many versions. Still watch for: ambient bell interval (6–14s), volume (35%), pentatonic scale, and anchor-layer fade-out range (0.85–1.0).

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

1. `meditate.html`'s in-product label reads `v1.75` and the latest `git tag` is `v1.77` (the global suite line). The hub `index.html` carries no version label.
2. The files listed in §2 still exist with the same purposes — five HTML files: `index.html` (hub) + four practice apps.
3. The TIER constant at the top of `meditate.html`'s JS is still `0`.
4. None of the §9 open questions has been answered without this doc being updated.
5. `git log` shows the v1.32 baseline commit (`4683660`) is still the earliest in the history.

If any of those are out of date, treat this file as stale and ask the user to update or re-handoff.

---

## 12. Final note from the prior instance

The user is building this as both a personal practice tool and the seed of a values-constrained organisation. They're thoughtful, push back well, and care about safety as a binding constraint rather than a marketing claim. Treat the work seriously. When in doubt, prioritise their welfare over feature velocity. Read the docs. Match the existing voice in CONSTRAINTS.md and REQUIREMENTS.md (specific, slightly uncomfortable, refuses to disclaim away responsibility) when adding to those documents.

The hardest thing is keeping the structure honest as it grows. Most of my best work in this session came from being explicit about what's binding versus what's malleable — that distinction is the load-bearing one. Carry it forward.
