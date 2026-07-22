# Hill Climbing — Auditable Requirements (Draft v0.5)

> **⚠️ Superseded privacy framing — read `STATEMENT.md` first.** This document was written for the *product era*, when the suite was a set of **private, on-device** practice tools and this file's job was to make **privacy** auditable. The project is now the public-data art project **_Governance, the Game_** (`STATEMENT.md`), in which **every participant donates their own data as public seed data.** That reframe removes the privacy *guarantees* this document was built around — "nothing leaves the device," consent gates scaled to secrecy, zero-knowledge framed as a privacy *promise*, sensitivity tiers as leak-cost. Where this document's privacy framing conflicts with `STATEMENT.md`, **`STATEMENT.md` governs.** What is **not** privacy framing, and is **not** stripped:
> - **Two data protections survive, load-bearing everywhere below.** (1) **Credentials are secrets, not data** — the shared Anthropic key (`hill-climbing-api-key`) is spending power, not donated content; it stays out of HC read/export and is never synced. (2) **Only your own data is yours to donate** — nothing here makes another person's data public.
> - **CARE and SAFETY remain the foundation.** They were never privacy framing. `GOVERNANCE.md`'s coded floor is literally "care for the vulnerable," and the subsistence floor is that care made material — so the value tests (§1 Test 1), the adverse-event runbook (§3), and the anti-engagement stance stay in force.
> - **Honest disclosures of egress stay.** "This is sent to Anthropic on your key," "the sync server sees blob sizes/counts/timestamps" — these are the *opposite* of a privacy claim and are kept exactly.
>
> The tier-transition ladder (§4) and the audience-scaled consent tables describe the product-era frame; the two-person-world passages describe a since-superseded direction (`STATEMENT.md`). All are retained as record, not as live privacy commitments — while the safety machinery above (value tests, adverse-event runbook, anti-engagement) stays in force.

**Purpose.** This document closes gaps in `CONSTRAINTS.md` that need to be specific and stable for an audit (privacy review, safety review, governance review, regulator engagement). It is deliberately narrower than `CONSTRAINTS.md` — it documents only what *must not be malleable*. Tuning constants, feature ideas, UI copy, and roadmap items remain in `BACKLOG.md` where iteration is healthy.

The data sections (§1–§2) are organised **standard-first**: the test every data practice must pass comes before any inventory of what we happen to store. The exhaustive per-item inventory — the audit-grade artifact — lives in **Appendix A**, and by the standard in §1 it is a *Tier-2 deliverable*: owed in full to external users, not a documentation cost front-loaded onto a solo developer.

This document binds. Amendments follow `CONSTRAINTS.md §6` (supermajority + 30-day public comment + clinical-advisor sign-off where safety-relevant + published rationale).

Items marked **[FOUNDER-PENDING]** are proposed defaults awaiting explicit founder ratification at incorporation. Items marked **[TBD-TIER-N]** become required at the named tier and are gating prerequisites to advance into that tier (see §4).

---

## 1. Data practices — the standard, before the inventory

Every data practice in the suite must pass three tests, in order. A practice that fails any of them is a defect, however convenient it is to us. The tests are the policy; the inventory (Appendix A) is only evidence that we pass them.

**Reframed for the art project (public data).** In the product era these tests policed *privacy*. Under `STATEMENT.md` the data is **public donated seed data**, so the tests are re-read, not deleted: **Test 1** (serves a value the participant would choose) still binds — it is the care value in operation. **Test 2's** "consent scaled to audience" is **no longer a secrecy mechanism**; what survives is the participant's informed choice *to donate*, plus honest **disclosure** of every off-device send. **Test 3's** "controls proportional to risk" no longer scales to privacy-leak cost; the only hard data controls that remain are the **two carve-outs** — credentials-are-secrets and only-your-own-data-is-yours-to-donate. The audience-tier table below is kept as product-era record; it is not a live privacy gate.

**Test 1 — It serves a value the user would choose.** Every byte stored or transmitted exists to give the user something they would recognise and want: their practice history, an LLM that can see their goals, the same data on a second device. Data kept "because it might be useful later" fails this test and does not ship. Usefulness *to the operator* is never sufficient on its own.

**Test 2 — It carries informed consent, scaled to who is affected.** The user understands what is collected, why, where it goes, and can decline — and the *formality* of that consent matches the audience:

| Scale | Consent standard | What that requires |
|---|---|---|
| **Solo (Tier 0, today)** | Implicit | The user is the developer; they consent by building it. No consent artifacts required — but Tests 1 and 3 still bind. |
| **Friends & family (Tier 1)** | Informal but explicit | A plain-language account — in person or in-product — of anything that leaves the device. A real explanation, not legalese, before first use. |
| **External users (Tier 2+)** | Formal and documented | Written disclosures, the per-item inventory in Appendix A kept current, consent captured at the point of collection, and a verifiable deletion path. Tier-transition prerequisites (§4), not optional. |

**Test 3 — Its controls are proportional to risk.** The rigor of the safeguards — verification, deletion SLAs, encryption, review cadence, clinical sign-off — scales with **sensitivity × reach**. A free-text journal is not a day-flag; a hundred strangers are not one developer. We do not run Tier-3 machinery at Tier 0, and we never ship Tier-0 informality to Tier 2.

### 1.1 The current posture (Tier 0, solo)

**Where the data lives (a factual map, not a privacy promise).** Most of what the apps store sits in the participant's own browser (localStorage + IndexedDB); the flows below additionally send it off the device. In the product era this table was the guarantee that "nothing leaves the device except…"; under `STATEMENT.md` the data is **public donated seed data**, so the table is now simply an **honest disclosure** of every off-device send — each named party who *can* read the content, each mechanism that bounds it. The disclosure is kept because it is true, not because it protects a secret:

| Opt-in flow | What leaves the device | Who can read the content | What bounds the exposure |
|---|---|---|---|
| **BYOK AI apps** — Council, Companion, Nourish chef, the hub's companion next-step, and Reflect's photo describe | The text/decision the user submits, or the goals + journal + activity digest Companion assembles; the hub's next-step sends a **narrower** digest (activity day-counts/durations, open in-progress items, the focused Climb goal + open steps, and the companion's memory summary — **no journal prose**); Reflect (opt-in via its own in-app toggle, off by default) sends each **newly attached journal photo**, once, to get a description + text transcription saved beside it — the suite's first *image* egress, and the first send of journal-store content by the journal itself (L42) — all on the **user's own Anthropic key** | **Anthropic**, under the user's own API terms — **never the operator** (there is no operator server in the path) | User owns the key and the account; explicit key gate; plain-language disclosure; Companion shows the verbatim digest before it sends (L24/L27/L29). The hub next-step is the one flow that fires **on arrival rather than per user action** — which is why it is additionally gated behind its own explicit on-hub enable that names exactly what is sent (L40). Reflect's photo describe is per-user-action (the attach) behind its own explicit consent note; photos attached while it is off are never sent (L42) |
| **Companion web access** | Model-written search queries and page fetches, on the user's key | Anthropic **plus** the third-party search providers / fetched sites | Soft (prompt-level) "general, non-identifying queries only" guardrail; capped 5+5 per reply; user's own key (L30) |
| **E2EE cross-device sync** | Ciphertext **plus metadata** (account email, ciphertext sizes, row counts, timestamps, doc keys) | Operator sees **metadata only** — content is cryptographically unreadable | End-to-end encryption: the operator holds no key and cannot decrypt (Appendix A.5). Under `STATEMENT.md` this is now **optional transport, not a secrecy guarantee** — the donated data is public regardless; the metadata leak (sizes/counts/timestamps/email) is disclosed here honestly |
| **Web Push reminders** | A push-subscription endpoint | The platform push service (Google / Apple / Mozilla) | No content and no behavioural data — a fixed practice prompt; revocable at any time |

This table is the canonical short statement of what leaves the device. It replaces the older "zero outbound traffic, except…" framing, which had accreted five separate exceptions (L22/L24/L27/L29/L30/L31) and no longer described the suite honestly.

### 1.2 Data by sensitivity

What we hold, ranked by what a leak *would have* cost the user in the product era — retained as an honest map of where the most personal prose sits; under `STATEMENT.md` this is donated public seed data, not a secret to protect:

- **Free-form personal prose (highest).** Reflect journal entries; Council deliberations; Companion conversations; Levity notebook lines; Foresee prediction lines (`hill-climbing-foresee`). On-device; end-to-end encrypted if sync is on. Council and Companion additionally send some of this to Anthropic on the user's own key when the user acts (Companion sends the journal digest by design on every reply — L29). Companion also persists a **model-written rolling summary of the user's past conversations** (its cross-conversation memory, added v0.8 — L37): the first *distilled* at-rest personal content in the suite, held in the same `hill-climbing-companion` blob and E2E-encrypted with it.
- **Short personal labels.** Climb goal/task titles; Train exercise names; Nourish self-reported outcomes. Personal but bounded — not prose.
- **Credential.** The single shared Anthropic API key (`hill-climbing-api-key`). Device-local, **never synced.** Browser localStorage is not a secure secret store — an accepted Tier-0 risk (L29).
- **Non-identifying flags & preferences.** Per-day usage flags; session-length preferences; onboarding / UI dismissals. No content, no identity.

Full per-item detail — every key, its shape, size, retention, and deletion path, plus the sync trust model — is **Appendix A**.

### 1.3 Deletion

- **Now (Tier 0):** on-device data is cleared through the browser (DevTools → Application → Storage), and several apps already offer their own in-app erase (Reflect per-entry delete; Climb "Delete everything"; Train and Council in-app erase). Any app with sync on offers "Delete my synced data," which removes the user's `sync_docs` + `sync_keybundle` rows; signing out drops the device's cached key.
- **Tier ≥ 2 prerequisite:** a single in-app "delete all my data" control that removes every `hill-climbing-*` localStorage key (including the shared `hill-climbing-api-key` credential and `hill-climbing-companion` — the latter covers both saved conversations and the cross-conversation memory in one blob, which Companion's in-app "Clear all conversations" already erases together today), the `breathe-session-duration` key, and the Reflect `journal`, Climb `climb`, and usage `hc-usage` IndexedDB databases — with confirmation, and unsubscribing any active Web Push reminder.
- **Tier ≥ 2:** server-side report-deletion and full account deletion (removing the Supabase `auth.users` row) within the §3 / data-export SLA (24 h).

Deletion is real — no retained shadow copies (CONSTRAINTS P1). The full per-store deletion mechanism is inventoried in Appendix A.

### 1.4 Agent interoperability (the symmetry standard)

The suite is operable by the user and by an LLM agent acting on the user's behalf, **symmetrically** — founder-directed (2026-07, KNOWN_RISKS L45). The standard, stated as commitments:

- **Indistinguishability.** Given two on-device snapshots of application state — one produced by agent actions, one by human UI actions — it must not be possible to tell which was which. Every programmatic action (`window.HC.invoke`) routes through the same internal function the UI handler calls: same validation, same persistence, same sync marking, same timestamps. Neither channel records provenance, anywhere.
- **Seedability, both directions.** Every persistent store is exportable and importable verbatim (`HC.export`/`HC.import` — raw localStorage strings, complete IndexedDB records, ids and timestamps included), so the person can seed the history an agent "would have" produced and an agent can produce any state the person could reach. Import is destructive by design and requires an explicit confirm.
- **No new egress.** The interface and its documentation surface (`llms.txt`) make no network calls and expose no action that does. Agent operation adds nothing to the §1.1 egress table.
- **One scoped exception, held equally.** Credentials (`hill-climbing-api-key`) are excluded from read/export for both parties; they are set and cleared only by explicit action carrying the UI's own validation. This is carve-out (1) from the banner — a secret, not donated data — and it holds under the art frame unchanged.
- **Meditate's surface is now the timed sit only.** Meditate v1.80 deleted the hidden camera "stillness" mode entirely; its HC manifest declares one store (`hill-climbing-timed-minutes`) and three actions (`setTimedMinutes`, `beginTimedSit`, `endTimedSit`). The former stillness-game store, trajectory buffer, and adverse-event reporter are gone, so the earlier "seedable camera stores held outside the action surface" carve-out no longer applies — there is no camera surface left to hold out.
- **Honest scope.** The guarantee covers on-device snapshots. Opt-in E2EE sync's server-side metadata (push timestamps, sizes) can still distinguish a bulk seed from organic history — stated, not hidden.
- **The ground rules bind the agent surface.** `llms.txt` carries them: act only on the person's explicit ask; never fabricate practice (outcome actions record what the person reports); destructive operations require the person's explicit approval each time. These are prompt-level norms for well-behaved agents, not hard controls — the same class as the L30/L40 guardrails, and reviewed on the same cadence.
- **[DRAFTED — the world direction] The parity guarantee is preserved as the world grows.** The two-person world (`WORLD_ARCHITECTURE.md`) extends the agent surface with characters, rooms, and cross-user sharing — but under a load-bearing rule that keeps this section literally true: **agent-characters write only to a new world-artifact store, never to a practice store** (journal, Foresee, goals). So no practice-state record is ever agent-authored and §1.4's practice-store indistinguishability is unchanged. World artifacts carry *signed* authorship in a store **outside §1.4's scope** — additive, not a loosening. The world's own data practices (the artifact store, cross-user shared-room keys gated behind a security review, autonomy guardrails) are specified in `WORLD_ARCHITECTURE.md` §5–§9 and enter Appendix A only if and when they are built. *Drafted; the direction and its binding-doc changes await founder ratification.*

---

## 2. Consent and privacy

> **Reframed (public data).** Under `STATEMENT.md` "consent" here means the participant's informed choice **to donate their own data as public seed data**, plus honest disclosure of every off-device send — not a promise of secrecy. The two hard protections that remain are the banner's carve-outs: **credentials are secrets, not data**, and **only your own data is yours to donate**. The audience-scaled machinery below is product-era record.

### 2.1 Consent, scaled to the audience

This operationalises Test 2 of §1. At the **current** scale (Tier 0, solo) consent is **implicit** — the user builds the thing. The obligations below become live as the audience grows, and are gating prerequisites for the tier they name (§4):

- **Tier 1 (friends & family):** before anyone else uses an app that can leave the device, they get a plain-language account of *what* leaves and *to whom* (the four flows in §1.1). Informal — a conversation or a short in-product note — but explicit and before first use.
- **Tier 2+ (external users):** formal, documented consent — written disclosures, consent captured at the point of collection (not buried in a one-time modal), the Appendix A inventory kept current, and one-click withdrawal where the flow allows it.

New data fields collected count as breaking and require re-consent at the next interaction (§6.2).

### 2.2 What we never collect

- Identity — **no account is required**; every app is fully usable anonymously. An **optional** account (email + password) exists only to enable opt-in cross-device sync (Appendix A.5), and no email is collected unless the user turns sync on. We never collect name, phone, or any identity beyond that email.
- Location
- Device fingerprints
- Behavioral analytics
- Cookies for cross-site or third-party tracking
- Microphone audio
- Camera images are never persisted (Meditate v1.80 no longer uses the camera at all; the `anime.html` webcam experiment renders live and stores nothing)

### 2.3 Consent boundaries

- **Camera access (`anime.html` experiment only):** browser-level permission required before any capture; nothing is persisted (Meditate no longer uses the camera — v1.80).
- **localStorage / IndexedDB:** standard browser storage; not transmitted except via the opt-in flows in §1.1.
- **Audio:** synthesised in-browser; no microphone access requested.
- **BYOK AI apps (all tiers, opt-in):** each off-device send is user-initiated and gated behind an explicit key setup that names the data flow and Anthropic in plain language; billed to the user's own account; Nourish's chef adds its own first-run consent checkbox, and Reflect's photo describe adds its own in-app consent note (naming that each newly attached photo is sent) before it can be enabled. **One deliberate exception to "user-initiated per send" (founder-directed):** the hub's companion next-step, once explicitly enabled on the hub, sends its digest automatically each time the user returns to the hub (throttled). The consent for the *recurring* pattern is collected up front — the enable note states that it fires on every return — and turning it off is a single tap (L40).
- **Cross-device sync (all tiers, opt-in):** signing in and enabling sync is explicit and per-device; data is end-to-end encrypted before upload; the passphrase and recovery code never leave the device; the user can delete the server copy at any time (Appendix A.5).
- **Web Push reminders (all tiers, off by default):** enabled only by explicit action; revocable with "Turn off."
- **Backend adverse-event submission (Tier ≥ 2):** explicit opt-in at each report; never default-on.

### 2.4 Sharing

The company does not, and structurally cannot, sell or share user data with third parties. Charter clauses required at Tier ≥ 2 prohibit data-sale and ad-targeted business models.

*Honest note: Companion's opt-in web access emits model-written, deliberately non-personal search queries to third-party search providers on the user's own key (§1.1, L30). This is neither a data sale nor an ad-targeted arrangement — no user data is handed to a provider for its own use — but it is a genuine third-party touchpoint, disclosed here for completeness. The safeguard is the prompt-level instruction to keep queries general and personal-detail-free; hardening it (a query-redaction step, or a per-conversation web toggle) is a documented follow-up.*

---

## 3. Adverse-Event Response Runbook

### 3.1 Capture

In-product `this didn't feel right` link, always visible during practice. Local storage capture is always-on (Tier 0 onwards). Server-side submission is Tier ≥ 2.

**[DRAFTED FOR RATIFICATION — the world direction] Relational capture.** The two-person world (`WORLD_ARCHITECTURE.md`, CONSTRAINTS S8) needs a second capture path for a harm the practice link does not name: *this hurt the relationship* — a character said or did something wounding in a partner's voice, a portrayal felt like a violation, an attachment to a character of a loved one turned painful. Available wherever a character can act or leave an artifact; local-capture always-on like the practice path. It routes to the relational-safety review (bilateral — either partner's objection is dispositive; CONSTRAINTS S8), not to clinical triage, since the harm is interpersonal rather than a practice adverse event. *Drafted; binds only upon founder ratification.*

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
- **Informal consent given (§2.1):** anyone beyond the developer has had the off-device flows (§1.1) explained in plain language before first use.

### 4.2 TIER 1 → TIER 2 (friends & family → open beta)

- Backend report submission with documented SLA per §3.2.
- Pre-screening questionnaire on first run (validated short forms — DES-II for dissociation, GAD-7 for anxiety; specific instrument set ratified separately).
- Onboarding ramp: first 14 days of any new user has reduced caps (max round duration 60 s, no auto-escalation past 90 s).
- Clinical advisor under contract with veto authority on safety-relevant changes per §3.4.
- Responsibility-copy variant active in safety modal (already implemented; auto-activates at Tier 2).
- Quarterly incident-rate publication mechanism live (publishes even if rate is 0).
- In-app "delete all my data" button.
- **Formal, documented consent (§2.1, Test 2):** written disclosures for every off-device flow, consent captured at the point of collection, and the Appendix A data inventory current and founder-ratified.
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
| Every data practice traces to a user value (§1 Test 1) | Review each new/changed store or transmission against the value test; a practice with no user-recognised benefit is rejected | Every release adding or changing a data practice |
| Data export ≤ 24 h | Manual test (when implemented) | Every release |
| Off-device egress limited to the four opt-in flows in §1.1 (BYOK AI apps → `api.anthropic.com` only, incl. Companion's server-side web search/fetch; E2EE sync → ciphertext + metadata only; Web Push subscription) — no analytics, telemetry, error reporting, or third-party scripts (detail: Appendix A.4) | Network-tab inspection during a full session | Every release |
| Companion web reply stores only dialogue, no tool blocks or raw digest (L30) | Send a Companion message that triggers a web search; inspect `hill-climbing-companion` + the synced blob — only `{role,text}` turns, no `server_tool_use` / `web_*` blocks and no digest text | Every release touching `companion.html` |
| Companion cross-conversation memory stays bounded, erasable, and is distilled without web egress (L37) | Confirm `hill-climbing-companion.memory.summary` stays a bounded rolling summary (not an unbounded transcript pile); "Clear all conversations" empties `memory`; the background summarizer request sends `tools: []` (no `web_search`/`web_fetch`) | Every release touching `companion.html` |
| Companion request tool writes on-device only, is consented and reversible (L38) | Trigger `add_request` and inspect the network tab — no request leaves the device beyond the same `api.anthropic.com` call; confirm the entry appears in the in-app Requests list and can be deleted; confirm the store is capped (100) and requires both a heading and a prompt | Every release touching `companion.html` |
| Agent interface keeps the §1.4 symmetry: same-code-path actions, verbatim round-trip, no provenance, no egress (L45) | Headless run: perform the same mutation via the UI code path and via `HC.invoke` in fresh contexts (deterministic time/uid patch) and byte-compare the stores; export → wipe → import → export and byte-compare; grep the interface layer for provenance fields; network-tab inspection while invoking actions — zero requests beyond the app's own | Every release touching `hc-agent.js` or any app's HC registration |
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

- **Version:** 0.5 (draft)
- **Author:** First draft assembled by AI (Claude Sonnet 4.6) at founder request, October 2025.
- **Revision history:**
  - v0.1 — initial draft.
  - v0.2 (founder-directed) — reframed §1–§2 around a standard-first data policy (value → consent-scaled-to-audience → controls-proportional-to-risk); the exhaustive per-item inventory and sync internals moved intact to **Appendix A** and marked a Tier-2 deliverable; §4.2 gains the formal-consent + inventory prerequisite and §4.1 the informal-consent prerequisite; §5 gains a value-test row and consolidates the network-egress row. `CONSTRAINTS.md §1.2/§1.4/§3.2 P1/§3.4` realigned to the same standard in the same change.
  - v0.2a (founder-ratified, v1.78) — Appendix A updated for cross-device **usage sync**: A.1's `hill-climbing-usage` row rewritten (day-flags + per-day duration + session count) with new `hill-climbing-usage-device` / `hill-climbing-usage-backfilled` rows; new A.2 `hc-usage/records` store; A.5 registers the `usage/…` per-record log and revises its "never synced" note; §1.3 delete-all extended to the `hc-usage` database. Inventory-level only; the §1 standard is unchanged and the change passes all three tests (KNOWN_RISKS L33).
  - v0.2 (inventory freshness) — added the **Companion requests-to-the-builder** store (`companion.html` v0.9): A.1 `hill-climbing-requests` row (a `{ heading, prompt }` brief per request), A.5 `ls:hill-climbing-requests` blob, an A.4 note that the `add_request` client tool adds no egress (on-device write), and a §5 verification row. Factual keep-current update, no policy change; the store is the user's own product feedback about the suite, on-device + E2EE-synced like the rest, and passes §1's three tests at Tier 0 (KNOWN_RISKS L38).
  - v0.2 (inventory freshness) — added the **Savor** app (`savor.html`) to Appendix A: its `hill-climbing-savor` localStorage row (A.1) and `ls:hill-climbing-savor` sync blob (A.5). Savor also logs usage through the shared `hc-usage.js` (the A.1 aggregate + the A.2 `hc-usage/records` store + the `usage/…` sync log), like the other practice apps. Factual keep-current update, no policy change; Savor is fully on-device and adds no new off-device flow (it joins the existing E2EE-sync posture). Passes §1's three tests at Tier 0 (KNOWN_RISKS L34).
  - v0.3 (founder-directed, drafted for ratification) — new **§1.4 Agent interoperability**: the suite is symmetrically operable by the user and by an LLM agent on their behalf (`window.HC` + `llms.txt`), with indistinguishable on-device snapshots, verbatim two-way seeding, zero added egress, a credential carve-out held equally, and honest scoping of the guarantee (sync metadata can still distinguish). §5 gains a parity-verification row; A.4 gains a no-egress note. Founder set the standard in-session verbatim (KNOWN_RISKS L45); the §1.4 *wording* awaits explicit founder read-through, per the amendment norm for binding docs.
  - v0.4 (founder-directed, **drafted for ratification**) — the **world direction** (`WORLD_ARCHITECTURE.md`, `WORLD_ROADMAP.md`): the suite is being redrawn toward a private, two-person, values-constrained world of profile-grounded characters. Drafted binding changes, reviewed across four adversarial lenses before landing: §3.1 gains a **relational adverse-event capture path** ("this hurt the relationship"); §1.4 gains a reaffirmation that agents write only a world-artifact store, never practice stores, so the parity guarantee is **preserved literally**. Companion doc changes: CONSTRAINTS **S8** (relational/psychological harm as a first-class safety commitment — the review's headline finding, binding under T1), a new **§5** world anti-engagement amendment, and **P11** (consent-as-permission; accepted operator asymmetry). New KNOWN_RISKS entries **L46–L49**. Nothing is built; the suite is unchanged and still TIER 0. Awaits founder ratification via CONSTRAINTS §6.
  - v0.5 (**public-data art reframe — _Governance, the Game_**) — this document's product-era **privacy framing is superseded by `STATEMENT.md`** (banner added at the top; §1/§2 reframed: data is public donated seed data, "consent scaled to audience" is no longer a secrecy mechanism, and the only surviving hard data controls are the two carve-outs — credentials-are-secrets and only-your-own-data-is-yours-to-donate). CARE and SAFETY are explicitly preserved as the art's foundation; honest egress disclosures are kept verbatim. Inventory (Appendix A) updated for the same session's shipped code: **ERP removed** (`erp.html` deleted — its `hill-climbing-erp` row, the `ls:hill-climbing-erp` sync blob, the §1.2 sensitivity mention, and the §1.4 ERP transcription-only clause all struck; the app is gone, and the 988 crisis line that lived only inside it with it); **Meditate v1.80** stripped to the timed sit (removed the `stillness-game`, `hill-combing-reports`, `hill-combing-last-trajectory`, `hill-combing-acknowledged-v1`, and `hill-climbing-introduced-v1` rows, the `ls:stillness-game` sync blob, and the camera transient buffers; the only remaining store is `hill-climbing-timed-minutes`, HC surface = three timed actions); **Savor folded into the unified Nourish v0.17** (`savor.html` is a redirect stub; the `hill-climbing-savor` store now rides inside Nourish, and its usage folds into Nourish's row); **Govern v0.2** row added (rules / append-only ledger / magistrate verdicts + the token-budget layer: world params, family roster, per-family budgets, one-family-one-vote surplus proposals). All legacy `hill-combing-*` keys are now retired. Inventory-freshness + framing reconciliation; no new binding commitment invented.
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

---

## Appendix A — Formal data inventory (Tier-2 deliverable)

> **Why this is an appendix.** Under §1 Test 2, a *formal, documented* data inventory is what external users are owed; at Tier 0 (solo) it is evidence kept for rigor, not a live consent instrument. The content below is the complete, audit-grade record — every key, store, transient buffer, network flow, and the sync trust model. Keeping it current and founder-ratified is a **Tier-2 transition prerequisite** (§4.2). Nothing here was dropped in the §1 reframe; it was moved so the standard reads first.

### A.1 On-device localStorage (persistent, on user device only)

| Key | Contents | Size | Retention | Deletion mechanism |
|---|---|---|---|---|
| `hill-climbing-usage` | Per-app usage — day-flags **plus per-day practice duration and session count**: `{ "v": 1, "meditate": { "YYYY-MM-DD": { "s": 1500, "n": 1 }, … }, "breathe": { … }, "nourish": { "YYYY-MM-DD": 1, … }, … }` (duration-bearing apps hold `{ s: total seconds, n: session count }`; flag-only apps and pre-v1.78 days hold the bare `1`). Written by the seven usage-logging practice apps via the shared `hc-usage.js` — Meditate/Breathe record a completed session's seconds, the rest (Nourish [cook + taste], Levity, Foresee, Climb, Train) mark the day active (Savor's taste sessions fold into Nourish's row now that it is one app). Read by `index.html`. This is the **this-device aggregate** (companion + offline reads); the cross-device-synced copy is the `hc-usage/records` IndexedDB store (A.2). Records seconds practised, session counts, and day-activity — **no per-session timestamps in this blob, no session content, no user-identifiable data.** | < 20 KB (grows ~5 KB/yr) | Until user clears; no auto-pruning (streak requires full history) | Browser settings; future "delete all my data" button (Tier ≥ 2 prerequisite) |
| `hill-climbing-usage-device` | Random per-device id (e.g. `"d3f9a1b2k7"`) tagging this device's usage records so cross-device sums don't collide. Device-local; **never synced**. | ~20 B | Until user clears | Browser settings; future "delete all my data" button (Tier ≥ 2 prerequisite) |
| `hill-climbing-usage-backfilled` | One-time guard (timestamp) marking that this device's pre-existing usage history was migrated into records. Device-local; **never synced**. | ~15 B | Until user clears | Browser settings; future "delete all my data" button (Tier ≥ 2 prerequisite) |
| `hill-climbing-timed-minutes` | Meditate timed-mode session length preference (minutes, integer) | ~10 B | Until user clears | Same as above |
| `breathe-session-duration` | Breathe session length preference (minutes, integer). **Synced (E2EE) when sync is on** (A.5). | ~10 B | Until user clears | Same as above |
| `hill-climbing-install-dismissed` | Hub PWA install-banner dismissal timestamp (ms since epoch); re-prompts 5 days after dismissal | ~15 B | Until user clears | Same as above |
| `hill-climbing-hub-suggest` | Hub companion next-step opt-in flag (`'1'` = enabled). When enabled (and only then), the hub sends a compact BYOK digest to Anthropic on each return — see A.4. Device-local UI preference; **never synced** (each device consents separately). | ~5 B | Until user clears or turns the toggle off in-hub | In-hub toggle ("companion: on" → tap to turn off); browser settings |
| `hill-climbing-hub-suggest-log` | Rolling log of the last **10** companion next-step snapshots: `{ v, items: [{ ts, model, reply {app, text}, digest }] }` — the review evidence behind "didn't fit?". Each `digest` is a copy of what was sent (activity counts, open intents, Climb focus goal/steps, the companion memory-summary excerpt), so this key inherits that content's sensitivity. Device-local; **never synced**; nothing leaves the device from here on its own. | < 60 KB (cap 10) | Rolling — 11th snapshot drops the oldest | Browser settings; future "delete all my data" button (Tier ≥ 2 prerequisite) |
| `hill-climbing-hub-suggest-seed` | Transient hand-off for the hub's "ask about this": `{ v, ts, text, show {text, app} }` — `text` is the model-facing context (suggestion + digest), `show` the display fields Companion renders as the visible continuity card; written when the user taps through to Companion and **consumed (deleted) on Companion's next load**; ignored if older than 10 min. A local write only — its content reaches Anthropic only if the user then sends a message in the seeded conversation (ordinary Companion egress). | < 8 KB, transient | Seconds — deleted on consumption; orphaned seeds overwritten by the next tap | Consumed automatically; browser settings |
| `hill-climbing-reflect-photo-ai` | Reflect photo-describe opt-in flag (`'1'` on / `'0'` explicit off). When enabled (and only then), each **newly attached** journal photo is sent once to Anthropic on the user's own key to produce a description + text transcription — see A.4. **The consent is decided once and remembered across devices (founder-directed, v0.9):** the flag **syncs (E2EE) when sync is on** as its own blob (A.5), so enabling on one synced device counts on all of them — and turning it off propagates the same way. On a device without sync, the choice is device-local. | ~5 B | Until user clears or turns the toggle off in-app (off propagates to synced devices) | In-app toggle ("describe photos: on" → tap to turn off, everywhere); browser settings |
| `hill-climbing-nourish` | Nourish cooking-ladder state (Nourish is now the **unified Cook + Taste** app, `nourish.html` v0.17 — Savor was folded in as a second tab): `{ v, level, streak, cleared {id→outcome}, history [{id, outcome, ts}], active, recent[] }`. Challenge ids and self-reported outcomes only; no free text, no identity. **Synced (E2EE) when sync is on** (A.5). | < 20 KB (grows slowly) | Until user clears | Same as above |
| `hill-climbing-savor` | Taste-show state, **now written inside the unified Nourish app** (`nourish.html` v0.17, "Taste" tab); `savor.html` is a redirect stub → `nourish.html#taste`. Shape: `{ v, watched {epId→ts}, notes [{id, ep, epTitle, taste, text, created}], myLessons [{id, title, taste, host, idea, grab[], steps[], aha, created}], current }`. `notes[].text` and the `myLessons[]` fields are **free-form user-written prose** — short tasting observations and the user's own lessons, which are authored to be shared. Its usage folds into the Nourish dashboard row on the hub. **Synced (E2EE) when sync is on** (A.5). | grows slowly | Until user clears | Browser settings; future "delete all my data" button (Tier ≥ 2 prerequisite) |
| `hill-climbing-climb` | Climb goals + tasks state: `{ v, rootId, goals {id → {title, parentId, order, status active/resting, created, updated, restedAt}}, tasks {id → {goalId, title, done, created, updated, doneAt}}, focusId }`. `rootId` names the single editable root goal every other goal hangs under. Goal and task titles are short user-authored text and may be personal (they name what the user is working toward). | grows with use; typically < 100 KB | Until user clears or uses Climb's in-app "Delete everything" | In-app Delete everything (present today); browser settings; future "delete all my data" button (Tier ≥ 2 prerequisite) |
| `hill-climbing-levity` | Levity comedy-practice state: `{ v, level, streak, cleared {id→outcome}, history [{id, outcome, ts}], active, recent[], notebook [{text, landed, ts}] }`. `notebook[].text` is free-form user-written comedy material — personal creative prose. **Synced (E2EE) when sync is on** (A.5). | grows slowly | Until user clears | Browser settings; future "delete all my data" button (Tier ≥ 2 prerequisite) |
| `hill-climbing-foresee` | Foresee calibration-practice state: `{ v, level, streak, predictions [{id, text, conf, madeTs, due, level, status, outcome?, resolvedTs?, brier?}] }`. `predictions[].text` is free-form user-written one-line predictions about their own life (plans, feelings, other people) — short personal prose, journal-adjacent. No egress anywhere in the app. **Synced (E2EE) when sync is on** (A.5). | grows slowly | Until user clears | Browser settings; future "delete all my data" button (Tier ≥ 2 prerequisite) |
| `hill-climbing-train` | Train workout-logger state: `{ v, unit, exercises [{id, name, fields, createdAt}], workouts [{id, startedAt, finishedAt, entries[…]}], active }`. Exercise names (short user text) plus numeric reps/weight/time. Low sensitivity. **Synced (E2EE) when sync is on** (A.5). | grows with use | Until user clears or in-app erase | In-app erase; browser settings; future "delete all my data" button (Tier ≥ 2 prerequisite) |
| `hill-climbing-remind` | Remind reminders state: `{ v, reminders [{id, text, created, due (local "YYYY-MM-DDTHH:mm" or null), done, doneAt}] }`. Reminder text is short user-authored text and may be personal (what the person doesn't want to forget). Low–moderate sensitivity. **Synced (E2EE) when sync is on** (A.5). No BYOK surface; no notifications. | grows with use | Until user clears or in-app "Delete everything" | In-app Delete everything; browser settings; future "delete all my data" button |
| `hill-climbing-council` | Council saved deliberations: array (cap 30) of `{ id, ts, situation, directors, chairOpening, thread [{role, text}], feedback }`. `situation`, `thread[].text`, and `feedback.note` are **free-form personal decisions** — among the most sensitive content in the suite (see L24). **Synced (E2EE) when sync is on** (A.5). | < 100 KB (cap 30) | Until user clears or in-app erase | In-app erase; browser settings; future "delete all my data" button (Tier ≥ 2 prerequisite) |
| `hill-climbing-companion` | Companion saved conversations **and cross-conversation memory**: `{ v, conversations: [ { id, ts, title, thread [{ role, text, hidden? }] } ] (cap 60), memory: { summary, folded, ts } }`. `thread[].text` is **free-form personal conversation** — the user's own words plus the companion's replies, which may paraphrase their goals or journal. `memory.summary` (**added v0.8**) is a **model-written rolling distillation of the user's older conversations** — an evolving profile of what matters to them, which may paraphrase goals/journal content the companion surfaced; `memory.folded` maps conversation id → turns already distilled. Among the most sensitive content in the suite (see L29, **L37**). The raw goals/journal/activity **digest** the companion is shown at reply time is still *not* stored here — with one bounded exception: a conversation opened via the hub's "ask about this" hand-off carries the flagged suggestion's **hub digest** (activity counts, open intents, Climb focus, memory-summary excerpt — no journal prose) as a hidden opening turn, plus a small `hubRef` display object (the suggestion sentence + target app, rendered as the visible hand-off card), so follow-up questions have their context (companion v0.12–v0.13, L40). Otherwise what persists is the dialogue **and the distilled memory of it**. **Synced (E2EE) when sync is on** (A.5). | < 250 KB (cap 60 + bounded memory) | Until user clears (in-app "Clear all conversations", **which erases the memory too**) or in-app erase | In-app Clear all conversations (**dialogue + memory**); browser settings; future "delete all my data" button (Tier ≥ 2 prerequisite) |
| `hill-climbing-nourish-chef` | Nourish Chef mode settings: `{ model, consented, history [{title, outcome, ts}] (cap 20) }`. Recipe titles + self-reported outcomes; no free-form pantry text is persisted. The API key is **no longer stored here** — it moved to the shared `hill-climbing-api-key` (below). | < 20 KB | Until user clears | Browser settings; future "delete all my data" button (Tier ≥ 2 prerequisite) |
| `hill-climbing-requests` | Companion **requests to the builder** (added v0.9): `{ v, items: [ { id, ts, heading, prompt } ] }` (cap 100). Requests **about the app suite itself** — captured from a conversation via the `add_request` client tool once the user okays it, **or written directly by the hub's "didn't fit?" review flow** (a user tap, no model involved): a suggestion-review entry embeds the flagged suggestion, the user's optional note, and the digest that produced it (incl. the companion memory-summary excerpt), so review entries can carry more personal context than the original short briefs. On-device; both writers are local (no new egress). **Synced (E2EE) when sync is on** (A.5); the hub registers this blob too, so hub-written entries push (same blob-LWW concurrent-edit caveat as A.5). | grows slowly (cap 100) | Until user clears (in-app per-item delete or "Clear all", or browser clear) | In-app per-item delete / Clear all (in Companion); browser settings; future "delete all my data" button (Tier ≥ 2 prerequisite) |
| `hill-climbing-govern` | Governance-layer state (`govern.html` v0.2 — the governance over Kin's families): `{ v:2, rules {charter[{text,…}], family{}, character{}}, ledger[{id,…}] (append-only character-action record — a coded invariant, never rewritten), verdicts[{id,…}] (magistrate audit results), world {pool, subsistence, cadence, lastReset}, families[{name, ts}], budgets {familyName → {allocation, spent}}, proposals[{id, splits, votes, status, ts, resolvedTs}] }`. The v0.2 budget layer adds the world params, family roster, per-family token budgets, and one-family-one-vote surplus-distribution proposals. Rule text and family/character names are short authored labels. **Synced (E2EE) when sync is on** (A.5). | grows slowly | Until user clears | Browser settings; future "delete all my data" button (Tier ≥ 2 prerequisite) |
| `hill-climbing-echo` | Echo (listening game) state: `{ v, longest, sits, lastTs }` — all-time longest phrase, session count, last-played timestamp (informational only; never used to prompt or nag). No free text, no identity. Device-local; **never synced** (games are deliberately outside sync and the usage log). | < 1 KB | Until user clears | In-app export exists; browser settings; future "delete all my data" button (Tier ≥ 2 prerequisite) |
| `hill-climbing-garden` | Garden (stone-garden puzzle) state: `{ v, solved {levelIndex → first-solve ts}, last }`. Level indices and timestamps only; no free text, no identity, no move-count records. Device-local; **never synced**. | < 1 KB | Until user clears | In-app export exists; browser settings; future "delete all my data" button (Tier ≥ 2 prerequisite) |
| `hill-climbing-api-key` | The user's **Anthropic API key** — a single credential **shared across the hub's bring-your-own-key AI apps** (Council, Companion, and Nourish's chef): set it in any one and it works in all. A credential; browser localStorage is not a secure secret store. Legacy per-app keys (`hill-climbing-council-key`, `hill-climbing-companion-key`, and the `key` field formerly inside `hill-climbing-nourish-chef`) are migrated into this key once, then deleted, so nobody re-enters. Device-local; **never synced.** Removing it in any app clears it hub-wide. | ~100 B | Until user clears or in-app "Remove key" | In-app Remove key (clears it hub-wide); browser settings |

The legacy `hill-combing-*` keys have all been retired — every one lived inside Meditate's deleted camera "stillness" mode (its game state, adverse-event reports, trajectory buffer, and acknowledgment flag). No `hill-combing-*` key remains in the suite; all current keys use `hill-climbing-*`.

### A.2 On-device IndexedDB

| Database / store | Contents | Size | Retention | Deletion mechanism |
|---|---|---|---|---|
| `journal` / `entries` (written by `reflect.html`) | Journal entries: `{ id, created, updated, text (free-form, user-written), mood (1–7 or null), satisfaction (1–7 or null), images (optional, ≤4 — user-attached photos stored as on-device-compressed JPEG data URLs `{dataUrl, w, h, desc?, ocr?}`, long edge ≤1400 px, typically 100–400 KB each; added v0.7; `desc`/`ocr` are the optional **model-written description + verbatim text transcription** from the opt-in BYOK photo-describe flow, added v0.8 — A.4/L42 — stored beside the photo so they sync/export/delete with it), embedding (reserved, currently null), embModel (null), deleted? (tombstone flag) }`. Photos can be **more identifying than prose** (faces, places, documents) — same journal-grade sensitivity class, same handling: on-device, inside the entry record, so they ride the same per-entry E2EE sync, export/import, and per-entry delete; a delete tombstone **strips the photo bytes**. Never read by the hub or Companion (their readers touch only text/ratings/day-counts — no photo ever enters a BYOK digest). **Synced (E2EE) when sync is on** (A.5) — as a per-entry log, not a whole blob; a deleted entry becomes a `deleted:true` tombstone (hidden from UI/exports) so the deletion propagates rather than resurrecting on another device. | grows with use; `text` is user-authored prose, photos add ~100–400 KB each | Until the user deletes an entry (in-app, per-entry) or clears browser data | In-app per-entry delete (removes its photos too); browser settings; future "delete all my data" button (Tier ≥ 2 prerequisite) |
| `climb` / `events` (written by `climb.html`) | Append-only event log of every Climb state change: `{ id, ts, type, …payload }` — 14 types covering goal add/rename/reorder/move/archive/restore, focus set/clear, task add/rename/complete/uncomplete/delete, plus baseline snapshots. Payloads include goal/task titles (before/after on renames), so the log carries the same short user-authored text as the state blob. For the user's own local analysis; exportable as JSON. **Synced (E2EE) when sync is on** (A.5, since v1.99) — otherwise never transmitted. | grows with use (append-only) | Until Climb's in-app "Delete everything" or browser clear | In-app Delete everything (removes the whole database); browser settings; future "delete all my data" button (Tier ≥ 2 prerequisite) |
| `hc-usage` / `records` (written by the seven usage-logging practice apps — meditate, breathe, nourish [cook + taste], levity, foresee, climb, train — via `hc-usage.js`, added v1.78; Savor's taste sessions now write through the unified Nourish app) | Per-session and per-day usage records: `{ id, device, app, day: "YYYY-MM-DD", s: seconds, n: sessions, ts }`. One immutable record per completed session (Meditate/Breathe carry `s`) or per device-day flag (`s:0`). Each record is tagged with the writing device so the hub **sums** across devices instead of overwriting. No session content, no free text — just which practice, which day, how long, from which device. **Synced (E2EE) when sync is on** (A.5) as a per-record log — the union-merge that lets two devices' same-day activity add up rather than clobber (a whole-blob sync could not). | grows with use (~1–5 records/active app-day) | Until browser clear or a future "delete all my data" | Browser settings; future "delete all my data" button (Tier ≥ 2 prerequisite) |

The `journal` store is the only one holding **free-form personal prose** (and, since reflect v0.7, the only one holding **user photos**) — the most sensitive data in the suite. Climb's goal/task titles (in both its localStorage blob and its event log) are short user-authored labels: personal, but bounded and not prose. The hub (`index.html`) opens the journal database **read-only and version-less** to derive Reflect's usage dots, and never writes to it (see the IndexedDB-gotcha note in `CLAUDE.md §7`).

### A.3 Browser memory (transient)

- Audio-context oscillator/bell state (Meditate's timed-sit bell + ambient bed; the various apps' synths) — in-memory only, never persisted.
- `anime.html` (webcam experiment): live camera video stream + per-frame analysis-canvas pixel data — rendered live, overwritten every frame, never persisted. (Meditate's former camera pipeline — video stream, frame ring-buffer, motion-window for smoothness scoring — was deleted with the camera "stillness" mode in v1.80.)

### A.4 Network transmission

- **Outbound traffic** is limited to the initial HTML/JS load plus the user-initiated, opt-in flows below — Web Push reminders; the five bring-your-own-key AI surfaces (Council, Nourish's chef, Reflect's photo-describe, Companion, and the hub's next-step suggestion); and optional cross-device sync. No analytics, telemetry, ads, error reporting, or third-party scripts. (The product-era "zero outbound at Tier 0–1" framing is superseded — app data is public seed data; see STATEMENT.md.)
- **Opt-in bring-your-own-key AI apps (all tiers; on the user's own Anthropic key).** Five surfaces call `https://api.anthropic.com/v1/messages` directly from the browser using a key the user supplies and stores locally — there is **no operator server between the user and Anthropic**. Council sends the situation text the user types plus the deliberation (L24). Nourish's chef sends the pantry list, preferences, and cooking level (L25). **Reflect's photo describe (opt-in via `hill-climbing-reflect-photo-ai`, off by default; L42) sends each newly attached journal photo, once, at attach time — the suite's first image egress and the only flow that transmits journal-store content from the journal itself; the returned description + verbatim transcription are stored beside the photo inside the entry (so they ride E2EE sync/export/delete), an explicit in-app consent note precedes enabling, photos attached while it is off are never sent, and a prompt-level (model-obedience, not hard-filter) instruction tells the model never to name or guess who a person in the photo is.** **Companion sends the widest slice: the user's current goals, recent journal entries, and recent activity, assembled fresh each reply and folded into the prompt (L29). Since companion v0.14, "journal entries" includes photo entries: the stored AI description + transcription (`desc`/`ocr`, transcription capped per photo) ride the digest so photo-only entries are visible to the companion — the photos themselves are never sent, and deleted-entry tombstones are excluded (a v0.14 fix).** **The hub's companion next-step (opt-in via `hill-climbing-hub-suggest`, off by default; L40) sends a deliberately narrower digest — per-app activity day-counts and durations (last 14 days), open in-progress items (a mid-cook, a mid-tasting, an open workout), the focused Climb goal with up to three open step titles, the companion's existing memory summary (which may distil journal themes), and the deterministic candidate list — never journal prose. Unlike the other three, once enabled it fires automatically on each return to the hub (throttled to ≥60 s apart) rather than per user action; the enable note discloses exactly this, and a single tap turns it off.** As of **v0.8**, each reply *also* carries the companion's **cross-conversation memory** — the last few conversations verbatim plus a rolling summary of the older ones (L37) — so the send now includes a **persisted distillation of past dialogue, not only the fresh digest**. A **separate background summarizer call** (also on the user's own key, but carrying **no web tools**) periodically distils aged-out conversations into that summary; it sends conversation transcripts only, not the goals/journal/activity digest, and cannot trigger the web egress below. Common to all: the send is user-initiated, disclosed plainly before first use behind an explicit key gate, billed to the user's own account, and governed by Anthropic's commercial API terms — *not* by our operator policy, because we never receive the content. This **request** egress is TLS-encrypted in transit but **readable by Anthropic** (unlike E2EE sync).
- **The agent interface (`window.HC`, `hc-agent.js`; L45) adds no egress.** It is a purely on-device programmatic surface — reads, verbatim export/import, and action invocation that routes through the same functions the UI calls. It makes no network requests, exposes no action that does (the BYOK send paths and the hub's on-arrival fetch are deliberately not invokable), and registers no new stores. `llms.txt` is a static text file served like any other asset.
- **Companion carries a client-side request tool (added v0.9; L38) — no new egress.** In addition to Anthropic's server-side web tools, the Companion sends one **custom** tool, `add_request`, whose *definition* rides in the request but whose *execution* is entirely in-browser: when the user okays passing along a suite request, the model calls the tool and the app writes a `{ heading, prompt }` brief to the on-device `hill-climbing-requests` store (A.1). It is the suite's first model-invoked tool with a **side effect**, but the side effect is a local write to the user's own device (synced only under the same E2EE path as everything else) — nothing new leaves the device, and the entry is visible and deletable in-app. The confirm-first behaviour is a prompt-level instruction; the visible, reversible list is the backstop.
- **Companion additionally has live internet access (added v0.2; L30).** On the user's own key, each Companion reply may invoke Anthropic's server-side web-search and web-fetch tools (capped at 5 searches + 5 fetches per reply). Beyond the request egress above, this generates a **second class of outbound traffic**: model-written search queries and page fetches, executed on Anthropic's infrastructure and reaching **third-party search providers and the fetched sites**. These queries are written by the model, not the user, and the system prompt instructs it to use general, non-identifying queries only and never to place the user's private details, journal text, or situation specifics into a search — but this is a **prompt-level guardrail, not a hard code filter**, so a model slip could disclose a detail. Taken together with the personal-content sends above, these are the suite's operator-adjacent-but-not-operator-held disclosures of user-derived content; every other data flow is either on-device or end-to-end encrypted.
- **Opt-in Web Push reminders (all tiers, off by default; added v1.76).** If — and only if — the user explicitly enables reminders on the hub, the browser registers a push subscription with its platform push service (Google / Apple / Mozilla) and receives pushes sent by the project's own GitHub Actions sender. This is user-initiated, revocable at any time ("Turn off"), and carries no analytics or behavioural data — the payload is a fixed practice prompt drawn from a hand-authored rotation. The subscription endpoint is the user's to copy into the sender's GitHub Actions secret. See also Council (L24) and cross-device sync below.
- **Opt-in end-to-end-encrypted cross-device sync (all tiers, off by default; added v1.99).** If the user signs in and turns on sync, their data is encrypted on-device and stored as ciphertext on a backend (see A.5). Only ciphertext plus metadata (doc keys, sizes, timestamps, and the account email) leave the device; **content never does — the operator cannot read it.** **Tier reconciliation:** §3.1 gates *operator-readable* server submission at Tier ≥ 2. E2EE sync is permitted from **Tier 0** on the principle that what that gate protects — operator power over user data — does not arise when the operator holds no key and cannot decrypt. The encryption guarantee, not the tier, is the safeguard. Founder-ratified (v1.99).
- **Tier ≥ 2: adverse-event reports may POST to a backend** *with explicit per-report consent at submission time*. No silent transmission.
- **All tiers: no microphone, no audio recording, no behavioral telemetry, no fingerprinting, no cookies for tracking.**

### A.5 Off-device storage (opt-in, end-to-end encrypted cross-device sync — added v1.99)

Sync is **off by default** and opt-in. When a user turns it on, their data is encrypted **on the device** and stored on a backend (Supabase: Postgres + Auth) that holds only ciphertext. This is the third off-device flow in the suite (after opt-in Web Push and Council), and the first where the operator stores user *content* at all — which is precisely why it is designed so the operator **cannot read it**.

**Trust model — zero-knowledge.** A random 256-bit Data Encryption Key (DEK) encrypts every document (AES-GCM). The DEK never leaves the device in usable form: it is wrapped twice — once by a key derived from the user's **passphrase**, once by a key derived from a one-time **recovery code** (PBKDF2-HMAC-SHA-256, 600,000 iterations, per-wrap random salt). The server stores only the two wrapped-DEK blobs and per-document ciphertext. The passphrase and recovery code never leave the device; the operator holds no key and cannot decrypt. The working DEK is imported non-extractable, so its raw bytes never re-enter JS after setup/unlock.

| Backend store | Contents | Operator-readable? |
|---|---|---|
| `sync_docs` | Per-user rows `{ doc_key, ciphertext, iv, updated_at, device_id }`. Blob rows (whole-store snapshots, e.g. `ls:hill-climbing-climb`) and append-only log rows (e.g. `idb:climb:events/<id>`). Each document's `(user, doc_key, clock)` is bound as AES-GCM additional authenticated data, so ciphertext can't be replayed under a different key or slot. | **No** — ciphertext only. |
| `sync_keybundle` | One row per user: the two wrapped-DEK blobs + salts/IVs + KDF descriptor. | **No** — unwrapping needs the passphrase or recovery code. |
| Supabase Auth (`auth.users`) | Account email + password hash (identity/login only). | Email: yes. Password: hashed by Supabase. |

**Row isolation** is enforced by Postgres Row-Level Security (`user_id = auth.uid()`) on every table; the anon API key shipped in the client is public by design and grants nothing without a valid session.

**Metadata that is NOT protected (documented honestly).** Even though content is unreadable, the operator can see, per account: the email, ciphertext **sizes**, row **counts** (≈ number of edits ≈ activity volume), **timestamps**, and `doc_key`s (which app, and that an event log exists). Content never leaves the device in the clear; this metadata does. Reducing it (padding, batching, key hashing) is a documented follow-up, not shipped in v1.99.

**Device-local sync support (never synced):** `hill-climbing-sync-meta` (localStorage: a random device id, per-store logical clocks, and pull cursors), the `hc-sync` IndexedDB (holds the cached DEK as a non-extractable `CryptoKey`), and Supabase's own session token. None of these is a synced document.

**Retention & deletion.** Server rows persist until deleted. The user can delete the entire server copy in-app ("Delete my synced data" removes their `sync_docs` + `sync_keybundle` rows), and signing out drops the device's cached key — satisfying CONSTRAINTS P1 (real deletion, no shadow copies) and C3 (stopping is honored) for the synced copy.

**Scope in v2.0:** the sync foundation (`hc-sync.js`) now covers **every app that holds user data** — each opt-in, off by default, same encryption. Registered documents:

- **Blob (last-write-wins):** `ls:hill-climbing-climb` (Climb state, v1.99), `ls:hill-climbing-companion` (Companion conversations, v0.1), `ls:hill-climbing-requests` (Companion requests to the builder, v0.9), `ls:breathe-session-duration` (Breathe session length), `ls:hill-climbing-nourish` (Nourish ladder — Cook + Taste, v0.17), `ls:hill-climbing-savor` (taste-show state, incl. tasting notes + own lessons — now written inside Nourish), `ls:hill-climbing-levity` (Levity state), `ls:hill-climbing-foresee` (Foresee calibration ladder + predictions, v0.1), `ls:hill-climbing-train` (Train state), `ls:hill-climbing-council` (Council deliberations), `ls:hill-climbing-govern` (Governance state — rules, ledger, verdicts, and the v0.2 token-budget layer), `ls:hill-climbing-reflect-photo-ai` (Reflect photo-describe consent flag, reflect v0.9 — a one-character `'1'`/`'0'` so the opt-in is decided once across devices), `ls:hill-climbing-remind` (Remind reminders, v0.1). *(Meditate no longer registers a blob — v1.80 deleted its `stillness-game` store; and the deleted ERP app's `ls:hill-climbing-erp` is gone.)*
- **Log (append-only, per-record):** `idb:climb:events/<id>` (Climb event log, v1.99); `idb:reflect:entries/<id>@<updated>` (the **Reflect `journal`** — the single most sensitive store, including any attached photos inside the entry ciphertext — synced per-entry, *not* as a whole blob, so two devices never clobber each other's writing; edits and deletes carry version-stamped keys, deletes as tombstones with photo bytes stripped); and `usage/<device>:<app>:<day>[:…]` (per-app usage — day-flags + per-session practice durations, added v1.78). Usage syncs as a per-record log rather than a blob **specifically** so two devices active the same day **sum** instead of overwriting; each record carries the device that wrote it and totals are summed at read time.

**Never registered (device-local, never synced):** the shared Anthropic credential `hill-climbing-api-key` (A.1, carve-out — a secret, not donated data), Meditate's `hill-climbing-timed-minutes` session-length preference, all UI/onboarding flags, the usage **device id** + **backfill guard** (A.1), and the legacy `hill-climbing-usage` localStorage **aggregate** (a per-device convenience copy for companion/offline; the synced source of truth is the `hc-usage/records` log above, not this blob). What leaves the device for sync is always ciphertext + metadata only; content never does.
