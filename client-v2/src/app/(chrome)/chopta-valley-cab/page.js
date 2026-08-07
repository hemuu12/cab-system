import Link from 'next/link';
import {
  ArrowRight, CalendarDays, Landmark, MapPin, Route as RouteIcon, TrainFront, Users
} from 'lucide-react';

const SITE_URL = 'https://www.wondertravel.online';
const META = {
  title: 'Delhi to Chopta Valley Cab — Tungnath Trek & Mini Switzerland Route | WonderTravel',
  description: 'Plan a Delhi to Chopta Valley cab journey to Uttarakhand\'s "Mini Switzerland": route, distance, the Tungnath-Chandrashila trek and how to combine it with Kedarnath.'
};

const ROAD_STAGES = [
  ['Delhi to Rishikesh', 'Plains driving on national highway to the last major town before the climb.'],
  ['Rishikesh to Rudraprayag', 'A Himalayan hill drive along the Alaknanda valley, passing Devprayag.'],
  ['Rudraprayag to Chopta', 'A climb into the Mandakini valley via Ukhimath, arriving at the high-altitude meadow known as Mini Switzerland.']
];

const PLACE_FACTS = [
  ['What it is', 'A high-altitude meadow in the Mandakini valley, often called &ldquo;Mini Switzerland&rdquo; for its rolling green ridgelines and views of Chaukhamba and other snow peaks.'],
  ['Why travellers come', 'The base for the Tungnath&ndash;Chandrashila trek &mdash; one of the highest Shiva temples in the world followed by a short climb to a 360-degree Himalayan viewpoint &mdash; along with camping and a growing base for birdwatching.'],
  ['Elevation', 'The meadow sits around 2,900 m, with the Chandrashila summit above it at roughly 3,690 m.'],
  ['Trek difficulty', 'The Tungnath temple is a moderate 3&ndash;4 km climb from Chopta; the further push to Chandrashila summit is steeper and best attempted with proper layering and an early start.']
];

const PLAN_POINTS = [
  ['Best time to visit', 'April to June for clear trekking weather and rhododendron blooms; September to November for crisp, clear mountain views; December to February brings heavy snow, striking but demanding for trekking.'],
  ['Trekking gear', 'Even in summer, temperatures drop sharply after dark at this altitude &mdash; warm layers, sturdy footwear and an early trek start are essential.'],
  ['Combine with Kedarnath', 'Chopta sits on the same Mandakini valley approach used for Kedarnath, so many travellers combine both in one Garhwal itinerary.'],
  ['Limited stays', 'Accommodation around Chopta is mostly camps and small guesthouses with limited capacity; booking ahead matters, especially in peak trekking season.']
];

const GATEWAY_LINKS = [
  ['Nearest railhead', 'Rishikesh, at the start of the hill drive', TrainFront],
  ['Nearest town', 'Ukhimath, just below Chopta', MapPin],
  ['Often combined with', 'Kedarnath itineraries', Users]
];

export async function generateMetadata() {
  return {
    title: META.title,
    description: META.description,
    robots: { index: true, follow: true, 'max-image-preview': 'large' },
    alternates: { canonical: '/chopta-valley-cab' },
    openGraph: { title: META.title, description: META.description, url: '/chopta-valley-cab' },
    twitter: { title: META.title, description: META.description }
  };
}

export default function ChoptaValleyCabPage() {
  const canonicalUrl = `${SITE_URL}/chopta-valley-cab`;
  const faqs = [
    {
      q: 'How far is Chopta from Delhi by road?',
      a: 'Chopta is roughly 450&ndash;460 km from Delhi by road, travelling via Rishikesh and Rudraprayag. Given the length of the Himalayan hill drive, it is usually covered over two driving days with an overnight stop.'
    },
    {
      q: 'What is Chopta known for?',
      a: 'Known as &ldquo;Mini Switzerland&rdquo;, Chopta is a high-altitude meadow and the base for the Tungnath&ndash;Chandrashila trek, along with camping and mountain photography.'
    },
    {
      q: 'How difficult is the Tungnath-Chandrashila trek?',
      a: 'The Tungnath temple is a moderate 3&ndash;4 km climb from Chopta, manageable for most fit travellers. The further climb to Chandrashila summit is steeper and better suited to those with some trekking experience.'
    },
    {
      q: 'Can I combine Chopta with Kedarnath?',
      a: 'Yes. Chopta sits on the same Mandakini valley approach used for the Kedarnath yatra, so the two are commonly combined in one Garhwal itinerary.'
    },
    {
      q: 'What is the best time to visit Chopta?',
      a: 'April to June for pleasant trekking weather, September to November for the clearest mountain views, and December to February for heavy snow &mdash; scenic but more demanding for trekking.'
    },
    {
      q: 'Can WonderTravel arrange a Delhi to Chopta cab?',
      a: 'Yes. Given the distance, we typically plan it as a multi-day round trip with an overnight stop, and can combine it with a Kedarnath itinerary in the same booking.'
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
          { '@type': 'ListItem', position: 3, name: 'Delhi to Chopta cab', item: canonicalUrl }
        ]
      },
      {
        '@type': 'TouristAttraction',
        name: 'Chopta Valley',
        description: 'A high-altitude meadow in the Mandakini valley known as Mini Switzerland, the base for the Tungnath-Chandrashila trek.',
        address: { '@type': 'PostalAddress', addressRegion: 'Uttarakhand', addressCountry: 'IN' }
      },
      {
        '@type': 'Service',
        name: 'Delhi to Chopta cab',
        serviceType: 'One-way, round-trip and multi-stop driver-assisted cab travel',
        provider: { '@id': `${SITE_URL}/#business` },
        areaServed: [
          { '@type': 'City', name: 'Delhi' },
          { '@type': 'Place', name: 'Chopta, Uttarakhand' }
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
      <span aria-current="page">Chopta Valley</span>
    </nav>

    <header className="seo-guide-hero">
      <span className="eyebrow">Mini Switzerland</span>
      <h1>Delhi to Chopta Valley cab: route, distance and why travellers head there</h1>
      <p>Chopta is a fast-rising trending destination for the Tungnath&ndash;Chandrashila trek and its rolling green meadows framed by snow peaks. Here is the route and what to plan for.</p>
      <div className="seo-guide-actions">
        <Link className="button button-ember" href="/#book">Plan your Chopta trip <ArrowRight /></Link>
        <Link className="button button-ghost" href="/kedarnath-cab">Combine with a Kedarnath trip</Link>
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
        <h2 id="road-route-title">Delhi to Chopta, stage by stage</h2>
        <p>The road distance from Delhi to Chopta is roughly 450&ndash;460 km, depending on the exact route and starting point in Delhi, along the Alaknanda and Mandakini valleys &mdash; typically a two-day drive with an overnight stop.</p>
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
        <h2><Landmark aria-hidden="true" style={{ display: 'inline', width: '0.85em', height: '0.85em', verticalAlign: '-0.08em', marginRight: '0.3em' }} />Chopta Valley</h2>
        <p>Green meadows, high-altitude trekking and one of the highest Shiva temples in the world.</p>
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
        <p>Chopta shares its approach road with the Kedarnath yatra route.</p>
      </div>
      <ul>
        <li><Link href="/kedarnath-cab"><span>Kedarnath travel guide</span><small><RouteIcon aria-hidden="true" style={{ width: '0.9em', height: '0.9em' }} /></small></Link></li>
        <li><Link href="/rishikesh-cab"><span>Delhi to Rishikesh cab</span><small><RouteIcon aria-hidden="true" style={{ width: '0.9em', height: '0.9em' }} /></small></Link></li>
        <li><Link href="/badrinath-cab"><span>Badrinath travel guide</span><small><RouteIcon aria-hidden="true" style={{ width: '0.9em', height: '0.9em' }} /></small></Link></li>
      </ul>
    </section>

    <section className="route-faq">
      <h2>Common questions about Chopta travel</h2>
      {faqs.map(item => <details key={item.q}><summary>{item.q}</summary><p>{item.a}</p></details>)}
      <p className="route-guide-link">More questions? See our full <Link href="/taxi-faq">taxi FAQ</Link>.</p>
    </section>

    <section className="seo-guide-cta">
      <span className="eyebrow">Flexible booking</span>
      <h2>Start planning your Chopta trip.</h2>
      <p>Tell us your dates and pickup city &mdash; we&rsquo;ll help plan the drive, alone or combined with a Kedarnath itinerary.</p>
      <Link className="button button-gold" href="/#book">Start planning <ArrowRight /></Link>
    </section>
  </article>;
}
