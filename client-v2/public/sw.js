const VERSION = 'wondertravel-v5';
const STATIC_CACHE = `${VERSION}-static`;
const RUNTIME_CACHE = `${VERSION}-runtime`;
const IMAGE_CACHE = `${VERSION}-images`;
const CACHE_PREFIX = 'wondertravel-';

const APP_SHELL = [
  '/',
  '/offline.html',
  '/manifest.webmanifest',
  '/branding/favicon.ico',
  '/branding/apple-touch-icon.png',
  '/branding/pwa-192.png',
  '/branding/pwa-512.png',
  '/branding/pwa-maskable-512.png',
  '/branding/wondertravel-icon.png',
  '/branding/wondertravel-wordmark-header.png'
];

const precacheAppShell = async () => {
  const cache = await caches.open(STATIC_CACHE);
  await cache.addAll(APP_SHELL);
  const home = await fetch('/');
  const markup = await home.clone().text();
  await cache.put('/', home);
  const builtAssets = [...markup.matchAll(/(?:src|href)="(\/assets\/[^"]+)"/g)].map(match => match[1]);
  if (builtAssets.length) await cache.addAll([...new Set(builtAssets)]);
};

self.addEventListener('install', event => {
  event.waitUntil(precacheAppShell());
});

self.addEventListener('activate', event => {
  event.waitUntil(Promise.all([
    caches.keys().then(keys => Promise.all(keys
      .filter(key => key.startsWith(CACHE_PREFIX) && ![STATIC_CACHE, RUNTIME_CACHE, IMAGE_CACHE].includes(key))
      .map(key => caches.delete(key)))),
    self.clients.claim()
  ]));
});

self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
  if (event.data?.type === 'CLEAR_RUNTIME_CACHE') {
    event.waitUntil(Promise.all([caches.delete(RUNTIME_CACHE), caches.delete(IMAGE_CACHE)]));
  }
});

const cacheResponse = async (cacheName, request, response) => {
  if (response?.ok && response.type === 'basic') {
    const cache = await caches.open(cacheName);
    await cache.put(request, response.clone());
  }
  return response;
};

const navigationResponse = async request => {
  try {
    const response = await fetch(request);
    await cacheResponse(RUNTIME_CACHE, request, response);
    return response;
  } catch {
    return (await caches.match(request)) ||
      (await caches.match('/')) ||
      (await caches.match('/offline.html'));
  }
};

const staleWhileRevalidate = async request => {
  const cached = await caches.match(request);
  const network = fetch(request)
    .then(response => cacheResponse(RUNTIME_CACHE, request, response))
    .catch(() => null);
  return cached || network || Response.error();
};

const cacheFirstImage = async request => {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    return await cacheResponse(IMAGE_CACHE, request, await fetch(request));
  } catch {
    return Response.error();
  }
};

self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin || url.pathname.startsWith('/api/') || request.headers.has('range')) return;

  if (request.mode === 'navigate') {
    event.respondWith(navigationResponse(request));
    return;
  }

  if (request.destination === 'image') {
    event.respondWith(cacheFirstImage(request));
    return;
  }

  if (['style', 'script', 'font', 'worker'].includes(request.destination) ||
      url.pathname === '/manifest.webmanifest') {
    event.respondWith(staleWhileRevalidate(request));
  }
});

self.addEventListener('push', event => {
  const fallback = {
    title: 'WonderTravel',
    body: 'You have a new journey update.',
    url: '/admin'
  };
  let payload = fallback;
  try {
    payload = { ...fallback, ...event.data?.json() };
  } catch {
    payload.body = event.data?.text() || fallback.body;
  }
  const notification = self.registration.showNotification(payload.title, {
    body: payload.body,
    icon: '/branding/pwa-192.png',
    badge: '/branding/notification-badge-96.png',
    data: { url: payload.url || '/admin' },
    tag: payload.tag || payload.eventId || 'wondertravel-update',
    renotify: true
  });
  const badge = payload.appBadge && navigator.setAppBadge
    ? navigator.setAppBadge().catch(() => {})
    : Promise.resolve();
  event.waitUntil(Promise.all([notification, badge]));
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const requested = new URL(event.notification.data?.url || '/admin', self.location.origin);
  const target = requested.origin === self.location.origin ? requested.href : `${self.location.origin}/admin`;
  event.waitUntil(Promise.all([
    navigator.clearAppBadge ? navigator.clearAppBadge().catch(() => {}) : Promise.resolve(),
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(async clients => {
      const existing = clients.find(client => new URL(client.url).origin === self.location.origin);
      if (existing) {
        await existing.navigate?.(target);
        return existing.focus();
      }
      return self.clients.openWindow(target);
    })
  ]));
});
