# WonderTravel client (v2)

Design-identical rebuild of `client/` on Redux Toolkit + RTK Query, with a custom
axios interceptor layer underneath every request.

```
npm install
npm run dev     # http://localhost:5174, proxies /api to http://localhost:5001
npm run build
```

Start the API first (`cd ../server && npm run dev`), then this app.

**The port is not arbitrary.** The server's CORS allowlist comes from `CLIENT_URL` in
`server/.env`, which must contain `http://localhost:5174` or every credentialed
request — session refresh, login, all mutations — is rejected before it reaches a
route, surfacing as a `500` with nothing in the server log. `strictPort` is enabled
here so the dev server fails loudly rather than shifting to a port CORS does not
allow. `server/.env` is read once at boot, so restart the API after changing it.

Set `VITE_API_BASE_URL` to point at a non-proxied API (defaults to `/api`).

## Design parity

`index.html`, `public/` and `src/styles.css` are byte-for-byte copies of the
original app, and every page renders the same markup and class names.

The Home and Results pages were handed over as static HTML files that the old app
mounted with `html-react-parser` and ran through `Function(script)()`. They are now
real components under `src/pages/home/` and `src/pages/results/`, so both pages use
RTK Query like the rest of the app instead of their own `fetch` calls.

Two details of that conversion are worth knowing:

- The original scripts **rewrote their own markup after load** — Results renamed every
  spec label, rate note and price caption; Home swapped card copy from the API. The
  components render that final state, not the pre-script HTML.
- Each design's CSS styles bare element selectors (`nav`, `footer`, `*`), so it cannot
  live in the global bundle. `src/styles/{home,results}.css` are verbatim extracts
  mounted by `components/design/DesignStyles.jsx` only while the page is on screen,
  reproducing the original cascade.

`components/design/` holds what both pages share: the nav profile menu, the vehicle
carousel, the floating contact buttons, and the design's inline SVG icons (kept as raw
paths so the design CSS can size and stroke them by selector).

## Request pipeline

```
component → RTK Query hook → axiosBaseQuery → httpClient (axios + interceptors) → /api
```

| File | Responsibility |
| --- | --- |
| `src/api/tokenStore.js` | In-memory access token (never localStorage) + change subscribers |
| `src/api/httpClient.js` | Axios instance; request interceptor adds `Authorization` and picks the content type; response interceptor performs a **single-flight** 401 refresh-and-retry, then normalizes and toasts the error |
| `src/api/errors.js` | One place mapping any failure to `{ status, message, data }` |
| `src/api/events.js` | Browser-event bridge so the API layer stays free of React and redux imports |
| `src/api/axiosBaseQuery.js` | Adapts the axios instance to RTK Query, forwarding the abort signal |

Behaviour worth knowing:

- Parallel 401s trigger exactly one `/auth/refresh`; all callers await the same promise.
- `/auth/*` paths never enter the refresh loop, and `/auth/refresh` + `/auth/me`
  failures stay silent (they are expected while probing an anonymous session).
- Pass `skipErrorToast: true` on a query to suppress the automatic error toast.
- A failed refresh clears the token, emits `wondertravel:session-expired`, and the
  store resets the RTK Query cache.

## Store

| Slice | Purpose |
| --- | --- |
| `api` | RTK Query cache — endpoints injected from `store/api/*Api.js` |
| `auth` | Current user, bootstrap `loading` flag, mirrored access token |
| `toast` | Notification queue rendered by `components/Toaster.jsx` |
| `account` | Locally-held profile, preferences, saved places, payments, wallet |

Endpoints are split by domain — `authApi`, `catalogApi`, `bookingApi`, `adminApi` —
and share the tag set in `baseApi.js`, so a mutation invalidates both its admin
table and the matching public cache (editing a vehicle refreshes `/vehicles` too).

The admin console uses one generic `adminResource` query keyed by resource name
instead of eight near-identical endpoints.

`store/middleware/persistAccount.js` mirrors the account slice into localStorage,
keeping persistence out of the page components.

## Hooks

- `useAuth()` → `{ user, loading, isAdmin, logout }`, backed by a shared restore query.
- `useToast()` → `success` / `error` / `info` / `show`, same signature as the old context.
