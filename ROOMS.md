# Hill Climbing — Rooms (the world, made concrete)

**Status:** Draft for founder review. Crystallizes the founder's **"rooms" vision** (stated
2026-07) into a concrete, buildable architecture, reconciled with the existing world-direction
drafts (`WORLD_ARCHITECTURE.md`, `WORLD_ROADMAP.md`), the two built world slices (`kin.html`,
`govern.html`), and the art-project statement (`STATEMENT.md`). Precedence is unchanged:
**CONSTRAINTS > REQUIREMENTS > this doc.** Nothing here amends a binding document; §12 lists the
binding-doc changes this direction *would* need, drafted for founder ratification.

Companion documents: `WORLD_ARCHITECTURE.md` (the layer stack and why), `WORLD_ROADMAP.md` (the
phased order of building), `KIN.md` (the clone/lineage model), `GOVERNANCE.md` (rules, ledger,
token budgets). This doc is the *rooms* synthesis: it takes the founder's vision bullet by bullet
and says what already exists, what is genuinely new, and what is gated.

---

## 0. The shape in one paragraph

A **world** is an owner's profile expressed as an **append-only log of state changes**. Every
change — edit a value, add a goal, send a message, move between screens — is an **event**, and
every event can be authored by **either a human or an LLM** through the one interface both already
share (`window.HC`). The current state is a *reduction* over the log; an **older self** is that
same reduction stopped at an earlier point (time travel); a **clone** is a self frozen at a point
and set loose to diverge (this is Kin). Screens are **rooms**; each screen is a **room type**, and
you can have more than one room of a type (a second goals room). **Roles** decide which rooms an
actor may enter by default. Agents **advance slowly when no human is in the room and immediately
when one is**, bounded by a **token budget** the owner sets; when a room holds more than two
agents (or one agent and two humans), a **cheap moderator** decides who speaks next, with a clear
**thinking/typing indicator**. In conversation you can trigger a **research agent** that goes and
finds an answer. It is **turn-based first**; unattended autonomy is the destination, not the
entrance.

The vision is not a new project — it is the **integration** of pieces the repo already has in
draft or in first-slice code. The one genuinely new primitive is the **event-sourced world log**;
everything else is rooms, roles, and a turn scheduler *around* it.

---

## 1. The framing decision the vision forces *(read this first)*

The vision reintroduces surfaces the art pivot said the project had left behind, and this
contradiction is the single most important thing for the founder to resolve before the cross-user
parts are built:

- **`STATEMENT.md` (the art frame)** says the project "moved past" the two-person private world:
  *"there are no consent gates, no shareable-vs-private distinction, no sensitivity tiers, no
  relational-safety review, and no partner whose data isn't theirs to give (everyone gives their
  own)."* Data is **public donated seed data**.
- **The vision** says: *"invite a friend to join your world," "exchange messages with an intimate
  partner," "share your clones with your partner and they can chat with them."* That is the
  **private, two-person, partner-portrayal world** of `WORLD_ARCHITECTURE.md` — the exact surface
  `CONSTRAINTS.md` S8/P11 (drafted, unratified) name as the tenderest safety concern in the
  project, gated behind a **security review** and a **relational-safety review**.

These cannot both be the top-level frame for the cross-user surface. Three coherent resolutions:

1. **Private two-person world is back on top** (the vision supersedes the art pivot for the world
   layer). Then S8/P11/§5-world are **ratified**, and the two hard gates bind Phase 2. Partner
   data is *not* public; the digest-minimization, consent, crypto, and relational-safety
   apparatus all return.
2. **Art frame holds; "friend/partner" means public co-exhibition, not private intimacy.** Then
   "invite a friend" = another artist donates their own family into the public world; "share your
   clone" = it is already public; "exchange messages with a partner" is *public* correspondence,
   art not intimacy. No relational-safety gate — but then the "intimate partner" language is a
   metaphor, and the tender-portrayal protections are genuinely gone (a real cost to own openly).
3. **Both, in two rooms.** The world is public by default (art frame), but a **private room type**
   exists whose contents never become public seed data and whose cross-user sharing carries the
   full consent/crypto/relational apparatus. This is the most work and the most honest to the
   vision's *range* (public exhibition *and* intimate correspondence), and it maps cleanly onto
   the "permissions per room type" primitive the vision already asks for.

**Decision — founder, 2026-07-22: resolution 3, hybrid + staged.** The world is **public by
default** (the art frame), with a **private room *type*** whose contents never become public seed
data and whose cross-user sharing carries the full consent / crypto / relational apparatus. This is
built on the vision's own primitive — the private↔public boundary is a **permission on a room
type** (§3). Build the **single-device** world now (§11 Phase R1 — safe under this framing because
nothing leaves the device and no one else's data is touched); the framing now gates only *how* the
**cross-user** phase (§11 Phase R2) is built, not *whether*.

**Ratification still owed (§12):** the decision is made, but its **binding-doc wording** is not yet
written — `STATEMENT.md`'s "no privacy frame / moved past the two-person world" needs a carve-out
for the private room type, and `CONSTRAINTS.md` **S8 / P11 / §5-world** need ratifying *scoped to
that private surface*. Those are substantive binding amendments, drafted in §12 and awaiting the
founder's explicit sign-off on wording (per the amendment norm). **The single-device prototype
(§13) is unaffected either way** — it neither publishes data nor shares across accounts.

---

## 2. The core primitive: an event-sourced world

> Vision bullets 8 ("every state-changing action can be done by both human users and LLMs") and 13
> ("the LLM context is a log of all state changes since profile creation, with older history
> repeatedly compressed, plus skills") are **one primitive**: an append-only event log.

**The world log.** Every state change is an event:

```
Event = {
  id, ts,
  actor:   actorId,        // WHO made the change — human or agent, same field either way
  room:    roomId,         // WHERE it happened (which screen)
  type:    'setValue' | 'addGoal' | 'addTask' | 'addEvent' | 'sendMessage' |
           'enterRoom' | 'authorRule' | 'spawnClone' | ... ,
  payload: {...},          // the change itself
  reducesFrom: eventId,    // the log is a chain; state = fold(events)
}
```

- **State is a reduction over the log.** `render()` folds the events into the current world
  (values, the goal tree, the calendar, tasks, room contents). There is no separately-authored
  "current state" that can drift from the history — the history *is* the state. This is the same
  discipline `climb.html` already ships (an append-only IndexedDB `events` log that reduces to
  goals + steps) and `govern.html`'s **append-only ledger** invariant (history is never
  rewritten).
- **Humans and LLMs append identically.** A UI click and an `HC.invoke(...)` land the *same* event
  through the *same* internal function — this is exactly REQUIREMENTS §1.4 (human/agent snapshots
  indistinguishable), extended from per-app stores to the world log. No event records *whether* it
  came from a person or a model beyond the `actor` field, which names an actor, not a species.
- **Attribution here does not break §1.4.** The world log records an `actor` on every event, and
  world/room artifacts carry *signed authorship* — but this is a **new world-layer store, outside
  §1.4's practice-store scope** (`WORLD_ARCHITECTURE.md` §5: signed authorship is *additive*, in a
  new store, not a modification of the parity guarantee). The hard line, which keeps §1.4 literally
  true: **Rooms writes only its own world store and never a practice store** (journal / Foresee /
  goals). The moment an agent writes a practice store, or a provenance field is added to a
  *practice* event, §1.4 breaks — so neither ever happens. (Attribution *belongs* in the world log
  precisely because agents can act there; parity's "no provenance" is a property of the practice
  stores, which agents never touch.)
- **The log is the model context.** An LLM acting in the world is handed a rendering of the log —
  recent events verbatim, older events **compressed** into periodic **summary events** folded back
  into the chain (a `type: 'compaction'` event that stands in for the span it replaces). This is
  the "repeatedly compressed" requirement made concrete: compaction is itself an event, so the
  history stays a single append-only chain and the compression is auditable, not a hidden cache.
- **Skills** are named, parameterized actions the model may take — literally the `HC.actions()`
  manifest (§10), plus room-scoped verbs. "Skills for interacting with the environment" = the
  action catalog the world exposes, the same one the UI uses.

**Why event-sourcing is the right spine.** It makes four separate vision bullets fall out for
free: (13) the log *is* the context; (8) both actors write the same log; (11/12) time travel is
"fold up to event N"; (9) a clone is "freeze the fold at event N and diverge." One primitive,
four features.

---

## 3. Rooms, room types, and instances

> Vision bullets 17–21: users and agents move between screens which are all rooms; every screen is
> a room type; change permissions for a room and for a room type; create a second goals room.

- **A room is a place + a policy + what was left there.** This is `WORLD_ARCHITECTURE.md` Layer 2
  verbatim (`Room = { id, place, policy, artifacts }`). The refinement the vision adds is the
  **room *type*** layer above the instance:

```
RoomType = { id, label, defaultPolicy, verbs:[actionName…] }   // e.g. "goals", "journal", "council", "message"
Room     = { id, typeId, label, policy?, artifacts }            // an instance; policy overrides the type default
```

- **Every screen is a room type.** The existing practice pages become the seed room types (a goals
  room type from `climb`, a journal room type from `reflect`, a council/message room type from
  `companion`, and so on) — the hub becomes the **map** (`WORLD_ARCHITECTURE.md` Layer 2 / roadmap
  Phase 3). New places (rooms with no practice page behind them) are just room types with no
  legacy `place`.
- **Create a second goals room** = instantiate a second `Room` of `typeId: 'goals'`. Instances are
  cheap; the type carries the verbs and the default policy, the instance carries its own contents
  and any policy override.
- **Permissions at two scopes.** Bullet 19 (per-room) edits `Room.policy`; bullet 20 (per-type)
  edits `RoomType.defaultPolicy`, which every instance inherits unless it overrides. This is the
  `Policy = { enter, act, leave }` shape from `WORLD_ARCHITECTURE.md` Layer 3, lifted to also live
  on the type. Enforcement is the **authorization ring** (agent actions + room access only; it does
  not gate a human editing their own data — Layer 3's honest scoping).

Room rules-as-natural-language (the "room owner authors local rules" level) already exist in
`GOVERNANCE.md`'s level hierarchy (charter > world > **room** > family > character). Rooms and
Govern share the same room object; Govern authors *rules* over it, Rooms authors *permissions* over
it. They are two faces of one record — the design's recurring "permission and consent are one
record" theme.

---

## 4. Actors and roles

> Vision bullets 22 (roles have default room access, changeable) and 8 (both humans and LLMs act).

- **Actor** is `WORLD_ARCHITECTURE.md` Layer 1: `{ id, kind:'human'|'agent', owner, label, pubkey? }`.
  The `pubkey`/identity-key half is only needed for cross-user signing (§11 Phase R2), so the
  single-device prototype carries actors without keys.
- **Role** is the new grouping the vision asks for: a named bundle of default room access.

```
Role = { id, label, defaultRooms:{ [roomId|roomTypeId]: ['enter','act','leave'] } }
Actor.role = roleId    // an actor's role seeds its default policy across rooms; per-room overrides win
```

Roles resolve to per-(actor × room × action) policy at read time: an actor's role gives it a
baseline set of rooms it may enter/act/leave, and any explicit `Room.policy`/`RoomType.defaultPolicy`
entry overrides it. This is how "different roles have access to different rooms by default, which
can be changed" (bullet 22) becomes concrete without a second permission system — roles are a
*default-provider* for the one policy check that already exists.

Example seed roles: **owner** (all rooms), **guest/friend** (public rooms only), **partner**
(public + designated private rooms — the framing-gated ones from §1), **character** (the rooms its
lineage is admitted to, conservative by default per `WORLD_ARCHITECTURE.md` §7), **researcher** (a
transient role for the research agent, §7).

---

## 5. Clones as time-indexed selves

> Vision bullets 9–12, 15: create a clone seeded by your state; family name = your name, given name
> per clone; multiple clones at different points in time; move backwards through time to recreate an
> older you; maintain multiple versions.

This is **Kin** (`kin.html` v0.1, `KIN.md`), extended by the event log:

- **A clone is a frozen fold + divergence.** Spawning a clone reduces the world log **up to event
  N** into a birth digest, freezes it, and gives the clone its own diverging thread — precisely
  Kin's copy-on-spawn-then-diverge. `Clone.bornAt = eventId` (not just a timestamp), so the clone
  is anchored to an exact point in the history.
- **Family name = owner's name; given name per clone** — Kin's naming handshake, unchanged (the
  clone proposes its own name; the owner approves or returns with feedback).
- **Multiple clones at different points** (bullet 11) = spawn at different `eventId`s; siblings
  differ by *when* they were born, exactly as Kin already frames it.
- **Time travel** (bullet 12) is the new capability the log unlocks: "recreate an older version of
  you" = fold the log **only up to event N** and present that as a read-only past self, from which
  you can spawn a clone or branch. The live world stays at HEAD; time travel is a *view*, never a
  destructive rewind (append-only is preserved — you never delete events to go back, you fold
  fewer of them).
- **Maintain multiple versions** (bullet 15) = multiple clones are multiple living versions; the
  time-travel view lets you pick the point each was taken from.

The one-way rule stays (Kin / `WORLD_ARCHITECTURE.md` §5): **a clone writes only its own
thread and the room artifacts it is admitted to — never back into the owner's practice stores or
world state.** This keeps §1.4 literally true.

---

## 6. Turns, speed, budgets, and the moderator

> Vision bullets 23–26: the owner sets a token budget determining how far agents advance without a
> human in conversation; LLMs advance slowly with no human present, immediately with a human;
> background agents stay in their room and follow its speed rules; a cheap moderator picks the
> responder when a room has >2 agents or 1 agent + 2 humans, with a clear typing indicator.

This is `WORLD_ARCHITECTURE.md` Layer 6 (autonomy) + `GOVERNANCE.md`'s token-budget layer, made
concrete as a **turn scheduler**:

- **Token budget = autonomy depth.** The owner sets a per-world (and optionally per-room / per-role)
  token budget. It is `GOVERNANCE.md`'s budget layer put to work: **metering is a hard code
  invariant** — an agent cannot spend tokens it does not have — above a **subsistence floor** no
  configuration strips. When the budget for unattended advancement is exhausted, agents **stop and
  wait for a human**, they do not degrade or overspend. (Real tokens are real money on a real BYOK
  key — the budget is the owner's finite compute, ceded to the world's rules.)
- **Speed model** (bullets 24–25):
  - **A human in the room ⇒ agents respond immediately** (interactive turn — the human is present
    and spending attention, so latency should be conversational).
  - **No human in the room ⇒ agents advance slowly**, on a throttle (a tick interval + a per-tick
    token cap), and only while budget remains. "Slowly" is the anti-engagement guardrail made
    mechanical: an unattended room should *drift*, never *race* to generate a backlog that pulls
    you back (`WORLD_ARCHITECTURE.md` §8 / `WORLD_ROADMAP.md`: no "what you missed" feed).
  - **Background agents stay put.** An agent spawned in a room remains in that room and obeys *that
    room's* speed rules; it does not roam. This bounds where unattended computation can happen and
    makes the ledger of "what happened while I was away" per-room and legible.
- **The moderator** (bullet 26). When a room holds **more than two agents, or one agent and two
  humans**, turn-taking is ambiguous, so a **cheap model** (a small, fast model — this is the one
  place a non-Opus tier is right) acts as **moderator**: given the room's recent log and who is
  present, it names **which single actor responds next**. Exactly one actor is "holding the floor"
  at a time; a clear **thinking/typing indicator** shows who. The moderator **only routes** — it
  never speaks in an actor's voice (the `GOVERNANCE.md` "no allow-with-modification" discipline: an
  AI must not author *content* in another's voice). **On "two humans":** the binding "two only"
  ceiling (owner + partner, `CONSTRAINTS.md` §10 Q4) is a *cross-user Phase-2* concern — it is
  **not** encoded in the single-device prototype, where you can add any number of local actors to
  model turn-taking, and where the moderator simply routes among whoever is present. The ceiling
  governs real *networked* humans (a third account is a "not a product" tripwire,
  `WORLD_ARCHITECTURE.md` §8, forcing a fresh values re-ratification), and that surface is gated
  (§11 Phase R2). The prototype does not enforce a human cap because single-device local actors are
  not the thing the ceiling is about.
- **Turn-based first.** All of the above runs **when a human runs a turn** in the single-device
  prototype (§13). Genuinely *unattended* stepping (a browser runtime at the origin, on the owner's
  key) is `WORLD_ARCHITECTURE.md` Layer 6 / roadmap Phase 4 — deferred, and it needs the turn logic
  extracted into document-free modules first (roadmap Phase 3). The prototype builds the scheduler
  and the speed/budget *rules*; it does not build the unattended runtime.

---

## 7. The research agent

> Vision bullet 16: in conversation you can trigger a research agent that finds the answer given
> available resources.

`companion.html` already has BYOK **web search + fetch**. The vision asks for one step more: a
**triggerable sub-agent** that, given a question, runs its own small loop (web-search → synthesize,
with citations) and returns a cited answer as a **room artifact**, rather than the main conversant
doing it inline. Concretely:

- A **research role/actor** is spawned for the question, admitted to the room as a transient actor,
  runs a bounded loop against available resources (the prototype wires Anthropic's server-side
  `web_search` tool with citations; a `web_fetch` step and `HC.read` over rooms the researcher's
  role may enter are natural extensions), and **leaves a signed research artifact** in the room
  (finding + sources). Its spend counts against the room's
  token budget (§6), so research is metered like any other agent action.
- Because it writes only a **room artifact** (never a practice store, never world state), it obeys
  the one-way rule and §1.4 automatically.
- "Given the resources available to them" is the permission model doing its job: a researcher sees
  exactly the rooms its role admits it to, plus the web if the room permits web egress. Resource
  scope = room access.

---

## 8. The onboarding flow

> Vision bullets 1–7, in order. Each onboarding step is just an **event appended to the world log**
> in the relevant room — onboarding is not a special mode, it is the first few events of the world.

1. **Name** → the world's owner name (also the family name for clones, §5).
2. **Values** → authored into a **values room** (a room type); each value an event.
3. **Goals, as a hierarchy** → a **goals room**; goals nest (parent/child) — this is `climb.html`'s
   goal model, made hierarchical, on the event log.
4. **Key calendar events** → a **calendar room**; each event dated.
5. **Key tasks, optionally tagged to one or more goals** → a **tasks room**; a task carries
   `goalIds:[…]` linking it to zero or more goals (Remind/`climb` lineage).
6. **Invite a friend to join your world** → creates a **friend actor/role** with access to public
   rooms. *Single-device now (a local actor you can act as); networked invitation is §11 Phase R2,
   framing-gated (§1).*
7. **Exchange messages with an intimate partner** → a **message room** between the owner and a
   **partner actor**. *Single-device now (both actors local); networked partner + the tender
   partner-portrayal surface is §11 Phase R2, gated behind the security + relational-safety reviews
   (or reframed public, per §1's resolution).*

Steps 1–5 are entirely single-user and safe under every framing. Steps 6–7 are single-device in the
prototype and cross-user (gated) later.

---

## 9. The vision, bullet by bullet

Status legend: **built** = shipping as an established suite app/slice · **drafted** = specified in a
design doc · **new** = this doc introduces it as a world-layer concept · **gated** = needs the
framing decision (§1) and/or a hard review before real cross-user content.

**Important:** these labels describe each bullet's maturity as a *suite-wide, cross-user-capable*
feature — **not** whether the `rooms.html` v0.1 prototype demonstrates it. The prototype (§13) now
**realizes single-device** most of the "new"/"drafted"/"partially built" rows below (the
event-sourced log, room types + instances, roles + permissions, time travel, the turn scheduler +
moderator, the research agent). So "new" here means "new as a *world-layer* concept," even where
the prototype already shows it locally; what stays genuinely unbuilt is the **cross-user** cluster
(6/7/14) and unattended autonomy.

*(This table is completed against the code-level reconciliation in §10; see BACKLOG for the
per-item build tracking.)*

| # | Vision bullet | Status | Basis |
|---|---|---|---|
| 1 | Name | new (trivial) | world log seed event |
| 2 | Values | new | values room over the log |
| 3 | Goals as a hierarchy | partially built | `climb.html` goals + event log; hierarchy is new |
| 4 | Calendar events | new | calendar room over the log |
| 5 | Tasks tagged to goals | partially built | `climb`/`remind` task model; goal-tagging is new |
| 6 | Invite a friend | new + gated | friend role now (local); networked = Phase R2 |
| 7 | Intimate-partner messages | drafted + gated | `WORLD_ARCH.` §7; local now, networked gated |
| 8 | Every action by human or LLM | **built** | REQUIREMENTS §1.4 / `hc-agent.js` parity |
| 9 | Clone seeded by state | **built** | `kin.html` spawn-from-history |
| 10 | Given name + family name | **built** | `kin.html` naming handshake |
| 11 | Multiple clones at time points | **built** | `kin.html` siblings by birth time |
| 12 | Time travel to older you | new | fold the log up to event N |
| 13 | Log-as-context, compressed, + skills | new | the event-sourced world (§2) |
| 14 | Share clones with partner | drafted + gated | `WORLD_ARCH.` §5/§7 portrayal; gated |
| 15 | Multiple versions of yourself | **built** | `kin.html` multiple characters |
| 16 | Research agent in conversation | partially built | `companion` web search/fetch; sub-agent loop is new |
| 17 | Screens are rooms | drafted | `WORLD_ARCH.` Layer 2 |
| 18 | Every screen is a room type | new | the RoomType layer (§3) |
| 19 | Permissions per room | drafted | `WORLD_ARCH.` Layer 3 policy |
| 20 | Permissions per room type | new | policy lifted to the type (§3) |
| 21 | Create a second goals room | new | room instances of a type (§3) |
| 22 | Roles → default room access | new | the Role layer (§4) |
| 23 | Owner token budget → autonomy depth | **built (component)** | `govern.html` budget layer |
| 24 | Slow without human, immediate with human | new | the turn scheduler (§6) |
| 25 | Background agents stay in their room | new | scheduler scope rule (§6) |
| 26 | Moderator + typing indicator | new | cheap-model floor routing (§6) |
| 27 | Build with loop engineering + subagents | (process) | how this work is being done |

**Read of the whole:** ~7 bullets are already **built**, ~6 more are **drafted**, the rest are
**new** — but almost every "new" one is a small layer over an existing primitive (a type over a
room, a role over a policy, a fold over the log). The vision is an **integration**, not a
green-field build. Two clusters (6/7/14) are **gated** on the §1 framing decision.

---

## 10. Reuse vs. genuinely new

*(Filled from the code-level reconciliation; see BACKLOG for tracking.)*

**Reuse (extend, don't rebuild):**
- `hc-agent.js` (`window.HC`) — the human/LLM action parity that makes bullet 8 already true; the
  world log's events are HC actions.
- `hc-sync.js` — opt-in client-side-encrypted transport for the world store (single-account now;
  cross-account shared rooms are new PKI, gated). **Substrate note:** the *production* world log
  should ride `hc-sync.js`'s **`kind:'log'` append-only store** (union-by-id merge, `server_seq`
  cursor), which is immune to the whole-blob last-write-wins clobber that affects the suite's plain
  blob stores (KNOWN_RISKS L31) — the append-only log is exactly what LWW would corrupt across
  devices. The v0.1 prototype uses a single localStorage **blob** (like `govern`/`kin`) because it
  is single-device (no concurrent edits, so no clobber) and simplest; migrating the log to
  `kind:'log'` is the first thing multi-device sync needs.
- `hc-usage.js` — the cross-device-summed activity aggregate feeds an agent's context (as it already
  does for companion).
- `climb.html`'s append-only IndexedDB event log — the proven pattern for §2's world log.
- `govern.html`'s ledger invariant + token-budget layer (subsistence floor, hard metering,
  one-family-one-vote surplus, periodic reset) — the budget substrate for §6.
- `kin.html`'s clone model + naming handshake — §5's clones.
- `companion.html`'s BYOK conversation + web search/fetch + context digest — §6's turns and §7's
  research agent.

**Genuinely new:**
- The **event-sourced world log** as a first-class store (the one true new primitive).
- The **RoomType** layer and **room instances** (a second goals room).
- The **Role → default-room-access** layer over the existing policy check.
- The **turn scheduler**: presence detection, the slow/immediate speed model, background-agent room
  confinement, and the **cheap-model moderator** with a typing indicator.
- **Time travel** (fold-up-to-N) and clone-anchoring to an `eventId`.
- The **research sub-agent** loop (vs. inline search).
- For cross-user (gated): **identity keys + per-room shared-key exchange with out-of-band
  fingerprint verification** (`WORLD_ARCH.` §6) — new PKI, not free reuse of the symmetric sync.

---

## 11. Phasing

Turn-based first, single-device before cross-user, gates enforced — consistent with
`WORLD_ROADMAP.md`.

- **Phase R0 — this document + the framing decision (§1).** Nothing user-visible depends on it, but
  the cross-user phase does.
- **Phase R1 — the single-device world (the prototype, §13).** One owner, on one device: onboarding
  (steps 1–5), rooms + room types + instances + permissions, roles, the event-sourced world log
  with compaction, clones + time travel, a turn-based room with a BYOK agent, the speed model +
  token budget + moderator + typing indicator, and the research agent. **Local friend/partner
  actors** (steps 6–7 modeled on-device). **Nothing leaves the device beyond the existing BYOK
  model calls; no cross-account sharing; no data published.** Safe under all three §1 framings.
  This is `WORLD_ROADMAP.md` Phase 1 ("two actors on your device") widened to the full rooms model.
- **Phase R2 — cross-user (gated).** Real remote friend/partner on their own device and key;
  networked shared rooms; sharing a clone with a partner who chats with it. **Gated on the §1
  framing decision** and, if the private-world framing wins, on the **security review** (shared-room
  crypto, `WORLD_ARCH.` §6) and the **relational-safety review** (two-sided continuous consent,
  approval queue, rupture/exit, bilateral veto, `WORLD_ARCH.` §7 / CONSTRAINTS S8). Nothing
  real-content ships here before those clear.
- **Phase R3 — unattended autonomy (gated).** The browser-runtime-at-origin that steps rooms while
  no human is present, on the owner's key, within budget, with the pull-only ledger and
  digest-at-rest guardrails. `WORLD_ARCH.` Layer 6 / roadmap Phase 4. Needs the Phase-3 turn-logic
  extraction first.

---

## 12. Binding-document implications *(drafted for founder ratification — not applied here)*

Per the standing norm, a substantive change to a binding doc is surfaced, not made unilaterally.
This direction would need:

- **The §1 framing decision — DECIDED (hybrid, staged); binding wording still owed.** The founder
  chose public-by-default + a private room type (2026-07-22). This is a charter-level statement
  about what the world *is*, so it belongs in `STATEMENT.md` / `CONSTRAINTS.md` — but the *wording*
  is a substantive binding amendment and is **not written yet** (drafted here, awaiting explicit
  sign-off per the amendment norm). Specifically: `STATEMENT.md`'s "no privacy frame / moved past
  the two-person world" needs a **carve-out** stating that a designated **private room type** is
  *not* public seed data and carries the two-person world's protections.
- **Because hybrid won, ratify (scoped to the private room type):** the already-drafted
  `CONSTRAINTS.md` **S8** (relational harm), **P11** (representation self-governed), and the **§5
  world anti-engagement amendment** (no turn-timers, no "partner is waiting," no completion
  pressure — the intimate-turn loop is the strongest pull) — each **scoped to the private surface**,
  since the public surface keeps the art frame — and add the `REQUIREMENTS.md` world-data section
  (room artifact store, shared-room keys with the security-review prerequisite, autonomy
  guardrails, a relational adverse-event path). These are currently marked *"binds only upon
  founder ratification via §6."*
- **REQUIREMENTS §1.4 stays literally true** under the "agents write the world, humans write their
  practice" rule (`WORLD_ARCH.` §5): the world log and room artifacts are a *new* store class agents
  may author; practice stores stay human-authored and provenance-free.
- **New `KNOWN_RISKS.md` entries** for: the event log as a growing personal-content store; the
  moderator/turn-scheduler as a new (soft) control surface; the research sub-agent's egress; and —
  for Phase R2 — partner portrayal, the clone as a private→shared bridge, cross-user key MITM,
  metadata linkage, and forward secrecy.
- **Anti-engagement, enforced mechanically** (§6): the slow-when-unattended throttle and the
  pull-only-never-notified posture are the world's version of the suite's no-streaks/no-DAU stance.
  They are guardrails, and where a guardrail is soft (a model obeying a prompt) it is labeled soft,
  per the L30/L40 honesty convention.

---

## 13. What the v0.1 prototype ships (`rooms.html`)

A single-file, single-device, BYOK prototype that makes the model tangible and playable alone:

- **Onboarding** (steps 1–5): name, values, a **hierarchical** goals tree, calendar events, tasks
  tagged to goals — each captured as an event on the world log.
- **The world log**: append-only, event-sourced; the current state is a fold; a **World-log tab**
  shows the raw log and lets you compact old spans into a summary event, and a "Show LLM context"
  action renders exactly what an agent in a room sees (the "context, compressed" made visible).
- **Rooms**: a map of rooms; each screen is a room type; you can **add a second room of a type**
  (e.g. a second goals room); per-room and per-room-type **permissions**; **roles** with default
  room access.
- **Actors**: the owner, plus local **friend** and **partner** actors and **agent** actors
  (clones); an **act-as** switch so you can take a turn as any actor you own — this is how bullets
  6–7 are modeled on one device without any network sharing.
- **Clones + time travel**: spawn a clone from the log at HEAD or at an earlier point (the naming
  handshake, reused from Kin's model); a read-only **older-self view** by folding the log up to a
  chosen event.
- **A turn-based room** with a **BYOK agent**: a human-present turn responds immediately; an
  unattended room advances slowly on a throttle within a **token budget** (metered, above a
  subsistence floor); **background agents stay in their room**; a **cheap-model moderator** picks
  the next speaker when a room has >2 agents or 1 agent + 2 humans; a **thinking/typing indicator**
  shows who holds the floor.
- **A research agent** trigger in conversation: a bounded web-search→synthesize loop (Anthropic's
  `web_search` tool, with citations) that leaves a cited research artifact in the room.
- Wired into the suite properly: `window.HC` manifest (world log + room stores + actions), opt-in
  encrypted sync of the world store, `llms.txt`, the PWA precache, and the usage/hub surfaces as
  appropriate.

**Explicitly NOT in v0.1:** networked cross-account friend/partner (Phase R2, gated); sharing a
clone with a *remote* partner (gated); unattended autonomy runtime (Phase R3); any agent write to a
practice store; any data published as public seed data. The prototype is a **model of the world**,
not the world with two real people in it.

---

## 14. Open questions for the founder

1. **The framing (§1) — DECIDED (founder, 2026-07-22): hybrid, staged.** Public by default + a
   private room *type* that carries the full consent/crypto/relational apparatus. What remains is
   ratifying the binding-doc *wording* (§12: a `STATEMENT.md` carve-out for the private room type +
   `CONSTRAINTS.md` S8/P11/§5-world scoped to it) before any cross-user content ships.
2. **Is Rooms a new surface or a mode over the existing suite?** (`WORLD_ARCH.` §10 Q2.) The
   prototype is a standalone `rooms.html` (like `kin`/`govern` — each world slice shipped standalone
   first); the eventual integration could fold the practice pages in as room types.
3. **How much of the existing per-app state should the world log import?** The prototype keeps the
   world log self-contained; optionally it could seed from `climb` goals, `remind` tasks, etc. Seed
   from existing stores, or start clean?
4. **Moderator model tier.** A small fast model for routing is the intent (cost + latency); confirm
   BYOK on the shared key is acceptable for that role, or whether routing should be deterministic
   (round-robin / rule-based) to avoid any model call for turn arbitration.
5. **Token-budget defaults.** What subsistence floor and unattended-throttle feel right, and should
   the budget be per-world, per-room, or per-role by default?
