# RFC-000: PWA capability roadmap

- Status: Proposed
- Owners: Product, frontend, backend, operations
- Target stack: React/Vite, service worker, Express 5, MongoDB/Mongoose
- Last updated: 2026-07-28

## Summary

Build PWA device capabilities as independently deployable modules around the
existing WonderTravel API. The first release adds reliable push delivery and
idempotent offline mutations. A second release adds OS sharing, deep links,
periodic refresh, location and media capture. Payments remain online-only and
are released separately after webhook and reconciliation controls exist.

## Goals

1. Preserve booking correctness when connectivity is weak or intermittent.
2. Notify customers about meaningful booking events without spam.
3. Make installed-app entry points behave like stable application routes.
4. Request device permissions only in response to a clear user action.
5. Keep sensitive passenger, location and payment information out of caches,
   notification bodies and logs.
6. Provide fallbacks when a browser does not support a PWA capability.

## Non-goals

- Making every page fully functional without a network.
- Storing card, UPI credential or contact-book data.
- Silent background location tracking.
- Depending on an app store or native wrapper.
- Guaranteeing periodic/background execution on every browser.

## Current-state gaps to resolve first

- `GET /api/bookings/:reference` is currently unauthenticated and returns the
  populated booking. Before deep links or notifications point at this route,
  require customer/admin authorization or introduce a separately scoped,
  revocable public share token as described in RFC-003.
- The server deliberately falls back to temporary in-memory data when MongoDB
  is unavailable. Push subscriptions, outbox delivery, idempotency and offline
  replay must report `503` while persistence is unavailable; they must never
  silently use memory because durability is part of their contract.
- Production secrets currently have development fallbacks. Advanced PWA
  capabilities must refuse to start in production without JWT, OTP, encryption
  and VAPID secrets.
- CSP is currently disabled. Device integration does not depend on CSP, but a
  later hardening pass should remove inline-script constraints and enable a
  tested policy.

## Architecture decisions

### AD-1: Mongo-backed outbox before a dedicated queue

The server currently has no Redis or worker framework. Transactional work is
written to MongoDB as an `OutboxEvent`, then processed by a separate Node
worker. This gives durable retries and at-least-once delivery without adding
another datastore. If throughput later requires BullMQ, SQS or another broker,
the outbox remains the source of truth.

### AD-2: At-least-once delivery with idempotent consumers

Web push, offline mutations and payment webhooks can be delivered more than
once. Every mutation and external event receives a stable idempotency key.
Server handlers must return the original result for a repeated key rather than
performing the action again.

### AD-3: Progressive enhancement

Feature detection controls all device integrations. The standard booking,
account, upload and payment paths remain usable when service workers, push,
background sync, badges, contact picker or periodic sync are unavailable.

### AD-4: Capability-specific permission prompts

WonderTravel must not prompt for notifications, location, camera or contacts on
initial page load. Explain the value first and request permission only after the
user selects the corresponding action.

### AD-5: No API response caching by the service worker by default

Authenticated API responses may contain personal information. Public fleet and
route snapshots can be cached through explicitly designed snapshot endpoints.
All other `/api/*` traffic remains network-only unless an RFC names the exact
endpoint and retention policy.

## Proposed shared server modules

```text
server/src/
  models/
    OutboxEvent.js
    IdempotencyRecord.js
    PushSubscription.js
    NotificationPreference.js
  routes/
    notifications.js
    sync.js
    pwa.js
  services/
    outbox.js
    push.js
    idempotency.js
  workers/
    outboxWorker.js
```

Run the API and worker as separate processes:

```json
{
  "scripts": {
    "start": "node src/server.js",
    "worker": "node src/workers/outboxWorker.js"
  }
}
```

## Capability matrix

| Capability | Backend required | Browser fallback |
| --- | --- | --- |
| Installation and offline shell | No additional backend | Normal website |
| Push notifications | Subscription API, VAPID, outbox worker | Email/SMS/in-app status |
| App icon badge | Unread-count API | In-app badge |
| Offline booking replay | Idempotency records, conflict rules | Saved draft + manual retry |
| Periodic refresh | ETag snapshot APIs | Refresh on foreground |
| Share target | Stable `/share` route, optional draft API | Paste/copy form |
| Deep links | Stable frontend routes and server SPA fallback | Home page |
| Location | Optional geocoding proxy and consent fields | Typed address |
| Camera/media | Upload contracts, validation, deletion | File picker |
| Contacts | No address-book storage | Manual entry |
| Payments | Order API, provider webhook, reconciliation | Cash/manual payment |

## Delivery phases

### Foundation

- Add capability flags to server configuration.
- Add structured logging with request IDs and redaction.
- Add `OutboxEvent` and `IdempotencyRecord`.
- Add worker health and backlog metrics.
- Add integration-test infrastructure with a real test MongoDB.

### Phase 1: reliability

- Implement RFC-001 push delivery and notification preferences.
- Implement RFC-002 idempotent offline booking/inquiry replay.
- Add update, offline and replay telemetry.

### Phase 2: device integration

- Implement RFC-003 stable deep links, share target and snapshot APIs.
- Implement location assistance and camera uploads from RFC-004.
- Add badge counts and foreground notification center.

### Phase 3: payments and optimization

- Implement provider orders, verified webhooks and reconciliation.
- Evaluate a dedicated queue only after measuring Mongo outbox load.
- Evaluate TWA/native packaging separately if store distribution is required.

## Required feature flags

```text
PWA_PUSH_ENABLED=false
PWA_OFFLINE_SYNC_ENABLED=false
PWA_PERIODIC_SYNC_ENABLED=false
PWA_SHARE_TARGET_ENABLED=false
PWA_LOCATION_ENABLED=false
PWA_PAYMENTS_ENABLED=false
```

Flags are server-authoritative and exposed to the frontend through
`GET /api/pwa/capabilities`.

Example response:

```json
{
  "push": true,
  "offlineSync": true,
  "periodicSync": false,
  "shareTarget": false,
  "location": true,
  "payments": false
}
```

## Observability

Track at minimum:

- install prompt shown, accepted and dismissed;
- active service-worker version;
- offline mutation queued, replayed, conflicted and expired;
- outbox backlog age and retry count;
- push subscription count, send success, 404/410 removal and failure reason;
- notification opened and destination route;
- payment order, webhook, reconciliation and refund state.

Never record passenger notes, push endpoints, cryptographic keys, full
coordinates, tokens or payment payloads in logs.

## Definition of done

- Each accepted RFC has tests, rollback instructions and capability flags.
- API processes remain healthy when the worker is stopped.
- Duplicate mutation/event delivery does not duplicate business actions.
- Unsupported browsers retain the current website workflow.
- Security review approves data retention and permission copy.
