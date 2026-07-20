# Hill Climbing — Governance

**Status:** Design draft, under adversarial review. A multi-level governance structure for the
public-data art project (`STATEMENT.md`): rules live as natural language at every level; an AI
**aggregates** them into a per-context policy and an AI **enforces** that policy at the one seam
every action passes through (`window.HC`). It governs both the project and in-world action,
because both meet at that seam.

It is also, per the art frame, partly *a piece* — an AI magistrate is itself an object about
algorithmic governance, ruling in public over a world of donated selves.

---

## The core move

Instead of a rigid coded rule-engine, **rules are plain-language statements authored at each
level**, and AI does the two jobs a rule-engine would:

- **Aggregate** — read all rules applicable to a context, order them by precedence, resolve
  conflicts, and emit a compiled **effective policy** for that context.
- **Enforce** — at the point of action, judge the proposed action against that policy and return
  a verdict with its reasons.

This is what makes the rules bite. The usability audit found the suite's rules are "norms in copy,
not enforced controls," and that the agent is most fluent exactly where enforcement is absent. An
AI enforcer at the HC seam turns those norms into *applied* norms — able to apply fuzzy,
natural-language rules ("nothing cruel in a family member's voice") a rigid engine never could.

### The load-bearing principle: hard in code, soft to AI

AI enforcement is a **strong norm, not a hard guarantee** — probabilistic, fallible, gameable, the
same class as every prompt-level guardrail in the suite (L30/L40). So the division of labor is
strict:

- **Hard invariants stay coded** — never delegated to the AI. The two strip-survivors from
  `STATEMENT.md` are the canonical examples: *credentials are secrets* (the API key never enters
  read/export) and *only your own data is yours to donate*. These are code, and the AI cannot
  loosen them.
- **Soft, contextual, natural-language norms go to the AI** — the vast, fuzzy space a coded engine
  can't reach. This is where the aggregator/enforcer earns its keep.

If a rule needs a *guarantee*, it is code. If it needs *judgment*, it is the AI's. Never confuse
the two.

---

## The levels (highest precedence first)

Rules are authored at five levels. **Higher binds lower; a lower level may be _stricter_ but never
_looser_** than the level above it.

| # | Level | Who authors | What it governs |
|---|---|---|---|
| 0 | **Charter** (constitutional) | Founder | The supreme values — `STATEMENT.md`'s frame plus what survives from `CONSTRAINTS.md` (care; the refusal to rank; the two hard invariants). Slowest to change; highest bar. Binds everything. |
| 1 | **World rules** | Project | How the world of families works — the operational layer (the `REQUIREMENTS.md` descendant). |
| 2 | **Room rules** | Room owner | Local rules for a place in the world — what may happen there (`WORLD_ARCHITECTURE.md`'s rooms). |
| 3 | **Family rules** (house rules) | Each participant | A family is a jurisdiction with its own character. May be stricter than the world, never looser than the charter. |
| 4 | **Character rules** (self-governance) | The character itself | A character's own vows as it diverges — what it will and won't do. It may bind *itself* more tightly (an act of individuation) but cannot exempt itself from any level above. |

**Conflict resolution.** Within the aggregator: higher wins; a lower rule that tries to *loosen* a
higher one is void and flagged; a lower rule that *tightens* is honored. Genuine contradictions the
AI can't resolve are surfaced for review, not silently guessed — constitutional conflicts escalate
to the founder, the final human court.

This generalizes the precedence the repo already runs on (`CONSTRAINTS > REQUIREMENTS > BACKLOG`),
makes it span the world, and has it **compiled per context by AI** rather than read by hand.

---

## The two mechanisms

### 1. The Aggregator — compiles the effective policy

- **In:** a context — who is acting, where (room), what action, on what — plus the full layered
  rule corpus.
- **Out:** a compiled **effective policy** for that context: a concrete, precedence-ordered set of
  what is permitted / forbidden / required, each item tagged with the level it came from
  (provenance), and any unresolved contradictions flagged.
- It is an LLM that reads natural-language rules and composes them. Stable policies are
  **pre-compiled** per (room, family, action-class) and recompiled only when rules change — so
  enforcement is not a fresh full-corpus read on every action.

### 2. The Magistrate — enforces at the HC seam

- Sits at the HC action chokepoint (the authorization ring `WORLD_ARCHITECTURE.md` §3 already
  defines — every action routes through it).
- Before an action commits, it judges the action against the compiled policy and returns a
  verdict — **allow / refuse / allow-with-modification / hold-for-review** — with a plain-language
  **reason** citing the rules and levels it applied.
- **A panel, not a judge.** To resist the concentration of power an AI magistrate would otherwise
  be (CONSTRAINTS §3), enforcement is a small panel of AI judges with distinct lenses (charter,
  care, family) deciding by majority — the judge-panel pattern, reducing single-point and
  single-perspective failure.

---

## Power distribution (the value most at risk)

An AI that aggregates and enforces all rules is a concentration of power — precisely what the
founding constraint resists. Built-in mitigations:

- **Authorship stays distributed.** Only *compilation and application* are AI-mediated; **what the
  rules are** is authored by participants at every level. The AI governs coherence and
  application, never authorship.
- **A panel, not a sovereign** (above).
- **Appeal.** Any refusal can be appealed to the next level up — a room refusal to the world, a
  world refusal to the charter/founder — the appeal being an AI re-evaluation at the higher level,
  with the founder as the final human court for constitutional questions.
- **Legibility as public record.** Every verdict carries its reasons and rule-provenance and is
  public — governance as exhibit, fitting the public-art frame. A ruling you cannot read is a
  ruling you cannot contest.

---

## Honest limits

The project's ethos is to refuse to disclaim away what it can't guarantee. So, plainly:

- **Enforcement is soft.** Much stronger than copy, but fallible and jailbreakable. Anything
  needing a *hard* guarantee stays code (see the load-bearing principle). Do not oversell the
  magistrate as a control it is not.
- **Concentration is disclosed, not eliminated.** Even a panel is AI, and the model provider is a
  concentration point — the same accepted-asymmetry the world doc names.
- **Rules are gameable.** A family or character can author rules that technically comply while
  subverting intent; the aggregator flags suspected bad faith but cannot fully prevent it. In the
  art frame, rules-lawyering is itself part of the performance.
- **The art frame lowers the stakes.** This governs a fictional world of characters from donated
  public data — an enforcement failure is an aesthetic event, not user harm. The magistrate is as
  much a piece about algorithmic governance as it is infrastructure.

---

## How it plugs in

- **Seam:** the HC authorization ring is the single enforcement point (already defined).
- **Charter:** `STATEMENT.md` values sit at level 0; the two hard invariants stay coded.
- **Shape:** a `governance` module exposing `aggregate(context) → policy` and
  `enforce(action, policy) → verdict`, called by the HC ring. Both are BYOK LLM calls — so, like
  every model call in the suite, they are the *judgment* layer (runtime), never a hard control.
- **Precedent:** the existing `CONSTRAINTS > REQUIREMENTS > BACKLOG` ordering, generalized.

## MVP (single participant, Tier 0)

The five levels collapse to **charter → your world → your families → your characters**. The
aggregator/enforcer runs over the HC seam for `kin.html` actions: before a character acts, the
panel checks it against your charter + family + character rules and returns a reasoned verdict,
publicly logged. The multi-participant version — many families, room rules, cross-family appeals —
arrives with the exhibition/competition.
