# Hill Climbing — Agent Handoff

**For the next AI instance.** Read this file first, in full, before acting. Then read the files listed in §3 in the order given. Then ask the user §6's confirmation question before making any change.

This is a working solo-developer project. The user is building a suite of contemplative/practice web apps under the "Hill Climbing" name (it began as a single stillness-meditation app). The suite is now **twelve single-file practice apps behind a hub, plus one experimental webcam toy and a static writing blog** (see §1 and §2), all at **TIER 0**. Note: §§4–5, 7–8, 10 below were largely written during the single-app era. The *collaboration norms, values, and decision history* they record are still current and load-bearing — but their file references and mechanics often describe `meditate.html` in its earlier camera-game form (see §1; that mode is currently hidden). Read those sections for norms-and-history; read §§1–3, 6, 9, 11 for the live factual state, which is what drifts.

---

## 1. Project state

> **⚠️ STRUCTURE — read before editing files.** The project is a **hub + twelve practice apps + one experiment**, all single-file, no build, no backend of our own. `index.html` is the static **hub/landing page** (practice cards + weekly-usage dashboard + PWA install banner + opt-in Web Push reminder toggle). **When older prose below says "the app" or "index.html" as if it were the meditation app, it means `meditate.html`** — the meditation app was `index.html` until the multi-app split; each app links back to the hub via a top-left home link.

- **Single-file HTML apps**, one per practice, plus the hub and shared JS modules (`hc-sync.js`, `hc-usage.js`, `hc-sync-chip.js`, `sw.js`). No build system, no bundled dependencies, no backend of our own. Open any file in a browser to run. (Opt-in sync uses Supabase; opt-in reminders use Web Push via a GitHub Actions sender — see below.)
- **Versioning is now per-app, and there are no git tags.** Each app carries its own in-product label (`v1.76 · t0` in meditate, `v0.7 · breathe`, `v0.7 · companion`, …). There is **no global `vX.Y` suite line and no annotated tags** — the old tag-per-version convention has lapsed (§4). A version lives only in the in-product label + the commit message.
- **Tier 0 (solo developer).** `const TIER = 0` at the top of `meditate.html`'s JS gates escalating safety scaffolding: 0 (solo), 1 (friends & family), 2 (open beta), 3 (public). Nothing advances tiers automatically.
- **Meditate's camera "stillness" game is currently hidden.** Since meditate v1.67 the camera-guided Stillness mode (webcam motion detection → 2-up/1-down staircase over duration + threshold → stillness-reactive synth) is disabled (`display:none`, code intact), leaving **Timed mode** (a quiet countdown sit with a bell-bookended ambient noise bed) as the only reachable meditation practice. Much of §7's audio/staircase history describes that hidden mode — accurate for it, not for what a user sees today.
- **The 2-up/1-down staircase (Levitt 1971, ~71% success) is now the suite's signature**, reused beyond meditation: Nourish (cooking) and Levity (comedy) both climb a 10-level ladder with self-reported outcomes.
- **Off-device data flows now exist** (all opt-in, off by default): three **bring-your-own-Anthropic-key** AI apps (Council, Companion, Nourish's chef) call the Anthropic API directly on the *user's own key*; **Companion additionally has live web search/fetch**; **end-to-end-encrypted, zero-knowledge cross-device sync** (Supabase) covers every app with user data; and **Web Push reminders**. The whole data policy was reframed standard-first in **REQUIREMENTS §1–§2 (v0.2)** — read it before touching anything data-related.

---

## 2. Files in the repo

**Practice apps + hub** (single-file HTML; line counts approximate):

| File | Purpose | Read first? |
|---|---|---|
| `index.html` | **Hub/landing page** (~1,230 lines) — eleven practice cards (Council is reachable but not carded), weekly-usage dashboard, PWA install banner, opt-in Web Push reminder toggle. | Yes (quick skim) |
| `meditate.html` | **Meditation app** (~3,190 lines), in-product `v1.76`; holds the `TIER` constant. Timed mode active; camera Stillness mode hidden since v1.67 (code intact). Older prose calls this "the app" / "index.html". | Yes (skim) |
| `breathe.html` | Breathwork + nervous-system training (`v0.7`) — coherence / physiological sigh / box / 4-7-8, plus a stress-then-recover training loop. | If relevant |
| `erp.html` | **ERP** (`v0.1`) — a companion to *exposure & response prevention* (the OCD/anxiety therapy). Build a SUDS-rated fear **ladder**, log exposures (peak/end distress, ritual resisted?, expected-vs-happened), and watch the record over time. **Companion to therapist-guided ERP, not a replacement** (Guide view + crisis footer). Journal-grade sensitive prose; on-device + E2EE-sync-eligible; hard anti-gamification — no points/levels/streaks, distress is never a score to maximise (L39). State: `hill-climbing-erp`. | If relevant |
| `reflect.html` | Journal (`v0.6`), IndexedDB-backed (`journal`/`entries`): free-text + optional mood/satisfaction. **The most sensitive store in the suite.** | If relevant |
| `nourish.html` | Learn-to-cook via the staircase (`v0.15`). 10-level ladder, self-reported outcomes; General + Sushi tracks; optional BYOK "chef" mode writes recipes from your pantry. Each challenge card deep-links to the paired **Savor** taste episode. State: `hill-climbing-nourish`. | If relevant |
| `savor.html` | Learn-to-cook-*by-tasting*, framed as a show (`v0.3`). Ten-episode **season** on the palate (salt · acid · fat · five tastes · aroma · "what does this need?") + community guest lessons you can write & share as files; each episode is a small at-the-counter tasting + a notebook note. Fully on-device; joins E2EE sync + shared usage log (`hc-usage.js`). **Paired with Nourish** (taste↔cook deep-links — L35). State: `hill-climbing-savor`. | If relevant |
| `levity.html` | Learn-to-be-funny via the staircase (`v0.2`). Comedy-craft ladder + a bit notebook. State: `hill-climbing-levity`. | If relevant |
| `climb.html` | Goals + steps tracker (`v0.5`) with an append-only IndexedDB event log (`climb`/`events`). No due dates/points/streaks by design. State: `hill-climbing-climb`. | If relevant |
| `train.html` | Workout logger (`v0.2`) — exercises, sets, progressive-overload defaults. State: `hill-climbing-train`. | If relevant |
| `companion.html` | **BYOK AI** (`v0.11`) — **two modes of one app**, chosen by a top-centre switch that re-themes the page (teal ↔ indigo via `html[data-mode]`). **Companion**: reads your current goals + recent journal + activity (incl. summed practice durations & session counts for meditate/breathe, from the **cross-device** synced usage aggregate — v0.10/v0.11) into each reply and can search/fetch the web (**broadest personal-content egress** — L29/L30); carries a cross-conversation memory (v0.8, L37); and can **write up requests about the suite to an on-device Requests list** (a `{ heading, prompt }` brief — what to build / questions to answer) via a client-side `add_request` tool, confirm-first, reviewable/copyable from menu → Requests (v0.9, L38 — on-device, no new egress; a server-side feedback service was considered and declined). **Council**: an LLM "board of directors" (4 directors + a Chair) for a decision (off-device — L24). Mode persists in `hill-climbing-cc-mode`; `?mode=council` deep-links. Three synced blobs: `hill-climbing-companion` + `hill-climbing-council` + `hill-climbing-requests`. | If relevant |
| `council.html` | **Redirect** → `companion.html?mode=council` (hash preserved). Council merged into Companion as a mode (companion v0.7). Kept as a stub so old bookmarks/precache entries still land in Council mode. | If relevant |
| `anime.html` | **Experiment** (`v0.1`) — a webcam cel-shading/rotoscope toy (draws you as a cel-shaded character; snapshot/record). No persistent state; linked from the hub but not in the PWA precache/manifest. | If relevant |
| `blog.html` | **Writing / blog** (`v0.1`) — *not a practice.* A single-file, hash-routed reading page for suite writing, holding all three post kinds: **devlog · essay · notes** (a light All/Devlog/Essays/Notes filter; shareable `#slug` deep links). Reached by a **quiet "Writing" footer link on the hub**, not a nav card. **Zero data:** no localStorage/IndexedDB, no usage log, no sync, no egress beyond its own precached assets — the simplest app in the suite; posts are authored HTML inlined in-file. Precached in `sw.js` (v0.1). | If relevant |

**Shared infra & config:**

| File | Purpose | Read first? |
|---|---|---|
| `hc-sync.js` / `hc-sync-chip.js` | Shared opt-in **E2EE sync** engine (zero-knowledge, Supabase) + the floating status chip. Loaded by every app holding user data. | If touching sync |
| `hc-usage.js` | Shared **usage log** (per-app day-flags + per-session practice durations). Records to a `hc-usage` IndexedDB store, keeps the legacy `hill-climbing-usage` localStorage aggregate for offline/companion, and registers a per-record `usage` sync store so totals **sum** across devices. Loaded by the eight practice apps that log usage (meditate · breathe · erp · nourish · savor · levity · climb · train) + the hub (added v1.78; Savor joined v0.3; ERP joined v0.1) + **companion** (read-only, joined companion v0.11 — reads `aggregate()` so its context digest sees cross-device durations). | If touching usage/dashboard |
| `sw.js` / `manifest.webmanifest` | PWA service worker (`CACHE_VERSION` — currently `hc-v2.17`, **bump on every deploy**) + manifest. | If touching PWA |
| `supabase-schema.sql` | Backend schema for sync (`sync_docs`, `sync_keybundle`, RLS). Founder provisions the Supabase project. | If touching sync |
| `push/` + `.github/workflows/notify.yml` | Self-owned Web Push **sender** (Node + `web-push`, VAPID) run on cron via GitHub Actions. Receiving half is in `sw.js`. | If touching reminders |
| `README.md` | User-facing repo readme. | Skim |

**Governance docs:**

| File | Purpose | Read first? |
|---|---|---|
| `CONSTRAINTS.md` | Founding principles: care, safety, balanced power distribution. `[DECISION]` markers for unresolved values. | Yes |
| `REQUIREMENTS.md` | Auditable specifics: **data-practices standard (v0.2, standard-first)** + full inventory in Appendix A, adverse-event runbook, tier criteria, verification, decision register. | Yes |
| `BACKLOG.md` | Work tracking: Inbox / Bugs / Features / Tuning / Experiments / Design Questions / Done. | Yes |
| `KNOWN_RISKS.md` | Self-flagged uncertainties, ranked by user-safety severity (S = safety, L = low). | Yes |
| `CLAUDE.md` | This file. | (You're here) |

**Document precedence** in case of conflict: CONSTRAINTS > REQUIREMENTS > BACKLOG. KNOWN_RISKS doesn't bind — it captures uncertainty.

---

## 3. Recommended reading order for next instance

1. `CLAUDE.md` (this file) — collaboration norms and history
2. `CONSTRAINTS.md` — the principles
3. `REQUIREMENTS.md` — what's auditable/binding
4. `KNOWN_RISKS.md` — what's known-broken or suspect, ordered by user-safety
5. `BACKLOG.md` — what's open
6. The app you're working on (e.g. `meditate.html`) — skim CSS, skim the JS state machine, deep-read whatever's relevant to the task. Add `hc-sync.js` if the task touches persistence/sync.

---

## 4. Collaboration norms (inferred from the user)

These are how the user has consistently operated. Default to these unless told otherwise.

- **Auto mode is on.** Execute autonomously, make reasonable assumptions, prefer action over planning. The user provides course corrections rather than approving every step.
- **User pushes back when wrong.** Take corrections seriously and re-evaluate framing, not just the specific item. Example from session: I labelled "tab-switching exploit" as HIGH severity; user correctly flagged that this was gameplay-integrity, not safety, and insisted *user safety is the primary axis* for all risk assessment. That reframing should propagate to all future severity calls.
- **When the user says "completely different," believe them.** Across the v1.26–v1.31 audio iterations I kept tuning the same architecture even though the user was reporting the same complaint each round. They had to explicitly say "we may have maxed out on these knobs" before I shifted paradigm. **Heuristic: if the same user complaint persists after 2+ rounds of incremental fixes, the issue is paradigm-level, not parameter-level.** Stop tuning, propose alternative paradigms, ask the user to choose before implementing.
- **User prefers concrete over theoretical.** When asked exploratory questions, give a recommendation and the main tradeoff (2–3 sentences for small questions, longer for substantive ones), not a survey of possibilities.
- **Bias toward shipping but pause-for-inspection default.** After a substantive change, the default is to wait for user verification. The user overrides with "keep going" when they want continuation. Bigger refactors and aesthetic changes especially deserve a pause.
- **One user-stated outcome per iteration when iteration is risky.** The user explicitly noted "you ideate and ship faster than I can inspect" — slow down for things touching state machine, persistence, audio engine, or safety mechanisms. Note: "one outcome" allows bundling multiple coordinated code changes that all address the same user complaint (e.g., three coordinated knob tweaks for a single "audio is harsh" fix). The rule is about the unit of verification, not the unit of code change.
- **Each app self-versions in-product; formats vary** (`v1.76 · t0` in meditate, `v0.7 · breathe`, `v0.7 · companion`). Bump on user-visible changes, and update **both** the `#version-label` HTML literal **and** the JS line that sets its `textContent`. There is no global suite version and no git tags (see the git-workflow bullet).
- **localStorage keys keep the `hill-combing-*` prefix for v1 stability** even though the app was renamed. New keys may use `hill-climbing-*`. Do not rename existing keys without a migration shim — user state would be lost.
- **The IDE / preview panel auto-publishes after each edit, with a hook reminder to mention it.** When you edit `index.html`, the system reminder says "is now visible in the preview panel" — your response should briefly acknowledge that.
- **The `TodoWrite` tool reminder appears periodically.** It's a gentle nudge — ignore unless tracking work would actually help. Never mention the reminder itself to the user.
- **No documentation files unless asked.** Markdown files like CONSTRAINTS.md, REQUIREMENTS.md, BACKLOG.md, KNOWN_RISKS.md, and this CLAUDE.md were each created at explicit user request. Don't proliferate docs unprompted.
- **Keep documentation current by default — including the binding docs.** Standing founder instruction: *always assume you should keep documentation up to date.* When your change makes a doc factually stale — a new app, a new localStorage key, a version bump, a data flow, a roster/count — update the doc as part of the same change, in every doc it touches (CLAUDE.md §§1–2, REQUIREMENTS Appendix A, KNOWN_RISKS, BACKLOG). Do **not** defer factual freshness or leave it "flagged for later." The one carve-out: a **substantive policy amendment** to CONSTRAINTS.md or REQUIREMENTS.md — changing a *commitment, standard, or value* (not inventorying a fact) — still warrants surfacing it to the founder, because those docs bind and the precedence ordering (CONSTRAINTS > REQUIREMENTS > BACKLOG > KNOWN_RISKS) means their substance carries weight. Rule of thumb: **adding a true row to Appendix A = just do it; rewriting P1 or a test = confirm first.** BACKLOG.md, KNOWN_RISKS.md, and this file always grow freely.
- **Reuse existing infrastructure before building new.** When extending the app, ask *"can the existing code be extended to handle this?"* before writing new structure. Default to extension; build new only when conflation would actually hurt readability or correctness. The bias toward new is one of my consistent failure modes — example: when adding ambient bells in v1.32, I considered both a new scheduler and extending the milestone-bell code; the new scheduler happened to be the right call but the deliberation should be the default, not the exception.
- **Git workflow — PR-based; "shipped" means merged to `main`.** The repo is `github.com/cognitivemirrors/hill-climbing`, deploying to GitHub Pages at `https://cognitivemirrors.github.io/hill-climbing/` on every push to `main` (~1–2 min redeploy; the legacy Pages builder occasionally drops a trigger — KNOWN_RISKS L19). Work now happens on **`claude/<slug>` feature branches**, one change per branch, merged to `main` via **pull request** (see `git log` — PRs #13–#19). This replaced the old commit-tag-push-to-main flow. **A local edit is not a ship**; a "shipped" claim must be backed by a merged PR (or at least a pushed branch the user can review).

  **Per-change checklist:**
  1. Bump the touched app's in-product version (the `#version-label` HTML literal **and** the JS `textContent` line).
  2. If any app shell (HTML/JS) changed, bump `CACHE_VERSION` in `sw.js` (e.g. `hc-v2.06` → `hc-v2.07`) so clients pull fresh HTML; add the file to the precache list if it's a new app.
  3. Add a terse `Done` (or Inbox `[x]`) entry to `BACKLOG.md`.
  4. If you touched a data practice, reflect it in `REQUIREMENTS.md` (binding — see the confirmation norm above) and `KNOWN_RISKS.md`.
  5. **If the change alters the app roster, the tier, the versioning/workflow, or a data flow, update `CLAUDE.md` §§1–2 in the same commit.** The handoff rots fastest there — that's why §11 is a freshness *check*, not a snapshot to trust. (Run `./scripts/state.sh` to see the live state.)
  6. Commit on a `claude/<slug>` branch; `git push -u origin <branch>`. Open a PR **only when the user asks** — do not open PRs unprompted.

  **No git tags.** The old annotated-tag convention has lapsed — don't reintroduce tags without asking. Revert is `git revert` of the offending commit/PR (or `git checkout <commit>` locally); there are no version tags to check out.
  - **Concurrent branches collide on version numbers.** Several in-flight `claude/*` branches have collided on `main` (Climb/Train, Council/Levity — see BACKLOG). On collision, renumber to the next free number at merge rather than rewriting history.
  - Never run destructive operations (`reset --hard`, force-push to `main`, branch deletion) without explicit user instruction.

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

> "I've read CLAUDE.md, CONSTRAINTS.md, REQUIREMENTS.md, KNOWN_RISKS.md, and BACKLOG.md. The suite is now ten practice apps behind a hub (plus the `anime.html` experiment), all at TIER 0, versioned per-app with no git tags — confirmed via `git log` and the in-product labels. Before I do anything, can you confirm: (a) are we still at TIER 0; (b) which open item is the priority — the meditation safety items S1/S2/S4/S5 (they apply to the currently-hidden camera mode), the pre-Tier-1 watch-items on the off-device flows (KNOWN_RISKS L28–L31), or something new; and (c) any context the prior session missed?"

Wait for the answer. Then proceed.

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

## 9. Active open questions (live as of the REQUIREMENTS v0.2 reframe, 2026-07)

- **Pre-Tier-1 watch-items on the off-device flows** (KNOWN_RISKS L28–L31) are the live cluster now. BYOK egress disclosure (esp. Companion sending the journal by default on every reply), the *soft* prompt-level web-query privacy guardrail (model-obedience, not a hard filter), E2EE metadata leakage (email/sizes/counts/timestamps), whole-blob LWW concurrent-edit loss across six stores, and adding full **account deletion**. None are user-harm at Tier 0; all deserve a look before friends-and-family.
- **The data policy was reframed standard-first in REQUIREMENTS v0.2** (value → consent-scaled-to-audience → controls-proportional-to-risk; exhaustive inventory demoted to Appendix A). CONSTRAINTS §1.2/§1.4/§3.2 P1/§3.4 were realigned to match. The recurring "nothing leaves the device" contradiction (old L22/L24/L27/L29/L30/L31) is resolved at the framing level (see KNOWN_RISKS L32).
- **Meditation safety items S1/S2/S4/S5** (KNOWN_RISKS) remain open but describe the **currently-hidden** camera stillness mode — they matter again if/when that mode returns. User hasn't picked a priority.
- **Gamification watch across the ladder apps** — Nourish / Levity / Climb / Train levels & progression sit near the CONSTRAINTS §3.1/§5 anti-gamification line (KNOWN_RISKS L23/L25). Kept honest by free skips, non-shaming copy, no points/badges, weekly-not-daily hub streak.
- **The 12 [DECISION] markers in CONSTRAINTS.md** have proposed defaults in REQUIREMENTS.md §7 but await explicit founder ratification. Don't unilaterally treat them as resolved.
- **`anime.html` is un-integrated** — linked from the hub but the only app not in the `sw.js` precache, no usage hook, no doc beyond §2 here. Decide whether it's a real practice or a scratch experiment. (Related: the manifest's install shortcuts still cover only 5 apps — BACKLOG Inbox. Run `./scripts/state.sh` to see current coverage.)
- **The journal-vs-in-app-rating question** for measuring the app's value in the user's life — user was leaning toward journal first; nothing built. The hub's Reflect dot-strip surfaces usage but no ratings.

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

Before relying on anything in this file, verify (these drift fastest):

1. **App inventory (§2).** `ls *.html` still shows the hub + the ten practice apps + `anime.html`; in-product labels roughly match (`grep -h version-label *.html` / the `VERSION` constants).
2. **Tier.** `grep 'const TIER' meditate.html` is still `0`.
3. **Meditation mode.** Meditate's camera Stillness mode is still hidden (Timed-only) unless a later version re-enabled it.
4. **Workflow.** `git tag` is still empty and history still shows PR merges (`git log --oneline | grep 'Merge pull request'`) — the PR-based, no-tag flow still holds.
5. **Data policy.** `REQUIREMENTS.md` is still standard-first (§1 "Data practices — the standard, before the inventory"; inventory in Appendix A). If it reverted or moved on, re-sync this file.
6. **Open questions (§9)** — none answered without this doc being updated.

If any of those are out of date, treat this file as stale and update it (this file grows freely — no confirmation needed) or ask the user to re-handoff.

**Automation (so this snapshot self-corrects):** a `SessionStart` hook (`.claude/settings.json` → `.claude/hooks/session-start.sh`) prints `scripts/state.sh` into context at the start of every session and arms an advisory doc-freshness pre-commit guard (`scripts/git-hooks/pre-commit`, warns when app code is committed without a doc/version touch — never blocks). The hook takes effect for all sessions once merged to the default branch; the guard is armed per-session via `git config core.hooksPath scripts/git-hooks` (run it once yourself for a local checkout).

---

## 12. Final note from the prior instance

The user is building this as both a personal practice tool and the seed of a values-constrained organisation. They're thoughtful, push back well, and care about safety as a binding constraint rather than a marketing claim. Treat the work seriously. When in doubt, prioritise their welfare over feature velocity. Read the docs. Match the existing voice in CONSTRAINTS.md and REQUIREMENTS.md (specific, slightly uncomfortable, refuses to disclaim away responsibility) when adding to those documents.

The hardest thing is keeping the structure honest as it grows. Most of my best work in this session came from being explicit about what's binding versus what's malleable — that distinction is the load-bearing one. Carry it forward.
