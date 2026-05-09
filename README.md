# Hill Climbing

A stillness practice that uses your camera and synthesised sound. A 2-up / 1-down staircase game adapts both round duration and stillness threshold to keep practice in the engagement zone (~71% success rate).

## Use

Open the URL on a device with a camera and a Web-Audio-capable browser:

1. Click **Begin** on the start screen.
2. Grant camera permission when prompted.
3. Frame yourself within the silhouette guide on the positioning screen.
4. Click **I'm ready** to enter practice.
5. Hold above the threshold floor for the round duration.

First run shows a six-page guided introduction explaining what the app measures, what to expect, and when the practice might harm. Re-openable any time via the *about this practice* link on the start screen.

## Devices

Designed for desktop and tablet. Mobile-responsive at viewports below 640px — works for typical phone widths but not yet tested on very narrow devices (< ~360px).

Camera and audio require **HTTPS**. Localhost is fine for development; deployed environments must serve over HTTPS. iOS Safari requires audio to start within a user gesture (the **Begin** click satisfies this).

## State

All game state, adverse-event reports, and saved audio trajectories are stored in the browser's `localStorage` on the device that ran the session. Nothing leaves the device at Tier 0/1. To reset, clear the site's local storage in your browser.

See `REQUIREMENTS.md §1.1` for the full data inventory.

## Tier

The app currently runs at **Tier 0** (solo / developer). The `TIER` constant at the top of the JS in `index.html` controls escalating safety features. Higher tiers activate pre-screening, responsibility-forward copy, backend report submission, age gating, and other guardrails. See `REQUIREMENTS.md §4` for the criteria each tier requires.

## Documents

| File | What it is |
|---|---|
| `CONSTRAINTS.md` | Founding principles: care, safety, balanced power distribution. |
| `REQUIREMENTS.md` | Auditable requirements: data inventory, response runbook, tier transition criteria. |
| `BACKLOG.md` | Work tracking. Bugs, features, tuning, design questions, completed versions. |
| `KNOWN_RISKS.md` | Self-flagged uncertainties, ranked by user-safety severity. |
| `CLAUDE.md` | Agent handoff for AI assistants working on this project. |

## Versioning

Production iterations are tagged `vX.Y` in git. Each version bump is its own commit with a matching tag, so reverting is `git checkout vX.Y` followed by reload.

## Safety

This is **not therapy or medical care.** If you have a history of seizures, dissociation, panic disorder, PTSD, or severe anxiety, please consult a clinician before regular practice. Stop any time you feel dizzy, distressed, or dissociated. Press **Esc** mid-round to abort with no penalty. Tap the *this didn't feel right* link in-product to capture a concern.

If you're in crisis right now, contact your local emergency line or call / text **988** (US).

## License

Not yet chosen.
