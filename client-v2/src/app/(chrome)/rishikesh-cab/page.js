import Link from 'next/link';
import {
  ArrowRight, CalendarDays, Landmark, MapPin, Route as RouteIcon, TrainFront, Users
} from 'lucide-react';
import { money } from '../../../lib/format.js';
import { resultsHref, routePageBySlug, sedanFareEstimate } from '../../../data/routePages.js';

const SITE_URL = 'https://www.wondertravel.online';
const META = {
  title: 'Delhi to Rishikesh Cab — Yoga, Rafting & Ganga Aarti Route | WonderTravel',
  description: 'Plan a Delhi to Rishikesh cab journey to the yoga capital of the world: route, distance, best time for rafting and ashram stays, and how to combine it with Haridwar or the Char Dham gateways.'
};

const ROAD_STAGES = [
  ['Delhi to Meerut', 'A fast expressway stretch out of the city.'],
  ['Meerut to Haridwar', 'Continued plains driving on national highway towards the twin pilgrim towns.'],
  ['Haridwar to Rishikesh', 'A short final stretch along the Ganga, arriving at the yoga and rafting town.']
];

const PLACE_FACTS = [
  ['What it is', 'A town on the banks of the Ganga known globally as the &ldquo;Yoga Capital of the World&rdquo;, and the gateway to the Char Dham pilgrimage roads further into the hills.'],
  ['Why travellers come', 'Yoga and meditation retreats, ashram stays, white-water rafting, the Ganga Aarti at Triveni Ghat, and the Laxman Jhula and Ram Jhula suspension bridges.'],
  ['Rafting season', 'White-water rafting typically runs from September to June; the river is closed to rafting during the monsoon months (July&ndash;August) for safety.'],
  ['Gateway role', 'Rishikesh is also the last major town before the road climbs towards Uttarkashi, Gangotri, Yamunotri, Kedarnath and Badrinath &mdash; most Char Dham itineraries route through it.']
];

const PLAN_POINTS = [
  ['Best time to visit', 'September to June for rafting and pleasant weather; the monsoon months see the Ganga in spate and rafting paused.'],
  ['Ashram and yoga bookings', 'Popular ashrams and retreat centres fill up in advance, especially around International Yoga Day (June) and the winter season.'],
  ['Combine with Haridwar', 'Haridwar is barely half an hour away, so most travellers combine a Rishikesh trip with the Har Ki Pauri Ganga Aarti in the same visit.'],
  ['Onward Char Dham travel', 'If continuing towards Gangotri, Yamunotri, Kedarnath or Badrinath, Rishikesh is a natural overnight stop before the longer hill drive.']
];

const GATEWAY_LINKS = [
  ['Nearest railhead', 'Rishikesh and Haridwar stations', TrainFront],
  ['Nearest airport', 'Dehradun (Jolly Grant), roughly 20 km away', MapPin],
  ['Often combined with', 'Haridwar, or onward Char Dham routes', Users]
];

export async function generateMetadata() {
  return {
    title: META.title,
    description: META.description,
    robots: { index: true, follow: true, 'max-image-preview': 'large' },
    alternates: { canonical: '/rishikesh-cab' },
    openGraph: { title: META.title, description: META.description, url: '/rishikesh-cab' },
    twitter: { title: META.title, description: META.description }
  };
}

export default function RishikeshCabPage() {
  const canonicalUrl = `${SITE_URL}/rishikesh-cab`;
  const route = routePageBySlug('delhi-to-rishikesh');
  const sedanFare = route ? sedanFareEstimate(route) : null;
  const bookHref = route ? resultsHref(route) : '/#book';
  const faqs = [
    {
      q: 'How far is Rishikesh from Delhi by road?',
      a: 'Rishikesh is roughly 235&ndash;245 km from Delhi by road, travelling via Meerut and Haridwar. The drive typically takes around 5&ndash;6 hours depending on traffic.'
    },
    {
      q: 'What is Rishikesh known for?',
      a: 'Yoga and meditation retreats, ashram stays, white-water rafting on the Ganga, the Ganga Aarti at Triveni Ghat, and the Laxman Jhula and Ram Jhula suspension bridges.'
    },
    {
      q: 'When is rafting season in Rishikesh?',
      a: 'Rafting generally runs from September to June. The river is closed to rafting during the monsoon months (July and August) when water levels and currents make it unsafe.'
    },
    {
      q: 'Can I visit Haridwar and Rishikesh in the same trip?',
      a: 'Yes, easily. Haridwar is about half an hour from Rishikesh, so most travellers combine both towns &mdash; including the Har Ki Pauri Ganga Aarti &mdash; in a single visit.'
    },
    {
      q: 'Is Rishikesh a good base for the Char Dham yatra?',
      a: 'Yes. Rishikesh is the last major town before the road climbs into the Garhwal hills towards Gangotri, Yamunotri, Kedarnath and Badrinath, and is commonly used as an overnight halt.'
    },
    {
      q: 'Can WonderTravel arrange a Delhi to Rishikesh cab?',
      a: 'Yes. We can plan it as a one-way or round-trip booking, and combine it with Haridwar or an onward Char Dham itinerary in a single vehicle booking.'
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
          { '@type': 'ListItem', position: 3, name: 'Delhi to Rishikesh cab', item: canonicalUrl }
        ]
      },
      {
        '@type': 'TouristAttraction',
        name: 'Rishikesh',
        description: 'A town on the banks of the Ganga known as the Yoga Capital of the World, popular for ashram stays, yoga retreats and white-water rafting.',
        address: { '@type': 'PostalAddress', addressRegion: 'Uttarakhand', addressCountry: 'IN' }
      },
      {
        '@type': 'Service',
        name: 'Delhi to Rishikesh cab',
        serviceType: 'One-way, round-trip and multi-stop driver-assisted cab travel',
        provider: { '@id': `${SITE_URL}/#business` },
        areaServed: [
          { '@type': 'City', name: 'Delhi' },
          { '@type': 'Place', name: 'Rishikesh, Uttarakhand' }
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
      <span aria-current="page">Rishikesh</span>
    </nav>

    <header className="seo-guide-hero">
      <span className="eyebrow">Yoga capital of the world</span>
      <h1>Delhi to Rishikesh Cab</h1>
      <p>Rishikesh draws heavy search demand for wellness tourism, yoga retreats, ashram stays and river rafting &mdash; and doubles as the main gateway town for onward Char Dham travel. Here is the route, the fare and what to plan for.</p>
      {route && <div className="route-facts">
        <div><RouteIcon aria-hidden="true" /><span>Distance</span><b>{route.distanceKm} km</b></div>
        {sedanFare && <div><MapPin aria-hidden="true" /><span>Sedan fare</span><b>from {money(sedanFare)}</b></div>}
      </div>}
      <div className="seo-guide-actions">
        <Link className="button button-ember" href={bookHref}>Check fares and book <ArrowRight /></Link>
        <Link className="button button-ghost" href="/cabs/delhi-to-rishikesh">Full fare breakdown</Link>
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
        <h2 id="road-route-title">Delhi to Rishikesh, stage by stage</h2>
        <p>The road distance from Delhi to Rishikesh is roughly 235&ndash;245 km, depending on the exact route and starting point in Delhi &mdash; mostly plains driving with a short final stretch along the Ganga.</p>
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
        <h2><Landmark aria-hidden="true" style={{ display: 'inline', width: '0.85em', height: '0.85em', verticalAlign: '-0.08em', marginRight: '0.3em' }} />Rishikesh</h2>
        <p>Part pilgrim town, part wellness destination, part trekking and rafting hub &mdash; and the launch point for the Char Dham roads.</p>
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
        <span className="eyebrow">Onward hill routes</span>
        <h2>Combine your trip with nearby destinations</h2>
        <p>Rishikesh is the natural starting point for several onward hill and pilgrimage routes.</p>
      </div>
      <ul>
        <li><Link href="/cabs/delhi-to-haridwar"><span>Delhi to Haridwar cab</span><small><RouteIcon aria-hidden="true" style={{ width: '0.9em', height: '0.9em' }} /></small></Link></li>
        <li><Link href="/mussoorie-cab"><span>Delhi to Mussoorie cab</span><small><RouteIcon aria-hidden="true" style={{ width: '0.9em', height: '0.9em' }} /></small></Link></li>
        <li><Link href="/kedarnath-cab"><span>Kedarnath travel guide</span><small><RouteIcon aria-hidden="true" style={{ width: '0.9em', height: '0.9em' }} /></small></Link></li>
      </ul>
    </section>

    <section className="route-faq">
      <h2>Common questions about Rishikesh travel</h2>
      {faqs.map(item => <details key={item.q}><summary>{item.q}</summary><p>{item.a}</p></details>)}
      <p className="route-guide-link">More questions? See our full <Link href="/taxi-faq">taxi FAQ</Link>.</p>
    </section>

    <section className="seo-guide-cta">
      <span className="eyebrow">Flexible booking</span>
      <h2>Start planning your Rishikesh trip.</h2>
      <p>Tell us your dates and pickup city &mdash; we&rsquo;ll help plan the drive, alone or combined with Haridwar or an onward Char Dham route.</p>
      <Link className="button button-gold" href="/#book">Start planning <ArrowRight /></Link>
    </section>
  </article>;
}
