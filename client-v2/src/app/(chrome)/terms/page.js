import Link from 'next/link';

const SITE_URL = 'https://www.wondertravel.online';
const META = {
  title: 'Terms of Service | WonderTravel',
  description: 'The terms that govern booking and using driver-operated cab services through WonderTravel.'
};

// [PLACEHOLDER] fields must be filled in with real business/legal details before this page goes live.
const LAST_UPDATED = '[PLACEHOLDER: date, e.g. 1 August 2026]';
const LEGAL_ENTITY = '[PLACEHOLDER: registered business/entity name]';
const REGISTERED_ADDRESS = '[PLACEHOLDER: registered address]';
const CONTACT_EMAIL = '[PLACEHOLDER: support email]';

export async function generateMetadata() {
  return {
    title: META.title,
    description: META.description,
    robots: { index: true, follow: true },
    alternates: { canonical: '/terms' },
    openGraph: { title: META.title, description: META.description, url: '/terms' },
    twitter: { title: META.title, description: META.description }
  };
}

export default function TermsPage() {
  const canonicalUrl = `${SITE_URL}/terms`;
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: 'Terms of Service', item: canonicalUrl }
    ]
  };

  return <article className="seo-guide page-shell legal-page">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
    <nav className="route-crumbs" aria-label="Breadcrumb">
      <Link href="/">Home</Link><span aria-hidden="true">/</span><span aria-current="page">Terms of Service</span>
    </nav>

    <header className="seo-guide-hero">
      <span className="eyebrow">Legal</span>
      <h1>Terms of Service</h1>
      <p>Last updated: {LAST_UPDATED}</p>
    </header>

    <section className="route-faq">
      <h2>1. Acceptance of terms</h2>
      <p>By booking a journey, creating an account, or otherwise using the WonderTravel website and booking service (the "Service"), operated by {LEGAL_ENTITY} ("WonderTravel", "we", "us"), you agree to these Terms of Service. If you do not agree, do not use the Service.</p>
    </section>

    <section className="route-faq">
      <h2>2. The service</h2>
      <p>WonderTravel arranges driver-operated, one-way, round-trip and multi-day intercity cab journeys across India. Vehicles and drivers are made available through the platform's fleet and driver network; WonderTravel is not the direct employer of assigned drivers unless stated otherwise on a specific booking.</p>
    </section>

    <section className="route-faq">
      <h2>3. Bookings and fares</h2>
      <p>Fares are calculated per kilometre by vehicle class and displayed in full, itemised form (distance charge, driver allowance and applicable taxes) before a booking is confirmed. Tolls, parking and state entry permits are payable at actual during the trip unless otherwise stated. A booking is confirmed only once payment or the applicable confirmation step is completed and a confirmation reference is issued.</p>
    </section>

    <section className="route-faq">
      <h2>4. Cancellations and changes</h2>
      <p>Cancellation, rescheduling and refund terms are set out in the <Link href="/cancellation-refund-policy">Cancellation &amp; Refund Policy</Link>, which forms part of these Terms.</p>
    </section>

    <section className="route-faq">
      <h2>5. Passenger responsibilities</h2>
      <p>Passengers are responsible for providing accurate pickup, destination and passenger/luggage details at the time of booking, and for their own conduct and belongings during the journey. WonderTravel and its drivers may decline or end a trip where conduct endangers safety or violates applicable law.</p>
    </section>

    <section className="route-faq">
      <h2>6. Accounts</h2>
      <p>You are responsible for maintaining the confidentiality of your account credentials and for all activity under your account. Notify {CONTACT_EMAIL} promptly of any unauthorised use.</p>
    </section>

    <section className="route-faq">
      <h2>7. Limitation of liability</h2>
      <p>[PLACEHOLDER: liability limitation clause — to be reviewed with legal counsel before publishing, covering delay, vehicle breakdown, third-party acts, and force majeure events such as weather or road closures.]</p>
    </section>

    <section className="route-faq">
      <h2>8. Changes to these terms</h2>
      <p>These Terms may be updated from time to time. Continued use of the Service after an update constitutes acceptance of the revised Terms. The "Last updated" date above reflects the most recent revision.</p>
    </section>

    <section className="route-faq">
      <h2>9. Contact</h2>
      <p>Questions about these Terms can be sent to {CONTACT_EMAIL} or {REGISTERED_ADDRESS}. For booking support, visit the <Link href="/help">help center</Link>.</p>
    </section>
  </article>;
}
