# RFC-001: Web push notifications and app badges

- Status: Proposed
- Depends on: RFC-000 foundation
- Target phase: 1

## Summary

Add opt-in Web Push for booking events using VAPID, store subscriptions per
user/device, deliver through a Mongo-backed outbox worker, and keep installed
app badges synchronized with an unread notification count.

The current service worker already knows how to display a push payload and open
its destination. This RFC supplies the missing subscription, delivery,
preference and unread-state backend.

## User-visible events

Initial transactional event set:

- booking confirmed;
- driver assigned or changed;
- pickup reminder;
- booking status changed;
- booking cancelled;
- payment confirmed or failed when online payment exists.

Marketing notifications are a separate preference and default to off. Passenger
names, phone numbers, exact home addresses and payment information must not
appear in notification bodies.

## Dependencies and configuration

Add the maintained `web-push` package to the server.

```text
WEB_PUSH_PUBLIC_KEY=
WEB_PUSH_PRIVATE_KEY=
WEB_PUSH_SUBJECT=mailto:operations@wondertravel.in
PWA_PUSH_ENABLED=false
PUSH_WORKER_POLL_MS=2000
PUSH_MAX_ATTEMPTS=8
```

Generate VAPID keys once per environment and store private keys only in the
secret manager. Key rotation requires temporarily supporting the old and new
key pairs until old subscriptions expire or re-subscribe.

## Data model

### PushSubscription

```js
{
  user: ObjectId,                 // indexed
  endpoint: String,               // encrypted at rest
  endpointHash: String,           // SHA-256, unique/indexed
  keys: {
    p256dh: String,               // encrypted at rest
    auth: String                  // encrypted at rest
  },
  deviceLabel: String,
  userAgent: String,
  locale: String,
  timezone: String,
  active: Boolean,
  lastSuccessAt: Date,
  lastFailureAt: Date,
  failureCount: Number,
  expiresAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

Do not log `endpoint`, `p256dh` or `auth`. Use `endpointHash` for diagnostics.
Subscriptions receiving HTTP 404 or 410 are immediately disabled and deleted
after a short audit retention period.

### NotificationPreference

```js
{
  user: ObjectId,                 // unique
  transactional: Boolean,         // default true
  pickupReminders: Boolean,       // default true
  marketing: Boolean,             // default false
  quietHours: {
    enabled: Boolean,
    start: String,
    end: String,
    timezone: String
  }
}
```

### NotificationInbox

An inbox record provides cross-device unread state and a foreground fallback:

```js
{
  user: ObjectId,
  eventId: String,                // unique with user
  type: String,
  title: String,
  body: String,
  url: String,
  booking: ObjectId,
  readAt: Date,
  expiresAt: Date                 // TTL, suggested 90 days
}
```

### OutboxEvent

```js
{
  eventId: String,                // UUID, unique
  topic: String,                  // e.g. booking.confirmed
  aggregateType: String,
  aggregateId: String,
  recipientUserIds: [ObjectId],
  payload: Object,
  status: "pending|processing|sent|dead",
  attempts: Number,
  nextAttemptAt: Date,
  lockedAt: Date,
  lockedBy: String,
  lastErrorCode: String,
  createdAt: Date,
  processedAt: Date
}
```

## API contracts

### Get VAPID public key

`GET /api/notifications/vapid-public-key`

No authentication required. Return 404 when push is disabled.

```json
{ "publicKey": "base64url-key" }
```

### Register or refresh a subscription

`POST /api/notifications/subscriptions`

Requires `authenticate`.

```json
{
  "subscription": {
    "endpoint": "https://push-service.example/...",
    "expirationTime": null,
    "keys": { "p256dh": "...", "auth": "..." }
  },
  "device": {
    "label": "Haris’s phone",
    "locale": "en-IN",
    "timezone": "Asia/Calcutta"
  }
}
```

Return `201` for a new endpoint and `200` for an existing endpoint refreshed by
the same user. If an endpoint was previously attached to another account,
replace ownership only after successful authentication on the current device.

### Remove a subscription

`DELETE /api/notifications/subscriptions`

Requires `authenticate`. Body contains the endpoint; the server hashes it,
verifies ownership and deletes the record. Also expose
`DELETE /api/notifications/subscriptions/:id` for account device management.

### Preferences and inbox

```text
GET   /api/notifications/preferences
PATCH /api/notifications/preferences
GET   /api/notifications?cursor=...
GET   /api/notifications/unread-count
POST  /api/notifications/:id/read
POST  /api/notifications/read-all
```

All require `authenticate`. Cursor pagination is required for the inbox.

## Event production

Booking state changes must write their domain change and `OutboxEvent` in the
same MongoDB transaction when transactions are available. If deployment uses a
Mongo topology without transactions, use a deterministic event ID such as:

```text
booking:{bookingId}:status:{newStatus}:version:{booking.__v}
```

The unique `eventId` allows a repair job to insert a missing event safely.

## Worker behavior

1. Atomically claim eligible events with a lease.
2. Resolve user preferences and active subscriptions.
3. Create one `NotificationInbox` record per recipient/event.
4. Send a minimal push payload to every eligible device.
5. Record individual delivery results.
6. Retry transient failures using exponential backoff with jitter.
7. Disable subscriptions on 404/410.
8. Mark an event `dead` after the maximum attempts and alert operations.

At-least-once delivery is acceptable because `eventId` is stable and the
service worker uses it as the notification `tag`.

## Payload contract

```json
{
  "eventId": "uuid",
  "title": "Booking confirmed",
  "body": "Your WonderTravel journey is confirmed.",
  "url": "/confirmation/WTR-123456789",
  "tag": "booking-WTR-123456789"
}
```

Payloads should stay below 3 KB to remain portable across push services.

## Badge behavior

After login, foreground refresh and notification receipt:

1. Fetch `GET /api/notifications/unread-count`.
2. If supported, call `navigator.setAppBadge(count)`.
3. Clear with `navigator.clearAppBadge()` when count reaches zero or on logout.
4. Always show the same number inside the account UI for unsupported browsers.

The service worker may set a badge after push receipt only when the push payload
contains a server-computed `unreadCount`. The next foreground fetch remains
authoritative.

## Security and abuse controls

- Authentication is mandatory for subscription writes and inbox reads.
- Enforce body size and URL length limits.
- Accept only HTTPS push endpoints.
- Allow notification destinations only on the WonderTravel origin.
- Rate-limit subscription changes per user and IP.
- Require admin role and an audit record for any test-send endpoint.
- Never expose the VAPID private key to the client.
- Delete subscriptions when a user closes or blocks an account.

## Rollout

1. Ship persistence and APIs behind `PWA_PUSH_ENABLED=false`.
2. Enable test delivery for administrators only.
3. Enable booking confirmation for internal accounts.
4. Measure delivery success and stale subscription removal.
5. Add driver/reminder events.
6. Offer opt-in to customers after a successful booking.

## Acceptance criteria

- One user may have multiple devices and revoke each independently.
- Duplicate outbox processing produces one inbox item per event.
- 404/410 subscriptions stop receiving retries.
- Quiet hours defer non-critical delivery correctly across timezones.
- Logout clears the local badge but does not silently revoke other devices.
- No notification contains sensitive passenger or payment data.
