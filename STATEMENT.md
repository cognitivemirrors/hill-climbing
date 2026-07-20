# Hill Climbing — Statement

**A public-data art project. A contested competition of families. No winner, by design.**

This began as a suite of private, on-device contemplative practice tools. It is now an **art
project**, and its earlier product-era governance (the privacy standard in `REQUIREMENTS.md`, the
consent and crypto machinery, the two-person world's hard gates) describes a framing the project
has moved past. See "The pivot," below.

## The work

Each participant **donates their own data as public seed data** and, from it, builds a **family**:
a lineage of characters (`kin.html`) spawned from that life. A character inherits *everything* at
the moment it is born, then **diverges** into its own person — it shares your past but becomes
someone else. Family name is the participant's name; each child takes a given name it proposes and
the participant blesses. The families coexist in one public world.

Then the frame: **"Who will build the most ___ family?"**

The blank is never filled, and no family is ever ranked. The families are **exhibited,
characterized, and argued over** — the "most ___" is handed to whoever is looking, and the
disagreement about how to fill it is the piece. The competition asks the question instead of
answering it.

## Why contested

The whole suite refused the single score at every level — Foresee shows *the curve, not the
score*; there are no streaks, no daily counts, no leaderboards; anti-gamification was a founding
value. The competition turns that refusal outward. It takes the most rankable-seeming premise
there is — a competition of *selves* — and withholds the ranking, so the **audience's own urge to
compare** becomes the subject. It is a quantified-self tool used to critique the quantified self:
the leaderboard staged, and then denied.

The theme runs all the way down. A normal family competition rewards harmony or achievement — a
single note struck well. This one, if it rewards anything, rewards **individuation**: how vividly
each child diverged from the shared root and from its siblings. The mechanic is
inherit-everything-then-become-your-own-person; the virtue is *becoming*, not conforming. But even
that is offered, not scored.

## The pivot: public data, no privacy frame

Because every participant donates their own data as public art, the project sheds the apparatus
that existed to protect private data: end-to-end encryption is now just optional *transport*, not
a secrecy guarantee; there are no consent gates, no shareable-vs-private distinction, no
sensitivity tiers, no relational-safety review, and no partner whose data isn't theirs to give
(everyone gives their own). `CONSTRAINTS.md` / `REQUIREMENTS.md` / `KNOWN_RISKS.md` remain in the
repo as the record of the product-era frame; they are **superseded, not authoritative,** for the
art project.

Two things are *not* "public data" and survive the strip:

- **Credentials are secrets, not data.** The shared Anthropic key (`hill-climbing-api-key`) is
  spending power, not personal content; it stays out of read/export. Donating your data does not
  donate your wallet.
- **Only your own data is yours to donate.** The public-donation stance is each artist releasing
  *their own* life. Nothing here makes anyone else's data public.

## Status

- `kin.html` (v0.1) — the family-building tool: spawn, name-handshake, diverging conversation.
- Next surface — the **exhibition**: families side by side in the public world, browsable and
  describable, with the blank "most ___" left open to the viewer and nothing ranked.
- Still Tier 0. Data throughout is treated as **public seed data**.
