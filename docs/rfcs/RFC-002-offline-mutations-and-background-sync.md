# RFC-002: Offline mutations and background synchronization

- Status: Proposed
- Depends on: RFC-000 foundation
- Target phase: 1

## Summary

Allow users to save a booking or inquiry while offline and safely replay it
when connectivity returns. The server provides idempotency and conflict
semantics so retries cannot create duplicate bookings, inquiries, cancellations
or payments.

## Scope

### Queueable in the first release

- booking creation;
- inquiry creation;
- authenticated booking cancellation, with explicit warning that it remains
  pending until confirmed by the server.

### Draft-only, not automatically replayed

- profile edits;
- driver/admin changes;
- vehicle and image management.

### Never queued

- login, OTP and password reset;
- card/UPI payment confirmation;
- destructive admin deletion;
- upload bodies;
- operations whose deadline has passed.

## Client queue

Use IndexedDB, not Cache Storage or localStorage.

```js
{
  id: "uuid",
  idempotencyKey: "uuid",
  kind: "booking.create",
  method: "POST",
  path: "/api/bookings",
  body: {},
  createdAt: "ISO date",
  expiresAt: "ISO date",
  attempts: 0,
  state: "queued|syncing|confirmed|attention|expired",
  lastErrorCode: null
}
```

Retention:

- booking and inquiry queue entries: maximum 24 hours;
- confirmed receipts: maximum 7 days;
- failed/expired items: retained until shown once, then deleted.

The UI must clearly say “Saved on this device” rather than “Booked” until the
server returns a booking reference.

Passenger details stored in IndexedDB are personal information. Store only the
fields required for submission, remove records immediately after confirmation,
and provide “Remove saved request.” Do not store card data, access tokens or
refresh tokens in IndexedDB.

## Idempotency contract

Every queueable mutation sends:

```http
Idempotency-Key: 3f38c6a6-...
X-WonderTravel-Client-Time: 2026-07-28T10:30:00.000Z
```

The server validates the UUID and scopes it to:

```text
actor + HTTP method + canonical route + idempotency key
```

For anonymous bookings, the actor is a server-generated installation ID plus a
hash of normalized passenger phone/email. This prevents unrelated anonymous
users from discovering each other’s receipts.

### IdempotencyRecord

```js
{
  scopeHash: String,              // unique/indexed
  requestHash: String,            // SHA-256 of canonical body
  state: "processing|completed|failed",
  statusCode: Number,
  responseBody: Object,
  resourceType: String,
  resourceId: String,
  expiresAt: Date,                // TTL, suggested 7 days
  createdAt: Date,
  completedAt: Date
}
```

Rules:

- first request creates `processing` atomically;
- same key and same body returns the original response;
- same key with a different body returns `409 IDEMPOTENCY_MISMATCH`;
- a concurrently processing key returns `409 REQUEST_IN_PROGRESS` with
  `Retry-After`;
- validation failures may be stored briefly, but 5xx/network failures are
  retryable;
- payment idempotency uses a separate, longer retention policy.

## API changes

### Booking and inquiry endpoints

Modify:

```text
POST /api/bookings
POST /api/inquiries
PATCH /api/bookings/:reference/cancel
```

to accept and enforce `Idempotency-Key`.

Example confirmed booking response:

```json
{
  "reference": "WTR-123456789",
  "status": "confirmed",
  "idempotencyKey": "uuid",
  "replayed": false
}
```

A repeated request returns the same payload with `replayed: true`.

### Sync capabilities

`GET /api/sync/capabilities`

```json
{
  "enabled": true,
  "queueable": [
    "booking.create",
    "inquiry.create",
    "booking.cancel"
  ],
  "maxRetentionSeconds": 86400,
  "maxBatchSize": 10,
  "serverTime": "ISO date"
}
```

The endpoint prevents an older client from queuing operations the server no
longer supports.

## Authentication during background replay

The existing access token is intentionally kept only in JavaScript memory and
expires after 15 minutes. The service worker must not persist it.

For authenticated queue items:

1. Service worker calls `POST /api/auth/refresh` with credentials included.
2. The existing HttpOnly refresh cookie is sent because the request targets
   `/api/auth`.
3. The response provides a short-lived access token held only in worker memory.
4. Replay requests send that token in `Authorization`.
5. Discard the token when the sync event ends.

If refresh returns 401, mark entries `attention` and notify open clients to ask
the user to sign in. Do not repeatedly retry.

Anonymous booking/inquiry replay does not need an access token, but still
requires rate limiting and idempotency.

## Service-worker replay

Register a one-shot sync tag where supported:

```text
wondertravel-mutation-sync
```

Algorithm:

1. Load non-expired queue items ordered by creation time.
2. Obtain an access token only if an authenticated item exists.
3. Submit one item at a time to preserve intent order.
4. On 2xx, store the confirmation briefly and delete sensitive request data.
5. On 400/404/409 business conflict, mark `attention` and notify clients.
6. On 401, stop authenticated replay.
7. On 429, honor `Retry-After`.
8. On 5xx/network error, stop and let the browser schedule another attempt.
9. Broadcast results via `clients.matchAll()` and `postMessage`.

Browsers without Background Sync replay on:

- the `online` event;
- app launch;
- returning to the foreground;
- a manual “Try again” action.

## Booking-specific conflict rules

The server remains authoritative for:

- vehicle availability;
- route availability and distance;
- calculated fare;
- pickup time validity;
- payment availability.

An offline draft must not freeze price or availability. On replay:

- if the original vehicle/fare is still valid, create the booking;
- if fare changed, return `409 FARE_CHANGED` with the new quote and require
  acceptance;
- if vehicle is unavailable, return `409 VEHICLE_UNAVAILABLE` with alternatives;
- if pickup time has passed, return `409 PICKUP_TIME_EXPIRED`;
- never silently substitute a vehicle or charge a payment.

## Cancellation-specific behavior

The UI labels an offline cancellation “Cancellation pending.” The server
returns:

- `200` if cancellation succeeds or was already cancelled;
- `409 JOURNEY_ALREADY_STARTED` if status moved to active;
- `409 CANCELLATION_WINDOW_CLOSED` when policy prevents cancellation.

The idempotency record ensures repeated cancellation is safe.

## Server implementation

Add an idempotency middleware:

```text
server/src/middleware/idempotency.js
```

It must execute around validation and persistence, but avoid storing secret
headers. Hash a stable/canonical JSON body; do not use raw property order.

Mongo transactions should encompass the business write, idempotency completion
and outbox insertion when supported. Without transactions, deterministic
resource keys and a repair job are required.

## Security and rate limits

- Maximum queued JSON body: current API limit or lower.
- Maximum 10 outstanding anonymous requests per installation.
- Rate limit by IP, installation ID and normalized contact hash.
- Installation ID is random and not an authentication credential.
- Reject queue entries older than the server’s retention policy.
- Validate all fields again on replay; never trust client timestamps.
- Do not cache mutation responses in the service-worker HTTP cache.

## Acceptance criteria

- Replaying a booking 20 times creates exactly one booking/reference.
- A different payload with the same key is rejected.
- A fare or availability conflict requires the user’s decision.
- Authenticated replay refreshes a token without persisting it.
- Unsupported browsers can manually retry a saved draft.
- No payment credential or long-lived authentication secret enters IndexedDB.
- Sensitive queue data is deleted after confirmation or user removal.
