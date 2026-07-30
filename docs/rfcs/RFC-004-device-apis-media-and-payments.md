# RFC-004: Device APIs, media capture and payments

- Status: Proposed
- Depends on: RFC-000 foundation
- Target phase: 2–3

## Summary

Define safe progressive-enhancement patterns for location, camera/media,
contacts and online payments. These capabilities have different privacy and
correctness requirements and must not be bundled behind one broad permission.

## Location

### User experience

Offer explicit actions:

- “Use my current location” for pickup;
- “Choose on map”;
- “Share location for this pickup.”

Do not request geolocation on page load and do not perform background tracking.
Always preserve manual address entry.

### Backend contracts

Use a server-side provider proxy so API keys are not exposed:

```text
GET /api/location/reverse?lat=...&lng=...
GET /api/location/search?q=...
```

Responses use a provider-neutral format:

```json
{
  "placeId": "provider-neutral-or-namespaced-id",
  "label": "Connaught Place, New Delhi",
  "coordinates": { "lat": 28.6315, "lng": 77.2167 },
  "precision": "point"
}
```

Controls:

- authenticated or strongly rate-limited access;
- coordinate bounds and numeric validation;
- result count and query length limits;
- short cache for public geocoding results;
- provider attribution where required;
- no raw provider payloads in logs.

### Booking storage

Extend pickup/destination with optional structured location fields:

```js
{
  label: String,
  placeId: String,
  coordinates: {
    type: { type: String, enum: ["Point"] },
    coordinates: [Number] // [lng, lat]
  },
  source: "typed|current-location|map|shared"
}
```

Retain precise coordinates only as long as operationally required. Access must
be limited to the customer, assigned driver and authorized operations staff.
Define deletion/anonymization after journey completion.

## Camera and media

The frontend may use `<input type="file" accept="image/*" capture>` or
`getUserMedia()` where available, while preserving the existing file picker.

Initial use cases:

- admin/driver vehicle photographs;
- optional customer issue evidence;
- driver document onboarding only after a separate compliance review.

### Upload flow

Keep the current server-mediated Multer + Cloudinary path initially:

1. Validate authentication and role before reading a file.
2. Enforce per-use-case MIME allowlist and size/count limits.
3. Verify magic bytes; do not trust filename or browser MIME.
4. Strip metadata including GPS EXIF.
5. Normalize/re-encode images.
6. Upload into a segregated Cloudinary folder.
7. Store Cloudinary public ID and ownership.
8. Delete media when its parent resource is deleted or retention expires.

For larger scale, switch to short-lived signed direct-upload parameters, then
require a finalize endpoint that verifies the asset before attaching it.

Never place private identity documents in a public Cloudinary delivery mode.

### Proposed endpoints

```text
POST   /api/uploads/intents
POST   /api/uploads/:intentId/finalize
DELETE /api/uploads/:id
```

An `UploadIntent` binds user, purpose, allowed MIME types, max size, resource,
expiry and single-use status.

## Contacts

Use the Contact Picker API only after the user selects “Choose a passenger from
contacts.” Request only `name`, `email` and `tel`.

Rules:

- process selection locally;
- show the selected fields before applying them;
- send only the chosen passenger fields as part of the booking;
- never upload or synchronize the address book;
- never retain picker results for marketing;
- retain manual passenger entry for unsupported browsers.

No dedicated backend contact model is proposed.

## Payments

Payments are online-only. Do not queue payment initiation, authorization,
capture or refund through Background Sync.

### Provider-neutral state model

```js
{
  booking: ObjectId,
  provider: "razorpay",
  providerOrderId: String,
  providerPaymentId: String,
  amount: Number,                 // integer paise
  currency: "INR",
  status: "created|authorized|captured|failed|refunded",
  idempotencyKey: String,
  webhookEventIds: [String],
  failureCode: String,
  createdAt: Date,
  updatedAt: Date
}
```

### API contract

```text
POST /api/payments/orders
POST /api/payments/verify
POST /api/webhooks/razorpay
GET  /api/payments/:id
POST /api/admin/payments/:id/refunds
```

`POST /api/payments/orders`:

- requires a valid server-side booking quote;
- calculates amount on the server;
- requires an idempotency key;
- returns only public checkout configuration.

The webhook is authoritative for payment state. Browser “success” is
provisional until signature verification and/or provider lookup succeeds.

### Webhook requirements

- use the exact raw request body for signature verification;
- configure the webhook route before global JSON parsing or use route-specific
  raw-body middleware;
- store provider event ID uniquely;
- acknowledge duplicates without repeating work;
- write payment state and outbox event atomically;
- alert and retry reconciliation for unknown orders;
- never log signatures, full provider payloads or customer payment data.

### Booking relationship

A booking awaiting online payment uses a non-final state such as
`payment-pending`. The current `confirmed` default must not be used until
payment policy is decided. Cash bookings may still confirm immediately.

Fare changes after an offline draft require user acceptance before an order is
created.

## Permissions and policy

Publish an in-app permissions screen showing:

- capability;
- current browser permission state where detectable;
- reason WonderTravel uses it;
- how to revoke it;
- data retention summary.

Permission denial is not an error and must not block the manual workflow.

## Acceptance criteria

- Location is requested only after a user action and manual entry always works.
- Geocoding keys remain server-side and endpoints are rate-limited.
- Uploaded images are validated, metadata-stripped and ownership-bound.
- Contact picker selection is local and no address book is uploaded.
- Payment amounts are calculated server-side.
- Duplicate payment orders/webhooks do not duplicate charges or state changes.
- No payment action is queued offline.
- Each capability can be disabled independently through server flags.
