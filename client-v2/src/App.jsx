import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import LoadingScreen, { LogoutTransition } from './components/LoadingScreen.jsx';
import { formatDuration, ORIGIN_CITY, routePageBySlug } from './data/routePages.js';

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
const RouteLanding = lazy(() => import('./pages/RouteLanding.jsx'));
const PwaExperience = lazy(() => import('./components/PwaExperience.jsx'));

/** Routes rendering a handed-over static design, which brings its own chrome. */
const EXACT_DESIGN_PATHS = ['/', '/results'];
/** Routes that render full-screen without the site header or support buttons. */
const STANDALONE_PATHS = ['/login', '/forgot-password'];
export const SITE_URL = 'https://www.wondertravel.online';
/** `index` opts a route into search results; anything without it is deliberately kept out. */
const ROUTE_META = {
  '/': {
    title: 'Intercity Cabs Across India | WonderTravel',
    description: 'Book chauffeur-driven one-way, round-trip and outstation cabs across India, with extensive coverage throughout Uttarakhand.',
    index: true
  },
  '/results': {
    title: 'Compare Cab Fares & Vehicles | WonderTravel',
    description: 'Compare 5-seater and 7-seater cabs with transparent per-kilometre fares, driver allowance and GST for any route in India.',
    index: true
  },
  '/login': { title: 'Member Login | WonderTravel', description: 'Sign in to your WonderTravel account.' },
  '/forgot-password': { title: 'Reset Password | WonderTravel', description: 'Securely recover your WonderTravel account.' },
  '/account': { title: 'My Trips & Profile | WonderTravel', description: 'Manage your WonderTravel profile and journeys.' },
  '/admin': { title: 'Operations Dashboard | WonderTravel', description: 'WonderTravel operations workspace.' }
};

const setMeta = (selector, attribute, value) => {
  const element = document.head.querySelector(selector);
  if (element) element.setAttribute(attribute, value);
};

/** Replaces the page-level structured data block, or removes it on pages that have none. */
const setRouteSchema = schema => {
  const id = 'route-schema';
  document.getElementById(id)?.remove();
  if (!schema) return;
  const script = document.createElement('script');
  script.id = id;
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(schema);
  document.head.appendChild(script);
};

function SeoManager() {
  const { pathname } = useLocation();
  useEffect(() => {
    const routePage = pathname.startsWith('/cabs/') ? routePageBySlug(pathname.slice(6)) : null;
    const basePath = pathname.startsWith('/confirmation/') ? '/confirmation'
      : pathname.startsWith('/checkout/') ? '/checkout'
        : pathname.startsWith('/admin') ? '/admin'
          : pathname;
    const meta = routePage
      ? {
          title: `${ORIGIN_CITY} to ${routePage.city} Cab — Fare & Booking | WonderTravel`,
          description: `Book a ${ORIGIN_CITY} to ${routePage.city} cab. ${routePage.distanceKm} km, around ${formatDuration(routePage.durationHours)} by road, with transparent per-kilometre fares for 5-seater and 7-seater vehicles.`,
          index: true
        }
      : ROUTE_META[basePath] || {
        title: basePath === '/checkout' ? 'Review Your Journey | WonderTravel'
          : basePath === '/confirmation' ? 'Booking Confirmation | WonderTravel'
            : 'Page Not Found | WonderTravel',
        description: 'WonderTravel driver-operated intercity journeys across India.'
      };
    // Search parameters are deliberately excluded: every trip combination would otherwise
    // become its own indexable URL, splitting ranking signals across near-identical pages.
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

    setRouteSchema(routePage ? {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
            { '@type': 'ListItem', position: 2, name: `${ORIGIN_CITY} to ${routePage.city}`, item: canonicalUrl }
          ]
        },
        {
          '@type': 'FAQPage',
          mainEntity: [
            {
              '@type': 'Question',
              name: `How far is ${routePage.city} from ${ORIGIN_CITY}?`,
              acceptedAnswer: {
                '@type': 'Answer',
                text: `${routePage.city} is about ${routePage.distanceKm} km from ${ORIGIN_CITY} by road, and the drive usually takes around ${formatDuration(routePage.durationHours)} depending on traffic and weather.`
              }
            },
            {
              '@type': 'Question',
              name: `Are tolls and parking included in the ${ORIGIN_CITY} to ${routePage.city} fare?`,
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'No. Tolls, parking and any state permit are paid at actual, so you are never charged an estimate that turns out higher than the real cost.'
              }
            }
          ]
        }
      ]
    } : null);
  }, [pathname]);
  return null;
}

function RouteLoader() {
  return <LoadingScreen message="Preparing WonderTravel…" />;
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
    <Route path="/cabs/:slug" element={<RouteLanding />} />
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
    <LogoutTransition />
    {showChrome && <Suspense fallback={null}><Header /></Suspense>}
    <main>{routes}</main>
    {showChrome && <Suspense fallback={null}><SupportButtons /></Suspense>}
    <Suspense fallback={null}><PwaExperience /></Suspense>
  </>;
}
