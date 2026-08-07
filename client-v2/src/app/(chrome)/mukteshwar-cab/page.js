import Link from 'next/link';
import {
  ArrowRight, CalendarDays, Landmark, MapPin, Route as RouteIcon, TrainFront, Users
} from 'lucide-react';
import { money } from '../../../lib/format.js';
import { resultsHref, routePageBySlug, sedanFareEstimate } from '../../../data/routePages.js';

const SITE_URL = 'https://www.wondertravel.online';
const META = {
  title: 'Delhi to Mukteshwar Cab — Villa Stays & Orchard Views Route | WonderTravel',
  description: 'Plan a Delhi to Mukteshwar cab journey to Kumaon\'s quiet hill escape: route, distance, luxury villa stays, orchard resorts and how to combine it with Nainital or Bhimtal.'
};

const ROAD_STAGES = [
  ['Delhi to Rudrapur', 'Plains driving on national highway, the fastest stretch of the journey.'],
  ['Rudrapur to Haldwani', 'The last flat town before the hills begin &mdash; the usual gateway into Kumaon.'],
  ['Haldwani to Mukteshwar', 'A longer, quieter hill climb past Bhowali, gaining altitude towards the ridge-top orchard country.']
];

const PLACE_FACTS = [
  ['What it is', 'A quiet Kumaon hill town known for apple orchards, boutique villa stays and some of the widest unobstructed Himalayan views in the region.'],
  ['Why travellers come', 'Luxury and boutique villa stays, orchard resorts, the Chauli Ki Jali cliff-edge viewpoint, and a noticeably calmer pace than Nainital or Mussoorie.'],
  ['Elevation', 'Around 2,171 m above sea level, with clear-day views of the Nanda Devi and Panchachuli peaks.'],
  ['Growing trend', 'Search interest has risen sharply as travellers look past the crowded mainstream hill stations towards quieter alternatives with premium stays.']
];

const PLAN_POINTS = [
  ['Best time to visit', 'March to June for pleasant weather and apple blossom season; September to November for the clearest mountain views; December for a colder, quieter trip.'],
  ['Villa bookings', 'Boutique villas and orchard resorts here are limited in number and fill up quickly around long weekends &mdash; book well ahead.'],
  ['Combine with Nainital or Bhimtal', 'Mukteshwar is a short detour from the Nainital&ndash;Bhimtal loop, making it easy to add to a wider Kumaon itinerary.'],
  ['Quiet-travel pick', 'Suited to travellers looking for a slower, less crowded hill escape than the more mainstream Kumaon towns.']
];

const GATEWAY_LINKS = [
  ['Nearest railhead', 'Kathgodam, near Haldwani', TrainFront],
  ['Nearest hill town', 'Bhowali, on the way up', MapPin],
  ['Often combined with', 'Nainital or Bhimtal trips', Users]
];

export async function generateMetadata() {
  return {
    title: META.title,
    description: META.description,
    robots: { index: true, follow: true, 'max-image-preview': 'large' },
    alternates: { canonical: '/mukteshwar-cab' },
    openGraph: { title: META.title, description: META.description, url: '/mukteshwar-cab' },
    twitter: { title: META.title, description: META.description }
  };
}

export default function MukteshwarCabPage() {
  const canonicalUrl = `${SITE_URL}/mukteshwar-cab`;
  const route = routePageBySlug('delhi-to-mukteshwar');
  const sedanFare = route ? sedanFareEstimate(route) : null;
  const bookHref = route ? resultsHref(route) : '/#book';
  const faqs = [
    {
      q: 'How far is Mukteshwar from Delhi by road?',
      a: 'Mukteshwar is roughly 335&ndash;345 km from Delhi by road, travelling via Rudrapur and Haldwani. The drive typically takes around 8&ndash;9 hours including the hill climb.'
    },
    {
      q: 'What is Mukteshwar known for?',
      a: 'Boutique and luxury villa stays, apple orchard resorts, the Chauli Ki Jali cliff-edge viewpoint, and some of the clearest Himalayan views in Kumaon.'
    },
    {
      q: 'How is Mukteshwar different from Nainital?',
      a: 'Mukteshwar is quieter and less commercialised than Nainital, with a focus on villa and resort stays rather than a busy town centre &mdash; better suited to travellers wanting a slower pace.'
    },
    {
      q: 'Can I combine Mukteshwar with Nainital or Bhimtal?',
      a: 'Yes. Mukteshwar is a short detour from the Nainital&ndash;Bhimtal loop and is commonly added to the same Kumaon itinerary.'
    },
    {
      q: 'What is the best time to visit Mukteshwar?',
      a: 'March to June for pleasant weather, September to November for the clearest mountain views, and December for a colder, quieter visit.'
    },
    {
      q: 'Can WonderTravel arrange a Delhi to Mukteshwar cab?',
      a: 'Yes. We can plan it as a one-way or round-trip booking, and combine it with Nainital or Bhimtal in a single vehicle booking.'
    }
  ];

  const pageSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
          { '@type': 'ListItem', position: 2, name: 'Uttarakhand cabs', item: `${SITE_URL}/uttarakhand-cabs` },
          { '@type': 'ListItem', position: 3, name: 'Delhi to Mukteshwar cab', item: canonicalUrl }
        ]
      },
      {
        '@type': 'TouristAttraction',
        name: 'Mukteshwar',
        description: 'A quiet Kumaon hill town known for apple orchards, boutique villa stays and wide Himalayan views.',
        address: { '@type': 'PostalAddress', addressRegion: 'Uttarakhand', addressCountry: 'IN' }
      },
      {
        '@type': 'Service',
        name: 'Delhi to Mukteshwar cab',
        serviceType: 'One-way, round-trip and multi-stop driver-assisted cab travel',
        provider: { '@id': `${SITE_URL}/#business` },
        areaServed: [
          { '@type': 'City', name: 'Delhi' },
          { '@type': 'Place', name: 'Mukteshwar, Uttarakhand' }
        ],
        url: canonicalUrl,
        ...(sedanFare ? {
          offers: {
            '@type': 'Offer',
            price: sedanFare,
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

  return <article className="seo-guide page-shell">
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(pageSchema) }}
    />
    <nav className="route-crumbs" aria-label="Breadcrumb">
      <Link href="/">Home</Link><span aria-hidden="true">/</span>
      <Link href="/uttarakhand-cabs">Uttarakhand cabs</Link><span aria-hidden="true">/</span>
      <span aria-current="page">Mukteshwar</span>
    </nav>

    <header className="seo-guide-hero">
      <span className="eyebrow">Kumaon&rsquo;s quiet escape</span>
      <h1>Delhi to Mukteshwar Cab</h1>
      <p>Mukteshwar is highly searched for luxury villa stays, apple orchard resorts and scenic valley views &mdash; a calmer alternative to the busier Kumaon hill towns. Here is the route, the fare and what to plan for.</p>
      {route && <div className="route-facts">
        <div><RouteIcon aria-hidden="true" /><span>Distance</span><b>{route.distanceKm} km</b></div>
        {sedanFare && <div><MapPin aria-hidden="true" /><span>Sedan fare</span><b>from {money(sedanFare)}</b></div>}
      </div>}
      <div className="seo-guide-actions">
        <Link className="button button-ember" href={bookHref}>Check fares and book <ArrowRight /></Link>
        <Link className="button button-ghost" href="/cabs/delhi-to-mukteshwar">Full fare breakdown</Link>
        <Link className="button button-ghost" href="/uttarakhand-cabs">Explore Uttarakhand cabs</Link>
      </div>
    </header>

    <section className="seo-guide-section">
      <div className="seo-guide-heading">
        <span className="eyebrow">Getting there</span>
        <h2>Nearest gateways</h2>
      </div>
      <div className="seo-card-grid">
        {GATEWAY_LINKS.map(([title, text, Icon]) => <article key={title}>
          <Icon /><h3>{title}</h3><p>{text}</p>
        </article>)}
      </div>
    </section>

    <section className="seo-guide-section" aria-labelledby="road-route-title">
      <div className="seo-guide-heading">
        <span className="eyebrow">Road route</span>
        <h2 id="road-route-title">Delhi to Mukteshwar, stage by stage</h2>
        <p>The road distance from Delhi to Mukteshwar is roughly 335&ndash;345 km, depending on the exact route and starting point in Delhi, with a longer hill climb than Nainital.</p>
      </div>
      <div className="seo-checklist">
        {ROAD_STAGES.map(([title, text], index) => <div key={title}>
          <b>{index + 1}</b><span><strong>{title}</strong><small>{text}</small></span>
        </div>)}
      </div>
    </section>

    <section className="seo-guide-split">
      <div className="seo-guide-heading">
        <span className="eyebrow">About the destination</span>
        <h2><Landmark aria-hidden="true" style={{ display: 'inline', width: '0.85em', height: '0.85em', verticalAlign: '-0.08em', marginRight: '0.3em' }} />Mukteshwar</h2>
        <p>Orchard country and boutique stays, with some of Kumaon&rsquo;s widest mountain views.</p>
      </div>
      <dl className="seo-definition-list">
        {PLACE_FACTS.map(([title, text]) => <div key={title}><dt><MapPin /> {title}</dt><dd>{text}</dd></div>)}
      </dl>
    </section>

    <section className="seo-guide-section">
      <div className="seo-guide-heading">
        <span className="eyebrow">Before you travel</span>
        <h2>What to plan for</h2>
      </div>
      <div className="seo-card-grid seo-region-grid">
        {PLAN_POINTS.map(([title, text]) => <article key={title}><CalendarDays /><h3>{title}</h3><p>{text}</p></article>)}
      </div>
    </section>

    <section className="route-related uttarakhand-route-directory">
      <div className="seo-guide-heading">
        <span className="eyebrow">Nearby destinations</span>
        <h2>Combine your trip with nearby stops</h2>
        <p>Mukteshwar is close to Nainital and Bhimtal.</p>
      </div>
      <ul>
        <li><Link href="/nainital-cab"><span>Delhi to Nainital cab</span><small><RouteIcon aria-hidden="true" style={{ width: '0.9em', height: '0.9em' }} /></small></Link></li>
        <li><Link href="/cabs/delhi-to-bhimtal"><span>Delhi to Bhimtal cab</span><small><RouteIcon aria-hidden="true" style={{ width: '0.9em', height: '0.9em' }} /></small></Link></li>
        <li><Link href="/kainchi-dham-cab"><span>Kainchi Dham travel guide</span><small><RouteIcon aria-hidden="true" style={{ width: '0.9em', height: '0.9em' }} /></small></Link></li>
      </ul>
    </section>

    <section className="route-faq">
      <h2>Common questions about Mukteshwar travel</h2>
      {faqs.map(item => <details key={item.q}><summary>{item.q}</summary><p>{item.a}</p></details>)}
      <p className="route-guide-link">More questions? See our full <Link href="/taxi-faq">taxi FAQ</Link>.</p>
    </section>

    <section className="seo-guide-cta">
      <span className="eyebrow">Flexible booking</span>
      <h2>Start planning your Mukteshwar trip.</h2>
      <p>Tell us your dates and pickup city &mdash; we&rsquo;ll help plan the drive, alone or combined with Nainital or Bhimtal.</p>
      <Link className="button button-gold" href="/#book">Start planning <ArrowRight /></Link>
    </section>
  </article>;
}
