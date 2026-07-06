# The Gate

*Belay №1 · on the ethics of locking someone out of a tool built to help them
reach higher.*

Here is a decision we will actually have to make.

Hill Climbing watches you sit still and answers the stillness with quiet — the
drone thins out, a bell sounds now and then, the reward for arriving is space
rather than noise. Now suppose that one day the system, or something next to it,
can tell that you are the kind of person for whom this is likely to go badly. Not
certainly. Likely. For some people, sitting with the self is not a settling; it
is a trapdoor. The stillness deepens a dissociation instead of soothing an
anxiety. The place they disappear to is not a place they come back from lighter.

Suppose we can flag that — call it a susceptibility signal — with the same shrug
of confidence a credit model has when it declines a loan. Should we lock the
gate?

The question sounds like it answers itself in the direction of caution. It
doesn't. Locking the gate is an act with its own body count, and to see the
bodies you have to climb a little.

## The first rope: how lenders learned to say no

Banks decline people for a living, and over a century of doing it badly they
were forced to learn a few things. You can price risk — that's allowed — but you
may not use certain inputs to do it (race, sex, age; the Equal Credit
Opportunity Act). You must send an *adverse-action notice*: if you decline
someone, you have to tell them, and tell them *why*. And you can be liable even
when your model never names a forbidden category, if it produces a forbidden
pattern — disparate-impact doctrine catches the proxy you didn't know you were
using.

Sit with what that framework actually chose. It chose a *less accurate* model
that protects dignity over a *more accurate* one that leans on a forbidden proxy.
Predictive power is not the highest value; it can be overruled. If we build a
susceptibility flag, underwriting hands us a bill: the user is owed notice that
we flagged them, a reason they can read, a way to contest it, and an audit that
our "susceptible" is not quietly tracking *poor*, or *mentally ill*, or *already
marginalized* — the people most likely to move in ways a motion detector reads as
agitation, most likely to write in ways a model reads as risk. And we have to be
willing to accept a worse-performing filter to keep it honest. A flag we can't
explain to the person it lands on is not a safety feature. It's redlining with a
candle lit next to it.

One more gift from the lenders, the ugly one: declining isn't neutral. Deny
someone a bank loan and they don't stop needing money — they go to the payday
lender. Lock a vulnerable person out of a careful tool and they don't stop
reaching for something; they reach for a worse one, unregulated, with no bell and
no idle-pause. **The gate doesn't remove the risk. It exports it somewhere we
can't see.**

## The second rope: how doctors learned to withhold

Medicine says no too — withholds the opioid, the stimulant, the intensive
retreat — and its framework triangulates against the lender's in a useful way.
The doctor's no lives inside informed consent, a duty of care, and the standard
of what a reasonable practitioner would do. But medicine counts a cost the lender
doesn't: the harm of *withholding*. The opioid backlash didn't just stop
overprescription; it left real people in real pain, cut off, and some of them
went to the street too. Undertreatment is a diagnosis.

And notice medicine's answer to "this person is at elevated risk" is almost never
*deny*. It's *titrate and monitor* — a smaller dose, watched more closely,
adjusted. Applied to us, that reframes the whole question. The choice was never
lock-out versus open-door. It's a dial: shorter sits, gentler audio, a check-in
after, a human on the other end, a resource surfaced *beside* the practice rather
than a door shut in front of it. Binary was a failure of imagination.

Medicine also names the shadow we most need named. *Defensive medicine* is when a
doctor orders the test or withholds the treatment not for the patient but to
protect himself from being sued. It optimizes the provider's risk and calls it
the patient's safety. That is the exact shape of the temptation here — and it's
worth saying plainly, because it's the version of "safety" that would feel most
like virtue while we did it.

## The rope is made of the same thing both times

Here's the part that should unsettle a builder. Both frameworks that let us
reason about this at all — underwriting, prescribing — exist because someone was
regulated into them. Adverse-action notices exist because of redlining.
Prescribing standards and informed consent exist because of Tuskegee,
thalidomide, a long ledger of harm that got encoded into rules only after the
fact. We can only think clearly about our decision by borrowing tools forged in
fields that already had their disasters.

Wellness technology has the same harm surface and none of the tools. There is no
adverse-action notice for being quietly downranked by a mood-detecting app. There
is no disparate-impact audit for a susceptibility flag. Right now the only thing
standing between this project and that harm is a constant named `TIER` at the top
of a file and a document called CONSTRAINTS.md — which is to say, us, regulating
ourselves. That is more than most build, and it is exactly as fragile as it
sounds. Self-regulation is the thing every industry swears is sufficient in the
years right before it is regulated for cause.

Could a regulator do better? Eventually, maybe — but regulators lag the thing
they regulate by about a generation. The FDA is still working out how to think
about software that behaves like a medical device. A regulator is only equipped
when it has real technical talent instead of only lawyers, a mandate that can
adapt instead of ossifying, a channel for hearing about harms (medicine has
adverse-event reporting; we have nothing like it), and enough insulation from
capture — because the only people who understand this technology well enough to
govern it are, mostly, the people building it. There is no clean fix for that
last one. Which means for a while yet the regulator is going to be a person
looking in a mirror.

## The mirror

So look in it. What should we assume about the quality of our own judgment here?

Worse than it feels — and for reasons that don't dissolve with good intentions.

We are inside the frame. The builder deciding who is "too susceptible" is the
same builder who benefits when the tool is used and who is exposed when it hurts
someone. Notice which way that pressure pushes. It does not push toward the open
door.

We have no base rates. Underwriters have a century of default data; doctors have
trials and mortality tables. We have a couple of years of people using tools like
this and almost no ground truth about the harm we'd be claiming to predict. We
would be building a classifier for a thing we can't yet measure and calling its
output a fact.

And our feedback is censored in one direction. If we let someone in and it goes
badly, we might hear about it — that's the error that generates a story. If we
lock someone out and they're harmed elsewhere, or would have been fine, or needed
exactly this and lost it, we hear nothing. The error we can see is louder than
the error we can't, and a system that learns only from the errors it can see will
drift, steadily and self-righteously, toward locking more gates. It will feel
like getting safer. From the inside, it will look like care.

## The move

So, Monday. We don't build the gate. We build the dial.

No susceptibility signal locks anyone out. At most it changes defaults — shorter,
gentler, a check-in offered, a real resource placed beside the practice — and
every one of those changes is visible to the user, reversible by the user, and
explained in a sentence they can read. If we ever can't write that sentence, the
feature isn't ready. Before we build any classifier we build the thing that tells
the person they were classified and lets them say *you're wrong about me*. The
appeal ships before the judgment.

And the tripwire, because a decision without one is just a mood: if we ever find
ourselves reaching for a hard lock-out, or building a flag we can't explain to
the face it lands on, or noticing that our safety metrics only ever move one
direction — that's not safety maturing. That's the mirror fogging over. The
humility was never decoration on this decision. It was the rope.

---

*What's your move — and what's your tripwire? Reply with your climb.*
