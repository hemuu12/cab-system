import Link from 'next/link';
import {
  ArrowRight, CalendarDays, Landmark, MapPin, Route as RouteIcon, TrainFront, Users
} from 'lucide-react';
import { routePageBySlug, sedanFareEstimate } from '../../../data/routePages.js';

const SITE_URL = 'https://www.wondertravel.online';
const META = {
  title: 'Delhi to Kainchi Dham Cab — Neem Karoli Baba Ashram Route | WonderTravel',
  description: 'Plan a Delhi to Kainchi Dham cab journey to the Neem Karoli Baba ashram near Nainital: route, distance, best time to visit and how to combine it with a Kumaon hill trip.'
};

const ROAD_STAGES = [
  ['Delhi to Haldwani', 'The plains stretch on national highway, the usual gateway into the Kumaon hills.'],
  ['Haldwani to Bhowali', 'A hill drive up towards Nainital, passing through Bhowali &mdash; the small junction town closest to Kainchi Dham.'],
  ['Bhowali to Kainchi Dham', 'A short final stretch on the Bhowali&ndash;Almora road. The ashram sits directly beside the road, so no trek or detour is needed &mdash; a private cab can stop right at the gate.']
];

const PLACE_FACTS = [
  ['What it is', 'An ashram on the banks of the Kosi river, founded in 1964 and associated with the sage Neem Karoli Baba, widely known outside India for its connection to Steve Jobs and other well-known visitors.'],
  ['Location', 'On the Bhowali–Almora road, close to Nainital and a short detour from routes towards Almora, Ranikhet or Kausani.'],
  ['Access', 'Unlike the Char Dham sites, Kainchi Dham is roadside and open year-round — no trek, no seasonal opening or closing, and no altitude concerns.'],
  ['Foundation day', 'The ashram’s annual foundation-day gathering (in June) draws very large crowds; if travelling around that period, plan for heavier traffic and possible parking restrictions near the ashram.']
];

const PLAN_POINTS = [
  ['Best time to visit', 'Open year-round, so Kainchi Dham can be visited on almost any Kumaon trip. The foundation-day period in June is the busiest; visiting outside it usually means a calmer experience.'],
  ['Combine with Nainital or Bhimtal', 'Because it sits between Bhowali and Almora, Kainchi Dham is easy to combine with a Nainital, Bhimtal or Sattal trip as a short add-on rather than a dedicated journey.'],
  ['Weekday visits', 'Weekends and holidays tend to be busier given its popularity; a weekday visit is generally quieter.'],
  ['Dress and conduct', 'As with any ashram, modest dress is appreciated and mobile phone use is often restricted inside the main temple area.']
];

const GATEWAY_LINKS = [
  ['Nearest railhead', 'Kathgodam (near Haldwani)', TrainFront],
  ['Nearest hill town', 'Bhowali, a few km away', MapPin],
  ['Often combined with', 'Nainital, Bhimtal or Almora trips', Users]
];

export async function generateMetadata() {
  return {
    title: META.title,
    description: META.description,
    robots: { index: true, follow: true, 'max-image-preview': 'large' },
    alternates: { canonical: '/kainchi-dham-cab' },
    openGraph: { title: META.title, description: META.description, url: '/kainchi-dham-cab' },
    twitter: { title: META.title, description: META.description }
  };
}

export default function KainchiDhamCabPage() {
  const canonicalUrl = `${SITE_URL}/kainchi-dham-cab`;
  const route = routePageBySlug('delhi-to-kainchi-dham');
  const sedanFare = route ? sedanFareEstimate(route) : null;
  const faqs = [
    {
      q: 'How far is Kainchi Dham from Delhi by road?',
      a: 'Kainchi Dham is roughly 310–320 km from Delhi by road, travelling via Haldwani and Bhowali. It sits directly on the Bhowali–Almora road, a short distance from Nainital.'
    },
    {
      q: 'Can a cab drive right up to Kainchi Dham?',
      a: 'Yes. The ashram is on the roadside on the Bhowali–Almora road, so no trek or long detour is required — a private cab can stop close to the entrance, parking permitting.'
    },
    {
      q: 'Is Kainchi Dham open all year?',
      a: 'Yes. Unlike the Char Dham Himalayan shrines, Kainchi Dham does not have a seasonal opening and closing — it can be visited year-round, though winter mornings in the hills can be cold.'
    },
    {
      q: 'What is the best time to visit Kainchi Dham?',
      a: 'Any time of year works, since it is open year-round. The ashram’s foundation-day period in June is the busiest with the largest crowds; visiting outside that period is usually calmer.'
    },
    {
      q: 'Can I combine Kainchi Dham with a Nainital trip?',
      a: 'Yes, easily. Kainchi Dham sits between Bhowali and Almora, close to Nainital, Bhimtal and Sattal, so it is commonly added as a short stop on a wider Kumaon itinerary rather than a standalone trip.'
    },
    {
      q: 'How long does a visit to Kainchi Dham usually take?',
      a: 'Most visits take one to two hours, including darshan and a short walk around the ashram grounds — it does not require a full day the way a trek-based pilgrimage site does.'
    },
    {
      q: 'Can WonderTravel arrange a Delhi to Kainchi Dham cab?',
      a: 'Yes. We can plan it as a one-way or round-trip booking, or combine it with a wider Nainital/Kumaon itinerary in a single vehicle booking.'
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
          { '@type': 'ListItem', position: 3, name: 'Delhi to Kainchi Dham cab', item: canonicalUrl }
        ]
      },
      {
        '@type': 'TouristAttraction',
        name: 'Kainchi Dham (Neem Karoli Baba Ashram)',
        description: 'An ashram associated with the sage Neem Karoli Baba, on the Bhowali–Almora road near Nainital, open year-round and reachable directly by road.',
        address: { '@type': 'PostalAddress', addressRegion: 'Uttarakhand', addressCountry: 'IN' }
      },
      {
        '@type': 'Service',
        name: 'Delhi to Kainchi Dham cab',
        serviceType: 'One-way, round-trip and multi-stop driver-assisted cab travel',
        provider: { '@id': `${SITE_URL}/#business` },
        areaServed: [
          { '@type': 'City', name: 'Delhi' },
          { '@type': 'Place', name: 'Kainchi Dham, Uttarakhand' }
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
      <span aria-current="page">Kainchi Dham</span>
    </nav>

    <header className="seo-guide-hero">
      <span className="eyebrow">Neem Karoli Baba Ashram</span>
      <h1>Delhi to Kainchi Dham Cab</h1>
      <p>Kainchi Dham, the ashram associated with Neem Karoli Baba near Nainital, is one of the most visited spiritual stops in Kumaon &mdash; roadside, open year-round, and easy to combine with a wider hill trip. Here is the route and what to plan for.</p>
      <div className="seo-guide-actions">
        <Link className="button button-ember" href="/#book">Plan your Kainchi Dham visit <ArrowRight /></Link>
        <Link className="button button-ghost" href="/cabs/delhi-to-kainchi-dham">Check fares to Kainchi Dham</Link>
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
        <h2 id="road-route-title">Delhi to Kainchi Dham, stage by stage</h2>
        <p>The road distance from Delhi to Kainchi Dham is roughly 310&ndash;320 km, depending on the exact route and starting point in Delhi. Unlike the Char Dham sites, this is a same-day drive for many travellers.</p>
      </div>
      <div className="seo-checklist">
        {ROAD_STAGES.map(([title, text], index) => <div key={title}>
          <b>{index + 1}</b><span><strong>{title}</strong><small>{text}</small></span>
        </div>)}
      </div>
    </section>

    <section className="seo-guide-split">
      <div className="seo-guide-heading">
        <span className="eyebrow">About the ashram</span>
        <h2><Landmark aria-hidden="true" style={{ display: 'inline', width: '0.85em', height: '0.85em', verticalAlign: '-0.08em', marginRight: '0.3em' }} />Kainchi Dham</h2>
        <p>A roadside ashram with year-round access, unlike the seasonal Himalayan shrines further north.</p>
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
        <p>Kainchi Dham sits close to several popular Kumaon destinations.</p>
      </div>
      <ul>
        <li><Link href="/cabs/delhi-to-nainital"><span>Delhi to Nainital cab</span><small><RouteIcon aria-hidden="true" style={{ width: '0.9em', height: '0.9em' }} /></small></Link></li>
        <li><Link href="/cabs/delhi-to-bhimtal"><span>Delhi to Bhimtal cab</span><small><RouteIcon aria-hidden="true" style={{ width: '0.9em', height: '0.9em' }} /></small></Link></li>
        <li><Link href="/cabs/delhi-to-almora"><span>Delhi to Almora cab</span><small><RouteIcon aria-hidden="true" style={{ width: '0.9em', height: '0.9em' }} /></small></Link></li>
      </ul>
    </section>

    <section className="route-faq">
      <h2>Common questions about Kainchi Dham travel</h2>
      {faqs.map(item => <details key={item.q}><summary>{item.q}</summary><p>{item.a}</p></details>)}
      <p className="route-guide-link">More questions? See our full <Link href="/taxi-faq">taxi FAQ</Link>.</p>
    </section>

    <section className="seo-guide-cta">
      <span className="eyebrow">Flexible booking</span>
      <h2>Start planning your Kainchi Dham visit.</h2>
      <p>Tell us your dates and pickup city &mdash; we&rsquo;ll help plan the drive, alone or combined with nearby Kumaon stops.</p>
      <Link className="button button-gold" href="/#book">Start planning <ArrowRight /></Link>
    </section>
  </article>;
}
