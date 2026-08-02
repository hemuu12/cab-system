import Link from 'next/link';
import { ArrowRight, BadgeIndianRupee, CalendarDays, CarFront, MapPinned, ShieldCheck } from 'lucide-react';

const SITE_URL = 'https://www.wondertravel.online';
const META = {
  title: 'Intercity Cab Booking Guide India | WonderTravel',
  description: 'Understand one-way, round-trip and multi-day intercity cab booking in India, including vehicle choice, fare components and a practical travel checklist.'
};

const TRIP_TYPES = [
  {
    title: 'One-way intercity cab',
    text: 'Best when you only need a pickup and drop between two cities. You pay for the planned outward journey instead of keeping the vehicle for a return.'
  },
  {
    title: 'Round-trip outstation cab',
    text: 'Useful for a return journey, weekend break or family visit. The same vehicle remains assigned for the trip and daily minimum kilometres may apply.'
  },
  {
    title: 'Multi-day road journey',
    text: 'Designed for itineraries with several stops, overnight stays or changing destinations. Share the complete plan so driving time and allowances can be calculated clearly.'
  }
];

const CHECKLIST = [
  ['Route and stops', 'Add the exact pickup, destination and planned stops. Extra kilometres can then be discussed before departure.'],
  ['Passenger and luggage count', 'Choose a sedan or SUV/MPV with enough usable space for people and bags, not seats alone.'],
  ['Complete fare', 'Review the distance charge, driver allowance and GST, plus tolls, parking or permits payable at actual.'],
  ['Pickup details', 'Confirm the date, time, contact number and landmark so the driver can coordinate without last-minute confusion.']
];

export async function generateMetadata() {
  return {
    title: META.title,
    description: META.description,
    robots: { index: true, follow: true, 'max-image-preview': 'large' },
    alternates: { canonical: '/intercity-cab-guide' },
    openGraph: { title: META.title, description: META.description, url: '/intercity-cab-guide' },
    twitter: { title: META.title, description: META.description }
  };
}

export default function IntercityCabGuidePage() {
  const canonicalUrl = `${SITE_URL}/intercity-cab-guide`;
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Intercity cab booking across India, explained clearly',
    description: META.description,
    author: { '@type': 'Organization', name: 'WonderTravel', url: SITE_URL },
    publisher: { '@type': 'Organization', name: 'WonderTravel', url: SITE_URL },
    mainEntityOfPage: canonicalUrl
  };

  return <article className="seo-guide page-shell">
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
    />
    <nav className="route-crumbs" aria-label="Breadcrumb">
      <Link href="/">Home</Link><span aria-hidden="true">/</span><span aria-current="page">Intercity cab guide</span>
    </nav>

    <header className="seo-guide-hero">
      <span className="eyebrow">Travel planning guide</span>
      <h1>Intercity cab booking across India, explained clearly</h1>
      <p>Plan one-way, round-trip and multi-day road journeys between cities across India. This guide explains how to choose a trip format, compare vehicles and understand the fare before you confirm.</p>
      <div className="seo-guide-actions">
        <Link className="button button-ember" href="/#book">Plan your journey <ArrowRight /></Link>
        <Link className="button button-ghost" href="/uttarakhand-cabs">Explore Uttarakhand cabs</Link>
      </div>
    </header>

    <section className="seo-guide-section" aria-labelledby="trip-format-title">
      <div className="seo-guide-heading">
        <span className="eyebrow">Choose the right format</span>
        <h2 id="trip-format-title">One journey, three practical options</h2>
        <p>The best booking type depends on whether you are returning, how many stops you need and how long the vehicle should remain with you.</p>
      </div>
      <div className="seo-card-grid">
        {TRIP_TYPES.map(({ title, text }, index) => <article key={title}>
          <span>0{index + 1}</span><h3>{title}</h3><p>{text}</p>
        </article>)}
      </div>
    </section>

    <section className="seo-guide-split" id="fare-breakdown">
      <div className="seo-guide-heading">
        <span className="eyebrow">Transparent estimates</span>
        <h2>What makes up an intercity cab fare?</h2>
        <p>The distance charge is only one part of a complete road-trip estimate. WonderTravel shows the known components before confirmation and keeps variable road charges separate.</p>
      </div>
      <dl className="seo-definition-list">
        <div><dt><BadgeIndianRupee /> Distance charge</dt><dd>Planned kilometres multiplied by the published vehicle-class rate.</dd></div>
        <div><dt><CalendarDays /> Driver allowance</dt><dd>A daily allowance based on the length and format of the journey.</dd></div>
        <div><dt><MapPinned /> Road charges</dt><dd>Tolls, parking and state permits are paid at actual where applicable.</dd></div>
        <div><dt><ShieldCheck /> Taxes</dt><dd>GST is itemised separately in the booking summary.</dd></div>
      </dl>
    </section>

    <section className="seo-guide-section">
      <div className="seo-guide-heading">
        <span className="eyebrow">Before you book</span>
        <h2>A four-point road journey checklist</h2>
      </div>
      <div className="seo-checklist">
        {CHECKLIST.map(([title, text], index) => <div key={title}>
          <b>{index + 1}</b><span><strong>{title}</strong><small>{text}</small></span>
        </div>)}
      </div>
    </section>

    <section className="seo-guide-split seo-guide-choice">
      <div>
        <span className="eyebrow">Vehicle choice</span>
        <h2>Sedan or SUV/MPV?</h2>
      </div>
      <div className="seo-guide-prose">
        <p><CarFront aria-hidden="true" /> A sedan is usually suitable for up to four passengers travelling light. An SUV or MPV provides more seating and is often more practical for larger families, additional luggage or longer itineraries.</p>
        <p>Always count the luggage you will actually carry. A nominal seat count does not guarantee that every seat and every large suitcase will fit comfortably at the same time.</p>
      </div>
    </section>

    <section className="seo-guide-cta">
      <span className="eyebrow">Ready when you are</span>
      <h2>Tell us where your India journey starts and ends.</h2>
      <p>Choose any pickup and destination. Available vehicles and the itemised estimate are shown before booking.</p>
      <Link className="button button-gold" href="/#book">Check vehicles and fares <ArrowRight /></Link>
    </section>
  </article>;
}
