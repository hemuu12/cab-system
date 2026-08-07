import Link from 'next/link';
import {
  ArrowRight, CalendarDays, Landmark, MapPin, Route as RouteIcon, TrainFront, Users
} from 'lucide-react';
import { money } from '../../../lib/format.js';
import { resultsHref, routePageBySlug, sedanFareEstimate } from '../../../data/routePages.js';

const SITE_URL = 'https://www.wondertravel.online';
const META = {
  title: 'Delhi to Auli Cab — Ski Resort & Himalayan Views Route | WonderTravel',
  description: 'Plan a Delhi to Auli cab journey to Uttarakhand\'s premier ski resort: route, distance, skiing season, cable car and Himalayan photography, and how to combine it with Joshimath or Badrinath.'
};

const ROAD_STAGES = [
  ['Delhi to Rishikesh', 'Plains driving on national highway to the last major town before the climb.'],
  ['Rishikesh to Joshimath', 'A long Himalayan hill drive along the Alaknanda valley through Rudraprayag, Karnaprayag and Chamoli.'],
  ['Joshimath to Auli', 'A short final climb of around 15&ndash;16 km, or the cable car ride from Joshimath directly up to Auli.']
];

const PLACE_FACTS = [
  ['What it is', 'A high-altitude meadow and ski resort above Joshimath, developed as India&rsquo;s premier skiing destination with wide slopes framed by Nanda Devi and other Himalayan peaks.'],
  ['Why travellers come', 'Skiing and snowboarding in winter, one of Asia&rsquo;s longest cable car (ropeway) rides year-round, and panoramic Himalayan photography from the meadows.'],
  ['Elevation', 'Around 2,800&ndash;3,050 m above sea level, giving snow cover through winter and cool weather even in summer.'],
  ['Skiing season', 'Typically late December through February, when the slopes are consistently snow-covered; the meadows and cable car are open through most of the year for non-skiing visits.']
];

const PLAN_POINTS = [
  ['Best time to visit', 'December to February for skiing and snow; April to June and September to November for clear-weather meadow visits and photography without snow gear.'],
  ['Cable car ride', 'The Joshimath&ndash;Auli ropeway is a highlight in its own right, giving sweeping valley views even for travellers not skiing.'],
  ['Combine with Joshimath or Badrinath', 'Auli sits just above Joshimath, itself the last major town before the Badrinath temple road, so both are easily combined on one itinerary.'],
  ['Winter road conditions', 'Snow and cold can affect the Joshimath&ndash;Auli road and the wider Alaknanda valley route in peak winter; check conditions before departure.']
];

const GATEWAY_LINKS = [
  ['Nearest railhead', 'Rishikesh, at the start of the hill drive', TrainFront],
  ['Nearest town', 'Joshimath, just below Auli', MapPin],
  ['Often combined with', 'Badrinath or Joshimath trips', Users]
];

export async function generateMetadata() {
  return {
    title: META.title,
    description: META.description,
    robots: { index: true, follow: true, 'max-image-preview': 'large' },
    alternates: { canonical: '/auli-cab' },
    openGraph: { title: META.title, description: META.description, url: '/auli-cab' },
    twitter: { title: META.title, description: META.description }
  };
}

export default function AuliCabPage() {
  const canonicalUrl = `${SITE_URL}/auli-cab`;
  const route = routePageBySlug('delhi-to-auli-joshimath');
  const sedanFare = route ? sedanFareEstimate(route) : null;
  const bookHref = route ? resultsHref(route) : '/#book';
  const faqs = [
    {
      q: 'How far is Auli from Delhi by road?',
      a: 'Auli is roughly 530&ndash;545 km from Delhi by road, travelling via Rishikesh, Rudraprayag and Joshimath. It is typically covered over two driving days given the length of the Himalayan hill drive.'
    },
    {
      q: 'What is Auli known for?',
      a: 'Skiing and snowboarding in winter, panoramic Himalayan views including Nanda Devi, and one of Asia&rsquo;s longest cable car rides connecting Joshimath to Auli.'
    },
    {
      q: 'When is the skiing season in Auli?',
      a: 'Typically late December through February, when snow cover on the slopes is most reliable. The meadows and cable car remain open through much of the rest of the year for non-skiing visits.'
    },
    {
      q: 'Can I visit Auli without skiing?',
      a: 'Yes. The cable car ride and the meadow views are popular year-round attractions on their own, independent of the skiing season.'
    },
    {
      q: 'Can I combine Auli with a Badrinath trip?',
      a: 'Yes. Auli sits just above Joshimath, which is also the last major town before the Badrinath temple road, so the two are commonly combined in one itinerary.'
    },
    {
      q: 'Can WonderTravel arrange a Delhi to Auli cab?',
      a: 'Yes. Given the distance, we typically plan it as a multi-day round trip with an overnight stop, and can combine it with Joshimath or Badrinath in the same booking.'
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
          { '@type': 'ListItem', position: 3, name: 'Delhi to Auli cab', item: canonicalUrl }
        ]
      },
      {
        '@type': 'TouristAttraction',
        name: 'Auli',
        description: 'A high-altitude ski resort and meadow above Joshimath, known for winter skiing, a long cable car ride and Himalayan mountain views.',
        address: { '@type': 'PostalAddress', addressRegion: 'Uttarakhand', addressCountry: 'IN' }
      },
      {
        '@type': 'Service',
        name: 'Delhi to Auli cab',
        serviceType: 'One-way, round-trip and multi-stop driver-assisted cab travel',
        provider: { '@id': `${SITE_URL}/#business` },
        areaServed: [
          { '@type': 'City', name: 'Delhi' },
          { '@type': 'Place', name: 'Auli, Uttarakhand' }
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
      <span aria-current="page">Auli</span>
    </nav>

    <header className="seo-guide-hero">
      <span className="eyebrow">India&rsquo;s premier ski resort</span>
      <h1>Delhi to Auli Cab</h1>
      <p>Auli draws heavy search interest year-round for winter skiing, mountain photography and one of Asia&rsquo;s longest cable car rides above Joshimath. Here is the route, the fare and what to plan for.</p>
      {route && <div className="route-facts">
        <div><RouteIcon aria-hidden="true" /><span>Distance</span><b>{route.distanceKm} km</b></div>
        {sedanFare && <div><MapPin aria-hidden="true" /><span>Sedan fare</span><b>from {money(sedanFare)}</b></div>}
      </div>}
      <div className="seo-guide-actions">
        <Link className="button button-ember" href={bookHref}>Check fares and book <ArrowRight /></Link>
        <Link className="button button-ghost" href="/cabs/delhi-to-auli-joshimath">Full fare breakdown</Link>
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
        <h2 id="road-route-title">Delhi to Auli, stage by stage</h2>
        <p>The road distance from Delhi to Auli is roughly 530&ndash;545 km, depending on the exact route and starting point in Delhi, along the Alaknanda valley &mdash; typically a two-day drive with an overnight stop.</p>
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
        <h2><Landmark aria-hidden="true" style={{ display: 'inline', width: '0.85em', height: '0.85em', verticalAlign: '-0.08em', marginRight: '0.3em' }} />Auli</h2>
        <p>Snow slopes in winter, sweeping meadow views the rest of the year.</p>
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
        <p>Auli sits close to Joshimath and the Badrinath temple road.</p>
      </div>
      <ul>
        <li><Link href="/badrinath-cab"><span>Badrinath travel guide</span><small><RouteIcon aria-hidden="true" style={{ width: '0.9em', height: '0.9em' }} /></small></Link></li>
        <li><Link href="/rishikesh-cab"><span>Delhi to Rishikesh cab</span><small><RouteIcon aria-hidden="true" style={{ width: '0.9em', height: '0.9em' }} /></small></Link></li>
        <li><Link href="/cabs/delhi-to-auli-joshimath"><span>Delhi to Joshimath cab</span><small><RouteIcon aria-hidden="true" style={{ width: '0.9em', height: '0.9em' }} /></small></Link></li>
      </ul>
    </section>

    <section className="route-faq">
      <h2>Common questions about Auli travel</h2>
      {faqs.map(item => <details key={item.q}><summary>{item.q}</summary><p>{item.a}</p></details>)}
      <p className="route-guide-link">More questions? See our full <Link href="/taxi-faq">taxi FAQ</Link>.</p>
    </section>

    <section className="seo-guide-cta">
      <span className="eyebrow">Flexible booking</span>
      <h2>Start planning your Auli trip.</h2>
      <p>Tell us your dates and pickup city &mdash; we&rsquo;ll help plan the drive, alone or combined with Joshimath or Badrinath.</p>
      <Link className="button button-gold" href="/#book">Start planning <ArrowRight /></Link>
    </section>
  </article>;
}
