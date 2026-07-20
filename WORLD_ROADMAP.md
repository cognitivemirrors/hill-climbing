# Hill Climbing — World Roadmap

**Status:** Draft for founder review, revised after a four-lens adversarial review. The phased
plan for turning the practice suite into a private, two-person digital world with
profile-grounded characters — turn-based first, autonomous play eventually.

Companion document: **`WORLD_ARCHITECTURE.md`** (the shape and why). Read that one first; this
doc is the *order of building*.

---

## Principles for building the world

These hold across every phase — the guardrails that keep the world a relationship artifact
rather than an engagement product.

- **Turn-based before autonomous.** A human runs a turn; the world advances. Autonomy is Phase 4.
- **One verifiable outcome per phase.** Each phase is a single thing you can inspect and play
  before the next begins.
- **Bolt onto the seam, but budget the ring.** The world attaches to `window.HC`, but the
  authorization ring, the room store, the room-context binding, and `{as}` plumbing are **new
  enforcement infrastructure** — real work, not free reuse (see Phase 0/1). "Reuse the seam,
  don't rewrite the suite" is true of the *practices*; it is not true of the *ring*.
- **Agents write the world, humans write their practice.** Character-authored content lands only
  in the room artifact store — never in a practice store (journal/ERP/Foresee/goals). This keeps
  REQUIREMENTS §1.4 literally true and keeps the ERP clinical boundary intact by construction.
- **No engagement mechanics — including the ones privacy hides.** No scores/streaks/levels/DAU.
  And specifically: **no turn-timers, no "your partner is waiting" prompts, no unfinished-
  adventure reminders, no completion pressure** (the intimate-partner loop is the *strongest*
  pull, not an absent one); the autonomy ledger is **pull-only, never notified**; the shared
  history has **no collection/completion mechanics or growing counts.**
- **Consent is two-sided, continuous, and enforced.** No portrayal without the portrayed
  person's grant; they can review, repudiate, and remove what their character said; tender
  artifacts wait in an approval queue that doesn't sync until confirmed. Either party can halt
  and exit unilaterally.
- **No operator backend over plaintext, ever.** Each character runs only on a runtime holding
  **its own owner's key**; no partner runs the other's character. Autonomy is a **browser**
  runtime at the origin, never a plain server job.
- **The crypto gate is real and gates Phase 2.** Cross-user shared content ships only after the
  shared-room key model (with mandatory out-of-band fingerprint verification) passes a security
  review.
- **The relational-safety gate is real and also gates Phase 2.** Portrayal harm is live the
  moment a partner-seeded character can leave an artifact.

---

## Phase 0 — Foundations *(docs + seam prep; no user-visible change)*

**Goal:** agree the framing and prepare the seam, changing nothing a person sees.

**Ships:**
- These two documents, ratified (or amended) by the founder — including the binding-doc changes
  in WORLD_ARCHITECTURE §9 (the new relational-safety commitment is the big one).
- The `Actor`, `Room`, `Policy` data shapes; the **identity keypair** primitive (new PKI —
  generate/store an ed25519 key, private half credential-class).
- `HC.invoke`/`HC.read` gain the optional `{ as: actor }` argument, **default-compatible** (omit
  ⇒ the device's human, exactly as today). This touches `hc-agent.js`'s `invoke` signature.
- The authorization chokepoint stubbed in `hc-agent.js` with a default allow-all-for-the-human
  policy (today's behavior), scoped to agent actions + room access (WORLD_ARCHITECTURE §3).

**Deliberately NOT in Phase 0:** rooms, characters, sharing, any UI, any behavior change.

**Exit criteria:** the 108/108 parity suite still passes unchanged (the optional argument is
inert by default); the shapes and the keypair primitive are written and testable; **the founder
has ratified the direction and the new binding safety clause.**

---

## Phase 1 — Two identities, one room *(the vertical slice; single device)*

**Goal:** the smallest playable proof — **the thing to show your partner.** This phase *builds
the ring*; it does not merely reuse it. Enumerate the real work honestly:

**Ships:**
- Two actors on **your** device: you (`human`) and your character (`agent`, owned by you).
- The **room artifact store** — a new store, its HC descriptor, read/write functions (sync
  registration deferred to Phase 2), and **signed authorship** on every artifact.
- A **room-context binding** — e.g. `HC.enterRoom(roomId)` setting current-room state the invoke
  wrapper consults — because `policy(actor, room, action)` needs a room to key on and
  `HC.register` is per-page with no room concept today.
- `{as}` **plumbed into the action handler path** (a per-app change: handlers currently receive
  only `params`).
- **One enforced permission rule** at the ring (e.g. your character may `leave` an artifact here
  but is refused a room it isn't admitted to) — proving refusals are first-class.
- A **turn:** you act; then you trigger your character's turn locally — it receives a
  **minimized** digest (per-store opt-in, sensitive off by default, ERP excluded) and takes one
  action via `HC.invoke(..., { as: character })`, leaving a **signed artifact in the room store**
  (never in a practice store).

**Deliberately NOT in Phase 1:** your partner, cross-user sync/crypto, multiple rooms, autonomy,
any agent write to a practice store. Both actors live on your device; the character's turn is a
local model call.

**Exit criteria:** you and your character each leave a signed artifact in the room; the
permission rule demonstrably refuses a disallowed action; no practice store is ever agent-written
(the §1.4 parity check still passes); it is genuinely fun to run a turn.

---

## Phase 2 — The partner joins *(cross-user sharing; two hard gates)*

**Goal:** your partner, on their own device and key, with their own character, sharing one room.
**Two prerequisites gate this phase and nothing real-content ships before both pass.**

**Ships:**
- The **shared-room key model** (WORLD_ARCHITECTURE §6): per-room `RK`, wrapped under each
  owner's account DEK, **only after out-of-band fingerprint verification**; both read/write the
  room's artifacts; metadata linkage disclosed; revocation = rotate + re-wrap (with the
  forward-secrecy caveat stated).
- Your partner's actor + character, **owned and keyed by them.**
- The **two-sided consent regime:** input grants (which minimized stores seed each character,
  latitude — conservative by default) **and** output controls (review feed, per-artifact
  repudiate/remove, approval queue that doesn't sync tender artifacts until confirmed) **and** the
  rupture/exit protocol (unilateral halt, each keeps their own copy, autonomy auto-disables on
  exit, bilateral veto with either objection dispositive).
- The **"current picture of you"** drift view for each portrayed person.
- Practice stores stay **private and single-account**; only the room is shared. The character is
  documented as an intentional private→shared bridge, which is why its digest is minimized and
  ERP is excluded.

**Deliberately NOT in Phase 2:** autonomy; more than two people; sharing anything beyond rooms.

**Exit criteria (both gates + play):**
- **Security review** of the shared-room key model passes — fingerprint verification enforced,
  MITM path closed, metadata linkage and forward-secrecy threat models written and accepted —
  before any real content flows.
- **Relational-safety review** signed off — the output-side consent, approval queue, rupture
  protocol, and bilateral veto are in place and exercised.
- Both partners enter one room from separate devices and leave artifacts each other can see;
  repudiate/remove and revocation work; neither's private practice stores are exposed.

---

## Phase 3 — A world of rooms *(adventures, still turn-based; the autonomy-prep refactor)*

**Goal:** more than one place, a light structure for going somewhere together, and the refactor
that makes Phase 4 honest.

**Ships:**
- **Multiple rooms** — some wrap practice pages, some are new places.
- The **hub as map**: enter/leave rooms, see which actor is where and what they left (room
  membership read across per-page closures via a shared storage record).
- A light **adventure** structure — a sequence of rooms / a shared quest / a turn log — so the
  two of you and your characters *go somewhere* together, accreting a revisitable history with
  **no collection/completion mechanics and no growing counts.**
- **Turn-logic extraction (autonomy prerequisite):** pull the turn logic out of DOM-coupled page
  closures into **document-free modules**, so that Phase 4's "same core logic" claim becomes
  true. This is a real cross-app refactor and belongs here, before autonomy.

**Deliberately NOT in Phase 3:** autonomy; scoring/progression of any kind.

**Exit criteria:** the two of you and your characters complete one small multi-room adventure
turn-by-turn; the history is revisitable and carries no engagement mechanics; the extracted turn
modules run outside a live document (unit-testable), setting up Phase 4.

---

## Phase 4 — Autonomy, guardrailed *(the eventual payoff)*

**Goal:** characters take turns while you're away — safely.

**Ships:**
- A **browser runtime at the origin** that steps the world unattended: a left-open tab or a
  headless browser **on the owner's own machine** (it must reach origin-scoped storage and run
  app logic — a plain Node cron cannot). **Each character advances only on its own owner's
  key-holding runtime;** no partner runs the other's character. (The Web-Push sender is a
  scheduling-shape precedent only, not an execution model.)
- It runs the **document-free core turn modules** extracted in Phase 3 — no second implementation.
- **Autonomy guardrails, all mandatory:** explicit, revocable **per-character consent**; a
  **turn budget**; a **"nothing irreversible while unattended"** rule; a **pull-only ledger**
  (never pushed/notified; framed as review) of everything characters did while you were away,
  reviewable and reversible; **digest-at-rest** minimized, encrypted under the owner's key,
  retention-bounded, and **purged on revocation** (revocation halts the runner *and* destroys the
  persisted digest); autonomy **auto-disables on any party's exit.**

**Deliberately NOT in Phase 4:** unattended destructive actions; autonomy without per-character
consent; any autonomy over a partner's character; any operator-hosted runtime over plaintext.

**Exit criteria:** a character advances the world unattended within its budget on its owner's
runtime; the ledger shows exactly what happened and is reviewable/reversible; revocation halts
the runner and purges the digest immediately; the deepest relational-safety review (a character
portraying a partner, acting unsupervised) has **bilateral sign-off** (both partners), not a
single founder sign-off.

---

## Cross-cutting, every phase

- **Values guardrails** (the specific anti-engagement checks above, plus the **"not a product"
  tripwire** — a third participant, a public surface, a growth metric, a funnel, or monetization
  each force a fresh values re-ratification) — checked every phase.
- **Consent** — from Phase 2 on, no portrayal without an enforced two-sided grant.
- **Crypto + relational-safety gates** — both block Phase 2; neither is a formality.
- **Documentation stays current** — each phase updates CLAUDE.md §§1–2, REQUIREMENTS, and
  KNOWN_RISKS in the same change, per the suite's standing norm.

---

## Sequencing at a glance

| Phase | Outcome | New infra | Gate |
|---|---|---|---|
| 0 Foundations | seam ready, nothing visible | `{as}` on HC; identity keypair; stubbed ring | founder ratifies direction **+ new safety clause** |
| 1 Vertical slice | you + your character, one room, one device | room-artifact store; room-context binding; `{as}` plumbing; signed authorship | — (single-user, your own data) |
| 2 Partner joins | two people, two characters, shared room | per-room shared keys + OOB verification; two-sided consent + rupture | **security review + relational-safety review** |
| 3 World of rooms | multi-room turn-based adventures | new rooms; adventure/turn log; **turn-logic extraction** | values pass (no engagement creep) |
| 4 Autonomy | unattended turns, guardrailed | browser runtime at origin (own key); ledger; digest-at-rest | per-character consent + **bilateral** sign-off |

Turn-based value lands at **Phase 1** (playable alone) and **Phase 2** (playable together).
Autonomy is the destination, not the entrance — and every phase before it is already worth
having.
