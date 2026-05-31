'use strict';
/* Hill Climbing — Web Push sender (runs in GitHub Actions; no third party).
 *
 * Sends one gentle prompt to every stored push subscription, signed with
 * VAPID. The receiving half lives in sw.js (the 'push' handler).
 *
 * Required GitHub Actions secrets:
 *   VAPID_PRIVATE_KEY  — private half of the VAPID keypair  (KEEP SECRET)
 *   PUSH_SUBSCRIPTION  — a PushSubscription JSON copied from the app, OR a
 *                        JSON array of them for multiple devices
 * Optional secrets:
 *   VAPID_PUBLIC_KEY   — overrides the public key baked in below
 *   VAPID_SUBJECT      — mailto: or https: contact for the push service
 *
 * Usage:  node send.js [morning|evening]
 */

const webpush = require('web-push');
const { MORNING, EVENING } = require('./prompts');

const mode = (process.argv[2] || 'morning').toLowerCase() === 'evening' ? 'evening' : 'morning';

// The VAPID PUBLIC key is not secret — it also ships in the web client. Kept
// here as a default so only the PRIVATE key + subscription must be secrets.
const PUB = process.env.VAPID_PUBLIC_KEY
  || 'BKDvc7yIpMeGn5bcP3udXgGkO1l0Kaw3EKHLFnPxRg8GLRLqlpqBIx9mWGn794aBo_Fh2BkHJ_Kg-09GrZuqByU';
const PRV = process.env.VAPID_PRIVATE_KEY;
const SUBJECT = process.env.VAPID_SUBJECT || 'mailto:chan.m.kevin@gmail.com';
const subsRaw = process.env.PUSH_SUBSCRIPTION;

// Before setup is finished there's nothing to send — exit cleanly so the
// scheduled Action shows green instead of emailing a failure every day.
if (!subsRaw || !subsRaw.trim()) {
  console.log('No PUSH_SUBSCRIPTION configured yet; nothing to send.');
  process.exit(0);
}
if (!PRV) {
  console.error('Missing VAPID_PRIVATE_KEY secret.');
  process.exit(1);
}

webpush.setVapidDetails(SUBJECT, PUB, PRV);

let parsed;
try {
  parsed = JSON.parse(subsRaw);
} catch (e) {
  console.error('PUSH_SUBSCRIPTION is not valid JSON.');
  process.exit(1);
}
const subs = Array.isArray(parsed) ? parsed : [parsed];

const pool = mode === 'evening' ? EVENING : MORNING;
const prompt = pool[Math.floor(Math.random() * pool.length)];

const payload = JSON.stringify({
  title: mode === 'evening' ? 'Evening reflection' : 'A moment of stillness',
  body: prompt,
  url: mode === 'evening' ? '/reflect.html' : '/meditate.html',
  tag: 'hc-' + mode,
});

(async () => {
  let sent = 0, expired = 0, failed = 0;
  for (const sub of subs) {
    try {
      await webpush.sendNotification(sub, payload, { TTL: 3600 });
      sent++;
    } catch (err) {
      // 404/410 means the browser dropped this subscription — the device
      // must re-subscribe (and you re-paste PUSH_SUBSCRIPTION).
      if (err.statusCode === 404 || err.statusCode === 410) {
        expired++;
        console.warn('A subscription has expired; re-subscribe on that device.');
      } else {
        failed++;
        console.error('Send failed:', err.statusCode, String(err.body || err.message || '').slice(0, 200));
      }
    }
  }
  console.log(`mode=${mode} sent=${sent} expired=${expired} failed=${failed}`);
  // Only hard-fail if every send errored for a real reason (not just expiry).
  if (failed > 0 && sent === 0) process.exit(1);
})();
