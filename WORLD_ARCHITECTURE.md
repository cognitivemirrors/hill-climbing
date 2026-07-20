# Hill Climbing — World Architecture

**Status:** Draft for founder review. Describes a direction, not shipped code. The binding
documents (`CONSTRAINTS.md`, `REQUIREMENTS.md`) are amended *for ratification* to match this
direction — see §9. Precedence is unchanged: CONSTRAINTS > REQUIREMENTS > this doc.

Companion document: **`WORLD_ROADMAP.md`** (the phased plan). This doc is the *what and why of
the shape*; the roadmap is the *order of building*.

---

## 1. The shift in intention

Hill Climbing began as a suite of **solo, on-device contemplative practice tools**. It is
becoming a **private, values-constrained digital world** that two people — and, through them,
agent-characters grounded in their own profiles — inhabit and play in together.

The practices do not go away. They become the world's **geography and verbs**: a page is a
place, the things you can do on that page are what you can do in that place, and the state you
leave behind is what the place remembers. The organizing purpose moves from *"tools I use
alone"* to *"a shared world we build and play in, that still refuses engagement mechanics and
still distributes power."*

Three things this conversation established, which the architecture is built to honor:

- **Parity solves embodiment.** Because a programmatic action is indistinguishable from a human
  one (REQUIREMENTS §1.4), a character can *do anything a person can do* in the world, natively,
  through the same functions. This half of "based off our profiles" is already solved.
- **The profile solves characterization.** *Who* a character is — voice, judgment, the feel of
  "that's so them" — comes from their owner's profile as context. For a world you play in
  together, the target is **recognizable and delightful, not forensic**; that is the easy tier,
  and it is the right target. A high-fidelity replica would be the wrong thing to build.
- **The permission model is the consent model.** "Who may enter this room, and what they may
  leave here" is the same mechanism as "how may I be represented, by whom, seeded from which of
  my own stores." These are not two systems. They are one.

---

## 2. Mental model

> The existing suite is the world's **geography and physics**. The new work is a thin ring of
> **identity, rooms, and sharing** around it — and every bit of that ring bolts onto the one
> seam we already built: `window.HC`.

Nothing below replaces the practice apps. The world *wraps* them. `HC.describe()` already
answers *"what can be done in this place";* `HC.invoke()` already *does* it through the app's own
functions; the stores already hold *what the place remembers.* The world adds *who is acting,
where they are allowed to be, and what is shared.*

---

## 3. The layer stack

Layers 0–1 exist or are trivial additions; 2–4 are the substance; 5–6 are the payoff, with 6
deferred (see the roadmap).

### Layer 0 — Substrate *(exists)*
The practice suite + `hc-agent.js` (`window.HC`). Pages are places; `describe/read/export` read
the world; `invoke` changes it; `hc-sync.js` persists it (opt-in, zero-knowledge). This layer is
done and verified (108/108 parity checks).

### Layer 1 — Identity *(small addition)*
Introduce **actors**. An actor is a typed subject of action:

```
Actor = {
  id:      string,            // stable id
  kind:    'human' | 'agent', // who is at the controls
  owner:   humanId,           // the person this actor belongs to / answers to
  label:   string,            // "Kevin", "Kevin's character", …
}
```

Actors are the **authors of world artifacts** and the **subjects of permissions**. Critically,
identity is a *world-layer* concept: **practice-store records stay provenance-free** (§1.4 is
preserved — see §5). Authorship lives on *world artifacts*, never retrofitted onto your journal.

The HC contract gains one optional argument, default-compatible so nothing changes today:

```
HC.invoke(action, params, { as?: Actor })   // omit `as` ⇒ the device's human, exactly as now
```

### Layer 2 — Rooms *(substance)*
A **room** is a place + an access rule + a store of what was left there.

```
Room = {
  id:       string,
  place:    pageRef,          // initially an existing page; later, new places too
  policy:   Policy,           // who may enter / act / leave (Layer 3)
  artifacts: RoomStore,       // notes, objects, events actors deposit — the "leave behind"
}
```

Rooms wrap existing pages first; later a room may be a *new* place. The hub becomes the **map**.
The room's `artifacts` store is the one genuinely new store type — everything an actor "leaves"
(a letter, an object, a turn in an adventure) lands here, authored and timestamped **at the
world layer**.

### Layer 3 — Authorization *(the HC ring — the elegant part)*
The permission model is a thin layer over `HC.invoke` / `HC.read` / `HC.export`, keyed by
**(actor × room × action)**:

```
HC.invoke(action, params, { as: actor })
   └─ policy(actor, room, action)  →  allow | refuse      // one chokepoint
```

Because every action already funnels through HC, authorization has exactly one place to live.
Refusals are **first-class**: a character can be *in* a room and still be unable to do X. A
policy is small and legible:

```
Policy = {
  enter:  actorId[] ,         // may read the room + its artifacts
  act:    { [actionName]: actorId[] },   // may invoke this action here
  leave:  actorId[] ,         // may write to the room's artifact store
}
```

This ring adds **no provenance to practice state** — it gates access; it does not stamp your
journal. World artifacts carry authorship because the world needs it; practice records do not,
because §1.4 says they must not.

### Layer 4 — Sharing *(cross-user)*
Two people means **cross-account shared rooms**, which today's sync does not do (it shares *one*
account across *its own* devices). A shared room gets **its own key**, shared between the two
owners via a wrapped-key handshake, so both can read and write the room's artifacts while the
operator still cannot decrypt anything. See §6.

The boundary is deliberate: **practice stores stay single-account and private; only *rooms* are
shared surfaces.** Sharing a room shares the room — not your journal.

### Layer 5 — Characters *(agents)*
A **character** is an agent bound to an actor identity, given:

1. a **profile digest** — `HC.export` of the stores *its owner chose to expose* (the
   characterization fuel; gated by that owner's consent — §7), and
2. an **action budget** scoped by the permission model.

It acts through `HC.invoke(action, params, { as: character })`. Its traces land in room and
practice stores exactly as a human's do (parity), with authorship recorded at the world layer.
Turn-based first: **a character acts when a human runs a turn.**

### Layer 6 — Autonomy *(deferred — see roadmap Phase 4)*
Autonomous play is characters taking turns **without a human present.** This is the only layer
that needs a **runtime** — a process that steps the world. The values-consistent options:

- **(a) Local runner** on one partner's machine — still on-device, their own key, no operator
  backend. *Preferred.*
- **(b) Scheduled runner** — a cron-style job advancing turns periodically (the Web-Push sender
  is the existing precedent for this shape).
- **(c) Operator backend** — *rejected by default*: it breaks "no backend of our own," and to
  act on real content it would need keys, breaking zero-knowledge.

Autonomy ships behind explicit, revocable, **per-character consent**, a **turn budget**, a
**"nothing irreversible while unattended"** rule, and a **visible ledger** of what characters did
while you were away. It runs the *same core logic* as the turn-based path — which is why Phase 1
must build that path cleanly.

---

## 4. What each layer reuses vs. adds

| Layer | Reuses | Genuinely new |
|---|---|---|
| 0 Substrate | everything | — |
| 1 Identity | HC contract | the `Actor` type; optional `{as}` on invoke |
| 2 Rooms | pages, the hub-as-map | the room artifact store |
| 3 Authorization | the single HC seam | the `(actor × room × action)` policy check |
| 4 Sharing | hc-sync's E2EE machinery | per-room shared keys (cross-account) |
| 5 Characters | HC.export (fuel), HC.invoke (action), parity | the agent loop + digest assembly |
| 6 Autonomy | the turn logic from Layer 5 | a runtime + autonomy guardrails |

---

## 5. Provenance: §1.4 preserved, reframed

§1.4 guarantees that two *practice-state* snapshots — one from a human, one from an agent — are
indistinguishable. The world **needs** authorship ("whose character left this letter?"), which
looks like a contradiction. It is not, if scoped precisely:

- **Practice stores remain provenance-free.** No `origin` / `by` / `agent` field is ever added
  to a journal entry, a goal, a prediction. The parity guarantee is untouched *there*.
- **World artifacts carry authorship.** The room's `artifacts` store — a separate surface —
  records which actor deposited what, and when. This is a *new* store class, not a modification
  of the old ones.

So §1.4 becomes, precisely: *a property of the practice stores.* The world layer adds an
authorship envelope **around** them, at the artifact granularity, on purpose. This distinction
is the single most important thing to keep straight as the world grows; getting it wrong
(stamping provenance onto practice records) would quietly break the parity guarantee.

---

## 6. Cross-user sharing — the crypto sketch *(needs review before real content)*

Today: a random per-document DEK encrypts each store; the DEK is wrapped by the user's passphrase
and recovery code; the server holds only ciphertext + wrapped keys (zero-knowledge). This is
**single-account.**

A shared room needs a **room key** that two accounts can both use:

- Generate a per-room key `RK`.
- Owner A wraps `RK` for Owner B using a key-agreement handshake (e.g. B publishes a public key;
  A wraps `RK` to it), and vice-versa. The server stores only the wrapped `RK` blobs and the
  room ciphertext.
- Both parties can now decrypt the room's artifacts; the operator still cannot decrypt anything.
- **Revocation** rotates `RK` and re-wraps for the remaining members — a real design point, not
  an afterthought.

This is a **genuine extension of the zero-knowledge design and must get a security review before
it touches real content** (a Tier-1-style prerequisite). Until then, Phase 1 runs both actors on
one device (no cross-account sharing), so the world is playable long before the crypto is built.

---

## 7. Consent, expressed as permission *(the ethical spine)*

A character portraying a partner — seeded from *their* journal, *their* beliefs — is the most
tender surface in the whole idea. The architecture handles it by making **consent and permission
the same record:**

- Each person **owns their own actor(s)** and **holds their own key.** No one else can create,
  seed, or run a character that portrays them.
- The **portrayal grant** is explicit and revocable: *which of my stores* seed my character,
  *how much latitude* it has, *which rooms* it may enter, *what it may do and leave there.* That
  grant IS the permission policy for that actor.
- Nothing about a person is characterized without that person's actor-owner granting it —
  enforced at the HC ring, not merely promised in copy.

This is the power-distribution constraint (CONSTRAINTS §3) expressed as a feature: authorship is
distributed, each person governs their own representation, and there is no central operator over
the shared space.

---

## 8. Values reconciliation

A "digital world with adventures" sounds like exactly the engagement product the constraints
reject. It is not — **if it is built as a private relationship artifact rather than a product**,
and the anti-engagement discipline extends *into* the world rather than relaxing at its border:

- **No scores, levels, streaks, DAU/retention optimization, or time-in-world targets.** The
  world inherits the posture that admitted Echo and Garden as *play* (outside sync + the usage
  dashboard, no records to maximize) — generalized under the same discipline.
- **No using the characters to nudge or retain the humans.** A character exists for delight and
  companionship, never as a retention mechanic pointed back at its players.
- **No other users to perform for.** It is private, for two people. That is a feature, not a
  limitation to grow out of.

Power distribution is **strengthened**, not threatened: each partner owns their character and
key; the permission model distributes authorship; no operator sits over the shared space.

The honest amendment — the thing that is genuinely the founder's to ratify — is that the
**project's center of gravity moves** from *"contemplative practice tools"* to *"a
values-constrained personal world that contains practices."* That is why the changes to
`CONSTRAINTS.md` and `REQUIREMENTS.md` are drafted for ratification, not applied unilaterally.

---

## 9. Binding-document impact (drafted for ratification)

- **CONSTRAINTS.md** — §5 (anti-engagement) extends its "play" carve-out from the two games to
  "a private world," with the guardrails in §8 above made explicit. §3 (power distribution)
  gains the consent-as-permission expression. A short statement of the widened intention (§1).
- **REQUIREMENTS.md** — a new section for the world layer's data practices: the room artifact
  store, cross-user shared-room keys (with the security-review prerequisite), autonomy
  guardrails, and the reaffirmation that practice stores stay provenance-free and private. §1.4
  reworded to *"a property of the practice stores."*
- **KNOWN_RISKS.md** — new entries for: relational-consent / partner-portrayal (the deepest),
  cross-user key sharing, autonomous-agent action, and the provenance-boundary discipline.

These are **proposals**. Nothing in CONSTRAINTS/REQUIREMENTS is treated as decided until you say
so.

---

## 10. Open questions for the founder

1. **The digest boundary.** By default, which stores seed a character? (Recommendation: opt-in
   per store, nothing sensitive by default — the owner adds journal/ERP/etc. deliberately.)
2. **How much latitude** should a character have to *reinterpret* vs. *stay faithful to* its
   profile? (This is a dial, per §1 — recognizable-and-fun argues for generous latitude.)
3. **Autonomy consent granularity** — per character, per room, per session, or all three?
4. **Shared-room membership** — strictly the two of you, ever more? (Recommendation: design for
   two; don't build for N until there's a real third person.)
5. **Is the world a mode of this app, or a new surface that imports the HC machinery?**
   (Recommendation: a mode/ring over the existing suite — reuse maximally; see the roadmap.)
