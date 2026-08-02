import { Suspense } from 'react';
import Header from '../../components/Header.jsx';
import SupportButtons from '../../components/SupportButtons.jsx';

export default function ChromeLayout({ children }) {
  return <>
    <Suspense fallback={null}><Header /></Suspense>
    {children}
    <Suspense fallback={null}><SupportButtons /></Suspense>
  </>;
}
