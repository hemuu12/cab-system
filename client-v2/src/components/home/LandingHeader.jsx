'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth.js';
import { smoothLogout } from '../../lib/smoothLogout.js';
import HomeNav from './HomeNav.jsx';

export default function LandingHeader() {
  const router = useRouter();
  const { user, logout } = useAuth();

  return <HomeNav
    user={user}
    onLogout={() => smoothLogout(logout)}
    onPlanJourney={() => router.push('/#book')}
  />;
}
