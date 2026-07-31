import { FOOTER_COLUMNS } from './homeContent.js';
import { Facebook, Instagram, Linkedin } from 'lucide-react';

const SOCIAL_LINKS = [
  { label: 'LinkedIn', Icon: Linkedin, href: '' },
  { label: 'Facebook', Icon: Facebook, href: '' },
  { label: 'Instagram', Icon: Instagram, href: '' }
];

export default function HomeFooter() {
  const scrollHome = event => {
    event.preventDefault();
    document.querySelector('#home')?.scrollIntoView({ behavior: 'smooth' });
  };
  return <footer>
    <svg className="footer-route-art" viewBox="0 0 1600 500" preserveAspectRatio="none" aria-hidden="true">
      <path d="M-80 370C190 185 390 455 665 270S1110 70 1680 245" />
      <circle cx="665" cy="270" r="6" />
      <circle cx="1260" cy="128" r="6" />
    </svg>
    <div className="footer-ghost-type" aria-hidden="true">WONDERTRAVEL</div>
    <div className="wrap">
      <div className="foot-grid">
        <div className="foot-brand">
          <a className="brand" href="#home" aria-label="WonderTravel home" onClick={scrollHome}>
            <img src="/branding/wondertravel-wordmark-header.png" alt="WonderTravel logo" width="720" height="180" loading="lazy" />
          </a>
          <p>Driver-operated one-way, round-trip and multi-day journeys across India, with roots in Uttarakhand.</p>
        </div>
        {FOOTER_COLUMNS.map(([heading, links]) => (
          <div className="foot-col" key={heading}>
            <h4>{heading}</h4>
            <ul>{links.map(([label, href]) => <li key={label}><a href={href}>{label}</a></li>)}</ul>
          </div>
        ))}
      </div>
      <div className="foot-bar">
        <p>© 2026 WonderTravel Cab Services · Serving India · Proudly from Uttarakhand</p>
        <div className="socials" aria-label="WonderTravel social links">
          {SOCIAL_LINKS.map(({ label, Icon, href }) => (
            <a
              className={`soc${href ? '' : ' pending'}`}
              href={href || undefined}
              aria-label={`${label}${href ? '' : ' link coming soon'}`}
              aria-disabled={!href}
              title={`${label} · link coming soon`}
              key={label}
            ><Icon /></a>
          ))}
        </div>
      </div>
    </div>
  </footer>;
}
