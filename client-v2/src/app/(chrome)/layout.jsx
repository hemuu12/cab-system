import { Suspense } from 'react';
import Header from '../../components/Header.jsx';
import SupportButtons from '../../components/SupportButtons.jsx';
import HomeFooter from '../../components/home/HomeFooter.jsx';

export default function ChromeLayout({ children }) {
  return <>
    <Suspense fallback={null}><Header /></Suspense>
    {children}
    <HomeFooter />
    <Suspense fallback={null}><SupportButtons /></Suspense>
  </>;
}
