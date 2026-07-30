# RFC-003: Share target, deep links and periodic synchronization

- Status: Proposed
- Depends on: RFC-000 foundation
- Target phase: 2

## Summary

Make WonderTravel a safe target in the operating-system Share menu, define
stable application deep links, and refresh a limited public travel snapshot in
the background where browsers permit it.

## Stable route contract

The following application URLs become long-lived public contracts:

```text
/book
/book?pickup=...&destination=...
/trips
/trips/:reference
/share
/account
/admin
```

Existing routes may redirect:

```text
/#book                         -> /book
/confirmation/:reference      -> /trips/:reference
```

Express already serves `index.html` for non-API routes, which is compatible
with deep links. React must add the routes and preserve an intended destination
through login.

Rules:

- Validate and normalize all query parameters.
- Do not place passenger names, phone numbers, email addresses or tokens in URLs.
- A private trip deep link requires authentication and ownership checks.
- A public confirmation link must use a separate revocable opaque share token,
  never the booking reference alone.

## Web Share Target

Add to the manifest after `/share` exists:

```json
{
  "share_target": {
    "action": "/share",
    "method": "GET",
    "enctype": "application/x-www-form-urlencoded",
    "params": {
      "title": "title",
      "text": "text",
      "url": "url"
    }
  }
}
```

Use `GET` for the first release because only small text/URL payloads are
accepted. Do not accept files through the share target until upload validation
and user confirmation are implemented.

The `/share` frontend:

1. Reads title/text/url.
2. Limits each field before rendering.
3. Detects supported map URLs or plain addresses.
4. Shows a preview.
5. Requires the user to choose pickup or destination.
6. Writes the accepted value into a booking draft.
7. Removes share parameters from browser history.

Never automatically create a booking from shared content.

## Parsing strategy

Start with deterministic parsers:

- Google Maps/Apple Maps URL host allowlist;
- `geo:` coordinates when delivered as text;
- plain postal address up to 300 characters;
- unsupported URLs shown as text only.

Remote URL expansion must happen through a backend endpoint to avoid browser
CORS limitations and SSRF.

### Safe URL expansion

`POST /api/pwa/resolve-shared-location`

```json
{ "url": "https://maps.app.goo.gl/..." }
```

Server requirements:

- allowlist supported hosts;
- reject credentials, private IPs and non-HTTPS URLs;
- limit redirects to three;
- cap response size and timeout;
- do not execute page JavaScript;
- return normalized label and optional coordinates;
- rate-limit by user/IP.

## Periodic synchronization

Periodic Background Sync is not available in every browser and its schedule is
controlled by the OS. It is an optimization, not a correctness mechanism.

### Public snapshot API

`GET /api/pwa/snapshot`

Response contains only public, compact data:

```json
{
  "version": "routes:42-fleet:18",
  "generatedAt": "ISO date",
  "routes": [],
  "vehicles": [],
  "capabilities": {}
}
```

Requirements:

- support `ETag` and `If-None-Match`;
- return `304` when unchanged;
- exclude pricing not intended for public display;
- exclude all user and booking data;
- gzip/brotli at the reverse proxy;
- cap payload size, initially 250 KB.

The service worker may store this response in a dedicated snapshot cache and
IndexedDB. Suggested periodic tag:

```text
wondertravel-public-snapshot
```

When periodic sync is unsupported, refresh the snapshot at app start if older
than six hours.

### Account refresh

Do not periodically fetch authenticated booking information in the background
until privacy and battery behavior are reviewed. Initially refresh account data
only on:

- application foreground;
- notification click;
- explicit pull/refresh;
- successful offline mutation replay.

## Deep-link notification contract

Push payloads and shortcuts may open only allowlisted relative routes. The
service worker converts them to same-origin URLs and rejects external origins.

If a target is already open:

1. focus the client;
2. send `{ type: "NAVIGATE", url }`;
3. let React Router navigate without a full reload.

Otherwise use `clients.openWindow(url)`.

## Optional public trip sharing

If product requires shareable trip status:

```text
POST   /api/bookings/:reference/share-links
DELETE /api/bookings/:reference/share-links/:id
GET    /api/shared-trips/:token
```

`ShareLink` stores only a hash of a random 256-bit token, expiry, revocation,
creator and a strict field visibility policy. The public response should expose
coarse status and schedule, never passenger contact data, driver private data
or live precise location by default.

## Security

- Escape all shared text; never render shared HTML.
- Strictly allowlist outbound resolver hosts.
- Prevent open redirects through `next` or deep-link parameters.
- Require ownership for private booking routes.
- Expire and revoke public share tokens.
- Keep snapshot data public by construction.
- Apply CSP once inline legacy source pages are refactored enough to support it.

## Acceptance criteria

- Installed supported apps appear as a text/URL share target.
- Shared content always requires confirmation before changing a booking draft.
- Direct navigation to every stable route works through Express.
- Login returns users to the original protected deep link.
- Snapshot returns 304 for an unchanged ETag.
- No authenticated/private response is stored in the snapshot cache.
- Unsupported browsers refresh public data normally on launch.
