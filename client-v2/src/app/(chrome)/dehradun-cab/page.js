import Link from 'next/link';
import {
  ArrowRight, CalendarDays, Landmark, MapPin, Route as RouteIcon, TrainFront, Users
} from 'lucide-react';
import { money } from '../../../lib/format.js';
import { resultsHref, routePageBySlug, sedanFareEstimate } from '../../../data/routePages.js';

const SITE_URL = 'https://www.wondertravel.online';
const META = {
  title: 'Delhi to Dehradun Cab — Doon Valley & Cafe Hub Route | WonderTravel',
  description: 'Plan a Delhi to Dehradun cab journey to the Doon valley capital: route, distance, cafe culture and sightseeing, and how to combine it with Mussoorie or Rishikesh.'
};

const ROAD_STAGES = [
  ['Delhi to Meerut', 'A fast expressway stretch out of the city.'],
  ['Meerut to Roorkee', 'Continued plains driving on national highway towards the Doon valley approach.'],
  ['Roorkee to Dehradun', 'The final stretch into the state capital, nestled between the Shivalik and Mussoorie ranges.']
];

const PLACE_FACTS = [
  ['What it is', 'The capital of Uttarakhand, a valley city between the Shivalik hills and the Himalayan foothills, and the state&rsquo;s main transit gateway.'],
  ['Why travellers come', 'A growing cafe and food scene, Robber&rsquo;s Cave (Guchhu Pani), Sahastradhara sulphur springs, Forest Research Institute, and its role as the base for onward trips to Mussoorie, Rishikesh and Haridwar.'],
  ['Elevation', 'Around 640 m above sea level &mdash; milder than the plains but noticeably warmer than the hill stations above it.'],
  ['Growing trend', 'Search interest in Dehradun has risen quickly as an urban escape and transit hub, rather than only a stopover en route to the hills.']
];

const PLAN_POINTS = [
  ['Best time to visit', 'March to June and September to November for pleasant weather; winters are cool but mild compared with the surrounding hill stations.'],
  ['Use as a base', 'Dehradun&rsquo;s central location makes it a practical base for day trips to Mussoorie, Rishikesh, Haridwar or Sahastradhara.'],
  ['Transit hub', 'Dehradun has the region&rsquo;s main railhead and airport (Jolly Grant), so many hill-bound travellers pass through it regardless of their final destination.'],
  ['Weekday advantage', 'City traffic and cafe crowds ease up on weekdays, useful if the visit is purely a city-exploration trip.']
];

const GATEWAY_LINKS = [
  ['Nearest railhead', 'Dehradun railway station, in the city', TrainFront],
  ['Nearest airport', 'Jolly Grant Airport, roughly 25 km away', MapPin],
  ['Often combined with', 'Mussoorie, Rishikesh or Haridwar trips', Users]
];

export async function generateMetadata() {
  return {
    title: META.title,
    description: META.description,
    robots: { index: true, follow: true, 'max-image-preview': 'large' },
    alternates: { canonical: '/dehradun-cab' },
    openGraph: { title: META.title, description: META.description, url: '/dehradun-cab' },
    twitter: { title: META.title, description: META.description }
  };
}

export default function DehradunCabPage() {
  const canonicalUrl = `${SITE_URL}/dehradun-cab`;
  const route = routePageBySlug('delhi-to-dehradun');
  const sedanFare = route ? sedanFareEstimate(route) : null;
  const bookHref = route ? resultsHref(route) : '/#book';
  const faqs = [
    {
      q: 'How far is Dehradun from Delhi by road?',
      a: 'Dehradun is roughly 225&ndash;235 km from Delhi by road, travelling via Meerut and Roorkee. The drive typically takes around 5&ndash;6 hours depending on traffic.'
    },
    {
      q: 'What is Dehradun known for?',
      a: 'A growing cafe and food scene, Robber&rsquo;s Cave, Sahastradhara sulphur springs, and its role as the main transit gateway to Mussoorie, Rishikesh and Haridwar.'
    },
    {
      q: 'Is Dehradun worth visiting on its own, or only as a stopover?',
      a: 'Both. It works well as a standalone city trip for its cafes and sightseeing, and equally well as a base for day trips into the surrounding hills.'
    },
    {
      q: 'How far is Mussoorie from Dehradun?',
      a: 'Mussoorie is about 35 km from Dehradun, roughly an hour&rsquo;s drive up the hill road.'
    },
    {
      q: 'What is the best time to visit Dehradun?',
      a: 'March to June and September to November offer the most pleasant weather; winters are cool but generally milder than the hill stations above it.'
    },
    {
      q: 'Can WonderTravel arrange a Delhi to Dehradun cab?',
      a: 'Yes. We can plan it as a one-way or round-trip booking, and combine it with Mussoorie, Rishikesh or Haridwar in a single vehicle booking.'
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
          { '@type': 'ListItem', position: 3, name: 'Delhi to Dehradun cab', item: canonicalUrl }
        ]
      },
      {
        '@type': 'TouristAttraction',
        name: 'Dehradun',
        description: 'The capital of Uttarakhand, a valley city known for its cafe culture, Robber&rsquo;s Cave and Sahastradhara, and its role as the region&rsquo;s main transit gateway.',
        address: { '@type': 'PostalAddress', addressRegion: 'Uttarakhand', addressCountry: 'IN' }
      },
      {
        '@type': 'Service',
        name: 'Delhi to Dehradun cab',
        serviceType: 'One-way, round-trip and multi-stop driver-assisted cab travel',
        provider: { '@id': `${SITE_URL}/#business` },
        areaServed: [
          { '@type': 'City', name: 'Delhi' },
          { '@type': 'City', name: 'Dehradun, Uttarakhand' }
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
      <span aria-current="page">Dehradun</span>
    </nav>

    <header className="seo-guide-hero">
      <span className="eyebrow">Doon valley capital</span>
      <h1>Delhi to Dehradun Cab</h1>
      <p>Dehradun is emerging fast as both an urban escape with a growing cafe scene and the primary transit gateway into the Uttarakhand hills. Here is the route, the fare and what to plan for.</p>
      {route && <div className="route-facts">
        <div><RouteIcon aria-hidden="true" /><span>Distance</span><b>{route.distanceKm} km</b></div>
        {sedanFare && <div><MapPin aria-hidden="true" /><span>Sedan fare</span><b>from {money(sedanFare)}</b></div>}
      </div>}
      <div className="seo-guide-actions">
        <Link className="button button-ember" href={bookHref}>Check fares and book <ArrowRight /></Link>
        <Link className="button button-ghost" href="/cabs/delhi-to-dehradun">Full fare breakdown</Link>
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
        <h2 id="road-route-title">Delhi to Dehradun, stage by stage</h2>
        <p>The road distance from Delhi to Dehradun is roughly 225&ndash;235 km, depending on the exact route and starting point in Delhi &mdash; largely plains driving on national highway.</p>
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
        <h2><Landmark aria-hidden="true" style={{ display: 'inline', width: '0.85em', height: '0.85em', verticalAlign: '-0.08em', marginRight: '0.3em' }} />Dehradun</h2>
        <p>City sightseeing, cafe culture and the launch point for most hill-bound journeys in the state.</p>
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
        <p>Dehradun is a short drive from several popular destinations.</p>
      </div>
      <ul>
        <li><Link href="/mussoorie-cab"><span>Delhi to Mussoorie cab</span><small><RouteIcon aria-hidden="true" style={{ width: '0.9em', height: '0.9em' }} /></small></Link></li>
        <li><Link href="/rishikesh-cab"><span>Delhi to Rishikesh cab</span><small><RouteIcon aria-hidden="true" style={{ width: '0.9em', height: '0.9em' }} /></small></Link></li>
        <li><Link href="/cabs/delhi-to-haridwar"><span>Delhi to Haridwar cab</span><small><RouteIcon aria-hidden="true" style={{ width: '0.9em', height: '0.9em' }} /></small></Link></li>
      </ul>
    </section>

    <section className="route-faq">
      <h2>Common questions about Dehradun travel</h2>
      {faqs.map(item => <details key={item.q}><summary>{item.q}</summary><p>{item.a}</p></details>)}
      <p className="route-guide-link">More questions? See our full <Link href="/taxi-faq">taxi FAQ</Link>.</p>
    </section>

    <section className="seo-guide-cta">
      <span className="eyebrow">Flexible booking</span>
      <h2>Start planning your Dehradun trip.</h2>
      <p>Tell us your dates and pickup city &mdash; we&rsquo;ll help plan the drive, alone or combined with Mussoorie or Rishikesh.</p>
      <Link className="button button-gold" href="/#book">Start planning <ArrowRight /></Link>
    </section>
  </article>;
}
