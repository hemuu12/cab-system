'use client';

import { useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useAuth } from '../hooks/useAuth.js';
import LoadingScreen from './LoadingScreen.jsx';

export default function ProtectedRoute({ children, admin = false }) {
  const { loading, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      const from = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
      router.replace(`/login?from=${encodeURIComponent(from)}`);
      return;
    }
    if (admin && user.role !== 'admin') router.replace('/account');
  }, [loading, user, admin, pathname, searchParams, router]);

  if (loading) return <LoadingScreen message="Restoring your secure session…" detail="Keeping your journeys protected." />;
  if (!user) return null;
  if (admin && user.role !== 'admin') return null;
  return children;
}
