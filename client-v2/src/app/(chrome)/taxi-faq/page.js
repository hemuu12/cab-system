import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const SITE_URL = 'https://www.wondertravel.online';
const META = {
  title: 'Taxi & Cab Booking FAQ India | WonderTravel',
  description: 'Answers to common questions about outstation cab booking in India: fares, safety, cancellation, luggage, payment and night travel.'
};

// Grouped by theme rather than one flat list, since search intent for these questions
// spans booking, money and trip-logistics separately.
const FAQ_GROUPS = [
  {
    title: 'Booking process',
    items: [
      {
        q: 'How do I book an outstation cab?',
        a: 'Enter your pickup and destination, travel date and trip type (one-way or round-trip) on the booking form. Available vehicles and their full fares are shown before you confirm, and a driver is assigned once the booking is complete.'
      },
      {
        q: 'Can I book a cab for same-day travel?',
        a: 'Same-day booking is usually possible, subject to vehicle availability at the time of booking. For long-distance or hill routes, booking a day ahead gives more choice of vehicle and pickup time.'
      },
      {
        q: 'Can I choose my exact pickup point?',
        a: 'Yes. Share the precise address or landmark at booking time so the driver can locate you without delay, especially in areas with limited signage.'
      }
    ]
  },
  {
    title: 'Fares and pricing',
    items: [
      {
        q: 'How is the cab fare calculated?',
        a: 'Fares are calculated per kilometre by vehicle class (sedan or SUV/MPV), based on the planned road distance. Driver allowance and GST are added and shown separately, so the total is itemised before you confirm.'
      },
      {
        q: 'Are tolls and parking included in the quoted fare?',
        a: 'No. Tolls, parking charges and any state entry permit are paid at actual during the trip, so the quoted fare is never inflated to cover charges that may not apply.'
      },
      {
        q: 'Is a round trip cheaper than booking two one-way trips?',
        a: 'Usually yes, since round trips use a lower per-kilometre rate. A minimum number of kilometres per day typically applies, because the vehicle and driver stay with you for the whole trip.'
      },
      {
        q: 'Do prices change with demand or time of day?',
        a: 'Per-kilometre rates are published by vehicle class and route distance rather than changing with demand. Night travel or festival-period trips may include an additional allowance, shown before booking.'
      }
    ]
  },
  {
    title: 'Trip types and changes',
    items: [
      {
        q: 'What is the difference between one-way and round-trip booking?',
        a: 'One-way booking covers a single pickup-to-drop journey and you pay only for that leg. Round-trip keeps the same vehicle and driver assigned for your return or full itinerary, at a round-trip rate.'
      },
      {
        q: 'What is the cancellation policy?',
        a: 'Trips can usually be cancelled or rescheduled ahead of the pickup time. The exact cutoff and any applicable charge is shown on your booking confirmation.'
      },
      {
        q: 'Can I add extra stops during the journey?',
        a: 'Planned stops should be shared at booking time so they are reflected in the route and estimate. Additional stops requested during the trip may be accommodated depending on the itinerary, at the driver’s discretion.'
      }
    ]
  },
  {
    title: 'Vehicles and luggage',
    items: [
      {
        q: 'What vehicles are available?',
        a: 'Sedans (up to 4 passengers) and SUVs/MPVs (up to 6 passengers) are available on most routes, each with a professional chauffeur for the full journey.'
      },
      {
        q: 'How much luggage can I carry?',
        a: 'Boot space depends on vehicle class, not seat count alone. Count the actual bags you will carry, including large suitcases, and choose a vehicle with enough usable space rather than just enough seats.'
      }
    ]
  },
  {
    title: 'Safety and travel conditions',
    items: [
      {
        q: 'Is night travel safe?',
        a: 'Night travel is available on most routes with an experienced driver. On hill sections, departures are usually planned to reach before evening where possible, since mountain roads are harder to drive after dark.'
      },
      {
        q: 'Are drivers verified?',
        a: 'Drivers are assigned through the platform’s regular verification and onboarding process before being made available for bookings.'
      },
      {
        q: 'What happens if weather or road conditions delay the trip?',
        a: 'Published journey times are planning estimates. Weather, seasonal traffic and road conditions — especially in hill regions — can extend the actual travel time, and the driver will keep you informed along the way.'
      }
    ]
  },
  {
    title: 'Payment',
    items: [
      {
        q: 'What payment methods are accepted?',
        a: 'Common online payment methods are supported at booking, alongside any pay-at-pickup option shown for your route. The accepted methods are confirmed on the booking page before you pay.'
      },
      {
        q: 'Will I get an itemised bill?',
        a: 'Yes. The distance charge, driver allowance and GST are itemised on the booking confirmation, with tolls, parking and permits noted separately as pay-at-actual items.'
      }
    ]
  }
];

export async function generateMetadata() {
  return {
    title: META.title,
    description: META.description,
    robots: { index: true, follow: true, 'max-image-preview': 'large' },
    alternates: { canonical: '/taxi-faq' },
    openGraph: { title: META.title, description: META.description, url: '/taxi-faq' },
    twitter: { title: META.title, description: META.description }
  };
}

export default function TaxiFaqPage() {
  const canonicalUrl = `${SITE_URL}/taxi-faq`;
  const allFaqs = FAQ_GROUPS.flatMap(group => group.items);
  const faqSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
          { '@type': 'ListItem', position: 2, name: 'Taxi FAQ', item: canonicalUrl }
        ]
      },
      {
        '@type': 'FAQPage',
        mainEntity: allFaqs.map(({ q, a }) => ({
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
      dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
    />
    <nav className="route-crumbs" aria-label="Breadcrumb">
      <Link href="/">Home</Link><span aria-hidden="true">/</span><span aria-current="page">Taxi FAQ</span>
    </nav>

    <header className="seo-guide-hero">
      <span className="eyebrow">Frequently asked questions</span>
      <h1>Taxi and cab booking questions, answered</h1>
      <p>Straight answers on booking, fares, safety and trip changes for outstation cab travel anywhere in India. Route-specific distance and fare details live on each city-pair page.</p>
      <div className="seo-guide-actions">
        <Link className="button button-ember" href="/#book">Plan your journey <ArrowRight /></Link>
        <Link className="button button-ghost" href="/intercity-cab-guide">Read the cab booking guide</Link>
      </div>
    </header>

    {FAQ_GROUPS.map(group => <section className="route-faq" key={group.title} aria-labelledby={`faq-${group.title}`}>
      <h2 id={`faq-${group.title}`}>{group.title}</h2>
      {group.items.map(item => <details key={item.q}><summary>{item.q}</summary><p>{item.a}</p></details>)}
    </section>)}

    <section className="seo-guide-cta">
      <span className="eyebrow">Still have a question?</span>
      <h2>Check a specific route for exact distance and fares.</h2>
      <p>Every city-pair page shows the road distance, estimated travel time and per-kilometre fare before you book. For booking changes, account issues or contacting support, visit the <Link href="/help">help center</Link>.</p>
      <Link className="button button-gold" href="/#book">Check vehicles and fares <ArrowRight /></Link>
    </section>
  </article>;
}
