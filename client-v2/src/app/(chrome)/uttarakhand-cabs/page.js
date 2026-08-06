import Link from 'next/link';
import { ArrowRight, CloudSun, Luggage, Mountain, Route as RouteIcon } from 'lucide-react';
import { ORIGIN_CITY, ROUTE_PAGES } from '../../../data/routePages.js';

const SITE_URL = 'https://www.wondertravel.online';
const META = {
  title: 'Uttarakhand Cab Services & Route Guide | WonderTravel',
  description: 'Plan intercity and outstation cabs for Uttarakhand hill stations, city transfers and pilgrimage roadheads, with flexible pickup locations across India.'
};

// This guide is framed from Delhi specifically; other origins get their own route pages
// but don't need a second copy of this directory section.
const UTTARAKHAND_ROUTES = ROUTE_PAGES.filter(route => route.region === 'Uttarakhand' && route.origin === ORIGIN_CITY);

const TRAVEL_REGIONS = [
  ['Dehradun, Rishikesh and Haridwar', 'City transfers, spiritual journeys and onward connections into the Garhwal hills.'],
  ['Nainital, Bhimtal and Mukteshwar', 'Lake-district stays and Kumaon hill journeys where travel time can vary with road and weather conditions.'],
  ['Corbett, Ramnagar and Haldwani', 'Wildlife-area transfers, rail connections and gateways for onward Kumaon travel.'],
  ['Char Dham road gateways', 'Multi-day itineraries towards Gaurikund, Badrinath, Gangotri and Janki Chatti need realistic driving days and flexible timing.']
];

export async function generateMetadata() {
  return {
    title: META.title,
    description: META.description,
    robots: { index: true, follow: true, 'max-image-preview': 'large' },
    alternates: { canonical: '/uttarakhand-cabs' },
    openGraph: { title: META.title, description: META.description, url: '/uttarakhand-cabs' },
    twitter: { title: META.title, description: META.description }
  };
}

export default function UttarakhandCabsPage() {
  const canonicalUrl = `${SITE_URL}/uttarakhand-cabs`;
  const contentSchema = {
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
        description: META.description,
        provider: { '@type': 'Organization', name: 'WonderTravel', url: SITE_URL },
        areaServed: { '@type': 'State', name: 'Uttarakhand' },
        serviceType: 'Driver-assisted one-way, round-trip and outstation cab travel'
      }
    ]
  };

  return <article className="seo-guide page-shell">
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(contentSchema) }}
    />
    <nav className="route-crumbs" aria-label="Breadcrumb">
      <Link href="/">Home</Link><span aria-hidden="true">/</span><span aria-current="page">Uttarakhand cabs</span>
    </nav>

    <header className="seo-guide-hero uttarakhand-guide-hero">
      <span className="eyebrow">Our home ground</span>
      <h1>Uttarakhand intercity and outstation cab services</h1>
      <p>Plan driver-assisted journeys to Uttarakhand from cities across India, as well as local transfers between the state&rsquo;s towns, hill stations and pilgrimage roadheads. Choose your own pickup; the route details are confirmed before departure.</p>
      <div className="seo-guide-actions">
        <Link className="button button-ember" href="/#book">Plan an Uttarakhand journey <ArrowRight /></Link>
        <Link className="button button-ghost" href="/intercity-cab-guide">Read the cab booking guide</Link>
        <Link className="button button-ghost" href="/taxi-faq">Read the taxi FAQ</Link>
      </div>
    </header>

    <section className="seo-guide-section">
      <div className="seo-guide-heading">
        <span className="eyebrow">Where we help you travel</span>
        <h2>From gateways to mountain destinations</h2>
        <p>Uttarakhand journeys are not all the same. A short city transfer, a hill-station holiday and a multi-day pilgrimage each need a different route plan.</p>
      </div>
      <div className="seo-card-grid seo-region-grid">
        {TRAVEL_REGIONS.map(([title, text]) => <article key={title}><Mountain /><h3>{title}</h3><p>{text}</p></article>)}
      </div>
    </section>

    <section className="seo-guide-split">
      <div className="seo-guide-heading">
        <span className="eyebrow">Hill-road planning</span>
        <h2>Allow time for the road, not only the kilometres</h2>
        <p>Mountain distances can take longer than the same distance on a plain highway. Weather, seasonal traffic, road work and daylight can all affect the schedule, so published times are planning estimates rather than promises.</p>
      </div>
      <dl className="seo-definition-list">
        <div><dt><CloudSun /> Check conditions</dt><dd>Review weather and local road updates shortly before departure, especially during monsoon and winter.</dd></div>
        <div><dt><RouteIcon /> Build a realistic day</dt><dd>Keep room for meal breaks, changing road conditions and check-in times on longer hill routes.</dd></div>
        <div><dt><Luggage /> Match vehicle and luggage</dt><dd>Choose capacity for passengers and bags together, particularly for family and multi-day travel.</dd></div>
      </dl>
    </section>

    <section className="route-related uttarakhand-route-directory">
      <div className="seo-guide-heading">
        <span className="eyebrow">Pilgrimage &amp; spiritual travel</span>
        <h2>In-depth guides for major pilgrimage sites</h2>
        <p>Char Dham routes and Kainchi Dham each have their own road access, timing and trek considerations &mdash; covered in detail beyond the standard route pages.</p>
      </div>
      <ul>
        <li><Link href="/kedarnath-cab"><span>Kedarnath travel guide</span><small>Trek from Gaurikund</small></Link></li>
        <li><Link href="/badrinath-cab"><span>Badrinath travel guide</span><small>Road access to the temple</small></Link></li>
        <li><Link href="/gangotri-cab"><span>Gangotri travel guide</span><small>Source of the Ganga</small></Link></li>
        <li><Link href="/yamunotri-cab"><span>Yamunotri travel guide</span><small>Trek from Janki Chatti</small></Link></li>
        <li><Link href="/kainchi-dham-cab"><span>Kainchi Dham travel guide</span><small>Neem Karoli Baba ashram</small></Link></li>
      </ul>
    </section>

    <section className="route-related uttarakhand-route-directory">
      <div className="seo-guide-heading">
        <span className="eyebrow">Detailed route references</span>
        <h2>Popular {ORIGIN_CITY} to Uttarakhand cab routes</h2>
        <p>These guides provide a distance and travel-time reference from {ORIGIN_CITY}. You can still enter a different pickup city in the booking form.</p>
      </div>
      <ul>{UTTARAKHAND_ROUTES.map(route => <li key={route.slug}>
        <Link href={route.path}><span>{ORIGIN_CITY} to {route.city} cab</span><small>{route.distanceKm} km</small></Link>
      </li>)}</ul>
    </section>

    <section className="seo-guide-cta">
      <span className="eyebrow">Flexible pickup</span>
      <h2>Your Uttarakhand journey can begin anywhere in India.</h2>
      <p>Enter your actual starting point and destination to view the relevant vehicles and fare breakdown.</p>
      <Link className="button button-gold" href="/#book">Start planning <ArrowRight /></Link>
    </section>
  </article>;
}
