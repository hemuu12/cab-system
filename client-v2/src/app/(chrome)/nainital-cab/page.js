import Link from 'next/link';
import {
  ArrowRight, CalendarDays, Landmark, MapPin, Route as RouteIcon, TrainFront, Users
} from 'lucide-react';
import { money } from '../../../lib/format.js';
import { resultsHref, routePageBySlug, sedanFareEstimate } from '../../../data/routePages.js';

const SITE_URL = 'https://www.wondertravel.online';
const META = {
  title: 'Delhi to Nainital Cab — Lake, Mall Road & Kumaon Route | WonderTravel',
  description: 'Plan a Delhi to Nainital cab journey to the lake town of Kumaon: route, distance, best time to visit, why travellers head there and how to combine it with nearby hill stations.'
};

const ROAD_STAGES = [
  ['Delhi to Rudrapur', 'Plains driving on national highway, the fastest stretch of the journey.'],
  ['Rudrapur to Haldwani', 'The last flat town before the hills begin &mdash; the usual gateway into the Kumaon range.'],
  ['Haldwani to Nainital', 'A winding climb through Bhowali towards the lake, gaining altitude for the final stretch into town.']
];

const PLACE_FACTS = [
  ['What it is', 'A colonial-era lake town built around Naini Lake, the administrative capital of Kumaon and one of Uttarakhand&rsquo;s most visited hill stations.'],
  ['Why travellers come', 'Boating on Naini Lake, the Mall Road promenade, Naina Devi Temple, cable car to Snow View Point, and cooler weather as an escape from the North Indian summer heat.'],
  ['Elevation', 'Around 2,084 m above sea level &mdash; noticeably cooler than the plains, especially mornings and evenings.'],
  ['Peak season', 'Summer (April&ndash;June) sees the heaviest search and travel demand as families escape the heatwave; winter (December&ndash;January) draws visitors for the cold and occasional snowfall in the surrounding hills.']
];

const PLAN_POINTS = [
  ['Best time to visit', 'March to June for pleasant weather and boating; September to November for clear skies after the monsoon; December for a colder, quieter, occasionally snowy trip.'],
  ['Weekend crowding', 'Mall Road and the lake area get very busy on weekends and long holidays; a weekday visit is calmer and parking is easier to find.'],
  ['Combine with Bhimtal or Kainchi Dham', 'Nainital sits close to Bhimtal, Sattal, Naukuchiatal and the Kainchi Dham ashram &mdash; easy to add as a short detour on the same trip.'],
  ['Monsoon caution', 'The hill roads around Nainital can see landslide-related delays during heavy monsoon (July&ndash;August); build in extra travel time if visiting then.']
];

const GATEWAY_LINKS = [
  ['Nearest railhead', 'Kathgodam, at the base of the climb', TrainFront],
  ['Nearest airport', 'Pantnagar, roughly an hour away', MapPin],
  ['Often combined with', 'Bhimtal, Sattal or Kainchi Dham trips', Users]
];

export async function generateMetadata() {
  return {
    title: META.title,
    description: META.description,
    robots: { index: true, follow: true, 'max-image-preview': 'large' },
    alternates: { canonical: '/nainital-cab' },
    openGraph: { title: META.title, description: META.description, url: '/nainital-cab' },
    twitter: { title: META.title, description: META.description }
  };
}

export default function NainitalCabPage() {
  const canonicalUrl = `${SITE_URL}/nainital-cab`;
  // The matching /cabs/delhi-to-nainital fare page carries the real live-fetched rate at build
  // time; reuse its distance/fare here too so this guide's Offer schema and this page's price
  // never disagree with the dedicated fare page.
  const route = routePageBySlug('delhi-to-nainital');
  const sedanFare = route ? sedanFareEstimate(route) : null;
  const bookHref = route ? resultsHref(route) : '/#book';
  const faqs = [
    {
      q: 'How far is Nainital from Delhi by road?',
      a: 'Nainital is roughly 275&ndash;285 km from Delhi by road, travelling via Rudrapur and Haldwani. The drive typically takes 7&ndash;8 hours depending on traffic and the final hill climb from Haldwani.'
    },
    {
      q: 'What is the best time to visit Nainital?',
      a: 'Summer (April to June) is the busiest season, popular as a heatwave escape. Autumn (September to November) offers clear mountain views. Winter (December to January) is colder and quieter, with occasional snow in the surrounding hills.'
    },
    {
      q: 'What is Nainital famous for?',
      a: 'Naini Lake and boating, the Mall Road promenade, Naina Devi Temple, the Snow View Point cable car, and its role as the gateway to the wider Kumaon hill region.'
    },
    {
      q: 'Can I combine a Nainital trip with Bhimtal or Kainchi Dham?',
      a: 'Yes. Bhimtal, Sattal, Naukuchiatal and the Kainchi Dham ashram are all a short drive from Nainital and are commonly added to the same itinerary.'
    },
    {
      q: 'Is the Nainital road safe during monsoon?',
      a: 'The hill stretch from Haldwani to Nainital can see landslide-related delays during heavy monsoon rain (July&ndash;August). We recommend checking road conditions and building in extra travel time if travelling in that window.'
    },
    {
      q: 'Can WonderTravel arrange a Delhi to Nainital cab?',
      a: 'Yes. We can plan it as a one-way or round-trip booking, and combine it with nearby Kumaon stops such as Bhimtal or Kainchi Dham in a single vehicle booking.'
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
          { '@type': 'ListItem', position: 3, name: 'Delhi to Nainital cab', item: canonicalUrl }
        ]
      },
      {
        '@type': 'TouristAttraction',
        name: 'Nainital',
        description: 'A colonial-era lake town in Kumaon, Uttarakhand, built around Naini Lake, known for boating, the Mall Road and cooler hill weather.',
        address: { '@type': 'PostalAddress', addressRegion: 'Uttarakhand', addressCountry: 'IN' }
      },
      {
        '@type': 'Service',
        name: 'Delhi to Nainital cab',
        serviceType: 'One-way, round-trip and multi-stop driver-assisted cab travel',
        provider: { '@id': `${SITE_URL}/#business` },
        areaServed: [
          { '@type': 'City', name: 'Delhi' },
          { '@type': 'Place', name: 'Nainital, Uttarakhand' }
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
      <span aria-current="page">Nainital</span>
    </nav>

    <header className="seo-guide-hero">
      <span className="eyebrow">Kumaon&rsquo;s lake town</span>
      <h1>Delhi to Nainital Cab</h1>
      <p>Nainital, built around the emerald Naini Lake, is one of the most searched hill-station destinations in Uttarakhand &mdash; a favourite summer escape from the plains heat and the gateway to the wider Kumaon region. Here is the route, the fare and why travellers head there.</p>
      {route && <div className="route-facts">
        <div><RouteIcon aria-hidden="true" /><span>Distance</span><b>{route.distanceKm} km</b></div>
        {sedanFare && <div><MapPin aria-hidden="true" /><span>Sedan fare</span><b>from {money(sedanFare)}</b></div>}
      </div>}
      <div className="seo-guide-actions">
        <Link className="button button-ember" href={bookHref}>Check fares and book <ArrowRight /></Link>
        <Link className="button button-ghost" href="/cabs/delhi-to-nainital">Full fare breakdown</Link>
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
        <h2 id="road-route-title">Delhi to Nainital, stage by stage</h2>
        <p>The road distance from Delhi to Nainital is roughly 275&ndash;285 km, depending on the exact route and starting point in Delhi, with the final climb from Haldwani adding travel time beyond the plain-road distance.</p>
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
        <h2><Landmark aria-hidden="true" style={{ display: 'inline', width: '0.85em', height: '0.85em', verticalAlign: '-0.08em', marginRight: '0.3em' }} />Nainital</h2>
        <p>A lake town that draws travellers year-round, with the sharpest demand spike every summer.</p>
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
        <span className="eyebrow">Nearby Kumaon destinations</span>
        <h2>Combine your trip with nearby hill stations</h2>
        <p>Nainital sits close to several popular Kumaon destinations.</p>
      </div>
      <ul>
        <li><Link href="/kainchi-dham-cab"><span>Kainchi Dham travel guide</span><small><RouteIcon aria-hidden="true" style={{ width: '0.9em', height: '0.9em' }} /></small></Link></li>
        <li><Link href="/mukteshwar-cab"><span>Delhi to Mukteshwar cab</span><small><RouteIcon aria-hidden="true" style={{ width: '0.9em', height: '0.9em' }} /></small></Link></li>
        <li><Link href="/cabs/delhi-to-bhimtal"><span>Delhi to Bhimtal cab</span><small><RouteIcon aria-hidden="true" style={{ width: '0.9em', height: '0.9em' }} /></small></Link></li>
      </ul>
    </section>

    <section className="route-faq">
      <h2>Common questions about Nainital travel</h2>
      {faqs.map(item => <details key={item.q}><summary>{item.q}</summary><p>{item.a}</p></details>)}
      <p className="route-guide-link">More questions? See our full <Link href="/taxi-faq">taxi FAQ</Link>.</p>
    </section>

    <section className="seo-guide-cta">
      <span className="eyebrow">Flexible booking</span>
      <h2>Start planning your Nainital trip.</h2>
      <p>Tell us your dates and pickup city &mdash; we&rsquo;ll help plan the drive, alone or combined with nearby Kumaon stops.</p>
      <Link className="button button-gold" href="/#book">Start planning <ArrowRight /></Link>
    </section>
  </article>;
}
