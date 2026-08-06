import Link from 'next/link';
import {
  ArrowRight, CloudSun, Footprints, Landmark, MapPin, Mountain, PlaneTakeoff, Route as RouteIcon, TrainFront
} from 'lucide-react';

const SITE_URL = 'https://www.wondertravel.online';
const META = {
  title: 'Delhi to Gangotri Cab — Route, Distance & Booking | WonderTravel',
  description: 'Plan a Delhi to Gangotri cab journey: the full road route via Rishikesh and Uttarkashi, the Gaumukh glacier trek beyond, travel season and a realistic multi-day itinerary.'
};

const ROAD_STAGES = [
  ['Delhi to Haridwar / Rishikesh', 'The plains stretch on national highway. Most multi-day Gangotri itineraries begin with an overnight halt here.'],
  ['Rishikesh to Tehri and Uttarkashi', 'The road climbs through Tehri Garhwal, passing near Tehri Dam, before reaching Uttarkashi &mdash; the main town on this route and a common overnight halt.'],
  ['Uttarkashi to Harsil and Gangotri', 'A scenic Bhagirathi valley drive through Harsil, a picturesque deodar-forest army town, before reaching Gangotri. The road runs directly to Gangotri temple &mdash; no trek is required to reach the temple itself.']
];

const PLACE_FACTS = [
  ['Altitude', 'Gangotri sits at roughly 3,100 m (about 10,200 ft) on the banks of the Bhagirathi river, in Uttarkashi district.'],
  ['Road access to the temple', 'The road reaches Gangotri town directly, right up to the temple &mdash; no trek is needed for darshan itself.'],
  ['Gaumukh glacier', 'The actual source of the Bhagirathi (mythologically, the point where the Ganga is said to descend) is Gaumukh, roughly 18 km further by trek from Gangotri &mdash; a separate, optional undertaking beyond the temple visit.'],
  ['Harsil valley', 'A scenic deodar-forest stop en route, often included as part of the same itinerary.']
];

const PLAN_POINTS = [
  ['Travel season', 'Gangotri traditionally opens in late spring (around Akshaya Tritiya) and closes around Diwali in autumn, when the deity is ceremonially moved to Mukhba/Mukhimath for winter. Exact dates are announced each year — check the current year’s dates before finalising travel.'],
  ['Weather', 'Monsoon months bring landslide risk on the Uttarkashi–Gangotri stretch; the Gaumukh trek, if attempted, requires suitable fitness and is best planned outside peak monsoon.'],
  ['Multi-day format', 'Given the distance and hill driving, a Delhi to Gangotri trip is best planned as a multi-day journey with at least one overnight halt each way, commonly at Uttarkashi.'],
  ['Combine with Yamunotri', 'Gangotri and Yamunotri are the two Char Dham sites closest to each other in this circuit, and are often combined into a single longer itinerary.']
];

const GATEWAY_LINKS = [
  ['Nearest railhead', 'Rishikesh', TrainFront],
  ['Nearest airport', 'Dehradun (Jolly Grant)', PlaneTakeoff],
  ['Main halt en route', 'Uttarkashi', MapPin]
];

export async function generateMetadata() {
  return {
    title: META.title,
    description: META.description,
    robots: { index: true, follow: true, 'max-image-preview': 'large' },
    alternates: { canonical: '/gangotri-cab' },
    openGraph: { title: META.title, description: META.description, url: '/gangotri-cab' },
    twitter: { title: META.title, description: META.description }
  };
}

export default function GangotriCabPage() {
  const canonicalUrl = `${SITE_URL}/gangotri-cab`;
  const faqs = [
    {
      q: 'How far is Gangotri from Delhi by road?',
      a: 'Gangotri is roughly 460–500 km from Delhi by road, travelling via Rishikesh, Tehri and Uttarkashi. The exact figure depends on the route and starting point within Delhi.'
    },
    {
      q: 'Can a cab drive all the way to Gangotri temple?',
      a: 'Yes. The road runs directly to Gangotri town and the temple. No trek is required for darshan — the trek is only needed if you continue further to Gaumukh, the glacier source, which is a separate optional trip.'
    },
    {
      q: 'What is Gaumukh and do I need to visit it?',
      a: 'Gaumukh is the glacier point regarded as the source of the Bhagirathi river, about 18 km beyond Gangotri by trek. It is optional — most pilgrims visiting Gangotri temple do not need to trek to Gaumukh unless specifically planning that extension.'
    },
    {
      q: 'How many days does a Delhi to Gangotri trip need?',
      a: 'Most itineraries plan at least 4–5 days: a day or two for the road journey each way, plus time for darshan at Gangotri. Add extra days if a Gaumukh trek is included.'
    },
    {
      q: 'What is the route from Delhi to Gangotri?',
      a: 'The standard route runs Delhi → Haridwar/Rishikesh → Tehri → Uttarkashi → Harsil → Gangotri. Most itineraries break the drive with an overnight halt at Uttarkashi.'
    },
    {
      q: 'When is the best time to visit Gangotri?',
      a: 'The temple is open only part of the year, traditionally from late spring until around Diwali, and closed through winter. Check the current year’s opening and closing dates before booking, since they are announced separately each year.'
    },
    {
      q: 'Can WonderTravel arrange a Delhi to Gangotri cab?',
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
          { '@type': 'ListItem', position: 3, name: 'Delhi to Gangotri cab', item: canonicalUrl }
        ]
      },
      {
        '@type': 'TouristAttraction',
        name: 'Gangotri Temple',
        description: 'A shrine to the goddess Ganga in the Garhwal Himalayas, part of the Char Dham and Chota Char Dham pilgrimage circuits, reachable directly by road, near the Gaumukh glacier source.',
        address: { '@type': 'PostalAddress', addressRegion: 'Uttarakhand', addressCountry: 'IN' }
      },
      {
        '@type': 'Service',
        name: 'Delhi to Gangotri outstation cab',
        serviceType: 'Multi-day driver-assisted outstation cab travel',
        provider: { '@id': `${SITE_URL}/#business` },
        areaServed: [
          { '@type': 'City', name: 'Delhi' },
          { '@type': 'Place', name: 'Gangotri, Uttarakhand' }
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
      <span aria-current="page">Gangotri</span>
    </nav>

    <header className="seo-guide-hero">
      <span className="eyebrow">Char Dham &middot; Source of the Ganga</span>
      <h1>Delhi to Gangotri cab: route, distance and how to plan the journey</h1>
      <p>Gangotri is one of the four Char Dham sites, reachable directly by road, and the gateway to Gaumukh &mdash; the glacier regarded as the source of the Ganga. Here is the full route, realistic timing and what to plan for.</p>
      <div className="seo-guide-actions">
        <Link className="button button-ember" href="/#book">Plan your Gangotri journey <ArrowRight /></Link>
        <Link className="button button-ghost" href="/cabs/delhi-to-gangotri">Check fares to Gangotri</Link>
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
        <h2 id="road-route-title">Delhi to Gangotri, stage by stage</h2>
        <p>The road distance from Delhi to Gangotri is roughly 460&ndash;500 km, depending on the exact route and starting point in Delhi. This is a Himalayan hill road for a large part of the journey, so travel time is better measured in days than hours.</p>
      </div>
      <div className="seo-checklist">
        {ROAD_STAGES.map(([title, text], index) => <div key={title}>
          <b>{index + 1}</b><span><strong>{title}</strong><small>{text}</small></span>
        </div>)}
      </div>
    </section>

    <section className="seo-guide-split">
      <div className="seo-guide-heading">
        <span className="eyebrow">Beyond the temple</span>
        <h2><Footprints aria-hidden="true" style={{ display: 'inline', width: '0.85em', height: '0.85em', verticalAlign: '-0.08em', marginRight: '0.3em' }} />Gangotri and Gaumukh</h2>
        <p>The temple itself is road-accessible; the glacier source beyond it is not.</p>
      </div>
      <dl className="seo-definition-list">
        {PLACE_FACTS.map(([title, text]) => <div key={title}><dt><Mountain /> {title}</dt><dd>{text}</dd></div>)}
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
        <h2><Landmark aria-hidden="true" style={{ display: 'inline', width: '0.85em', height: '0.85em', verticalAlign: '-0.08em', marginRight: '0.3em' }} />Gangotri temple</h2>
      </div>
      <div className="seo-guide-prose">
        <p>Gangotri temple is dedicated to the goddess Ganga and is one of the four sites in the Chota Char Dham circuit, alongside Kedarnath, Badrinath and Yamunotri &mdash; all of which WonderTravel also plans routes for.</p>
        <p>Because the drivable road reaches the temple directly, Gangotri is one of the more accessible Char Dham destinations, with the optional Gaumukh extension available for those wanting to go further.</p>
      </div>
    </section>

    <section className="route-related uttarakhand-route-directory">
      <div className="seo-guide-heading">
        <span className="eyebrow">Related Char Dham routes</span>
        <h2>Planning the wider Char Dham circuit?</h2>
        <p>Kedarnath, Badrinath and Yamunotri each have their own road access and timing considerations.</p>
      </div>
      <ul>
        <li><Link href="/kedarnath-cab"><span>Kedarnath travel guide</span><small><RouteIcon aria-hidden="true" style={{ width: '0.9em', height: '0.9em' }} /></small></Link></li>
        <li><Link href="/badrinath-cab"><span>Badrinath travel guide</span><small><RouteIcon aria-hidden="true" style={{ width: '0.9em', height: '0.9em' }} /></small></Link></li>
        <li><Link href="/cabs/delhi-to-yamunotri-janki-chatti"><span>Delhi to Yamunotri cab</span><small><RouteIcon aria-hidden="true" style={{ width: '0.9em', height: '0.9em' }} /></small></Link></li>
      </ul>
    </section>

    <section className="route-faq">
      <h2>Common questions about Gangotri travel</h2>
      {faqs.map(item => <details key={item.q}><summary>{item.q}</summary><p>{item.a}</p></details>)}
      <p className="route-guide-link">More questions? See our full <Link href="/taxi-faq">taxi FAQ</Link>.</p>
    </section>

    <section className="seo-guide-cta">
      <span className="eyebrow">Multi-day booking</span>
      <h2>Start planning your Gangotri road journey.</h2>
      <p>Tell us your dates and pickup city &mdash; we&rsquo;ll help plan the drive to Gangotri as a multi-day outstation booking.</p>
      <Link className="button button-gold" href="/#book">Start planning <ArrowRight /></Link>
    </section>
  </article>;
}
