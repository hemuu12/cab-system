const isDev = process.env.NODE_ENV === 'development';
const API_ORIGIN = isDev ? 'http://localhost:5001' : 'https://cab-system-puce.vercel.app';

// Next injects inline hydration/RSC payload <script> tags on every page, so a strict
// script-src 'self' (as the old Vite SPA used) breaks the app — 'unsafe-inline' is the
// documented Next.js approach for CSP without per-request nonces (nonces force fully
// dynamic rendering, which would disable the SSG/ISR strategy this migration relies on).
const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''};
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src 'self' data: https://fonts.gstatic.com;
  img-src 'self' data: blob: https:;
  connect-src 'self' ${API_ORIGIN} https://*.ably.io wss://*.ably.io;
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self';
  object-src 'none';
  upgrade-insecure-requests;
`.replace(/\s{2,}/g, ' ').trim();

/** @type {import('next').NextConfig} */
const nextConfig = {
  // The backend lives on a different Vercel domain, so its httpOnly refresh
  // cookie is a third-party cookie from the browser's point of view — Safari's
  // ITP and Chrome's third-party-cookie phase-out both drop it, which silently
  // signs users out (most visible right after a hard refresh forces a fresh
  // session restore). Proxying /api/* through this same domain makes every
  // request first-party, so the cookie is treated like any normal site cookie.
  async rewrites() {
    return [{ source: '/api/:path*', destination: `${API_ORIGIN}/api/:path*` }];
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Content-Security-Policy', value: cspHeader },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(self)' }
        ]
      },
      {
        source: '/branding/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }]
      }
    ];
  }
};

export default nextConfig;
