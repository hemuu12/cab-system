import Link from 'next/link';
import { ArrowRight, MessageCircle, Phone } from 'lucide-react';
import { SUPPORT_PHONE } from '../../../components/design/Floats.jsx';

const SITE_URL = 'https://www.wondertravel.online';
const META = {
  title: 'Help Center — Booking Support & Contact | WonderTravel',
  description: 'Get help with an outstation cab booking: contact support by WhatsApp or phone, manage or cancel a trip, recover your account, or report an issue with a driver or fare.'
};

// Grouped by what the visitor is trying to DO (contact, manage a trip, account, report),
// as distinct from /taxi-faq which answers general booking/fare/policy questions.
const HELP_GROUPS = [
  {
    title: 'Contact support',
    items: [
      {
        q: 'What is the fastest way to reach support?',
        a: 'WhatsApp is the fastest channel for booking changes, driver questions or urgent trip issues. Phone support is available for the same requests if you prefer to call.'
      },
      {
        q: 'What should I have ready when I contact support?',
        a: 'Share your booking reference, the pickup city and date, and a short description of what you need. This lets the team pull up your trip immediately instead of asking follow-up questions.'
      },
      {
        q: 'Is support available for both upcoming and completed trips?',
        a: 'Yes. Contact support for anything from a pre-trip change to a question about a fare already charged on a completed journey.'
      }
    ]
  },
  {
    title: 'Manage a booking',
    items: [
      {
        q: 'How do I cancel or reschedule a trip?',
        a: 'Sign in to your account to view the booking and its cancellation cutoff, or contact support with your booking reference to cancel or reschedule directly.'
      },
      {
        q: 'How do I change the pickup point, date or vehicle?',
        a: 'Changes are handled fastest through support before the pickup window, since some changes affect the assigned driver or fare. Share the booking reference and the exact change needed.'
      },
      {
        q: 'When will I get my driver and vehicle details?',
        a: 'Driver name and contact details are shared ahead of pickup and also appear on your booking confirmation once assigned. If pickup is close and no driver is shown, contact support.'
      }
    ]
  },
  {
    title: 'Account help',
    items: [
      {
        q: 'I can’t sign in to my account.',
        a: 'Use the password reset option on the login page, which sends a one-time code to your registered email. If the email isn’t recognised, contact support to check which address your bookings are under.'
      },
      {
        q: 'Where can I see my past and upcoming trips?',
        a: 'All bookings made with your account email appear on the account page under trip history. Guest bookings made without signing in are found using the booking reference instead.'
      },
      {
        q: 'How do I update my phone number or email?',
        a: 'Contact support with your booking reference and the corrected detail. This keeps driver-contact and confirmation messages going to the right place.'
      }
    ]
  },
  {
    title: 'Report an issue',
    items: [
      {
        q: 'The fare I was charged doesn’t match the estimate.',
        a: 'Share the booking reference with support along with the amount charged. Every booking has an itemised breakdown of distance charge, driver allowance, GST, and pay-at-actual tolls or permits, which the team can check against your trip.'
      },
      {
        q: 'I had a problem with my driver or vehicle.',
        a: 'Report it to support as soon as possible with the booking reference and a description of what happened. Driver-related reports are reviewed as part of the platform’s regular verification process.'
      },
      {
        q: 'I want to leave feedback about my trip.',
        a: 'Approved reviews appear publicly on the site. Leave a rating and, if you’d like, a written review and photo from your journey after the trip is complete.'
      }
    ]
  }
];

export async function generateMetadata() {
  return {
    title: META.title,
    description: META.description,
    robots: { index: true, follow: true, 'max-image-preview': 'large' },
    alternates: { canonical: '/help' },
    openGraph: { title: META.title, description: META.description, url: '/help' },
    twitter: { title: META.title, description: META.description }
  };
}

export default function HelpPage() {
  const canonicalUrl = `${SITE_URL}/help`;
  const allFaqs = HELP_GROUPS.flatMap(group => group.items);
  const helpSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
          { '@type': 'ListItem', position: 2, name: 'Help Center', item: canonicalUrl }
        ]
      },
      {
        '@type': 'ContactPage',
        name: META.title,
        url: canonicalUrl,
        about: { '@id': `${SITE_URL}/#business` }
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
      dangerouslySetInnerHTML={{ __html: JSON.stringify(helpSchema) }}
    />
    <nav className="route-crumbs" aria-label="Breadcrumb">
      <Link href="/">Home</Link><span aria-hidden="true">/</span><span aria-current="page">Help Center</span>
    </nav>

    <header className="seo-guide-hero">
      <span className="eyebrow">Help center</span>
      <h1>Booking support, contact and account help</h1>
      <p>Reach the booking team directly, manage an existing trip, or sort out an account or fare issue. For general questions about fares, safety and policy, see the <Link href="/taxi-faq">taxi FAQ</Link>.</p>
      <div className="seo-guide-actions">
        <a className="button button-ember" href="https://wa.me/919675286699" target="_blank" rel="noreferrer">
          <MessageCircle aria-hidden="true" /> Message on WhatsApp
        </a>
        <a className="button button-ghost" href={`tel:${SUPPORT_PHONE}`}>
          <Phone aria-hidden="true" /> Call {SUPPORT_PHONE}
        </a>
      </div>
    </header>

    {HELP_GROUPS.map(group => <section className="route-faq" key={group.title} aria-labelledby={`help-${group.title}`}>
      <h2 id={`help-${group.title}`}>{group.title}</h2>
      {group.items.map(item => <details key={item.q}><summary>{item.q}</summary><p>{item.a}</p></details>)}
    </section>)}

    <section className="seo-guide-cta">
      <span className="eyebrow">Didn’t find your answer?</span>
      <h2>Message the booking team directly.</h2>
      <p>Share your booking reference so support can pull up your trip and help right away.</p>
      <div className="seo-guide-actions">
        <a className="button button-gold" href="https://wa.me/919675286699" target="_blank" rel="noreferrer">
          WhatsApp support <ArrowRight aria-hidden="true" />
        </a>
        <Link className="button button-ghost" href="/taxi-faq">Read the taxi FAQ</Link>
      </div>
    </section>
  </article>;
}
