# Hill Climbing — World Roadmap

**Status:** Draft for founder review. The phased plan for turning the practice suite into a
private, two-person digital world with profile-grounded characters — turn-based first,
autonomous play eventually.

Companion document: **`WORLD_ARCHITECTURE.md`** (the shape and why). This doc is the *order of
building*. Read that one first.

---

## Principles for building the world

These hold across every phase. They are the guardrails that keep the world a relationship
artifact rather than an engagement product.

- **Turn-based before autonomous.** A human runs a turn; the world advances. Autonomy is Phase 4,
  and it runs the *same* core logic — so the turn path must be built cleanly the first time.
- **One verifiable outcome per phase.** The founder ships fast; the suite's own norm is to slow
  down for state, persistence, and safety. Each phase below is a single thing you can inspect
  and play before the next begins.
- **Reuse the seam; don't rewrite the suite.** Everything bolts onto `window.HC`. The world is a
  ring around the practices, not a replacement of them.
- **No engagement mechanics, ever — inside the world too.** No scores, streaks, levels, DAU,
  retention loops, or characters that nudge the humans. (WORLD_ARCHITECTURE §8.)
- **Consent is enforced, not promised.** No one is characterized without their actor-owner's
  explicit, revocable grant, checked at the HC ring — not merely stated in copy.
- **No operator backend over plaintext, ever.** Autonomy runs locally or on a scheduled job with
  the owner's key. The operator never holds a key and never decrypts.
- **The crypto gate is real.** Cross-user shared content does not ship until the shared-room key
  model passes a security review (a Tier-1-style prerequisite).

---

## Phase 0 — Foundations *(docs + seam prep; no user-visible change)*

**Goal:** agree the framing and prepare the seam, changing nothing a person sees.

**Ships:**
- These two documents, ratified (or amended) by the founder.
- The `Actor`, `Room`, and `Policy` data shapes defined (WORLD_ARCHITECTURE §3).
- `HC.invoke` / `HC.read` gain an optional `{ as: actor }` argument, **default-compatible**:
  omitting it behaves exactly as today (the device's human). No app changes; no behavior change.
- The authorization chokepoint stubbed in `hc-agent.js` (default policy = allow-all-for-the-human,
  i.e. today's behavior), so the ring exists before it constrains anything.

**Deliberately NOT in Phase 0:** rooms, characters, sharing, any UI.

**Exit criteria:** the 108/108 parity suite still passes unchanged (the optional argument is
inert by default); the shapes are written down; the founder has ratified the direction.

---

## Phase 1 — Two identities, one room *(the vertical slice; single device)*

**Goal:** the smallest playable proof — **the thing to show your partner.**

**Ships:**
- Two actors on **your** device: you (`human`) and your character (`agent`, owned by you).
- **One room** wrapping one existing page, with an `artifacts` store (the "leave behind").
- **One enforced permission rule** at the HC ring (e.g. your character may `act` in the room and
  `leave` an artifact, but not enter a room it isn't admitted to) — proving refusals are
  first-class.
- A **turn**: you act; then you trigger your character's turn locally — it receives a profile
  digest (`HC.export` of the stores you chose) and takes one action via
  `HC.invoke(..., { as: character })`, leaving a trace indistinguishable from yours.

**Deliberately NOT in Phase 1:** your partner, cross-user sync, multiple rooms, autonomy, any
new crypto. Both actors live on your device; the character's "turn" is a local model call.

**Exit criteria:** you and your character each leave an artifact in the room; the permission rule
demonstrably refuses a disallowed action; the character's traces are byte-indistinguishable from
a human's (the parity check, now with `{as}`); it is genuinely fun to run a turn.

---

## Phase 2 — The partner joins *(cross-user sharing)*

**Goal:** your partner, on their own device and key, with their own character, sharing one room.

**Ships:**
- The **shared-room key model** (WORLD_ARCHITECTURE §6): a per-room key wrapped for both owners;
  both read and write the room's artifacts; the operator still cannot decrypt.
- Your partner's actor + character, **owned and keyed by them.**
- The **consent-as-permission grant** made real: each of you sets which stores seed your
  character, how much latitude it has, which rooms it may enter, what it may leave.
- Practice stores stay **private and single-account**; only the room is shared.

**Deliberately NOT in Phase 2:** autonomy; more than two people; sharing anything beyond rooms.

**Exit criteria:** a **security review of the shared-room key model passes before any real
content flows** through it; both partners enter one room from separate devices and leave
artifacts each other can see; revocation (rotate + re-wrap) works; neither person's private
practice stores are exposed by the sharing.

---

## Phase 3 — A world of rooms *(adventures, still turn-based)*

**Goal:** more than one place, and a light structure for going somewhere together.

**Ships:**
- **Multiple rooms** — some are practice pages, some are new places built as rooms.
- The **hub as map**: enter/leave rooms, see who (which actor) is where and what they left.
- A light **adventure** structure — a sequence of rooms / a shared quest / a turn log — so the
  characters and the two of you *go somewhere* together, and it accretes into a shared history
  you can revisit.
- Still turn-based; still no metrics, no leveling, no time-in-world targets.

**Deliberately NOT in Phase 3:** autonomy; scoring/progression of any kind.

**Exit criteria:** the two of you and your characters complete one small multi-room adventure
turn-by-turn; the history is revisitable; a values pass confirms nothing engagement-shaped crept
in (no scores/streaks/nudges).

---

## Phase 4 — Autonomy, guardrailed *(the eventual payoff)*

**Goal:** characters take turns while you're away — safely.

**Ships:**
- A **runner** that steps the world unattended: a **local** always-on process on one partner's
  machine (preferred), or a **scheduled** job (the Web-Push sender is the existing precedent).
  Never an operator backend (WORLD_ARCHITECTURE §6).
- It runs the **same core turn logic** built in Phases 1–3 — no second implementation.
- **Autonomy guardrails, all mandatory:** explicit, revocable **per-character consent**; a
  **turn budget**; a **"nothing irreversible while unattended"** rule (destructive actions wait
  for a human); and a **visible ledger** of everything characters did while you were away, so you
  can review and undo.

**Deliberately NOT in Phase 4:** unattended destructive actions; autonomy without per-character
consent; any autonomy over a partner's character without that partner's grant.

**Exit criteria:** a character advances the world unattended within its budget; the ledger shows
exactly what happened and is reviewable/reversible; consent is revocable and revocation halts the
runner for that character immediately; the deepest relational-safety review (a character
portraying a partner, acting unsupervised) has a founder sign-off.

---

## Cross-cutting, every phase

- **Values guardrails** (no engagement mechanics inside the world) — checked on every phase, the
  way the suite already reviews the ladder apps against the anti-gamification line.
- **The consent model** — from Phase 2 on, no portrayal without an enforced grant.
- **The crypto gate** — from Phase 2 on, no real shared content before the security review.
- **Documentation stays current** — each phase updates CLAUDE.md §§1–2, REQUIREMENTS, and
  KNOWN_RISKS in the same change, per the suite's standing norm.

---

## Sequencing at a glance

| Phase | Outcome | New infra | Values/consent gate |
|---|---|---|---|
| 0 Foundations | seam ready, nothing visible | optional `{as}` on HC | founder ratifies the direction |
| 1 Vertical slice | you + your character, one room, one device | room artifact store; HC policy check | — (single-user, your own data) |
| 2 Partner joins | two people, two characters, shared room | per-room shared keys | **security review** + portrayal-consent grants |
| 3 World of rooms | multi-room turn-based adventures | new rooms; adventure/turn log | values pass (no engagement creep) |
| 4 Autonomy | unattended turns, guardrailed | a local/scheduled runner | per-character consent + ledger + relational-safety sign-off |

Turn-based value lands at **Phase 1** (playable alone) and **Phase 2** (playable together).
Autonomy is the destination, not the entrance — and every phase before it is already worth
having.
