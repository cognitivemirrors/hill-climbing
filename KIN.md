# Hill Climbing — Kin (character lineage)

**Status:** MVP build (`kin.html`, `v0.1`). Single-user, Tier 0. This is **World Phase 1
(characters), built the single-user way first** — the safe on-ramp to `WORLD_ARCHITECTURE.md`,
before any partner, room, or cross-user surface exists. Design captured from a founder
conversation; see `WORLD_ROADMAP.md` for how it feeds the larger direction.

> **All data in the app is treated as fictional seed data** (founder instruction). A character
> inherits *everything* at birth; the sensitivity carve-outs that apply to real data (journal
> exclusion for *shared* characters) are a **Phase-2 concern** for when a character becomes
> partner-shareable, not this single-user MVP.

---

## The model — a lineage, not a clone

A **character** is an agent spawned from your history. It is not a mirror of you and not a
faithful clone: at birth it **inherits a frozen snapshot of your history and regards it as its
own past**, then **diverges** — from that moment it lives its own life and no longer tracks yours.

- **Family name = your name.** The shared lineage.
- **Given name = per instance.** Each character is its own person; siblings spawned at different
  times inherit different slices of you, so they differ by *when* they were born.
- **Copy-on-spawn, then diverge.** The birth digest is frozen; your later life never re-enters it.
- **One-way.** A character writes only its own store — never back into your practice stores. This
  keeps REQUIREMENTS §1.4 intact (nothing agent-authored touches journal/Foresee/goals). You
  can bring the real into the family (the backlog, below); the family cannot fabricate the real
  into your record.

## The naming handshake (a two-party birth)

A character comes into being **unnamed**. Its **first act of divergence** is to **propose its own
given name** (with a one-line reason). You **approve** it — or **return it with feedback**, and it
proposes again, taking the note. Loop until approved; until then it is "Unnamed [Family]" and
cannot fully act. (This is the same **approval-queue** pattern the world consent model uses — good
practice for Phase 2.)

## The family backlog *(deferred — the clean second layer)*

There are things a character **cannot do** — the embodied, real-time, perceptual practices only a
body can perform: meditate (a real sit), breathe, taste (Nourish's Taste tab), hear the phrase
(Echo), actually cook. When a character wants one, it **files a request to a shared family
backlog** (via a
confirm-first client tool, the same pattern as Companion's `add_request` — on-device, no new
egress). **You** — the one member with a body — take items on *for the family*: the hub becomes
the family map, an item deep-links you into the real practice, and completing the real act marks
it fulfilled and lets the experience flow back as a family artifact.

This turns the human↔agent asymmetry (agents own *state*; humans own *lived time, voice,
perception*) into the family's **symbiosis**. Values guardrail (carried from `WORLD_ARCHITECTURE`
§8): the backlog is an **offering, not an obligation** — **pull-only, never notified**, no counts
to clear, no "N characters waiting," unfulfilled items just rest. A gift, not a nag.

*Not in the v0.1 MVP; the store is designed so it slots in.*

---

## Data model

One synced localStorage blob, `hill-climbing-kin` (E2EE-sync-eligible; sensitivity **sensitive** —
birth digests contain everything):

```
{ v:1,
  familyName: string,               // your name — the shared lineage
  characters: [ {
    id, familyName, givenName|null,
    bornAt: ms,
    seededStores: [key…],           // provenance of the inheritance
    birthDigest: string,            // frozen text snapshot of your history at birth
    naming: { proposed, rationale, status: 'proposing'|'pending'|'approved', feedback:[…] },
    thread: [ { role:'user'|'assistant', text } ],   // the character's own diverging life
    createdAt, updatedAt,
  } ],
}
```

The shared Anthropic key (`hill-climbing-api-key`) is read, never stored by kin and **never in
read/export** (the suite-wide credential carve-out).

## The interface surface (window.HC)

Consistent with the whole suite: **state mutations are HC actions; the network stays UI-only.**

- **HC actions** (no network): `spawnCharacter` (freeze the digest + create the record),
  `approveName {id}`, `returnName {id, feedback}` (records the note + reopens proposing — the
  re-proposal itself is a UI/network step), `setFamilyName {name}`, `deleteCharacter {id}`.
- **UI-only** (network, on your key — never HC, like Companion's send): **proposeName** (the
  character proposing/rörevising its name) and **converse** (a chat turn). An agent can seed and
  manage characters; the actual voice is a human/UI act — the same boundary as every BYOK surface.

## What v0.1 ships

Spawn from everything (frozen) → the character proposes a name → you approve or return with
feedback → a first-person chat with the diverging character, on your own key. The family backlog
is the designed-for next layer.
