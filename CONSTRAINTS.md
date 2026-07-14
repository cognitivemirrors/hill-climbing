# Hill Climbing — Constraint Specification (Draft v0.1)

**Purpose.** This document translates the three founding values — *care*, *safety*, and *balanced power distribution* — from abstract commitments into specific, observable, bindable rules. Without this translation the values are decorative. With it, a team member, board, or external auditor can determine whether a given product or business decision violates the founding intent.

This is a working draft. Items marked **[DECISION]** are points where the founder must choose a value or position. Items marked **[OPEN]** are deferred to a later layer of structural work (charter, board composition, governance design). Numbers are placeholders calibrated by domain practice and prior research; they are starting points for negotiation, not final commitments.

The document binds the company. To amend, see §6.

---

## 1. Care

### 1.1 Definition (this domain)

For Hill Climbing and the broader category of contemplative / wellness technology, *care* means **active commitment to user well-being as the primary measured outcome of the product**, distinct from engagement, growth, or revenue. It includes:

- Outcomes-orientation, not engagement-orientation
- Respecting user autonomy (the user's right to stop, leave, change their mind)
- Acknowledging the product's limits (where we are not the right tool)
- Investing in the user's life beyond the app, not their time inside it

### 1.2 Operational commitments

C1. **Outcome metrics dominate engagement metrics in product reviews.** Subjective well-being self-reports, sleep quality (where relevant), anxiety reduction self-reports, and qualitative open-text feedback are reviewed at every product retrospective with equal or greater weight than DAU/MAU/session-length.

C2. **Engagement-extractive patterns are prohibited.** No streak-shame, loss-aversion notifications, slot-machine variable rewards, or any mechanic whose primary purpose is to increase time-in-product without a corresponding outcome benefit.

C3. **Stopping is honored.** Account closure and full data export complete within **[DECISION: target hours, suggest 24]** hours of request. No dark patterns. No re-engagement campaigns triggered by deletion.

C4. **Limits are stated.** Where the product is not the right tool (active crisis, severe symptoms, populations we don't serve well), product copy says so plainly and links to better resources.

C5. **Adverse events are captured by default and reviewed by a clinician.** In-product channel (already implemented as the "this didn't feel right" link); standing review process; published incident rate.

C6. **Data earns its place by user value.** Every datum the product stores or transmits must trace to a value the user would recognise and choose. Data retained on the theory that it "might be useful later," or that serves the operator without serving the user, is rejected. The full data-practices standard — value, then consent scaled to audience, then controls proportional to risk — is specified at §3.2 P1 and in `REQUIREMENTS.md §1`.

### 1.3 Bindable metrics

| Metric | Target |
|---|---|
| % of users reporting positive subjective change at 30 days | ≥ **[DECISION: 50%?]** |
| Adverse-event rate per 1,000 active users per quarter | ≤ **5%** (Britton baseline) |
| Time from data-export request to delivery | ≤ 24 h |
| Time from adverse-event report to written response | ≤ 72 h |
| Engagement metrics in promotion criteria for product roles | 0 |

### 1.4 Decision rules

- A feature that improves engagement metrics but does not improve outcome metrics is **rejected**.
- A feature that introduces a habit-forming mechanic without a documented well-being rationale is **rejected**.
- A data practice that does not trace to a user-recognised value is **rejected**, on the same footing as an engagement-only feature (C6).
- A user complaint receives written response within 72 hours, with the response reviewed by a non-product team member.
- Onboarding ramp: new users practice within reduced limits for the first 14 days regardless of staircase position.

---

## 2. Safety

### 2.1 Definition (this domain)

*Safety* means **avoiding psychological, physical, or product-malfunction harm to users**, with particular attention to populations at known elevated risk (history of dissociation, panic disorder, PTSD, psychosis, severe anxiety, photosensitive epilepsy).

### 2.2 Operational commitments

S1. **Pre-screening before regular practice.** First-run questionnaire identifying high-risk profiles. High-risk users see different defaults: shorter duration cap, no auto-escalation, surfacing of professional resources, optional refusal of certain modes.

S2. **Clinical advisor with veto.** At least one trauma-aware clinician on staff or under formal contract, with explicit veto authority on changes affecting safety-relevant features (duration caps, escalation rules, screening, crisis pathways). Not advisory in name — voting in fact.

S3. **Hard caps that bind regardless of user request.** Round duration ceiling: 5 min. Daily session count ceiling: **[DECISION: suggest 3]**. Cool-down between sessions: **[DECISION: suggest 1 hour for new users, 0 for established]**.

S4. **Always-available exit.** Esc, click-anywhere, or visible Stop button aborts a round neutrally with no penalty. No "are you sure" dialog. No streak loss.

S5. **Visual / audio constraints.** No flashing in the 3–30 Hz photosensitive range. No sustained binaural-beat protocols beyond evidence-supported limits. Audio fade-in always present.

S6. **Adverse-event monitoring as a continuous obligation.** Quarterly publication of incident rate. Rate above 5% triggers automatic feature freeze and root-cause analysis.

S7. **Crisis pathway.** Visible link in the product to local emergency resources (988 in US; localized at Tier 3); easy "pause for two weeks" mode; warm-handoff option for users who explicitly request connection to therapy services.

### 2.3 Bindable metrics

| Metric | Target |
|---|---|
| Round duration max | 5 min |
| Daily session count max | **[DECISION: 3]** |
| % of features shipping with documented safety review | 100% |
| Adverse-event rate per 1,000 active users per quarter | ≤ 5% |
| % of adverse events with documented clinical review | 100% |
| % of features in monitoring-mode prior to general release | 100% |
| Time from camera-disconnect or product malfunction to user notification | < 2 s |

### 2.4 Decision rules

- Any feature touching duration, escalation, screening, or crisis-handling requires written clinical sign-off.
- Adverse-event rate exceeding 5% in any quarter triggers an automatic freeze on new feature releases until root cause is identified and addressed.
- New features ship in monitoring mode (small, observed user population) before general release.
- Any new audio or visual mechanic is reviewed for photosensitive / hypnotic / dissociative risk before launch.
- Pre-screened high-risk users are never auto-escalated past **[DECISION: 60s]** round duration without explicit confirmation.

---

## 3. Balanced Power Distribution

### 3.1 Definition (this domain)

For Hill Climbing and care/wellness technology generally, *balanced power distribution* means **resisting the natural tendency of digital products to concentrate power in the operator** — over user attention, user data, user behavior, the broader market, and within the company itself. The constraint applies across five surfaces:

- **Power over user attention** (lock-in, addiction, network-effect captivity)
- **Power over user data** (proprietary capture, surveillance, undisclosed use)
- **Power over user behavior** (manipulation, gamification beyond the user's interest)
- **Power over the market** (monopoly via interoperability denial, bundled lock-in)
- **Power within the company** (founder/investor concentration; employee voicelessness)

### 3.2 Operational commitments

P1. **Data practices meet a three-part standard — value, consent, control.**
   - **Value.** Every datum stored or transmitted serves a value the user would choose; data kept "in case it's useful" is rejected (see C6).
   - **Consent, scaled to audience.** The user understands what is collected and can decline, and the *formality* of consent scales with who is affected — implicit for a solo developer, informal-but-explicit for friends & family, formal and documented for external users.
   - **Control, proportional to risk.** Users own their data. Export is comprehensive, machine-readable, completed within 24h. Deletion is real (not soft-delete with retained shadow). No sale, no third-party sharing, no behavioral advertising. The rigor of these controls scales with data sensitivity × user reach.

P2. **Open-source the safety research.** Eval methods, harm-detection techniques, and adverse-event analyses are published openly and shared with the field. Capability research can remain closed; safety research cannot.

P3. **Interoperability where technical.** Where standards exist (export formats, protocols, federated identity), we conform. Where they don't, we publish ours.

P4. **No network-effect lock-in beyond 30 days.** A user can leave with their data and lose nothing of value. The product earns retention by being good, not by being inescapable.

P5. **Capped returns on outside capital.** Outside investors hold non-voting preferred stock with a cap on returns of **[DECISION: 5×?]**. Voting / control rights are held by the **[DECISION: perpetual purpose trust to be established]**, not by capital providers.

P6. **No advertising-based revenue.** Period. Revenue from the user, for the user.

P7. **Worker governance.** Employees collectively hold a substantial share of economic interest **[DECISION: target ≥30% by Year 5]** and have voting rights on internal governance (compensation policy, hiring norms, working conditions).

P8. **User council with binding rights on bounded decisions.** Changes to the safety-relevant constraints in §2, the data policies in P1, or the governance structure in §6 require ratification by a structured user-council process. **[OPEN: council composition mechanism]**

P9. **External accountability board with publication authority.** Independent ethicists, clinicians, and policy experts. Funded outside the company (foundation grant or revenue earmark) so it cannot be defunded into compliance. Authority to commission audits and publish findings.

P10. **Investor concentration ceiling.** No single investor holds more than **[DECISION: 20%?]** of economic interest. Diverse funding stack required by charter.

### 3.3 Bindable metrics

| Metric | Target |
|---|---|
| Time from data-export request to delivery | ≤ 24 h |
| % of safety research published openly | 100% |
| Max economic interest held by any single investor | ≤ 20% |
| Max revenue concentration from any single customer | ≤ **[DECISION: 10%?]** |
| Employee economic ownership share | ≥ 30% by Year 5 |
| % of safety/care decisions reviewed by external accountability board | 100% |
| User-council convenings per quarter | ≥ 1 |
| Cap on outside-investor returns | **[DECISION: 5×?]** |

### 3.4 Decision rules

- No feature that creates user-data lock-in beyond a 30-day export window.
- A data practice that fails the value test in P1 — data collected without a user-recognised benefit — is rejected, regardless of operator convenience.
- No revenue mechanic that depends on user attention extraction (ads, sponsored content, attention-tracking analytics sold to third parties).
- Any change to data policies, the cap structure, or the user-council mechanism requires both supermajority of governing body **and** user-council ratification.
- Any equity round that would push a single investor over the 20% ceiling is rejected.
- Any clinical-advisor or external-accountability-board funding source that creates dependency on a single donor must be diversified within 12 months.

---

## 4. Tensions Between Constraints

The three constraints will conflict in real situations. The conflict resolution rules:

T1. **Safety binds first.** Where care-as-flexibility conflicts with safety-as-cap, safety wins. (E.g., user requests longer rounds than the cap allows: cap holds, even if user reports the cap as paternalistic.)

T2. **Care binds second, within safety bounds.** Where power-distribution-as-uniformity conflicts with care-as-individual-attention, care wins for the user-facing decision while power-distribution shapes the *governance* of the decision. (E.g., a high-risk user gets gentler defaults, but the decision rule that produces those defaults is reviewed by the user council.)

T3. **Power distribution shapes how decisions are made, not what they are.** Where power-distribution-as-distributed-authority conflicts with safety-as-clinical-authority, the clinical authority decides the answer; the user council decides how the question is framed and reviewed.

T4. **Visible conflict beats hidden compromise.** When the constraints genuinely conflict, the conflict is documented publicly (in the next quarterly transparency report). Hidden trade-offs erode trust faster than visible disagreements.

---

## 5. Anti-Patterns Explicitly Rejected

The following patterns are common in tech and explicitly off-limits regardless of business pressure:

- **Engagement metrics as success criteria.** DAU/MAU as a north star. Time-spent as a goal.
- **Streak mechanics that punish absence.** Streak counts displayed prominently, loss-aversion notifications around them.
- **Variable-reward schedules.** Random rewards designed to exploit operant conditioning.
- **Dark patterns in account closure or data export.** Multi-step deletion flows. "Are you sure?" past three layers. Friction by design.
- **Behavioral data sold to third parties.** Even anonymised, even aggregated.
- **Advertising revenue.** Even "ethical" advertising. Even "well-targeted." No.
- **Capability-arms-race pressure shaping safety decisions.** "We have to ship before competitor X" is not a justification for relaxing a safety threshold.
- **Founder-CEO indefinite tenure.** Term limits on the CEO role: **[DECISION: 7 years?]** with renewable approval from governing body.

---

## 6. Mission Lock-In and Amendment

This document binds the company. It is not a values statement — it is a constraint specification with referenced metrics and decision rules.

To amend any clause:

A1. The amendment is proposed in writing with documented rationale.

A2. A 30-day public comment period during which users, employees, the user council, and the external accountability board may respond.

A3. The clinical advisor reviews safety-relevant clauses for any amendment touching §2 or related metrics.

A4. The governing body votes. Passage requires **[DECISION: supermajority — suggest 75%]**, including the clinical advisor's vote where safety-relevant.

A5. The amendment, the rationale, and the dissenting positions are published in full.

A6. **One-way ratchets.** Certain clauses tighten over time and cannot be loosened without a much higher bar. Specifically: the 5% adverse-event ceiling, the 5× return cap, the 20% investor concentration ceiling, the no-advertising commitment. Loosening any of these requires unanimous governing body vote plus user-council ratification.

---

## 7. Open Questions Carried Forward

These are deferred to subsequent structural work and are flagged here so they aren't lost:

Q1. **Governing body composition.** Who exactly votes? In what proportions? How are seats filled?

Q2. **Clinical advisor selection and scope.** Specific clinician identification; contract terms; veto scope.

Q3. **User council structure.** How members are selected, how decisions are taken, how representativeness is preserved.

Q4. **External accountability board composition.** Specific seats; funding mechanism; publication cadence.

Q5. **Perpetual purpose trust establishment.** Trustees, beneficiaries, transition timeline.

Q6. **Co-founder requirement.** Whether to ship Tier 1 with a solo founder or require minimum disciplinary diversity (clinician + technologist + ethicist) on the founding team.

Q7. **Revenue model.** Direct payment; donation; subscription; sliding scale. Each carries different power-distribution implications.

Q8. **Pre-screening questionnaire content.** Specific items, validation approach, false-positive vs. false-negative trade-off.

Q9. **Crisis pathway operationalisation.** Localised resources; warm-handoff partners; consent flow.

Q10. **Tier transition triggers.** What user-pool size, what revenue level, what time elapsed advances TIER from 0 → 1 → 2 → 3? Set quantitatively before they are reached.

---

## 8. Status

**Version:** 0.1 (draft)
**Author:** First draft assembled by AI (Claude Sonnet 4.6) at founder request, October 2025.
**Status:** Working draft. Not yet binding. Becomes binding upon ratification by founding governing body at incorporation.
**Revision (founder-directed):** C6, the §1.4 data decision rule, §3.2 P1 (rewritten as the value → consent → controls standard), and the §3.4 data decision rule were added/realigned to mirror the standard-first data policy in `REQUIREMENTS.md §1`. No existing commitment was loosened — export ≤ 24 h, real deletion, and the no-sale / no-sharing / no-behavioural-ads rules all carry forward as the *control* leg.
**Review cadence (post-ratification):** Annual full review; quarterly metric reporting; immediate review on any adverse-event spike.

This is scaffolding, not the building. It is more useful as something to argue with than something to accept.
