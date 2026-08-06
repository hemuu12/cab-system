import Link from 'next/link';
import {
  ArrowRight, CloudSun, Landmark, MapPin, Mountain, PlaneTakeoff, Route as RouteIcon, TrainFront
} from 'lucide-react';

const SITE_URL = 'https://www.wondertravel.online';
const META = {
  title: 'Delhi to Badrinath Cab — Route, Distance & Booking | WonderTravel',
  description: 'Plan a Delhi to Badrinath cab journey: the full road route via Rishikesh, Rudraprayag and Joshimath, travel season, altitude and a realistic multi-day itinerary.'
};

const ROAD_STAGES = [
  ['Delhi to Haridwar / Rishikesh', 'The plains stretch on national highway. Most multi-day Badrinath itineraries begin with an overnight halt here before the hill drive.'],
  ['Rishikesh to Devprayag and Rudraprayag', 'The road follows the Alaknanda river valley. Devprayag is the sacred confluence where the Bhagirathi and Alaknanda rivers meet and become the Ganga.'],
  ['Rudraprayag to Karnaprayag and Joshimath', 'A long hill stretch through Chamoli district, passing Nandprayag and Karnaprayag &mdash; two more of the five sacred river confluences (Panch Prayag) along this valley.'],
  ['Joshimath to Badrinath', 'The final climb to Badrinath town, past Vishnuprayag. Unlike Kedarnath, the road runs all the way to the temple &mdash; no trek is required to reach Badrinath itself.']
];

const PLACE_FACTS = [
  ['Altitude', 'Badrinath town sits at roughly 3,133 m (about 10,279 ft) in the Garhwal Himalayas, on the banks of the Alaknanda river.'],
  ['Road access', 'Badrinath is the only one of the four Char Dham sites that a private vehicle can reach directly &mdash; there is no compulsory trek, which makes it more accessible than Kedarnath for travellers who cannot walk long distances.'],
  ['Mana village', 'A short distance beyond the temple, Mana is often described as the last Indian village before the Tibet border, and is usually visited on the same trip.'],
  ['Tapt Kund', 'A natural hot-water spring beside the temple, where pilgrims traditionally bathe before darshan.']
];

const PLAN_POINTS = [
  ['Travel season', 'Badrinath traditionally opens in late spring (around Akshaya Tritiya) and closes around Vijaya Dashami/Diwali in autumn, when the deity is ceremonially moved to Joshimath for winter. Exact dates are announced by the temple committee each year &mdash; check the current year’s dates before finalising travel.'],
  ['Weather', 'Being high-altitude Himalayan terrain, weather can change quickly. Monsoon months carry landslide risk on the hill roads; shoulder-season mornings and evenings are cold even when days are mild.'],
  ['Multi-day format', 'Given the distance and hill driving, a Delhi to Badrinath trip is best planned as a multi-day journey with at least one overnight halt each way rather than attempted in a single day.'],
  ['Combine with Kedarnath', 'Because both sites are reached via a similar road corridor as far as Rudraprayag, many pilgrims combine Kedarnath and Badrinath into a single longer itinerary.']
];

const GATEWAY_LINKS = [
  ['Nearest railhead', 'Rishikesh', TrainFront],
  ['Nearest airport', 'Dehradun (Jolly Grant)', PlaneTakeoff],
  ['Last town before the border', 'Mana, beyond Badrinath', MapPin]
];

export async function generateMetadata() {
  return {
    title: META.title,
    description: META.description,
    robots: { index: true, follow: true, 'max-image-preview': 'large' },
    alternates: { canonical: '/badrinath-cab' },
    openGraph: { title: META.title, description: META.description, url: '/badrinath-cab' },
    twitter: { title: META.title, description: META.description }
  };
}

export default function BadrinathCabPage() {
  const canonicalUrl = `${SITE_URL}/badrinath-cab`;
  const faqs = [
    {
      q: 'How far is Badrinath from Delhi by road?',
      a: 'Badrinath is roughly 520–580 km from Delhi by road, travelling via Rishikesh, Devprayag, Rudraprayag and Joshimath. The exact figure depends on the route and starting point within Delhi.'
    },
    {
      q: 'Can a cab drive all the way to Badrinath temple?',
      a: 'Yes. Unlike Kedarnath, the road runs directly to Badrinath town, right up to the temple area. No trek is required, which makes Badrinath more accessible for elderly travellers or anyone unable to walk long distances.'
    },
    {
      q: 'How many days does a Delhi to Badrinath trip need?',
      a: 'Most itineraries plan at least 4–5 days: a day or two for the road journey each way, plus time for darshan and a visit to nearby Mana village. A buffer day for weather is common on this route.'
    },
    {
      q: 'What is the route from Delhi to Badrinath?',
      a: 'The standard route runs Delhi → Haridwar/Rishikesh → Devprayag → Rudraprayag → Karnaprayag → Joshimath → Badrinath. Most itineraries break the drive with an overnight halt around Rudraprayag or Joshimath.'
    },
    {
      q: 'When is the best time to visit Badrinath?',
      a: 'The temple is open only part of the year, traditionally from late spring until autumn, and closed through winter when the deity moves to Joshimath. Check the current year’s opening and closing dates before booking, since they are announced separately each year.'
    },
    {
      q: 'Can I visit Kedarnath and Badrinath on the same trip?',
      a: 'Yes, many pilgrims combine both. The routes share the same road corridor as far as Rudraprayag before splitting — towards Gaurikund for Kedarnath, or towards Joshimath for Badrinath.'
    },
    {
      q: 'Can WonderTravel arrange a Delhi to Badrinath cab?',
      a: 'Yes. We can plan the full road journey as a multi-day outstation booking, with the vehicle and driver held for your complete itinerary.'
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
          { '@type': 'ListItem', position: 3, name: 'Delhi to Badrinath cab', item: canonicalUrl }
        ]
      },
      {
        '@type': 'TouristAttraction',
        name: 'Badrinath Temple',
        description: 'A shrine to Lord Vishnu in the Garhwal Himalayas, part of the Char Dham and Chota Char Dham pilgrimage circuits, reachable directly by road.',
        address: { '@type': 'PostalAddress', addressRegion: 'Uttarakhand', addressCountry: 'IN' }
      },
      {
        '@type': 'Service',
        name: 'Delhi to Badrinath outstation cab',
        serviceType: 'Multi-day driver-assisted outstation cab travel',
        provider: { '@id': `${SITE_URL}/#business` },
        areaServed: [
          { '@type': 'City', name: 'Delhi' },
          { '@type': 'Place', name: 'Badrinath, Uttarakhand' }
        ],
        url: canonicalUrl
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
      <span aria-current="page">Badrinath</span>
    </nav>

    <header className="seo-guide-hero">
      <span className="eyebrow">Char Dham &middot; Divya Desam</span>
      <h1>Delhi to Badrinath cab: route, distance and how to plan the journey</h1>
      <p>Badrinath is one of the four Char Dham sites and the one most directly reachable by road &mdash; the drive goes all the way to the temple town, with no compulsory trek. Here is the full route, realistic timing and what to plan for.</p>
      <div className="seo-guide-actions">
        <Link className="button button-ember" href="/#book">Plan your Badrinath journey <ArrowRight /></Link>
        <Link className="button button-ghost" href="/cabs/delhi-to-badrinath">Check fares to Badrinath</Link>
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
        <h2 id="road-route-title">Delhi to Badrinath, stage by stage</h2>
        <p>The road distance from Delhi to Badrinath is roughly 520&ndash;580 km, depending on the exact route and starting point in Delhi. This is a Himalayan hill road for a large part of the journey, so travel time is better measured in days than hours.</p>
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
        <h2><Mountain aria-hidden="true" style={{ display: 'inline', width: '0.85em', height: '0.85em', verticalAlign: '-0.08em', marginRight: '0.3em' }} />Badrinath and Mana</h2>
        <p>Badrinath sits on the banks of the Alaknanda, with the last Indian village on this route just beyond it.</p>
      </div>
      <dl className="seo-definition-list">
        {PLACE_FACTS.map(([title, text]) => <div key={title}><dt><Landmark /> {title}</dt><dd>{text}</dd></div>)}
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

    <section className="route-related uttarakhand-route-directory">
      <div className="seo-guide-heading">
        <span className="eyebrow">Related Char Dham routes</span>
        <h2>Planning the wider Char Dham circuit?</h2>
        <p>Kedarnath, Gangotri and Yamunotri each have their own road access and timing considerations.</p>
      </div>
      <ul>
        <li><Link href="/kedarnath-cab"><span>Kedarnath travel guide</span><small><RouteIcon aria-hidden="true" style={{ width: '0.9em', height: '0.9em' }} /></small></Link></li>
        <li><Link href="/cabs/delhi-to-gangotri"><span>Delhi to Gangotri cab</span><small><RouteIcon aria-hidden="true" style={{ width: '0.9em', height: '0.9em' }} /></small></Link></li>
        <li><Link href="/cabs/delhi-to-yamunotri-janki-chatti"><span>Delhi to Yamunotri cab</span><small><RouteIcon aria-hidden="true" style={{ width: '0.9em', height: '0.9em' }} /></small></Link></li>
      </ul>
    </section>

    <section className="route-faq">
      <h2>Common questions about Badrinath travel</h2>
      {faqs.map(item => <details key={item.q}><summary>{item.q}</summary><p>{item.a}</p></details>)}
      <p className="route-guide-link">More questions? See our full <Link href="/taxi-faq">taxi FAQ</Link>.</p>
    </section>

    <section className="seo-guide-cta">
      <span className="eyebrow">Multi-day booking</span>
      <h2>Start planning your Badrinath road journey.</h2>
      <p>Tell us your dates and pickup city &mdash; we&rsquo;ll help plan the drive to Badrinath as a multi-day outstation booking.</p>
      <Link className="button button-gold" href="/#book">Start planning <ArrowRight /></Link>
    </section>
  </article>;
}
