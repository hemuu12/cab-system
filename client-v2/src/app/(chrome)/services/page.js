import Link from 'next/link';
import { ArrowRight, Briefcase, Sparkles, Users } from 'lucide-react';
import { ROUTE_PAGES } from '../../../data/routePages.js';
import { money } from '../../../lib/format.js';
import PremiumCard from '../../../components/ui/PremiumCard.jsx';
import VehicleImageCarousel from '../../../components/VehicleImageCarousel.jsx';

const SITE_URL = 'https://www.wondertravel.online';
const META = {
  title: 'Our Cab Services — One-Way, Round-Trip & Outstation | WonderTravel',
  description: 'Chauffeur-driven cab services across India: one-way intercity drops, round trips, multi-day itineraries and hill-route journeys, with transparent per-kilometre fares and verified drivers.'
};

const SERVICES = [
  {
    title: 'One-way intercity cab',
    text: 'A single pickup-to-drop journey between two cities. You pay only for the outward leg — no return fare, no hidden kilometres. Ideal for relocations, airport-to-city transfers and single-direction travel.'
  },
  {
    title: 'Round-trip outstation cab',
    text: 'The same vehicle and chauffeur stay assigned for your full trip and return. A lower per-kilometre rate applies, with a daily minimum, making it the practical choice for weekend breaks and family visits.'
  },
  {
    title: 'Multi-day road itineraries',
    text: 'Several destinations, overnight halts and flexible daily plans with one dedicated vehicle throughout. Share the complete itinerary at booking so driving days and allowances are calculated upfront.'
  },
  {
    title: 'Hill & pilgrimage routes',
    text: 'Experienced drivers for Uttarakhand hill stations and Char Dham journeys — Kedarnath, Badrinath, Gangotri and Yamunotri — with departures planned around mountain-road conditions.'
  }
];

async function fetchVehicles() {
  try {
    const res = await fetch(`${process.env.API_BASE_URL}/vehicles`, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    return (await res.json()) || [];
  } catch {
    return [];
  }
}

const WHY_US = [
  ['Transparent fares', 'Per-kilometre pricing by vehicle class, with the distance charge, driver allowance and GST itemised before you confirm. Tolls and permits are paid at actual — never inflated into the quote.'],
  ['Verified chauffeurs', 'Every driver goes through the platform’s verification and onboarding process, and stays with your vehicle for the entire journey.'],
  ['Real road distances', 'Route distances come from actual road routing, so the fare you see is calculated on the kilometres you will really travel.'],
  ['Cash payment', 'Pay in cash directly at pickup or during the trip — simple and universally accepted, with an itemised bill on your booking confirmation.']
];

export async function generateMetadata() {
  return {
    title: META.title,
    description: META.description,
    robots: { index: true, follow: true, 'max-image-preview': 'large' },
    alternates: { canonical: '/services' },
    openGraph: { title: META.title, description: META.description, url: '/services' },
    twitter: { title: META.title, description: META.description }
  };
}

export default async function ServicesPage() {
  const canonicalUrl = `${SITE_URL}/services`;
  const originCount = new Set(ROUTE_PAGES.map(route => route.origin)).size;
  const destinationCount = new Set(ROUTE_PAGES.map(route => route.city)).size;
  const vehicles = await fetchVehicles();

  const servicesSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
          { '@type': 'ListItem', position: 2, name: 'Our services', item: canonicalUrl }
        ]
      },
      ...SERVICES.map(service => ({
        '@type': 'Service',
        name: service.title,
        description: service.text,
        serviceType: 'Chauffeur-driven taxi service',
        provider: { '@id': `${SITE_URL}/#business` },
        areaServed: { '@type': 'Country', name: 'India' },
        url: canonicalUrl
      }))
    ]
  };

  return <article className="seo-guide page-shell">
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(servicesSchema) }}
    />
    <nav className="route-crumbs" aria-label="Breadcrumb">
      <Link href="/">Home</Link><span aria-hidden="true">/</span><span aria-current="page">Our services</span>
    </nav>

    <header className="seo-guide-hero">
      <span className="eyebrow">Our services</span>
      <h1>Chauffeur-driven cab services for every road journey</h1>
      <p>One-way drops, round trips, multi-day itineraries and hill-route journeys across India — every trip with a professional driver, a published per-kilometre fare and an itemised estimate before you confirm.</p>
      <div className="seo-guide-actions">
        <Link className="button button-ember" href="/#book">Plan your journey <ArrowRight /></Link>
        <Link className="button button-ghost" href="/intercity-cab-guide">Read the booking guide</Link>
        <Link className="button button-ghost" href="/taxi-faq">Taxi FAQ</Link>
      </div>
    </header>

    <section className="seo-guide-section" aria-labelledby="services-title">
      <div className="seo-guide-heading">
        <span className="eyebrow">What we offer</span>
        <h2 id="services-title">Four ways to travel by road</h2>
        <p>Every service is driver-operated door to door — you never self-drive, and the vehicle stays with you for as long as the trip format needs it.</p>
      </div>
      <div className="seo-card-grid">
        {SERVICES.map(({ title, text }, index) => <article key={title}>
          <span>0{index + 1}</span><h3>{title}</h3><p>{text}</p>
        </article>)}
      </div>
    </section>

    <section className="seo-guide-section" aria-labelledby="fleet-title">
      <div className="seo-guide-heading">
        <span className="eyebrow">The fleet</span>
        <h2 id="fleet-title">Choose by passengers and luggage, not seats alone</h2>
        <p>Every vehicle below is active in the fleet today, each with its own chauffeur for the full journey. The fare shown is the starting price for a one-way trip — the exact total for your route appears on the booking page.</p>
      </div>
      {vehicles.length > 0 && <div className="route-fare-grid">
        {vehicles.map(vehicle => <PremiumCard key={vehicle._id || vehicle.name} className="route-fare-card">
          {vehicle.images?.length > 0 && <VehicleImageCarousel images={vehicle.images} name={vehicle.name} className="mb-4" />}
          <h3>{vehicle.category || (vehicle.pricingClass === '7-seater' ? 'SUV / MPV' : 'Sedan')}</h3>
          <p style={{ color: 'var(--ink)', fontFamily: 'var(--serif)', fontSize: 20, fontWeight: 600, margin: '4px 0 14px' }}>{vehicle.name}</p>
          <div className="route-fare-amount">from {money(vehicle.fare?.total ?? 0)}<span style={{ fontSize: 12, fontWeight: 400 }}> /trip</span></div>
          {vehicle.description && <p style={{ marginTop: 12, lineHeight: 1.6 }}>{vehicle.description}</p>}
          <div className="exact-vehicle-specs" style={{ marginTop: 20, rowGap: 12 }}>
            <span><Users size={15} aria-hidden="true" /> {vehicle.seats} passengers</span>
            <span><Briefcase size={15} aria-hidden="true" /> {vehicle.luggage ?? (vehicle.seats > 5 ? 4 : 2)} bags</span>
            {(vehicle.features || []).slice(0, 2).map(feature => <span key={feature}><Sparkles size={15} aria-hidden="true" /> {feature}</span>)}
          </div>
          <Link className="button button-ghost" href="/#book" style={{ marginTop: 22, display: 'inline-flex' }}>Check availability <ArrowRight size={15} aria-hidden="true" /></Link>
        </PremiumCard>)}
      </div>}
    </section>

    <section className="seo-guide-section" aria-labelledby="coverage-title">
      <div className="seo-guide-heading">
        <span className="eyebrow">Where we operate</span>
        <h2 id="coverage-title">{originCount} origin cities · {destinationCount}+ destinations · {ROUTE_PAGES.length} published routes</h2>
        <p>Journeys start from Delhi, Dehradun, Haridwar, Jaipur, Lucknow and Chandigarh, reaching hill stations, pilgrimage towns and heritage cities across Uttarakhand, Rajasthan and North India. Not listed? Enter any destination on the booking form for a live estimate.</p>
      </div>
      <div className="route-planning-grid">
        <article><span>Hill country</span><h3>Uttarakhand</h3><p>Nainital, Mussoorie, Rishikesh, Jim Corbett, Auli and the Char Dham circuit — with drivers experienced on mountain roads.</p></article>
        <article><span>Heritage circuit</span><h3>Rajasthan</h3><p>Jaipur, Udaipur, Jodhpur, Jaisalmer, Pushkar and the desert cities, for single drops or full multi-day tours.</p></article>
        <article><span>Intercity corridors</span><h3>North India</h3><p>Agra, Mathura, Chandigarh, Meerut and routes around Delhi, for day trips and onward journeys.</p></article>
      </div>
      <p className="route-guide-link">Browse every city pair on the <Link href="/#routes">listed routes</Link>, or read the <Link href="/uttarakhand-cabs">Uttarakhand cab guide</Link> for hill-travel planning.</p>
    </section>

    <section className="seo-guide-section" aria-labelledby="why-title">
      <div className="seo-guide-heading">
        <span className="eyebrow">Why WonderTravel</span>
        <h2 id="why-title">Booked on clarity, driven with care</h2>
      </div>
      <div className="seo-checklist">
        {WHY_US.map(([title, text], index) => <div key={title}>
          <b>{index + 1}</b><span><strong>{title}</strong><small>{text}</small></span>
        </div>)}
      </div>
    </section>

    <section className="seo-guide-cta">
      <span className="eyebrow">Ready to travel?</span>
      <h2>Get an exact fare for your route in seconds.</h2>
      <p>Enter your pickup, destination and date — every available vehicle appears with its complete itemised estimate. Booking help is one WhatsApp message away via the <Link href="/help">help center</Link>.</p>
      <div className="seo-guide-actions">
        <Link className="button button-gold" href="/#book">Check vehicles and fares <ArrowRight /></Link>
        <Link className="button button-ghost" href="/help">Contact support</Link>
      </div>
    </section>
  </article>;
}
