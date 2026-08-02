'use client';

import { Suspense, useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

function ScrollManagerInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const hash = typeof window !== 'undefined' ? window.location.hash : '';

  useEffect(() => {
    if (hash) setTimeout(() => document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth' }), 0);
    else window.scrollTo({ top: 0, behavior: 'auto' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams, hash]);

  return null;
}

export default function ScrollManager() {
  return (
    <Suspense fallback={null}>
      <ScrollManagerInner />
    </Suspense>
  );
}
