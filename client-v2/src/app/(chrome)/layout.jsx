'use client';

import { Suspense } from 'react';
import { usePathname } from 'next/navigation';
import SupportButtons from '../../components/SupportButtons.jsx';
import HomeFooter from '../../components/home/HomeFooter.jsx';
import LandingHeader from '../../components/home/LandingHeader.jsx';

// The booking review page is a focused, single-task flow — the footer's marketing
// links and newsletter signup are a distraction there, not useful navigation.
const NO_FOOTER_PREFIXES = ['/checkout'];
const NO_SUPPORT_PREFIXES = ['/checkout'];

export default function ChromeLayout({ children }) {
  const pathname = usePathname();
  const hideFooter = NO_FOOTER_PREFIXES.some(prefix => pathname?.startsWith(prefix));
  const hideSupport = NO_SUPPORT_PREFIXES.some(prefix => pathname?.startsWith(prefix));

  return <>
    <Suspense fallback={null}><LandingHeader /></Suspense>
    {children}
    {!hideFooter && <HomeFooter />}
    {!hideSupport && <Suspense fallback={null}><SupportButtons /></Suspense>}
  </>;
}
