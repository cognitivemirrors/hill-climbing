# Hill Climbing

Four small, private practices for coming back to yourself — a single static site (installable as a PWA), no build step, no backend, no accounts. Everything runs and stores on your device.

A landing **hub** (`index.html`) links to four single-file apps:

| Practice | File | What it is |
|---|---|---|
| **Meditate** | `meditate.html` | A stillness practice using your camera and synthesised sound. A 2-up / 1-down staircase adapts round duration and stillness threshold to keep practice in the engagement zone (~71% success). |
| **Breathe** | `breathe.html` | Guided breathwork (coherence, physiological sigh, box, 4-7-8) plus a nervous-system "training loop": stress, then practice returning to calm. |
| **Reflect** | `reflect.html` | A journal — free-text entries with optional mood / satisfaction ratings. Stored in IndexedDB, on-device. |
| **Nourish** | `nourish.html` | Learn to cook by climbing a 10-level ladder of real cooking challenges. The same 2-up / 1-down staircase adapts difficulty; you cook the dish and self-report how it went. |

The hub also shows a quiet weekly-usage dashboard (which practices you touched each day) and an optional, opt-in daily-reminder toggle.

## Use

Open the hub URL in a modern browser and pick a practice. Each app links back to the hub via the home icon, top-left. Install to your home screen (PWA) for a full-screen, offline experience.

**Meditate** needs a camera: Begin → grant camera permission → frame yourself in the silhouette guide → hold above the threshold floor for the round. First run shows a guided introduction (re-openable via *about this practice*). **Breathe** and **Nourish** need no camera. **Reflect** is just writing.

## Devices

Designed for desktop, tablet, and phone (responsive). Camera and audio require **HTTPS** (localhost is fine for development). iOS Safari requires audio to start within a user gesture, which the in-app start buttons satisfy.

## State & privacy

Each app stores its state locally on the device that ran it:

- **localStorage** — meditation game state and adverse-event reports (`meditate.html`), breath-session and meditation preferences, per-app daily usage flags (`hill-climbing-usage`), the cooking ladder (`hill-climbing-nourish`), and the install-banner dismissal flag.
- **IndexedDB** — the journal entries (`reflect.html`, database `journal`).

Nothing leaves the device **except** the optional **daily reminders**: if you turn them on, your browser registers a Web Push subscription with its push service so reminders can be delivered. Reminders are off by default and opt-in. There is no analytics, telemetry, advertising, or third-party tracking anywhere in the suite.

See `REQUIREMENTS.md §1` for the full data inventory. To reset an app, clear the site's local storage / IndexedDB in your browser.

## Tier

The suite runs at **Tier 0** (solo / developer). The `TIER` constant at the top of the JS in `meditate.html` gates escalating safety features (pre-screening, responsibility-forward copy, backend report submission, age gating). See `REQUIREMENTS.md §4` for the criteria each tier requires.

## Documents

| File | What it is |
|---|---|
| `CONSTRAINTS.md` | Founding principles: care, safety, balanced power distribution. (Binding.) |
| `REQUIREMENTS.md` | Auditable requirements: data inventory, response runbook, tier transition criteria. (Binding.) |
| `BACKLOG.md` | Work tracking. Bugs, features, tuning, design questions, completed versions. |
| `KNOWN_RISKS.md` | Self-flagged uncertainties, ranked by user-safety severity. |
| `CLAUDE.md` | Agent handoff for AI assistants working on this project. |

## Versioning

Production iterations are tagged `vX.Y` in git as a single global line across the suite; each version bump is its own commit with a matching annotated tag, so reverting is `git checkout vX.Y` followed by reload. Individual apps also carry their own in-product labels (e.g. `v1.75 · meditate`-era, `v0.6 · breathe`, `v0.1 · nourish`). Pushing to `main` deploys to GitHub Pages.

## Safety

These practices are **not therapy or medical care.** If you have a history of seizures, dissociation, panic disorder, PTSD, or severe anxiety, consult a clinician before regular practice. Stop any time you feel dizzy, distressed, or dissociated — in Meditate, press **Esc** mid-round to abort with no penalty; in Breathe, stop and breathe normally if you feel light-headed. Tap *this didn't feel right* in Meditate to capture a concern.

If you're in crisis right now, contact your local emergency line or call / text **988** (US).

## License

Not yet chosen.
