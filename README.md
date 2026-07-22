# Hill Climbing

Thirteen small practices — plus two quiet games — for coming back to yourself. A single static site (installable as a PWA), no build step, no backend of our own, no account required. A few clearly-marked features can reach the network **only if you turn them on** (see [State & data](#state--data)). The whole suite is operable by you *and* by an LLM agent acting on your behalf, symmetrically (see [Interoperability](#interoperability-humans--llm-agents)).

A landing **hub** (`index.html`) links to the practices:

| Practice | File | What it is |
|---|---|---|
| **Meditate** | `meditate.html` | A quiet timed sit with a bell-bookended ambient sound bed. (A camera-guided "stillness" mode — webcam motion detection + an adaptive 2-up/1-down staircase — exists in the code but is currently hidden.) |
| **Breathe** | `breathe.html` | Guided breathwork (coherence, physiological sigh, box, 4-7-8) plus a nervous-system "training loop": stress, then practice returning to calm. |
| **ERP** | `erp.html` | Build a distress-rated exposure & response prevention ladder, log exposures, watch the record. Deliberately not gamified. |
| **Reflect** | `reflect.html` | A journal — free-text entries with optional mood / satisfaction ratings and photos. Stored in IndexedDB. |
| **Nourish** | `nourish.html` | Learn to cook by climbing a 10-level ladder of real cooking challenges (General + Sushi tracks). A 2-up / 1-down staircase adapts difficulty; you cook and self-report. An optional "chef" mode can write a recipe from your pantry. |
| **Savor** | `savor.html` | Learn to cook *by tasting* — a ten-episode season on the palate, plus guest lessons you can write and share as files. |
| **Levity** | `levity.html` | Learn to be funny by climbing a 10-level comedy-craft ladder, with a notebook for your bits. |
| **Foresee** | `foresee.html` | Calibration training — one-line predictions about your own life with stated confidence, resolved against reality and Brier-scored into the ladder. |
| **Climb** | `climb.html` | A goals-and-steps tracker with an honest, on-device history of your own follow-through. No due dates, points, or streaks by design. |
| **Train** | `train.html` | A workout logger — exercises and sets with quiet progressive-overload defaults. |
| **Echo** | `echo.html` | A listening game: five stones voice a growing bell phrase you tap back. No fail state; one quiet record. |
| **Garden** | `garden.html` | A zen stone-garden Sokoban — twelve levels, unlimited undo, no clock. |
| **Council** | `council.html` | An LLM "board of directors" you bring a decision to — four directors and a Chair (now a mode of Companion; the old URL still lands there). Uses your own Anthropic API key. |
| **Companion** | `companion.html` | A conversational companion that can see your current goals, recent journal, and activity, and can look things up on the web. Uses your own Anthropic API key. |
| **Anime** | `anime.html` | An experiment: your webcam, drawn as a cel-shaded character in real time. Snapshot or record a clip. |

The hub also shows a quiet weekly-usage dashboard (which practices you touched each day), an optional PWA install prompt, and an optional daily-reminder toggle.

## Use

Open the hub URL in a modern browser and pick a practice. Each app links back to the hub via the home icon, top-left. Install to your home screen (PWA) for a full-screen, offline experience.

Most apps need nothing but the page: **Meditate** (in its current timed mode), **Breathe**, **Nourish**, **Levity**, **Climb**, and **Train** all run without a camera; **Reflect** is just writing. **Anime** needs a camera. The AI apps (**Council**, **Companion**, and Nourish's optional chef mode) need your own Anthropic API key, which you paste once and it's stored locally.

## Devices

Designed for desktop, tablet, and phone (responsive). Camera and audio require **HTTPS** (localhost is fine for development). iOS Safari requires audio to start within a user gesture, which the in-app start buttons satisfy.

## State & data

Every app stores its state locally on the device that ran it — browser `localStorage`, and `IndexedDB` for Reflect's journal and Climb's event log. A few features are opt-in, off by default, and reach the network; they're named here:

- **Bring-your-own-key AI apps** — Council, Companion, and Nourish's optional chef mode. These call the Anthropic API **directly from your browser using a key you supply and store locally** — there is no server of ours in between. What you send (Council's situation text; a pantry list; or, for Companion, a digest of your current goals + recent journal + activity, plus any web searches it runs) is readable by Anthropic under **your own** API terms — and Companion's web queries are visible to the search providers that serve them. Billed to your account.
- **Cross-device sync** — optional; sign in and turn it on. Your data is uploaded to a backend (Supabase) so it can sync across your devices, along with metadata (sizes, counts, timestamps, your account email).
- **Daily reminders** — optional Web Push. If you enable them, your browser registers a push subscription so a fixed practice prompt can be delivered. No analytics, no behavioural data; revocable any time.

There is **no analytics, telemetry, advertising, or third-party tracking** anywhere in the suite, and **no account is required** to use any app (an optional account exists only to enable sync). See **`REQUIREMENTS.md §1`** for the standard every data practice must meet, and **Appendix A** for the full per-item inventory. To reset an app, clear the site's local storage / IndexedDB, or use an app's in-app data menu where present.

## Interoperability (humans + LLM agents)

Every page defines **`window.HC`** (from `hc-agent.js`) — one programmatic surface, used the same way by you (in the browser console) and by an agent driving your browser on your behalf: `HC.describe()` (stores, schemas, actions), `HC.read()`, `HC.export()` / `HC.import(payload, {confirm: true})` (verbatim, timestamps and ids included — either party can seed history), and `HC.invoke(action, params)` — every action routes through **the same internal function the UI button calls**, and nothing records which of you acted, so state produced by an agent is indistinguishable from state produced by hand. The interface itself makes **no network calls** and exposes no action that does; your API key is excluded from read/export. A static **`llms.txt`** at the site root documents the suite for agents, including binding ground rules (never fabricate practice; ERP is transcription-only; destructive operations need your explicit approval). The standard is **`REQUIREMENTS.md §1.4`**.

## Where this is heading

There's a drafted direction — not yet built, pending founder ratification — for the suite to grow into a private, two-person digital world: each person could have an agent-character, grounded in their own profile, that goes on adventures with the other's. Turn-based first; autonomous play, if it's ever built, is the eventual destination, not the starting point. The existing practices would become the world's rooms, built on the `window.HC` layer described above so a character can act with the same parity a human already has. A permission model for who may enter a room and what they may leave would double as the consent model for how each person is portrayed. None of this changes anything today — the suite is unchanged and still Tier 0. See `WORLD_ARCHITECTURE.md` (the shape and why) and `WORLD_ROADMAP.md` (the phased plan) for the full, ratification-pending design.

## Tier

The suite runs at **Tier 0** (solo / developer). The `TIER` constant at the top of the JS in `meditate.html` gates escalating safety features (pre-screening, responsibility-forward copy, backend report submission, age gating). See `REQUIREMENTS.md §4` for the criteria each tier requires.

## Documents

| File | What it is |
|---|---|
| `CONSTRAINTS.md` | Founding principles: care, safety, balanced power distribution. (Binding.) |
| `REQUIREMENTS.md` | Auditable requirements. Data practices are stated **standard-first** (value → consent-scaled-to-audience → controls-proportional-to-risk); the full per-item data inventory is Appendix A. Also: adverse-event runbook, tier-transition criteria, verification. (Binding.) |
| `BACKLOG.md` | Work tracking. Bugs, features, tuning, experiments, design questions, completed versions. |
| `KNOWN_RISKS.md` | Self-flagged uncertainties, ranked by user-safety severity. |
| `WORLD_ARCHITECTURE.md` | Draft direction for a possible private, two-person digital world built on the practice suite — the shape and why. Not shipped; pending founder ratification. |
| `WORLD_ROADMAP.md` | Companion to `WORLD_ARCHITECTURE.md` — the phased plan for building it, if ratified. |
| `CLAUDE.md` | Agent handoff for AI assistants working on this project. |

## Versioning

Each app carries its own in-product version label (e.g. `v1.76` in Meditate, `v0.7 · breathe`). There is no global suite version and no git tags. Changes land on `claude/<slug>` branches merged to `main` via pull request; pushing to `main` deploys to GitHub Pages. The PWA service worker's `CACHE_VERSION` is bumped on each deploy so clients pull fresh files.

## Safety

If you're in crisis right now, contact your local emergency line or call / text **988** (US).

## License

Not yet chosen.
