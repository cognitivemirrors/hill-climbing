# Hill Climbing — World Architecture

**Status:** Draft for founder review, revised after a four-lens adversarial review
(values/governance, privacy-crypto, technical feasibility, relational safety). Describes a
direction, not shipped code. The binding documents (`CONSTRAINTS.md`, `REQUIREMENTS.md`) are
amended *for ratification* to match this direction — see §9. Precedence is unchanged:
CONSTRAINTS > REQUIREMENTS > this doc.

Companion document: **`WORLD_ROADMAP.md`** (the phased plan). This doc is the *what and why of
the shape*; the roadmap is the *order of building*.

---

## 1. The shift in intention

Hill Climbing began as a suite of **solo, on-device contemplative practice tools**. It is
becoming a **private, two-person, values-constrained digital world** that two people — and,
through them, agent-characters grounded in their own profiles — inhabit and play in together.

The practices do not go away. They become the world's **geography and verbs**: a page is a
place, and the state you leave behind is what the place remembers. The organizing purpose moves
from *"tools I use alone"* to *"a shared world we build and play in, that still refuses
engagement mechanics and still distributes power."*

Three things this conversation established, which the architecture honors:

- **Parity solves embodiment — for world actions.** A programmatic action is indistinguishable
  from a human one (REQUIREMENTS §1.4), so a character can act in the world natively. **Honest
  narrowing (revision):** characters act with full parity on **room/world** actions and never
  mutate practice stores (journal, Foresee, goals) — see §5. "A character can do anything a
  person can do" means *in the world*, not *to your private records*.
- **The profile solves characterization — from a minimized digest, not a raw dump.** *Who* a
  character is comes from a **redacted, per-store-opt-in digest** of its owner's stores (§5), not
  a raw `HC.export`. The target is **recognizable and delightful, not forensic** — the easy tier,
  and the right one.
- **Permission and consent are one record — but consent is two-sided and continuous.** "Who may
  enter this room and what they may leave" is the same mechanism as "how may I be represented."
  The review corrected an omission: consent is not only *input-side* (which stores seed me) but
  *output-side* (I can review, repudiate, and remove what my character said in my name), and it
  is **continuous, not one-time** — see §7.

---

## 2. Mental model

> The existing suite is the world's **geography and physics**. The new work is a ring of
> **identity, rooms, sharing, and consent** around it — most of which attaches to the one seam we
> already built, `window.HC`, though the ring is genuinely new enforcement infrastructure, not
> free reuse (§3 Layer 3, §10).

Nothing below replaces the practice apps. The world *wraps* them. But be precise about what the
seam can and cannot do: `HC.invoke` is the **agent** path; a human's UI click calls the same
internal function *directly*, so the authorization ring gates agent actions and room access — it
does **not** gate a human editing their own data (§3 Layer 3). Earlier drafts claimed "every
action funnels through one chokepoint"; that is false and has been removed.

---

## 3. The layer stack

Layers 0–1 exist or are small; 2–4 are the substance; 5 is the payoff; 6 is deferred (roadmap
Phase 4).

### Layer 0 — Substrate *(exists)*
The practice suite + `hc-agent.js` (`window.HC`). Pages are places; `describe/read/export` read
the world; `invoke` changes it; `hc-sync.js` persists it (opt-in, zero-knowledge). Done and
verified (108/108 parity checks).

### Layer 1 — Identity *(new: actors + PKI)*
Introduce **actors** and, with them, **public-key identity** — which is *new infrastructure*, not
a reuse of `hc-sync.js` (that engine is entirely symmetric today; no public keys exist anywhere).

```
Actor = {
  id:      string,
  kind:    'human' | 'agent',
  owner:   humanId,           // the person this actor answers to
  label:   string,
  pubkey:  ed25519PublicKey,  // NEW: identity/signing key; the private half is credential-class
}
```

Each human holds a long-term **identity keypair**. It does two jobs: signing world artifacts
(§5) and the out-of-band-verified key agreement for shared rooms (§6). The private key is
**credential-class** — excluded from `HC.read`/`HC.export` exactly like `hill-climbing-api-key`.

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
  artifacts: RoomStore,       // the ONLY store character-authored content lands in (§5)
}
```

The room's `artifacts` store is the one genuinely new store type, and it is where **all
character-authored content lives** — signed, authored, timestamped at the world layer. A
character never writes into a practice store (§5). Rooms wrap existing pages first; the hub
becomes the **map**. (Reading room membership across the suite's per-page closures is done via a
small shared storage record — see §10 / roadmap I6.)

### Layer 3 — Authorization *(the HC ring — scoped honestly)*
A thin check over the **agent** entry points and over **room access for all actors**, keyed by
**(actor × room × action)**:

```
HC.invoke(action, params, { as: actor })
   └─ policy(actor, room, action)  →  allow | refuse
```

Its enforcement authority is **explicitly scoped**, because it cannot be universal:

- It gates **agent actions** (anything with `{ as: character }`) and **room enter/read/leave for
  every actor**. This is exactly what §7 needs — the thing that must be gated is *portrayal*
  (an agent act) and *room access*.
- It does **not** gate a human's own UI edits to their own practice stores — those call the app's
  internal function directly and are the human's own data by construction. The earlier "one place
  to live / every action funnels through HC" claim was false and is deleted.

Refusals are **first-class**: a character can be *in* a room and still be unable to do X.

```
Policy = {
  enter:  actorId[],                    // may read the room + its artifacts
  act:    { [actionName]: actorId[] },  // agents that may invoke this action here
  leave:  actorId[],                    // may write to the room's artifact store
}
```

### Layer 4 — Sharing *(cross-user; new PKI, not free reuse)*
Two people means **cross-account shared rooms**, which today's sync does not do. A shared room
gets its own key shared between the two owners — but *only after out-of-band verification* (§6),
without which operator-mediated key delivery is a textbook man-in-the-middle. The reuse table
(below) is corrected: the identity keypair and the shared-room key exchange are **new PKI**, not
an extension of the symmetric sync engine.

The boundary is deliberate but **soft, not structural** (§5, §7): practice stores stay
single-account and private; only *rooms* are shared. The honest caveat is that a character seeded
from your stores is itself a sanctioned bridge from private data into the shared surface — which
is why seeding is minimized and sensitive stores are excluded by default (§5).

### Layer 5 — Characters *(agents; write only to the world)*
A **character** is an agent bound to an actor identity, given:

1. a **minimized, redacted profile digest** — **not** a raw `HC.export`. Per-store opt-in;
   sensitive stores (e.g. the journal) excluded **by default** (consistent with the L40
   hub-suggest posture). The digest is model-facing context,
   and the instruction "paraphrase, never quote private-store content verbatim into shared
   artifacts" is a **soft, prompt-level guardrail** — the same class as the L30 web-query and L40
   guardrails, honestly labelled, not a hard filter.
2. an **action budget** scoped by the permission model.

It acts through `HC.invoke(action, params, { as: character })`, and — the load-bearing rule —
**character-authored content lands only in the room's `artifacts` store, never in a practice
store.** This single rule (adopted from the review as the spine of the design) does three things
at once: it keeps §1.4's practice-store parity **literally true**; it
gives `{as}` a clean place to land; and it makes signed authorship tractable. Turn-based first:
**a character acts when a human runs a turn.**

World artifacts carry **cryptographically signed authorship** (signed by the author's identity
key, verified on read against the pinned fingerprint). An unsigned `author` field in a shared,
byte-faithful (`HC.import`-restorable) store is forgeable — either partner's character could
otherwise fabricate an artifact attributed to the other person.

### Layer 6 — Autonomy *(deferred — roadmap Phase 4)*
Autonomous play is characters taking turns **without a human present** — the only layer needing a
**runtime**. Two corrections from the review:

- **It must be a browser runtime *at the origin*** (a left-open tab or a headless browser on the
  owner's machine), because the turn logic is DOM-coupled today and a plain Node cron cannot read
  origin-scoped `localStorage`/`IndexedDB` or run app logic. The Web-Push sender is **not** a
  precedent for *executing* turns (it only sends a notification); it is at most the same
  *scheduling shape*. Genuinely DOM-free autonomy requires first extracting the turn logic into
  document-free modules — a real refactor, scheduled in roadmap Phase 3.
- **Each character runs only on a runtime holding its own owner's key.** Because each person keys
  their own character, **no partner ever runs the other's character.** "Unattended shared" play
  means each side's character advances independently on its owner's runner, merging through the
  shared room.

Autonomy ships behind explicit, revocable **per-character consent**, a **turn budget**, a
**"nothing irreversible while unattended"** rule (destructive actions wait for a human), a
**pull-only ledger** (§8), and **digest-at-rest handling** (§6): the materialized digest the
runner needs is minimized, encrypted at rest under the owner's key, retention-bounded, and
**purged the instant the grant is revoked** (revocation halts the runner *and* destroys the
persisted digest). Any party's exit **auto-disables** autonomy (§7).

---

## 4. What each layer reuses vs. adds

| Layer | Reuses | Genuinely new |
|---|---|---|
| 0 Substrate | everything | — |
| 1 Identity | HC contract | the `Actor` type; **identity keypair / PKI**; optional `{as}` on invoke |
| 2 Rooms | pages, the hub-as-map | the room artifact store; a room-context binding |
| 3 Authorization | the HC agent entry points | the `(actor × room × action)` policy check (agent + room-access scope only) |
| 4 Sharing | hc-sync's ciphertext transport | **per-room shared keys + out-of-band verification (new PKI)** |
| 5 Characters | HC.invoke (action), parity | the agent loop; a **minimized** digest; signed world-artifact authorship |
| 6 Autonomy | the turn logic from Layer 5 | a **browser** runtime at origin; autonomy guardrails; digest-at-rest |

---

## 5. Provenance: §1.4 preserved literally

§1.4 guarantees two *practice-state* snapshots — one human, one agent — are indistinguishable.
The world needs authorship ("whose character left this?"). The review resolved the apparent
conflict cleanly, and it is now the spine of the design:

- **Agents never write practice stores.** No journal entry, goal, or prediction is ever
  agent-authored. §1.4's practice-store parity is therefore **preserved literally, unchanged** —
  not "reworded," not "narrowed." (The earlier draft's "§1.4 becomes a property of the practice
  stores" wording overstated a change that, under this rule, isn't one; §9 flags it for founder
  read-through regardless, since it touched binding wording.)
- **World artifacts carry signed authorship** in a *new* store **outside §1.4's scope.** This is
  additive, not a modification of the parity guarantee.

Keeping this boundary is the single most important discipline as the world grows: the moment an
agent is allowed to write a practice store, §1.4 breaks. The rule is "agents write the world,
humans write their practice."

---

## 6. Cross-user sharing — the crypto, honestly *(security review before any real content)*

Today's sync is **single-account**: a random per-doc DEK encrypts each store, wrapped by the
user's passphrase and recovery code; the server holds only ciphertext + wrapped keys.

A shared room needs a **room key `RK`** two accounts can both use. The review found the naive
handshake insecure and the "operator cannot decrypt" claim overstated; corrected design:

- **Out-of-band verification is mandatory, not optional.** "B publishes a public key; A wraps
  `RK` to it" routes public keys through the operator (Supabase) with no authentication — a
  textbook key-substitution MITM (the operator serves A its own key labelled "B," decrypts, and
  re-wraps to real B undetectably). So: each owner holds a long-term identity key (Layer 1);
  **before any `RK` is wrapped, the two people compare a short safety-number/fingerprint over a
  trusted channel** (in person or a call — trivial for two people) and pin it (TOFU).
  *Operator-mediated key delivery without fingerprint verification is not zero-knowledge.*
- **Wrap `RK` under each owner's random account DEK**, not the passphrase-derived key, so
  shared-room confidentiality doesn't hinge on passphrase strength (M1).
- **Metadata linkage is real and must be disclosed.** Two `user_id`s referencing one room doc,
  and two wrapped-`RK` rows pointing at it, tell the operator the **two accounts are linked — the
  existence of the relationship itself** — plus co-access cadence and artifact sizes. Enumerate
  this; either mitigate (pad sizes, decouple wrapped-`RK` rows from `user_id`) or accept-and-
  disclose. Fold into the L31 pre-Tier-1 metadata review.
- **Forward secrecy is limited.** `RK` is long-lived; revocation-by-rotation protects **future**
  artifacts only — the operator retains prior ciphertext and prior wrapped-`RK` blobs, so anyone
  who ever held `RK` recovers all past shared content, and real deletion depends on operator
  cooperation. State the threat model; decide if acceptable for a two-person artifact, or spec a
  per-epoch ratchet.

This is a **genuine extension of the zero-knowledge design and must pass a security review before
it touches real content** — a prerequisite gating **Phase 2** (not later). Until then, Phase 1
runs both actors on one device (no cross-account sharing), so the world is playable long before
the crypto exists.

---

## 7. Consent, expressed as permission — two-sided, continuous, with an exit

A character portraying a partner — seeded from *their* stores, speaking in *their* name — is the
most tender surface in the whole idea. The review found the first draft's consent model
**input-side only** and missing the rupture case. Corrected:

**Input-side (which the draft had):** each person owns their own actor(s) and holds their own
key; no one else can create, seed, or run a character portraying them; the portrayal grant names
which (minimized) stores seed the character, how much latitude, which rooms, what it may leave.

**Output-side (added):** the *portrayed* person can (i) **review** a feed of everything their
character has said/left, (ii) **repudiate/remove** any artifact, and (iii) hold tender-room
artifacts in an **approval queue that does not sync until they confirm** — so the irreversible
cross-device step is consent-gated *before* it happens, not apologized for after. Seeding consent
is **necessary but not sufficient**; portrayal consent is **continuous.**

**Latitude default (resolved):** because the harm lands on the *other* partner, real-partner
portrayal is **conservative by default**, with generosity opt-in per room — not the earlier
"generous latitude."

**Rupture and exit (§7 new):** either party can **unilaterally and immediately** halt all
portrayal of themselves and freeze/kill any character-of-them (including a running autonomous
one); shared-room artifacts default to **each party retaining their own copy, with neither able
to lock the other out** of co-authored history (this replaces §6's "re-wrap for the remaining
members," which would let one partner lock the other out); a character of you must not keep
speaking as you after you exit (enforced at the ring); autonomy auto-disables on any exit.

**Adjudication:** the portrayed person holds a **unilateral veto** over their own depiction — no
adjudication is needed to remove your own portrayal. Genuine two-party disputes require both
partners' consent, and **either partner's objection is dispositive (a veto, not a vote)**. This
explicitly is **not** "a founder sign-off," because the founder is one of the two interested
parties.

**Drift (M2):** journal-sourced digests over-weight recent affect (a "you-from-a-bad-week").
Give the portrayed person a refreshable, correctable **"this is the current picture of you your
character projects"** view.

---

## 8. Values reconciliation — honest about the new engagement surfaces

A "digital world with adventures" *is* the shape of the engagement products the constraints
reject. It can avoid being one **only** if built as a private relationship artifact *and* the
anti-engagement discipline extends into it — and the review corrected two false premises the
first draft leaned on:

- **"No other users to perform for" was false.** There is exactly one — an intimate partner —
  and that is the **strongest** engagement force there is (reciprocity, guilt at an unfinished
  shared turn). A waiting partner is a loss-aversion loop stronger than any streak. Mitigations,
  stated as hard guardrails: **no turn-timers, no "your partner is waiting" prompts, no
  unfinished-adventure reminders, no completion pressure.**
- **Two more new engagement surfaces the ban-list missed:** Phase 4's autonomy ledger must be
  **pull-only — never pushed or notified, framed as review, not a feed** (a what-you-missed feed
  is a return-trigger by construction); Phase 3's accreting shared history must carry **no
  collection/completion mechanics and no counts designed to grow.**
- **The Echo/Garden analogy was unsound and is dropped.** CONSTRAINTS §5 contains no games
  carve-out; the games' "play" status lives in the founder decision at KNOWN_RISKS L43, not
  binding text. And the games were safe *because* they are outside sync, zero-egress, tiny
  non-personal state, no accreting records — the world is the opposite on **every** axis. So the
  world cannot borrow safety-by-construction it structurally lacks; it needs its **own stricter,
  enforced guardrails**, and the §5 change is a **new** amendment (§9), not a widening of an
  existing carve-out.

**"Not a product" tripwire (added).** The whole defense hinges on "private relationship artifact,
not product," and nothing structural keeps it one. Enumerate the conditions that mean it *has
become* a product — a third+ participant, any public/shareable surface, any metric or record
designed to grow, any onboarding funnel, any monetization — and require crossing **any** of them
to re-run the full values reconciliation as a fresh amendment. Correspondingly, **"two only" is
binding** (§10 Q4): adding anyone is a product-shape change gated by re-ratification.

**Power distribution — accepted asymmetry, not "eliminated."** The first draft's "no central
operator" was false: the repo/GitHub-Pages deploy and the Supabase project are founder-
provisioned (per CLAUDE.md), so one person controls the code both characters run on and the sync
backend, and any hosted runtime concentrates power in whoever operates it. For a two-person
private artifact this asymmetry is **accepted and disclosed, not eliminated.** What the design
*can* guarantee: **either partner can halt the shared world, and neither can unilaterally change
the code the other's character runs under** (that routes through the amendment/consent path).

---

## 9. Binding-document impact (drafted for ratification)

The review's most important structural finding: **relational/psychological harm is a new harm
class the existing safety apparatus does not reach**, and under CONSTRAINTS T1 ("safety binds
first") it cannot be filed as a non-binding KNOWN_RISKS note. So the binding impact is larger
than the first draft admitted:

- **CONSTRAINTS.md — new §2 safety clause (relational harm).** Name relational/psychological harm
  as a first-class safety concern — a character wounding in a partner's voice, parasocial
  attachment to a character of someone you love, a portrayal that feels like a violation — and
  the operator obligations it creates. Plus: §5 gains a **new** anti-engagement amendment for the
  world (not a games-carve-out widening); §3 gains the consent-as-permission expression and the
  accepted-asymmetry disclosure.
- **REQUIREMENTS.md — new relational adverse-event surface + a world-data section.** A "this hurt
  the relationship" capture path analogous to the existing "this didn't feel right" (§3 runbook);
  the room artifact store, shared-room keys with the security-review prerequisite, and autonomy
  guardrails in the data standard; the reaffirmation that practice stores stay provenance-free
  and private. §1.4 stays literally true under §5's no-agent-writes-to-practice rule; flag the
  earlier "reword" language for founder read-through.
- **KNOWN_RISKS.md — new entries** for: partner-portrayal / relational-consent (the deepest,
  cross-referencing the new binding clause); the character as an intentional **private→shared
  exfiltration path**; cross-user key sharing (MITM-without-fingerprints, metadata linkage,
  forward-secrecy); autonomous-agent action; and character/person drift.
- **Tier prerequisite:** the **relational-safety review gates Phase 2**, not Phase 4 — portrayal
  harm is live the moment a partner-seeded character can leave an artifact.

These are **proposals**. Nothing in CONSTRAINTS/REQUIREMENTS is decided until the founder ratifies
it through the §6 amendment process.

---

## 10. Open questions for the founder

Resolved by the review (recorded here, ratification still yours):

- **Digest boundary (was Q1) → resolved:** seed from a **minimized, per-store-opt-in** digest,
  sensitive stores off by default. Adopt as a hard rule.
- **Latitude (was Q2) → resolved:** **conservative by default** for real-partner portrayal,
  generosity opt-in per room.
- **Membership (was Q4) → resolved:** **two only, binding**; adding anyone is a product-shape
  change requiring re-ratification.

Still genuinely open:

1. **Autonomy consent granularity** — per character, per room, per session, or all three?
2. **Is the world a mode of this app, or a new surface importing the HC machinery?**
   (Recommendation: a ring over the existing suite — but note §3/roadmap I6: even the "ring" is
   real new enforcement infrastructure, not free reuse.)
3. **Forward-secrecy stance** for shared rooms — accept the long-lived-`RK` threat model for a
   two-person artifact, or invest in a per-epoch ratchet?
4. **Metadata linkage** — mitigate (padding, decoupling wrapped-key rows) or accept-and-disclose
   that the operator learns the relationship exists?
