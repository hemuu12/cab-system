import * as Ably from 'ably';
import { createHash } from 'crypto';
import webpush from 'web-push';
import PushSubscription from '../models/PushSubscription.js';

export const ADMIN_ACTIVITY_CHANNEL_PREFIX = 'wondertravel:admin-activity:';

let client;
let pushReady = false;

export const pushEndpointHash = endpoint => createHash('sha256').update(endpoint).digest('hex');

export function webPushPublicKey() {
  const enabled = String(process.env.PWA_PUSH_ENABLED || '').toLowerCase() === 'true';
  const publicKey = String(process.env.WEB_PUSH_PUBLIC_KEY || '').trim();
  const privateKey = String(process.env.WEB_PUSH_PRIVATE_KEY || '').trim();
  if (!enabled || !publicKey || !privateKey) return '';
  if (!pushReady) {
    webpush.setVapidDetails(
      String(process.env.WEB_PUSH_SUBJECT || 'mailto:operations@wondertravel.online'),
      publicKey,
      privateKey
    );
    pushReady = true;
  }
  return publicKey;
}

export function adminRealtimeCapability(sections = []) {
  return Object.fromEntries(
    sections
      .filter(section => !['dashboard', 'audit'].includes(section))
      .map(section => [`${ADMIN_ACTIVITY_CHANNEL_PREFIX}${section}`, ['subscribe']])
  );
}

function realtimeClient() {
  const key = String(process.env.ABLY_API_KEY || '').trim();
  if (!key) return null;
  if (!client) client = new Ably.Rest({ key });
  return client;
}

/** Best-effort delivery: an unavailable realtime provider must never fail a customer action. */
async function publishRealtimeActivity(activity) {
  const ably = realtimeClient();
  if (!ably) return false;
  try {
    const section = String(activity?.section || '').trim().toLowerCase();
    if (!section) return false;
    await ably.channels.get(`${ADMIN_ACTIVITY_CHANNEL_PREFIX}${section}`).publish('activity', activity);
    return true;
  } catch (error) {
    console.error('Admin realtime notification failed:', error?.message || error);
    return false;
  }
}

const pushBody = activity => ({
  booking: activity.title === 'Booking cancelled'
    ? 'A customer cancelled a booking. Open Fleet operations for details.'
    : 'A new booking is ready for review.',
  inquiry: 'A new customer inquiry is ready for review.',
  feedback: 'A new guest review is waiting for moderation.',
  user: 'A new customer account was created.'
}[activity.type] || 'New customer activity is ready for review.');

const adminCanReceive = (user, section) => {
  if (!user || user.role !== 'admin' || !user.active || user.accountStatus === 'blocked') return false;
  if (user.adminRole === 'super_admin') return true;
  return !Array.isArray(user.adminSections) || user.adminSections.includes(section);
};

async function sendPushActivity(activity) {
  if (!webPushPublicKey()) return false;
  const section = String(activity?.section || '').toLowerCase();
  const subscriptions = await PushSubscription.find({ active: true }).populate({
    path: 'user', select: 'role adminRole adminSections active accountStatus'
  });
  const eligible = subscriptions.filter(subscription => adminCanReceive(subscription.user, section));
  if (!eligible.length) return true;

  const payload = JSON.stringify({
    eventId: activity.id,
    title: activity.title,
    body: pushBody(activity),
    url: `/admin?section=${encodeURIComponent(section)}`,
    tag: activity.id,
    appBadge: true
  });
  await Promise.allSettled(eligible.map(async subscription => {
    try {
      await webpush.sendNotification({
        endpoint: subscription.endpoint,
        expirationTime: subscription.expirationTime?.getTime() || null,
        keys: { p256dh: subscription.keys.p256dh, auth: subscription.keys.auth }
      }, payload, { TTL: 60 * 60, urgency: 'high' });
      subscription.lastSuccessAt = new Date();
      subscription.failureCount = 0;
      await subscription.save();
    } catch (error) {
      if ([404, 410].includes(error?.statusCode)) {
        await PushSubscription.deleteOne({ _id: subscription._id });
        return;
      }
      await PushSubscription.updateOne(
        { _id: subscription._id },
        { $set: { lastFailureAt: new Date() }, $inc: { failureCount: 1 } }
      );
    }
  }));
  return true;
}

/** Publishes through both transports; either one may be disabled independently. */
export async function publishAdminActivity(activity) {
  const results = await Promise.allSettled([
    publishRealtimeActivity(activity),
    sendPushActivity(activity)
  ]);
  return results.some(result => result.status === 'fulfilled' && result.value);
}

export async function createAdminRealtimeToken(user, sections = []) {
  const ably = realtimeClient();
  if (!ably) return null;
  const capability = adminRealtimeCapability(sections);
  return ably.auth.requestToken({
    clientId: `admin:${user._id}`,
    capability: JSON.stringify(capability),
    ttl: 60 * 60 * 1000
  });
}
