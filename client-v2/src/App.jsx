import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import LoadingScreen, { LogoutTransition } from './components/LoadingScreen.jsx';
import { formatDuration, ORIGIN_CITY, routeFaqs, routePageBySlug } from './data/routePages.js';
import { useVehiclesQuery } from './store/api/catalogApi.js';

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
const IntercityCabGuide = lazy(() => import('./pages/IntercityCabGuide.jsx'));
const UttarakhandCabs = lazy(() => import('./pages/UttarakhandCabs.jsx'));
const PwaExperience = lazy(() => import('./components/PwaExperience.jsx'));

/** Routes rendering a handed-over static design, which brings its own chrome. */
const EXACT_DESIGN_PATHS = ['/', '/results'];
/** Routes that render full-screen without the site header or support buttons. */
const STANDALONE_PATHS = ['/login', '/forgot-password'];
export const SITE_URL = 'https://www.wondertravel.online';
/** `index` opts a route into search results; anything without it is deliberately kept out. */
const ROUTE_META = {
  '/': {
    title: 'One-Way, Round-Trip & Outstation Cabs Across India | WonderTravel',
    description: 'Book chauffeur-driven one-way, round-trip and outstation cabs across India, with extensive coverage throughout Uttarakhand.',
    index: true
  },
  '/results': {
    title: 'Compare Cab Fares & Vehicles | WonderTravel',
    description: 'Compare 5-seater and 7-seater cabs with transparent per-kilometre fares, driver allowance and GST for any route in India.',
    index: true
  },
  '/intercity-cab-guide': {
    title: 'Intercity Cab Booking Guide India | WonderTravel',
    description: 'Understand one-way, round-trip and multi-day intercity cab booking in India, including vehicle choice, fare components and a practical travel checklist.',
    index: true
  },
  '/uttarakhand-cabs': {
    title: 'Uttarakhand Cab Services & Route Guide | WonderTravel',
    description: 'Plan intercity and outstation cabs for Uttarakhand hill stations, city transfers and pilgrimage roadheads, with flexible pickup locations across India.',
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
  const { data: vehicles } = useVehiclesQuery();
  useEffect(() => {
    const routePage = pathname.startsWith('/cabs/') ? routePageBySlug(pathname.slice(6)) : null;
    const sedanPerKm = routePage
      ? (vehicles || [])
        .filter(v => (v.pricingClass || (v.seats > 5 ? '7-seater' : '5-seater')) === '5-seater' && v.fare?.perKm)
        .reduce((min, v) => (min === null || v.fare.perKm < min ? v.fare.perKm : min), null)
      : null;
    const sedanFare = routePage && sedanPerKm ? sedanPerKm * routePage.distanceKm : null;
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
        description: 'WonderTravel driver-operated one-way, round-trip and outstation journeys across India.'
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

    const contentSchema = pathname === '/intercity-cab-guide' ? {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: 'Intercity cab booking across India, explained clearly',
      description: ROUTE_META['/intercity-cab-guide'].description,
      author: { '@type': 'Organization', name: 'WonderTravel', url: SITE_URL },
      publisher: { '@type': 'Organization', name: 'WonderTravel', url: SITE_URL },
      mainEntityOfPage: canonicalUrl
    } : pathname === '/uttarakhand-cabs' ? {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
            { '@type': 'ListItem', position: 2, name: 'Uttarakhand cabs', item: canonicalUrl }
          ]
        },
        {
          '@type': 'Service',
          name: 'Uttarakhand one-way, round-trip and outstation cab services',
          description: ROUTE_META['/uttarakhand-cabs'].description,
          provider: { '@type': 'Organization', name: 'WonderTravel', url: SITE_URL },
          areaServed: { '@type': 'State', name: 'Uttarakhand' },
          serviceType: 'Driver-assisted one-way, round-trip and outstation cab travel'
        }
      ]
    } : null;

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
          '@type': 'Service',
          name: `${ORIGIN_CITY} to ${routePage.city} Cab`,
          serviceType: 'One-way, round-trip and outstation taxi service',
          provider: { '@id': `${SITE_URL}/#business` },
          areaServed: [
            { '@type': 'City', name: ORIGIN_CITY },
            { '@type': 'City', name: routePage.city }
          ],
          ...(sedanFare ? {
            offers: {
              '@type': 'Offer',
              price: Math.round(sedanFare),
              priceCurrency: 'INR',
              availability: 'https://schema.org/InStock',
              url: canonicalUrl
            }
          } : {})
        },
        {
          '@type': 'FAQPage',
          mainEntity: routeFaqs(routePage, sedanFare).map(({ q, a }) => ({
            '@type': 'Question',
            name: q,
            acceptedAnswer: { '@type': 'Answer', text: a }
          }))
        }
      ]
    } : contentSchema);
  }, [pathname, vehicles]);
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
    <Route path="/intercity-cab-guide" element={<IntercityCabGuide />} />
    <Route path="/uttarakhand-cabs" element={<UttarakhandCabs />} />
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
