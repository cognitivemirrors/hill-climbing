# Hill Climbing

Twelve small practices — plus two quiet games — grown into **Governance, the Game**, a public-data art project (see `STATEMENT.md`). A single static site (installable as a PWA), no build step, no backend of our own, no account required. A few clearly-marked features can reach the network **only if you turn them on** (see [State & data](#state--data)). The whole suite is operable by you *and* by an LLM agent acting on your behalf, symmetrically (see [Interoperability](#interoperability-humans--llm-agents)).

A landing **hub** (`index.html`) links to the practices:

| Practice | File | What it is |
|---|---|---|
| **Meditate** | `meditate.html` | A quiet timed sit: a countdown bookended by a bell, over an ambient sound bed. |
| **Breathe** | `breathe.html` | Guided breathwork (coherence, physiological sigh, box, 4-7-8) plus a nervous-system "training loop": stress, then practice returning to calm. |
| **Reflect** | `reflect.html` | A journal — free-text entries with optional mood / satisfaction ratings and photos. Stored in IndexedDB. |
| **Nourish** | `nourish.html` | Cook **and** taste, in one app of two tabs. *Cook:* climb a 10-level ladder of real cooking challenges (General + Sushi tracks) — a 2-up / 1-down staircase adapts difficulty; you cook and self-report; an optional "chef" mode can write a recipe from your pantry. *Taste:* a ten-episode season on the palate, plus guest lessons you can write and share as files. (The old **Savor** app folded in here; the standalone `savor.html` page was deleted — the Taste season lives at `nourish.html#taste`, and the old bare `#cN` deep-links resolve inside Nourish.) |
| **Levity** | `levity.html` | Learn to be funny by climbing a 10-level comedy-craft ladder, with a notebook for your bits. |
| **Foresee** | `foresee.html` | Calibration training — one-line predictions about your own life with stated confidence, resolved against reality and Brier-scored into the ladder. |
| **Climb** | `climb.html` | A goals-and-steps tracker with an honest, on-device history of your own follow-through. No due dates, points, or streaks by design. |
| **Train** | `train.html` | A workout logger — exercises and sets with quiet progressive-overload defaults. |
| **Sing** | `sing.html` | Learn to sing by climbing a 10-level ladder of small vocal exercises — breath, pitch-matching, phrases by ear, whole songs, performing — with reference bells and an optional live microphone tuner (heard on-device, never recorded), plus a songbook of songs you're learning. |
| **Echo** | `echo.html` | A listening game: five stones voice a growing bell phrase you tap back. No fail state; one quiet record. |
| **Garden** | `garden.html` | A zen stone-garden Sokoban — twelve levels, unlimited undo, no clock. |
| **Council** | `council.html` | An LLM "board of directors" you bring a decision to — four directors and a Chair (now a mode of Companion; the old URL still lands there). Uses your own Anthropic API key. |
| **Companion** | `companion.html` | A conversational companion that can see your current goals, recent journal, and activity, and can look things up on the web. Uses your own Anthropic API key. |
| **Anime** | `anime.html` | An experiment: your webcam, drawn as a cel-shaded character in real time. Snapshot or record a clip. |

The hub also shows a quiet weekly-usage dashboard (which practices you touched each day), an optional PWA install prompt, and an optional daily-reminder toggle.

## Use

Open the hub URL in a modern browser and pick a practice. Each app links back to the hub via the home icon, top-left. Install to your home screen (PWA) for a full-screen, offline experience.

Most apps need nothing but the page: **Meditate**, **Breathe**, **Nourish**, **Levity**, **Foresee**, **Climb**, and **Train** all run without a camera; **Reflect** is just writing. **Anime** needs a camera. **Sing**'s optional tuner asks for the microphone — heard live for pitch on-device, never recorded or sent. The AI apps (**Council**, **Companion**, and Nourish's optional chef mode) need your own Anthropic API key, which you paste once and it's stored locally.

## Devices

Designed for desktop, tablet, and phone (responsive). Camera and audio require **HTTPS** (localhost is fine for development). iOS Safari requires audio to start within a user gesture, which the in-app start buttons satisfy.

## State & data

Every app stores its state locally on the device that ran it — browser `localStorage`, and `IndexedDB` for Reflect's journal and Climb's event log. A few features are opt-in, off by default, and reach the network; they're named here:

- **Bring-your-own-key AI apps** — Council, Companion, and Nourish's optional chef mode. These call the Anthropic API **directly from your browser using a key you supply and store locally** — there is no server of ours in between. What you send (Council's situation text; a pantry list; or, for Companion, a digest of your current goals + recent journal + activity, plus any web searches it runs) is readable by Anthropic under **your own** API terms — and Companion's web queries are visible to the search providers that serve them. Billed to your account.
- **Cross-device sync** — optional; sign in and turn it on. Your data is uploaded to a backend (Supabase) so it can sync across your devices, along with metadata (sizes, counts, timestamps, your account email).
- **Daily reminders** — optional Web Push. If you enable them, your browser registers a push subscription so a fixed practice prompt can be delivered. No analytics, no behavioural data; revocable any time.

There is **no analytics, telemetry, advertising, or third-party tracking** anywhere in the suite, and **no account is required** to use any app (an optional account exists only to enable sync). See **`REQUIREMENTS.md §1`** for the standard every data practice must meet, and **Appendix A** for the full per-item inventory. To reset an app, clear the site's local storage / IndexedDB, or use an app's in-app data menu where present.

Under the frame of the art project (see `STATEMENT.md`), the data you make here is treated as **public donated seed data** — with two limits that hold regardless: your Anthropic API key is a **credential, not data** (it is never included in the agent read/export surface), and nothing here makes anyone else's data public — **only your own is yours to donate.**

## Interoperability (humans + LLM agents)

Every page defines **`window.HC`** (from `hc-agent.js`) — one programmatic surface, used the same way by you (in the browser console) and by an agent driving your browser on your behalf: `HC.describe()` (stores, schemas, actions), `HC.read()`, `HC.export()` / `HC.import(payload, {confirm: true})` (verbatim, timestamps and ids included — either party can seed history), and `HC.invoke(action, params)` — every action routes through **the same internal function the UI button calls**, and nothing records which of you acted, so state produced by an agent is indistinguishable from state produced by hand. The interface itself makes **no network calls** and exposes no action that does; your API key is excluded from read/export. A static **`llms.txt`** at the site root documents the suite for agents, including binding ground rules (never fabricate practice; destructive operations need your explicit approval). The standard is **`REQUIREMENTS.md §1.4`**.

## Where this is heading

The suite is growing into **Governance, the Game** — a public-data art project in which the practices become a world's rooms and verbs, and the data people donate is the world's seed material (see `STATEMENT.md`). The first slices are built: **`kin.html`** spawns a character from your own history that then diverges into its own person, and **`govern.html`** is the governance layer over those characters' families — an append-only ledger, an asynchronous magistrate, and a token budget with a coded **subsistence floor** no vote can strip. Both are grounded on the `window.HC` layer described above, so a character can act with the same parity a human already has, and both are documented in `KIN.md` and `GOVERNANCE.md`.

The larger, still-drafted arc — a private, two-person world where each person has an agent-character that goes on adventures with the other's, turn-based first — lives in `WORLD_ARCHITECTURE.md` (the shape and why) and `WORLD_ROADMAP.md` (the phased plan), pending founder ratification.

## Documents

| File | What it is |
|---|---|
| `STATEMENT.md` | The art statement for **Governance, the Game** — the public-data frame that supersedes the product-era privacy framing. |
| `CONSTRAINTS.md` | Founding principles: care, safety, balanced power distribution. (Binding.) |
| `REQUIREMENTS.md` | Auditable requirements, reframed for the art project (the product-era privacy *guarantees* are superseded by `STATEMENT.md`; the value tests, adverse-event runbook, and anti-engagement stance stay in force). Data practices are stated **standard-first**; the full per-item inventory is Appendix A. (Binding.) |
| `BACKLOG.md` | Work tracking. Bugs, features, tuning, experiments, design questions, completed versions. |
| `KNOWN_RISKS.md` | Self-flagged uncertainties, ranked by user-safety severity. |
| `WORLD_ARCHITECTURE.md` | Draft direction for a possible private, two-person digital world built on the practice suite — the shape and why. Not shipped; pending founder ratification. |
| `WORLD_ROADMAP.md` | Companion to `WORLD_ARCHITECTURE.md` — the phased plan for building it, if ratified. |
| `KIN.md` | The character-lineage model behind `kin.html` — copy-on-spawn-then-diverge, family/given names, the deferred family backlog. |
| `GOVERNANCE.md` | The governance model behind `govern.html` — rules, the append-only ledger, the asynchronous magistrate, and the token budget with its coded subsistence floor. |
| `CLAUDE.md` | Agent handoff for AI assistants working on this project. |

## Versioning

Each app carries its own in-product version label (e.g. `v1.80` in Meditate, `v0.11 · breathe`). There is no global suite version and no git tags. Changes land on `claude/<slug>` branches merged to `main` via pull request; pushing to `main` deploys to GitHub Pages. The PWA service worker's `CACHE_VERSION` is bumped on each deploy so clients pull fresh files.

## Care and safety

Care and safety are the foundation of the work, not a disclaimer bolted onto it. In *Governance, the Game* they are load-bearing and coded: the governance layer's floor is literally **care for the vulnerable**, and each family's **subsistence floor** — the tokens no vote can strip — is that care made material (see `GOVERNANCE.md` and `STATEMENT.md`).

Concretely, in the apps: the bring-your-own-key features send what you give them to Anthropic on **your own** key (and Companion's searches to its search providers) — each one named in [State & data](#state--data) — and there is **no analytics, telemetry, or third-party tracking** anywhere in the suite.

## License

Not yet chosen.
