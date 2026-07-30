import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute.jsx';

const Header = lazy(() => import('./components/Header.jsx'));
const SupportButtons = lazy(() => import('./components/SupportButtons.jsx'));
const Home = lazy(() => import('./pages/Home.jsx'));
const Results = lazy(() => import('./pages/Results.jsx'));
const Checkout = lazy(() => import('./pages/Checkout.jsx'));
const Confirmation = lazy(() => import('./pages/Confirmation.jsx'));
const Account = lazy(() => import('./pages/Account.jsx'));
const NotFound = lazy(() => import('./pages/NotFound.jsx'));
const Login = lazy(() => import('./pages/Login.jsx'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword.jsx'));
const Admin = lazy(() => import('./pages/Admin.jsx'));
const PwaExperience = lazy(() => import('./components/PwaExperience.jsx'));

/** Routes rendering a handed-over static design, which brings its own chrome. */
const EXACT_DESIGN_PATHS = ['/', '/results'];
/** Routes that render full-screen without the site header or support buttons. */
const STANDALONE_PATHS = ['/login', '/forgot-password'];
const SITE_URL = 'https://cab-system-wk9q.vercel.app';
const ROUTE_META = {
  '/': {
    title: 'Delhi Outstation Cabs & Intercity Travel | WonderTravel',
    description: 'Explore chauffeur-driven one-way, round-trip and outstation cabs from Delhi to Uttarakhand, Rajasthan and nearby destinations.',
    index: true
  },
  '/results': { title: 'Available Cabs & Fare Estimates | WonderTravel', description: 'Compare WonderTravel vehicles and route-based fare estimates.' },
  '/login': { title: 'Member Login | WonderTravel', description: 'Sign in to your WonderTravel account.' },
  '/forgot-password': { title: 'Reset Password | WonderTravel', description: 'Securely recover your WonderTravel account.' },
  '/account': { title: 'My Trips & Profile | WonderTravel', description: 'Manage your WonderTravel profile and journeys.' },
  '/admin': { title: 'Operations Dashboard | WonderTravel', description: 'WonderTravel operations workspace.' }
};

const setMeta = (selector, attribute, value) => {
  const element = document.head.querySelector(selector);
  if (element) element.setAttribute(attribute, value);
};

function SeoManager() {
  const { pathname } = useLocation();
  useEffect(() => {
    const basePath = pathname.startsWith('/confirmation/') ? '/confirmation'
      : pathname.startsWith('/checkout/') ? '/checkout'
        : pathname.startsWith('/admin') ? '/admin'
          : pathname;
    const meta = ROUTE_META[basePath] || {
      title: basePath === '/checkout' ? 'Review Your Journey | WonderTravel'
        : basePath === '/confirmation' ? 'Booking Confirmation | WonderTravel'
          : 'Page Not Found | WonderTravel',
      description: 'WonderTravel driver-operated intercity journeys from Delhi.'
    };
    const canonicalUrl = `${SITE_URL}${pathname === '/' ? '/' : pathname}`;
    document.title = meta.title;
    setMeta('meta[name="description"]', 'content', meta.description);
    setMeta('meta[name="robots"]', 'content', meta.index ? 'index,follow,max-image-preview:large' : 'noindex,nofollow');
    setMeta('meta[property="og:title"]', 'content', meta.title);
    setMeta('meta[property="og:description"]', 'content', meta.description);
    setMeta('meta[property="og:url"]', 'content', canonicalUrl);
    setMeta('meta[name="twitter:title"]', 'content', meta.title);
    setMeta('meta[name="twitter:description"]', 'content', meta.description);
    const canonical = document.head.querySelector('link[rel="canonical"]');
    if (canonical) canonical.setAttribute('href', canonicalUrl);
  }, [pathname]);
  return null;
}

function RouteLoader() {
  return <div className="flex min-h-[60vh] items-center justify-center bg-night text-sm text-mist" role="status">Loading WonderTravel…</div>;
}

function ScrollManager() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) setTimeout(() => document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth' }), 0);
    else window.scrollTo({ top: 0, behavior: 'auto' });
  }, [pathname, hash]);
  return null;
}

export default function App() {
  const location = useLocation();
  const { pathname } = location;
  const usesExactDesign = EXACT_DESIGN_PATHS.includes(pathname);
  const usesStandaloneLayout = STANDALONE_PATHS.includes(pathname) || pathname.startsWith('/admin');
  const showChrome = !usesExactDesign && !usesStandaloneLayout;
  const routes = <Suspense fallback={<RouteLoader />}><Routes location={location}>
    <Route path="/" element={<Home />} />
    <Route path="/results" element={<Results />} />
    <Route path="/checkout/:vehicleId" element={<Checkout />} />
    <Route path="/confirmation/:reference" element={<Confirmation />} />
    <Route path="/login" element={<Login />} />
    <Route path="/forgot-password" element={<ForgotPassword />} />
    <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
    <Route path="/admin" element={<ProtectedRoute admin><Admin /></ProtectedRoute>} />
    <Route path="*" element={<NotFound />} />
  </Routes></Suspense>;
  return <>
    <ScrollManager />
    <SeoManager />
    {showChrome && <Suspense fallback={null}><Header /></Suspense>}
    <main>{routes}</main>
    {showChrome && <Suspense fallback={null}><SupportButtons /></Suspense>}
    <Suspense fallback={null}><PwaExperience /></Suspense>
  </>;
}
