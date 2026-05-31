'use strict';
/* Hill Climbing — reminder prompts.
 *
 * Hand-authored, rotated at send time. The voice is deliberate: invitational,
 * non-striving, unhurried. No streak-shame, no urgency, no metrics, no
 * "you haven't sat in N days." A reminder here is an open door, never a nudge
 * to perform. (See CONSTRAINTS.md — engagement mechanics are rejected.)
 *
 * Add freely. More entries = longer before any repeat.
 */

// Morning: a gentle invitation to begin the day with a little stillness.
const MORNING = [
  "A few minutes of stillness, if you'd like. Nothing to reach for — just somewhere to begin.",
  "The morning is wide. You're welcome to sit a while before it fills.",
  "No need to arrive anywhere. A short sit, just to feel where you already are.",
  "Stillness is here whenever you turn toward it. Maybe now, maybe soon.",
  "You could begin the day by doing a little less. A quiet sit is enough.",
  "Settling in for a few minutes asks nothing of you but your company.",
  "A small clearing before the day's noise — sit if it feels right.",
  "Let the first thing be unhurried. Stillness keeps no schedule.",
  "However you slept, however you feel — you're welcome to sit with it.",
  "The cushion isn't going anywhere. Come when you're ready, even briefly.",
  "A moment to let the morning be quiet before it becomes busy.",
  "Nothing to fix this morning. Just a little stillness, if you want it.",
  "Begin gently. A few slow minutes are their own reward.",
  "You don't have to earn rest. Sit a while, simply because you can.",
  "The day can wait a few breaths. Settle in, if you're willing.",
  "Stillness asks for no streak and keeps no score. Just sit, if it suits you.",
];

// Evening: a single open question to sit with — to notice, not to solve.
const EVENING = [
  "Where in your body are you still holding the day? Can you let a little of it go?",
  "What did you give your attention to today — and was it where you wanted it?",
  "Is there something you can set down before sleep, even just for tonight?",
  "What felt like enough today? Let yourself notice it.",
  "Where did you rush, and what might unhurried have felt like?",
  "What are you carrying that isn't yours to carry?",
  "When were you most here today? What was that like?",
  "What would it feel like to be gentle with yourself right now?",
  "Is there a tension you've stopped noticing? Where is it?",
  "What quietly went well today that you didn't pause to mark?",
  "What is asking for your attention — and does it need it tonight?",
  "Where can you soften, just slightly, as the day closes?",
  "What sound, or silence, do you notice if you stop and listen?",
  "What did you make harder than it needed to be? Can you forgive that?",
  "If nothing needed doing right now, what would you feel?",
  "What are you ready to let the day take with it?",
];

module.exports = { MORNING, EVENING };
