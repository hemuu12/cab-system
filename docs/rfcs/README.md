# WonderTravel PWA backend RFCs

These RFCs describe the backend and frontend work required to move the current
installable PWA from a strong offline shell to a device-integrated application.

| RFC | Capability | Status | Suggested phase |
| --- | --- | --- | --- |
| [RFC-000](./RFC-000-pwa-capability-roadmap.md) | Architecture and delivery roadmap | Proposed | Foundation |
| [RFC-001](./RFC-001-web-push-notifications-and-badges.md) | Push notifications, preferences and badges | Proposed | Phase 1 |
| [RFC-002](./RFC-002-offline-mutations-and-background-sync.md) | Offline booking queue, idempotency and sync | Proposed | Phase 1 |
| [RFC-003](./RFC-003-share-target-deep-links-and-periodic-sync.md) | OS sharing, deep links and background refresh | Proposed | Phase 2 |
| [RFC-004](./RFC-004-device-apis-media-and-payments.md) | Location, camera/media, contacts and payments | Proposed | Phase 2–3 |

## Current baseline

The frontend already supplies:

- an app-wide branded install experience;
- regular, maskable and monochrome WonderTravel icons;
- an offline application shell;
- automatic service-worker update handling;
- navigation and static-asset caching;
- install shortcuts and iOS launch screens;
- notification display/click handlers in the service worker.

The RFCs focus on the missing server contracts, persistence, worker processes,
security rules and browser fallbacks.

## Decision process

Before implementation, each RFC should be changed from `Proposed` to
`Accepted`, with the unresolved questions answered. Implementation should land
behind capability flags and be measured before broad release.
