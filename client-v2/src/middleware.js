import { NextResponse } from 'next/server';

const REFRESH_COOKIE = 'wondertravel_refresh';
const SECURE_REFRESH_COOKIE = '__Secure-wondertravel_refresh';

/**
 * Coarse pre-check only: redirects obviously-logged-out visitors away from
 * /account and /admin before the full page bundle ships. It cannot validate
 * the token or resolve the user's role (the access token is in-memory only
 * and the refresh cookie is httpOnly), so it only checks for the refresh
 * cookie's presence. The client-side ProtectedRoute + useAuth() remains the
 * real source of truth and still runs on every load of these pages.
 */
export function middleware(request) {
  const hasSession = request.cookies.has(SECURE_REFRESH_COOKIE) || request.cookies.has(REFRESH_COOKIE);
  if (hasSession) return NextResponse.next();

  const from = `${request.nextUrl.pathname}${request.nextUrl.search}`;
  const loginUrl = new URL(`/login?from=${encodeURIComponent(from)}`, request.url);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ['/account/:path*', '/admin/:path*']
};
