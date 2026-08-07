import Link from 'next/link';
import {
  ArrowRight, CloudSun, Compass, Footprints, Landmark, Mountain, PlaneTakeoff, Route as RouteIcon, TrainFront
} from 'lucide-react';
import { routePageBySlug, sedanFareEstimate } from '../../../data/routePages.js';

const SITE_URL = 'https://www.wondertravel.online';
const META = {
  title: 'Delhi to Kedarnath Cab — Route, Distance & Booking | WonderTravel',
  description: 'Plan a Delhi to Kedarnath cab journey: the full road route via Rishikesh and Rudraprayag, the Gaurikund roadhead, trek distance, travel season and a realistic multi-day itinerary.'
};

const ROAD_STAGES = [
  ['Delhi to Haridwar / Rishikesh', 'The plains stretch of the journey, on national highway. Most multi-day Kedarnath itineraries start with an overnight halt here to break up the drive.'],
  ['Rishikesh to Devprayag and Rudraprayag', 'The road follows the Alaknanda river valley into the hills. Devprayag is the sacred confluence where the Bhagirathi and Alaknanda rivers meet and become the Ganga.'],
  ['Rudraprayag to Guptkashi and Sonprayag', 'A winding hill road through Kund and Guptkashi. Sonprayag is where the Mandakini and Son Ganga rivers meet, and where the drivable road for most vehicles effectively ends.'],
  ['Sonprayag to Gaurikund', 'A short final stretch to Gaurikund, the traditional roadhead. Local traffic management here can change with the season, so the last few kilometres are sometimes covered by shared shuttle rather than a private car — your driver will know the current arrangement.']
];

const TREK_FACTS = [
  ['Trek distance from Gaurikund', 'About 16 km on the traditional route, gaining significant altitude — most pilgrims plan a full day, and many break the ascent with an overnight halt partway.'],
  ['Ways to cover the trek', 'On foot, by pony/mule, palanquin (palki/doli), or helicopter service from designated helipads, subject to availability and weather.'],
  ['Altitude', 'Kedarnath temple sits at roughly 3,583 m (about 11,755 ft), so acclimatisation and warm clothing matter even outside winter.']
];

const PLAN_POINTS = [
  ['Travel season', 'The temple traditionally opens in late spring (around Akshaya Tritiya) and closes around Bhai Dooj in autumn, when the deity is ceremonially moved to Ukhimath for winter. Exact dates are announced by the temple committee each year — check the current year’s dates before finalising travel.'],
  ['Weather', 'Mountain weather changes quickly. Monsoon months bring landslide risk on hill roads; late-season travel can be cold, especially at altitude. Check conditions close to departure.'],
  ['Multi-day format', 'Because of the road distance and the trek, a Delhi to Kedarnath trip is realistically a multi-day journey rather than a single-day round trip — plan the drive, the ascent, darshan and the return as separate days.'],
  ['Registration', 'Pilgrims are typically required to register (biometric/online) before the trek. Carry valid ID and check the current registration process before you travel.']
];

const GATEWAY_LINKS = [
  ['Nearest railhead', 'Rishikesh', TrainFront],
  ['Nearest airport', 'Dehradun (Jolly Grant)', PlaneTakeoff],
  ['Roadhead for the trek', 'Gaurikund, via Sonprayag', Compass]
];

export async function generateMetadata() {
  return {
    title: META.title,
    description: META.description,
    robots: { index: true, follow: true, 'max-image-preview': 'large' },
    alternates: { canonical: '/kedarnath-cab' },
    openGraph: { title: META.title, description: META.description, url: '/kedarnath-cab' },
    twitter: { title: META.title, description: META.description }
  };
}

export default function KedarnathCabPage() {
  const canonicalUrl = `${SITE_URL}/kedarnath-cab`;
  const route = routePageBySlug('delhi-to-kedarnath-gaurikund');
  const sedanFare = route ? sedanFareEstimate(route) : null;
  const faqs = [
    {
      q: 'How far is Kedarnath from Delhi by road?',
      a: 'The drivable road runs from Delhi via Rishikesh, Devprayag and Rudraprayag to Gaurikund, roughly 460–500 km depending on the exact route taken. From Gaurikund, the temple itself is reached by a further trek of about 16 km, since no road runs all the way to the shrine.'
    },
    {
      q: 'Can a cab go all the way to Kedarnath temple?',
      a: 'No. The road ends at Gaurikund (sometimes with a shared shuttle stretch from Sonprayag, depending on current local traffic management). From Gaurikund the final approach is on foot, by pony, palanquin or helicopter — there is no vehicle road to the temple itself.'
    },
    {
      q: 'How many days does a Delhi to Kedarnath trip need?',
      a: 'Most itineraries plan at least 4–5 days: a day or two for the road journey each way, plus a day for the trek and darshan. Building in a buffer day for weather is common on this route.'
    },
    {
      q: 'What is the best route from Delhi to Kedarnath?',
      a: 'The standard route runs Delhi → Haridwar/Rishikesh → Devprayag → Rudraprayag → Guptkashi → Sonprayag → Gaurikund. Most multi-day itineraries break the drive with an overnight halt around Rudraprayag or Guptkashi rather than attempting it in one stretch.'
    },
    {
      q: 'When is the best time to visit Kedarnath?',
      a: 'The temple is open only for part of the year, traditionally from late spring until autumn, and closed through winter when the deity moves to Ukhimath. Check the current year’s opening and closing dates before booking, since they are announced separately each year.'
    },
    {
      q: 'Do I need to register before the Kedarnath trek?',
      a: 'Pilgrims are typically required to complete a registration (often biometric or online) before starting the trek from Gaurikund. Carry valid photo ID and check the current registration process shortly before travel, as procedures can change.'
    },
    {
      q: 'Can WonderTravel arrange a Delhi to Kedarnath cab?',
      a: 'Yes. We can plan the road portion of the journey — Delhi to Sonprayag/Gaurikund and back — as a multi-day outstation booking, with the vehicle and driver held for your full itinerary.'
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
          { '@type': 'ListItem', position: 3, name: 'Delhi to Kedarnath cab', item: canonicalUrl }
        ]
      },
      {
        '@type': 'TouristAttraction',
        name: 'Kedarnath Temple',
        description: 'A Jyotirlinga shrine to Lord Shiva in the Garhwal Himalayas, part of the Char Dham and Chota Char Dham pilgrimage circuits, reached by road to Gaurikund and a trek beyond.',
        address: { '@type': 'PostalAddress', addressRegion: 'Uttarakhand', addressCountry: 'IN' }
      },
      {
        '@type': 'Service',
        name: 'Delhi to Kedarnath outstation cab',
        serviceType: 'Multi-day driver-assisted outstation cab travel',
        provider: { '@id': `${SITE_URL}/#business` },
        areaServed: [
          { '@type': 'City', name: 'Delhi' },
          { '@type': 'Place', name: 'Kedarnath, Uttarakhand' }
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
      <span aria-current="page">Kedarnath</span>
    </nav>

    <header className="seo-guide-hero">
      <span className="eyebrow">Char Dham &middot; Jyotirlinga</span>
      <h1>Delhi to Kedarnath Cab</h1>
      <p>Kedarnath is one of the most visited pilgrimage sites in Uttarakhand, and one of the most demanding to reach: a long Himalayan road journey followed by a trek, since no road runs all the way to the temple. Here is the full route, realistic timing and what to plan for.</p>
      <div className="seo-guide-actions">
        <Link className="button button-ember" href="/#book">Plan your Kedarnath journey <ArrowRight /></Link>
        <Link className="button button-ghost" href="/cabs/delhi-to-kedarnath-gaurikund">Check fares to Kedarnath</Link>
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
        <h2 id="road-route-title">Delhi to Gaurikund, stage by stage</h2>
        <p>The road distance from Delhi to the Gaurikund roadhead is roughly 460&ndash;500 km, depending on the exact route and starting point in Delhi. This is a Himalayan hill road for a large part of the journey, so travel time is better measured in days than hours.</p>
      </div>
      <div className="seo-checklist">
        {ROAD_STAGES.map(([title, text], index) => <div key={title}>
          <b>{index + 1}</b><span><strong>{title}</strong><small>{text}</small></span>
        </div>)}
      </div>
    </section>

    <section className="seo-guide-split">
      <div className="seo-guide-heading">
        <span className="eyebrow">Beyond the roadhead</span>
        <h2><Footprints aria-hidden="true" style={{ display: 'inline', width: '0.85em', height: '0.85em', verticalAlign: '-0.08em', marginRight: '0.3em' }} />The trek from Gaurikund</h2>
        <p>No road reaches Kedarnath temple itself. From Gaurikund, the final approach is on foot or by pony, palanquin or helicopter.</p>
      </div>
      <dl className="seo-definition-list">
        {TREK_FACTS.map(([title, text]) => <div key={title}><dt><Mountain /> {title}</dt><dd>{text}</dd></div>)}
      </dl>
    </section>

    <section className="seo-guide-section">
      <div className="seo-guide-heading">
        <span className="eyebrow">Before you travel</span>
        <h2>What to plan for</h2>
      </div>
      <div className="seo-card-grid seo-region-grid">
        {PLAN_POINTS.map(([title, text]) => <article key={title}><CloudSun /><h3>{title}</h3><p>{text}</p></article>)}
      </div>
    </section>

    <section className="seo-guide-split seo-guide-choice">
      <div>
        <span className="eyebrow">About the shrine</span>
        <h2><Landmark aria-hidden="true" style={{ display: 'inline', width: '0.85em', height: '0.85em', verticalAlign: '-0.08em', marginRight: '0.3em' }} />Kedarnath temple</h2>
      </div>
      <div className="seo-guide-prose">
        <p>Kedarnath temple stands at roughly 3,583 m in the Garhwal Himalayas, dedicated to Lord Shiva. It is one of the twelve Jyotirlingas and one of the four sites in the Chota Char Dham circuit, alongside Badrinath, Gangotri and Yamunotri &mdash; all of which WonderTravel also plans routes for.</p>
        <p>Because the temple is only accessible for part of the year and the final stretch is a trek rather than a drive, Kedarnath rewards early, realistic planning far more than most other Uttarakhand destinations.</p>
      </div>
    </section>

    <section className="route-related uttarakhand-route-directory">
      <div className="seo-guide-heading">
        <span className="eyebrow">Related Char Dham routes</span>
        <h2>Planning the wider Char Dham circuit?</h2>
        <p>Badrinath, Gangotri and Yamunotri each have their own road access and timing considerations.</p>
      </div>
      <ul>
        <li><Link href="/badrinath-cab"><span>Badrinath travel guide</span><small><RouteIcon aria-hidden="true" style={{ width: '0.9em', height: '0.9em' }} /></small></Link></li>
        <li><Link href="/gangotri-cab"><span>Gangotri travel guide</span><small><RouteIcon aria-hidden="true" style={{ width: '0.9em', height: '0.9em' }} /></small></Link></li>
        <li><Link href="/yamunotri-cab"><span>Yamunotri travel guide</span><small><RouteIcon aria-hidden="true" style={{ width: '0.9em', height: '0.9em' }} /></small></Link></li>
      </ul>
    </section>

    <section className="route-faq">
      <h2>Common questions about Kedarnath travel</h2>
      {faqs.map(item => <details key={item.q}><summary>{item.q}</summary><p>{item.a}</p></details>)}
      <p className="route-guide-link">More questions? See our full <Link href="/taxi-faq">taxi FAQ</Link>.</p>
    </section>

    <section className="seo-guide-cta">
      <span className="eyebrow">Multi-day booking</span>
      <h2>Start planning your Kedarnath road journey.</h2>
      <p>Tell us your dates and pickup city — we&rsquo;ll help plan the drive to Sonprayag/Gaurikund as a multi-day outstation booking.</p>
      <Link className="button button-gold" href="/#book">Start planning <ArrowRight /></Link>
    </section>
  </article>;
}
