import Link from 'next/link';

const SITE_URL = 'https://www.wondertravel.online';
const META = {
  title: 'Cancellation & Refund Policy | WonderTravel',
  description: 'How to cancel or reschedule a WonderTravel cab booking, and how refunds are calculated and processed.'
};

// [PLACEHOLDER] fields must be filled in with real business/legal details before this page goes live.
const LAST_UPDATED = '[PLACEHOLDER: date, e.g. 1 August 2026]';
const CONTACT_EMAIL = '[PLACEHOLDER: support email]';

export async function generateMetadata() {
  return {
    title: META.title,
    description: META.description,
    robots: { index: true, follow: true },
    alternates: { canonical: '/cancellation-refund-policy' },
    openGraph: { title: META.title, description: META.description, url: '/cancellation-refund-policy' },
    twitter: { title: META.title, description: META.description }
  };
}

export default function CancellationPolicyPage() {
  const canonicalUrl = `${SITE_URL}/cancellation-refund-policy`;
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: 'Cancellation & Refund Policy', item: canonicalUrl }
    ]
  };

  return <article className="seo-guide page-shell legal-page">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
    <nav className="route-crumbs" aria-label="Breadcrumb">
      <Link href="/">Home</Link><span aria-hidden="true">/</span><span aria-current="page">Cancellation &amp; Refund Policy</span>
    </nav>

    <header className="seo-guide-hero">
      <span className="eyebrow">Legal</span>
      <h1>Cancellation &amp; Refund Policy</h1>
      <p>Last updated: {LAST_UPDATED}</p>
    </header>

    <section className="route-faq">
      <h2>1. Cancelling a booking</h2>
      <p>A booking can be cancelled or rescheduled ahead of the pickup time. The exact cutoff before pickup and any applicable cancellation charge are shown on your booking confirmation at the time of booking, since they can vary by route and vehicle availability. Sign in to your account to cancel a booking directly, or contact <Link href="/help">support</Link> with your booking reference.</p>
    </section>

    <section className="route-faq">
      <h2>2. Cancellations close to pickup</h2>
      <p>Cancellations made after the cutoff shown on your confirmation, or after a driver has already been dispatched, may be charged in full or in part to cover the vehicle and driver allocation. [PLACEHOLDER: confirm the exact charge tiers, e.g. percentage of fare by time-before-pickup.]</p>
    </section>

    <section className="route-faq">
      <h2>3. Rescheduling</h2>
      <p>Where availability allows, a booking can be rescheduled to a new date or time instead of being cancelled. Rescheduling requests are handled the same way as cancellations — through your account or by contacting support with your booking reference — and are subject to the same cutoff shown on your confirmation.</p>
    </section>

    <section className="route-faq">
      <h2>4. Driver or vehicle issues on our side</h2>
      <p>If WonderTravel is unable to fulfil a confirmed booking (for example, no vehicle becomes available), the booking is cancelled without charge and any amount already paid is refunded in full.</p>
    </section>

    <section className="route-faq">
      <h2>5. Refund method and timing</h2>
      <p>Approved refunds are returned to the original payment method used at booking. [PLACEHOLDER: confirm typical refund processing time, e.g. "5–7 business days", which depends on the payment provider and bank.]</p>
    </section>

    <section className="route-faq">
      <h2>6. Pay-at-actual charges</h2>
      <p>Tolls, parking and state entry permits are paid at actual during the trip and are not part of the pre-paid fare, so they are not included in any cancellation charge or refund calculation.</p>
    </section>

    <section className="route-faq">
      <h2>7. Disputed charges</h2>
      <p>If a cancellation charge or refund amount looks incorrect, contact {CONTACT_EMAIL} or the <Link href="/help">help center</Link> with your booking reference so the itemised fare and cancellation timing can be reviewed.</p>
    </section>
  </article>;
}
