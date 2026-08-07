import Link from 'next/link';
import {
  ArrowRight, CalendarDays, Landmark, MapPin, Route as RouteIcon, TrainFront, Users
} from 'lucide-react';
import { money } from '../../../lib/format.js';
import { resultsHref, routePageBySlug, sedanFareEstimate } from '../../../data/routePages.js';

const SITE_URL = 'https://www.wondertravel.online';
const META = {
  title: 'Delhi to Mussoorie Cab — Mall Road & Queen of the Hills Route | WonderTravel',
  description: 'Plan a Delhi to Mussoorie cab journey to the "Queen of the Hills": route, distance, best time to visit Mall Road and Kempty Falls, and how to combine it with Dehradun or Rishikesh.'
};

const ROAD_STAGES = [
  ['Delhi to Meerut', 'A fast expressway stretch out of the city.'],
  ['Meerut to Dehradun', 'Continued plains driving on national highway into the Doon valley.'],
  ['Dehradun to Mussoorie', 'A short, steep climb of around 35 km up to the ridge-top hill station.']
];

const PLACE_FACTS = [
  ['What it is', 'A colonial-era hill station known as the &ldquo;Queen of the Hills&rdquo;, built along a ridge with views of the Doon valley on one side and the snow-capped Himalayas on the other.'],
  ['Why travellers come', 'The Mall Road promenade, Kempty Falls, Gun Hill cable car, Camel&rsquo;s Back Road, and its classic colonial-era architecture and boarding schools.'],
  ['Elevation', 'Around 2,005 m above sea level, giving a reliably cooler climate than the plains through most of the year.'],
  ['Peak season', 'Summer weekends (April&ndash;June) are the busiest, driven by families searching for a quick weekend escape close to Delhi.']
];

const PLAN_POINTS = [
  ['Best time to visit', 'March to June for warm-weather sightseeing; September to November for clear valley views after the monsoon; December to February for a colder trip with occasional snow.'],
  ['Weekend crowding', 'Being one of the closest hill stations to Delhi, Mussoorie sees heavy weekend traffic on the Dehradun climb; a weekday visit avoids the worst of it.'],
  ['Combine with Dehradun', 'Dehradun sits at the base of the climb, so most itineraries combine a Mussoorie hill visit with a Dehradun city stop.'],
  ['Monsoon caution', 'The Dehradun&ndash;Mussoorie road can see landslide-related delays during heavy monsoon (July&ndash;August); build in extra travel time if visiting then.']
];

const GATEWAY_LINKS = [
  ['Nearest railhead', 'Dehradun, at the base of the climb', TrainFront],
  ['Nearest airport', 'Dehradun (Jolly Grant)', MapPin],
  ['Often combined with', 'Dehradun or Rishikesh trips', Users]
];

export async function generateMetadata() {
  return {
    title: META.title,
    description: META.description,
    robots: { index: true, follow: true, 'max-image-preview': 'large' },
    alternates: { canonical: '/mussoorie-cab' },
    openGraph: { title: META.title, description: META.description, url: '/mussoorie-cab' },
    twitter: { title: META.title, description: META.description }
  };
}

export default function MussoorieCabPage() {
  const canonicalUrl = `${SITE_URL}/mussoorie-cab`;
  const route = routePageBySlug('delhi-to-mussoorie');
  const sedanFare = route ? sedanFareEstimate(route) : null;
  const bookHref = route ? resultsHref(route) : '/#book';
  const faqs = [
    {
      q: 'How far is Mussoorie from Delhi by road?',
      a: 'Mussoorie is roughly 255&ndash;265 km from Delhi by road, travelling via Meerut and Dehradun. The drive typically takes around 6&ndash;7 hours, including the final climb from Dehradun.'
    },
    {
      q: 'What is Mussoorie famous for?',
      a: 'Known as the &ldquo;Queen of the Hills&rdquo;, Mussoorie is famous for the Mall Road promenade, Kempty Falls, the Gun Hill cable car, Camel&rsquo;s Back Road and its colonial-era charm.'
    },
    {
      q: 'What is the best time to visit Mussoorie?',
      a: 'Summer (March to June) is the busiest season for warm-weather sightseeing. Autumn (September to November) offers the clearest valley views. Winter (December to February) is colder, quieter, with occasional snow.'
    },
    {
      q: 'Can I combine a Mussoorie trip with Dehradun?',
      a: 'Yes. Dehradun sits directly at the base of the Mussoorie climb, so most travellers combine both in a single itinerary.'
    },
    {
      q: 'Is the Mussoorie road busy on weekends?',
      a: 'Yes, being one of the closest hill stations to Delhi, the Dehradun&ndash;Mussoorie road gets heavy weekend and holiday traffic. A weekday visit is usually smoother.'
    },
    {
      q: 'Can WonderTravel arrange a Delhi to Mussoorie cab?',
      a: 'Yes. We can plan it as a one-way or round-trip booking, and combine it with Dehradun or Rishikesh in a single vehicle booking.'
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
          { '@type': 'ListItem', position: 3, name: 'Delhi to Mussoorie cab', item: canonicalUrl }
        ]
      },
      {
        '@type': 'TouristAttraction',
        name: 'Mussoorie',
        description: 'A colonial-era ridge-top hill station known as the Queen of the Hills, known for the Mall Road, Kempty Falls and views of the Doon valley and the Himalayas.',
        address: { '@type': 'PostalAddress', addressRegion: 'Uttarakhand', addressCountry: 'IN' }
      },
      {
        '@type': 'Service',
        name: 'Delhi to Mussoorie cab',
        serviceType: 'One-way, round-trip and multi-stop driver-assisted cab travel',
        provider: { '@id': `${SITE_URL}/#business` },
        areaServed: [
          { '@type': 'City', name: 'Delhi' },
          { '@type': 'Place', name: 'Mussoorie, Uttarakhand' }
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
      <span aria-current="page">Mussoorie</span>
    </nav>

    <header className="seo-guide-hero">
      <span className="eyebrow">Queen of the Hills</span>
      <h1>Delhi to Mussoorie Cab</h1>
      <p>Mussoorie is the classic choice for a family weekend hill trip close to Delhi, built around the iconic Mall Road and colonial-era landmarks. Here is the route, the fare and what to plan for.</p>
      {route && <div className="route-facts">
        <div><RouteIcon aria-hidden="true" /><span>Distance</span><b>{route.distanceKm} km</b></div>
        {sedanFare && <div><MapPin aria-hidden="true" /><span>Sedan fare</span><b>from {money(sedanFare)}</b></div>}
      </div>}
      <div className="seo-guide-actions">
        <Link className="button button-ember" href={bookHref}>Check fares and book <ArrowRight /></Link>
        <Link className="button button-ghost" href="/cabs/delhi-to-mussoorie">Full fare breakdown</Link>
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
        <h2 id="road-route-title">Delhi to Mussoorie, stage by stage</h2>
        <p>The road distance from Delhi to Mussoorie is roughly 255&ndash;265 km, depending on the exact route and starting point in Delhi, with a short steep climb from Dehradun for the final stretch.</p>
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
        <h2><Landmark aria-hidden="true" style={{ display: 'inline', width: '0.85em', height: '0.85em', verticalAlign: '-0.08em', marginRight: '0.3em' }} />Mussoorie</h2>
        <p>A ridge-top retreat with views of both the Doon valley and the high Himalayas.</p>
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
        <p>Mussoorie sits close to Dehradun and the Rishikesh road.</p>
      </div>
      <ul>
        <li><Link href="/dehradun-cab"><span>Delhi to Dehradun cab</span><small><RouteIcon aria-hidden="true" style={{ width: '0.9em', height: '0.9em' }} /></small></Link></li>
        <li><Link href="/rishikesh-cab"><span>Delhi to Rishikesh cab</span><small><RouteIcon aria-hidden="true" style={{ width: '0.9em', height: '0.9em' }} /></small></Link></li>
        <li><Link href="/cabs/delhi-to-haridwar"><span>Delhi to Haridwar cab</span><small><RouteIcon aria-hidden="true" style={{ width: '0.9em', height: '0.9em' }} /></small></Link></li>
      </ul>
    </section>

    <section className="route-faq">
      <h2>Common questions about Mussoorie travel</h2>
      {faqs.map(item => <details key={item.q}><summary>{item.q}</summary><p>{item.a}</p></details>)}
      <p className="route-guide-link">More questions? See our full <Link href="/taxi-faq">taxi FAQ</Link>.</p>
    </section>

    <section className="seo-guide-cta">
      <span className="eyebrow">Flexible booking</span>
      <h2>Start planning your Mussoorie trip.</h2>
      <p>Tell us your dates and pickup city &mdash; we&rsquo;ll help plan the drive, alone or combined with Dehradun or Rishikesh.</p>
      <Link className="button button-gold" href="/#book">Start planning <ArrowRight /></Link>
    </section>
  </article>;
}
