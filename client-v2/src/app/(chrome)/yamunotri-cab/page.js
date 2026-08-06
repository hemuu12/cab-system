import Link from 'next/link';
import {
  ArrowRight, CloudSun, Compass, Footprints, Landmark, Mountain, PlaneTakeoff, Route as RouteIcon, TrainFront
} from 'lucide-react';

const SITE_URL = 'https://www.wondertravel.online';
const META = {
  title: 'Delhi to Yamunotri Cab — Route, Distance & Booking | WonderTravel',
  description: 'Plan a Delhi to Yamunotri cab journey: the full road route via Rishikesh and Barkot, the Janki Chatti roadhead, trek distance and a realistic multi-day itinerary.'
};

const ROAD_STAGES = [
  ['Delhi to Haridwar / Rishikesh', 'The plains stretch on national highway. Most multi-day Yamunotri itineraries begin with an overnight halt here.'],
  ['Rishikesh to Barkot', 'The road climbs through Mussoorie/Nainbagh hill country towards Barkot, a common overnight halt before the final push to the roadhead.'],
  ['Barkot to Janki Chatti', 'A winding hill road to Janki Chatti, the roadhead for Yamunotri and typically the last point a private vehicle can reach. From here the final approach is on foot or by pony/palanquin.']
];

const TREK_FACTS = [
  ['Trek distance from Janki Chatti', 'About 5&ndash;6 km, the shortest of the four Char Dham treks &mdash; usually completed within a few hours each way.'],
  ['Ways to cover the trek', 'On foot, by pony/mule, or palanquin (palki/doli), subject to availability.'],
  ['Altitude', 'Yamunotri temple sits at roughly 3,293 m (about 10,800 ft), so warm clothing is worth carrying even outside winter.'],
  ['Surya Kund', 'A hot-water spring beside the temple, where pilgrims traditionally cook rice as an offering before darshan.']
];

const PLAN_POINTS = [
  ['Travel season', 'Yamunotri traditionally opens in late spring (around Akshaya Tritiya) and closes around Diwali in autumn, when the deity is ceremonially moved to Kharsali for winter. Exact dates are announced each year — check the current year’s dates before finalising travel.'],
  ['Weather', 'Monsoon months bring landslide risk on the hill roads; the trek itself is short but still gains meaningful altitude, so pace it sensibly.'],
  ['Multi-day format', 'Because of the road distance, a Delhi to Yamunotri trip is usually planned as a multi-day journey with an overnight halt around Barkot each way.'],
  ['Combine with Gangotri', 'Yamunotri and Gangotri are the two Char Dham sites closest to each other in this circuit, and are often combined into a single longer itinerary.']
];

const GATEWAY_LINKS = [
  ['Nearest railhead', 'Rishikesh', TrainFront],
  ['Nearest airport', 'Dehradun (Jolly Grant)', PlaneTakeoff],
  ['Roadhead for the trek', 'Janki Chatti', Compass]
];

export async function generateMetadata() {
  return {
    title: META.title,
    description: META.description,
    robots: { index: true, follow: true, 'max-image-preview': 'large' },
    alternates: { canonical: '/yamunotri-cab' },
    openGraph: { title: META.title, description: META.description, url: '/yamunotri-cab' },
    twitter: { title: META.title, description: META.description }
  };
}

export default function YamunotriCabPage() {
  const canonicalUrl = `${SITE_URL}/yamunotri-cab`;
  const faqs = [
    {
      q: 'How far is Yamunotri from Delhi by road?',
      a: 'The drivable road runs from Delhi via Rishikesh and Barkot to Janki Chatti, roughly 380–430 km depending on the exact route. From Janki Chatti, the temple is reached by a further trek of about 5–6 km.'
    },
    {
      q: 'Can a cab go all the way to Yamunotri temple?',
      a: 'No. The road ends at Janki Chatti. From there the final approach is on foot, by pony or by palanquin — there is no vehicle road to the temple itself, though this is the shortest trek of the four Char Dham sites.'
    },
    {
      q: 'How long is the Yamunotri trek?',
      a: 'About 5–6 km each way from Janki Chatti, usually completed within a few hours — noticeably shorter than the Kedarnath trek.'
    },
    {
      q: 'How many days does a Delhi to Yamunotri trip need?',
      a: 'Most itineraries plan at least 3–4 days: a day or so for the road journey each way, plus a day for the trek and darshan. Many combine Yamunotri with Gangotri in the same trip.'
    },
    {
      q: 'What is the route from Delhi to Yamunotri?',
      a: 'The standard route runs Delhi → Haridwar/Rishikesh → Barkot → Janki Chatti. Most itineraries break the drive with an overnight halt at Barkot.'
    },
    {
      q: 'When is the best time to visit Yamunotri?',
      a: 'The temple is open only part of the year, traditionally from late spring until around Diwali, and closed through winter. Check the current year’s opening and closing dates before booking, since they are announced separately each year.'
    },
    {
      q: 'Can WonderTravel arrange a Delhi to Yamunotri cab?',
      a: 'Yes. We can plan the road portion of the journey — Delhi to Janki Chatti and back — as a multi-day outstation booking, with the vehicle and driver held for your full itinerary.'
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
          { '@type': 'ListItem', position: 3, name: 'Delhi to Yamunotri cab', item: canonicalUrl }
        ]
      },
      {
        '@type': 'TouristAttraction',
        name: 'Yamunotri Temple',
        description: 'A shrine to the goddess Yamuna in the Garhwal Himalayas, part of the Char Dham and Chota Char Dham pilgrimage circuits, reached by road to Janki Chatti and a short trek beyond.',
        address: { '@type': 'PostalAddress', addressRegion: 'Uttarakhand', addressCountry: 'IN' }
      },
      {
        '@type': 'Service',
        name: 'Delhi to Yamunotri outstation cab',
        serviceType: 'Multi-day driver-assisted outstation cab travel',
        provider: { '@id': `${SITE_URL}/#business` },
        areaServed: [
          { '@type': 'City', name: 'Delhi' },
          { '@type': 'Place', name: 'Yamunotri, Uttarakhand' }
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
      <span aria-current="page">Yamunotri</span>
    </nav>

    <header className="seo-guide-hero">
      <span className="eyebrow">Char Dham &middot; Source of the Yamuna</span>
      <h1>Delhi to Yamunotri cab: route, distance and how to plan the journey</h1>
      <p>Yamunotri is one of the four Char Dham sites and has the shortest trek of the circuit &mdash; a short walk from Janki Chatti after a long Himalayan drive. Here is the full route, realistic timing and what to plan for.</p>
      <div className="seo-guide-actions">
        <Link className="button button-ember" href="/#book">Plan your Yamunotri journey <ArrowRight /></Link>
        <Link className="button button-ghost" href="/cabs/delhi-to-yamunotri-janki-chatti">Check fares to Yamunotri</Link>
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
        <h2 id="road-route-title">Delhi to Janki Chatti, stage by stage</h2>
        <p>The road distance from Delhi to the Janki Chatti roadhead is roughly 380&ndash;430 km, depending on the exact route and starting point in Delhi.</p>
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
        <h2><Footprints aria-hidden="true" style={{ display: 'inline', width: '0.85em', height: '0.85em', verticalAlign: '-0.08em', marginRight: '0.3em' }} />The trek from Janki Chatti</h2>
        <p>No road reaches Yamunotri temple itself, but this is the shortest walk of any Char Dham site.</p>
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
        <h2><Landmark aria-hidden="true" style={{ display: 'inline', width: '0.85em', height: '0.85em', verticalAlign: '-0.08em', marginRight: '0.3em' }} />Yamunotri temple</h2>
      </div>
      <div className="seo-guide-prose">
        <p>Yamunotri temple is dedicated to the goddess Yamuna and is one of the four sites in the Chota Char Dham circuit, alongside Gangotri, Kedarnath and Badrinath &mdash; all of which WonderTravel also plans routes for.</p>
        <p>Its short trek makes Yamunotri one of the more approachable Char Dham destinations once the long road journey is complete.</p>
      </div>
    </section>

    <section className="route-related uttarakhand-route-directory">
      <div className="seo-guide-heading">
        <span className="eyebrow">Related Char Dham routes</span>
        <h2>Planning the wider Char Dham circuit?</h2>
        <p>Kedarnath, Badrinath and Gangotri each have their own road access and timing considerations.</p>
      </div>
      <ul>
        <li><Link href="/kedarnath-cab"><span>Kedarnath travel guide</span><small><RouteIcon aria-hidden="true" style={{ width: '0.9em', height: '0.9em' }} /></small></Link></li>
        <li><Link href="/badrinath-cab"><span>Badrinath travel guide</span><small><RouteIcon aria-hidden="true" style={{ width: '0.9em', height: '0.9em' }} /></small></Link></li>
        <li><Link href="/gangotri-cab"><span>Gangotri travel guide</span><small><RouteIcon aria-hidden="true" style={{ width: '0.9em', height: '0.9em' }} /></small></Link></li>
      </ul>
    </section>

    <section className="route-faq">
      <h2>Common questions about Yamunotri travel</h2>
      {faqs.map(item => <details key={item.q}><summary>{item.q}</summary><p>{item.a}</p></details>)}
      <p className="route-guide-link">More questions? See our full <Link href="/taxi-faq">taxi FAQ</Link>.</p>
    </section>

    <section className="seo-guide-cta">
      <span className="eyebrow">Multi-day booking</span>
      <h2>Start planning your Yamunotri road journey.</h2>
      <p>Tell us your dates and pickup city &mdash; we&rsquo;ll help plan the drive to Janki Chatti as a multi-day outstation booking.</p>
      <Link className="button button-gold" href="/#book">Start planning <ArrowRight /></Link>
    </section>
  </article>;
}
