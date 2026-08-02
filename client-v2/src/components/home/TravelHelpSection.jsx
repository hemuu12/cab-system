'use client';

import { ArrowRight, MessageCircle, Phone } from 'lucide-react';
import { SUPPORT_PHONE } from '../design/Floats.jsx';

const FAQS = [
  [
    'What is included in the displayed fare?',
    'The booking screen separates the route package, driver allowance, toll and state permit estimate, and GST. Review that breakdown before confirming.'
  ],
  [
    'When will I receive driver details?',
    'The driver name and contact details are shared before pickup. Until then, your booking page will show the assignment as pending.'
  ],
  [
    'Can I request a route that is not listed?',
    'Yes. Enter the destination for route review or contact the booking team for help with distance and vehicle options.'
  ],
  [
    'How do I change or cancel a booking?',
    'Use the support number or WhatsApp button and share your booking reference so the team can review the request.'
  ],
  [
    'Where can I see my journeys?',
    'Sign in with the email connected to your booking. Your account keeps upcoming and previous booking records together.'
  ]
];

export default function TravelHelpSection({ onPlanJourney }) {
  return <section className="travel-help pad" id="help">
    <div className="wrap travel-help-grid">
      <div className="travel-help-copy reveal">
        <span className="eyebrow">Plan with clarity</span>
        <h2>Useful answers before you <span className="it">set off</span>.</h2>
        <p>Check what the fare shows, when driver information arrives, and how to get help with a booking.</p>
        <div className="help-contact-cards">
          <a href="https://wa.me/919675286699" target="_blank" rel="noreferrer">
            <MessageCircle /><span><small>WhatsApp</small><strong>Message the booking team</strong></span><ArrowRight />
          </a>
          <a href={`tel:${SUPPORT_PHONE}`}>
            <Phone /><span><small>Phone</small><strong>Call 9675286699</strong></span><ArrowRight />
          </a>
        </div>
        <button className="btn btn-ember" type="button" onClick={onPlanJourney}>Plan a journey</button>
      </div>
      <div className="faq-list reveal">
        {FAQS.map(([question, answer], index) => <details key={question} open={index === 0}>
          <summary>{question}<span>+</span></summary>
          <p>{answer}</p>
        </details>)}
      </div>
    </div>
  </section>;
}
