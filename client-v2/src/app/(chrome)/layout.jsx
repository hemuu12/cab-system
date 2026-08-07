import { Suspense } from 'react';
import SupportButtons from '../../components/SupportButtons.jsx';
import HomeFooter from '../../components/home/HomeFooter.jsx';
import LandingHeader from '../../components/home/LandingHeader.jsx';

export default function ChromeLayout({ children }) {
  return <>
    <Suspense fallback={null}><LandingHeader /></Suspense>
    {children}
    <HomeFooter />
    <Suspense fallback={null}><SupportButtons /></Suspense>
  </>;
}
