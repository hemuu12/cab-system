import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, Clock, MapPin, Route as RouteIcon } from 'lucide-react';
import { money, tomorrowISO } from '../../../../lib/format.js';
import { formatDuration, ROUTE_PAGES, routeFaqs, routePageBySlug } from '../../../../data/routePages.js';
import PremiumCard from '../../../../components/ui/PremiumCard.jsx';
import StatusBadge from '../../../../components/ui/StatusBadge.jsx';

const SITE_URL = 'https://www.wondertravel.online';
const CLASS_LABEL = { '5-seater': 'Sedan · up to 4 passengers', '7-seater': 'SUV / MPV · up to 6 passengers' };

export async function generateStaticParams() {
  return ROUTE_PAGES.map(route => ({ slug: route.slug }));
}

/** Cheapest published vehicle in each seating class, used for the "from" prices on the page. */
function cheapestByClass(vehicles = []) {
  const cheapest = {};
  for (const vehicle of vehicles) {
    const key = vehicle.pricingClass || (vehicle.seats > 5 ? '7-seater' : '5-seater');
    const perKm = vehicle.fare?.perKm;
    if (!perKm) continue;
    if (!cheapest[key] || perKm < cheapest[key].perKm) cheapest[key] = { perKm, name: vehicle.name };
  }
  return cheapest;
}

async function fetchVehicles() {
  try {
    const res = await fetch(`${process.env.API_BASE_URL}/vehicles`, { next: { revalidate: 300 } });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

function sedanFareFor(routePage, vehicles) {
  const sedanPerKm = routePage
    ? (vehicles || [])
      .filter(v => (v.pricingClass || (v.seats > 5 ? '7-seater' : '5-seater')) === '5-seater' && v.fare?.perKm)
      .reduce((min, v) => (min === null || v.fare.perKm < min ? v.fare.perKm : min), null)
    : null;
  return routePage && sedanPerKm ? sedanPerKm * routePage.distanceKm : null;
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const routePage = routePageBySlug(slug);
  if (!routePage) {
    return {
      title: 'Page Not Found | WonderTravel',
      description: 'WonderTravel driver-operated one-way, round-trip and outstation journeys across India.',
      robots: { index: false, follow: false }
    };
  }

  const title = `${routePage.origin} to ${routePage.city} Cab — Fare & Booking | WonderTravel`;
  const description = `Book a ${routePage.origin} to ${routePage.city} cab. ${routePage.distanceKm} km, around ${formatDuration(routePage.durationHours)} by road, with transparent per-kilometre fares for 5-seater and 7-seater vehicles.`;
  const canonicalPath = `/cabs/${slug}`;

  return {
    title,
    description,
    robots: { index: true, follow: true, 'max-image-preview': 'large' },
    alternates: { canonical: canonicalPath },
    openGraph: {
      title,
      description,
      url: canonicalPath
    },
    twitter: {
      title,
      description
    }
  };
}

export default async function RouteLandingPage({ params }) {
  const { slug } = await params;
  const route = routePageBySlug(slug);
  if (!route) notFound();

  const vehicles = (await fetchVehicles()) || [];
  const rates = cheapestByClass(vehicles);
  const related = ROUTE_PAGES.filter(item => item.origin === route.origin && item.region === route.region && item.slug !== route.slug).slice(0, 6);

  const bookHref = `/results?pickup=${encodeURIComponent(route.origin)}&destination=${encodeURIComponent(route.destination)}&date=${tomorrowISO()}&time=12:00&tripType=one-way&distanceKm=${route.distanceKm}`;
  const estimateFor = perKm => (perKm ? money(perKm * route.distanceKm) : null);
  const sedanFare = sedanFareFor(route, vehicles);
  const faqs = routeFaqs(route, sedanFare);
  const journeyScale = route.distanceKm > 450 ? 'a long-distance journey that may benefit from an early start and planned rest stops'
    : route.distanceKm > 250 ? 'a full intercity travel day with time allowed for traffic and meal breaks'
      : 'a shorter intercity journey that can usually be completed within the day';
  const roadContext = route.region === 'Uttarakhand'
    ? 'The final hill sections may take longer than plain-road kilometres suggest. Weather, seasonal traffic and local road conditions can change the schedule.'
    : 'Highway traffic, city entry time and planned stops can change the schedule, so the displayed duration is a planning estimate.';

  const canonicalUrl = `${SITE_URL}/cabs/${slug}`;
  const routeSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
          { '@type': 'ListItem', position: 2, name: `${route.origin} to ${route.city}`, item: canonicalUrl }
        ]
      },
      {
        '@type': 'Service',
        name: `${route.origin} to ${route.city} Cab`,
        serviceType: 'One-way, round-trip and outstation taxi service',
        provider: { '@id': `${SITE_URL}/#business` },
        areaServed: [
          { '@type': 'City', name: route.origin },
          { '@type': 'City', name: route.city }
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
        mainEntity: faqs.map(({ q, a }) => ({
          '@type': 'Question',
          name: q,
          acceptedAnswer: { '@type': 'Answer', text: a }
        }))
      }
    ]
  };

  return <div className="route-landing page-shell">
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(routeSchema) }}
    />
    <nav className="route-crumbs" aria-label="Breadcrumb">
      <Link href="/">Home</Link>
      <span aria-hidden="true">/</span>
      <span aria-current="page">{route.origin} to {route.city}</span>
    </nav>

    <header className="route-hero">
      <StatusBadge>{route.region}</StatusBadge>
      <h1>{route.origin} to {route.city} Cab</h1>
      <p>
        Book a chauffeur-driven cab from {route.origin} to {route.city}. One-way and round-trip
        journeys, transparent per-kilometre fares, and a professional driver for the full trip.
      </p>
      <div className="route-facts">
        <div><RouteIcon aria-hidden="true" /><span>Distance</span><b>{route.distanceKm} km</b></div>
        <div><Clock aria-hidden="true" /><span>Approx. travel time</span><b>{formatDuration(route.durationHours)}</b></div>
        <div><MapPin aria-hidden="true" /><span>Region</span><b>{route.region}</b></div>
      </div>
      <Link className="btn btn-ember route-cta" href={bookHref}>Check fares and book <ArrowRight aria-hidden="true" /></Link>
    </header>

    <section className="route-fares">
      <h2>{route.origin} to {route.city} taxi fare</h2>
      <div className="route-fare-grid">
        {['5-seater', '7-seater'].map(key => {
          const rate = rates[key];
          return <PremiumCard key={key} className="route-fare-card">
            <h3>{CLASS_LABEL[key]}</h3>
            {rate
              ? <>
                  <div className="route-fare-amount">from {estimateFor(rate.perKm)}</div>
                  <p>₹{rate.perKm} per km · {route.distanceKm} km one way</p>
                </>
              : <p>Fares for this class are being updated. Please check the booking page.</p>}
          </PremiumCard>;
        })}
      </div>
      <p className="route-fine-print">
        Estimates cover the distance charge for a one-way trip and exclude driver allowance, GST,
        tolls, parking and any state permit. The booking page shows the full itemised fare before
        you confirm.
      </p>
    </section>

    <section className="route-planning">
      <div className="seo-guide-heading">
        <span className="eyebrow">Route planning</span>
        <h2>Plan your {route.origin} to {route.city} road journey</h2>
        <p>At approximately {route.distanceKm} km, this is {journeyScale}. {roadContext}</p>
      </div>
      <div className="route-planning-grid">
        <article><span>Before departure</span><h3>Confirm pickup and stops</h3><p>Share the precise pickup point, luggage count and any planned stopovers so the assigned vehicle and estimate match the actual journey.</p></article>
        <article><span>Trip format</span><h3>Choose one-way or round trip</h3><p>Book one-way for a direct drop. Choose round-trip or multi-day travel when the vehicle needs to stay with you or the itinerary includes several places.</p></article>
        <article><span>Fare clarity</span><h3>Review every component</h3><p>Check the distance charge, driver allowance and GST before booking. Tolls, parking and state permits are paid at actual where applicable.</p></article>
      </div>
      <p className="route-guide-link">New to outstation booking? <Link href="/intercity-cab-guide">Read the complete intercity cab guide</Link>. Travelling into the hills? See our <Link href="/uttarakhand-cabs">Uttarakhand cab planning guide</Link>.{route.slug === 'delhi-to-kedarnath-gaurikund' && <> Planning the trek too? Read our <Link href="/kedarnath-cab">Kedarnath travel guide</Link>.</>}</p>
    </section>

    <section className="route-faq">
      <h2>Common questions</h2>
      {faqs.map(item => <details key={item.q}><summary>{item.q}</summary><p>{item.a}</p></details>)}
      <p className="route-guide-link">More questions? See our full <Link href="/taxi-faq">taxi FAQ</Link>.</p>
    </section>

    {related.length > 0 && <section className="route-related">
      <h2>Other {route.origin} to {route.region} routes</h2>
      <ul>{related.map(item => <li key={item.slug}>
        <Link href={item.path}>{route.origin} to {item.city}<span>{item.distanceKm} km</span></Link>
      </li>)}</ul>
    </section>}
  </div>;
}
