import { IconFacebook, IconInstagram, IconLinkedIn } from '../../components/design/icons.jsx';
import { FOOTER_COLUMNS } from './homeContent.js';

const SOCIALS = [IconFacebook, IconInstagram, IconLinkedIn];

export default function HomeFooter() {
  const scrollHome = event => {
    event.preventDefault();
    document.querySelector('#home')?.scrollIntoView({ behavior: 'smooth' });
  };
  return <footer>
    <div className="wrap">
      <div className="foot-grid">
        <div className="foot-brand">
          <a className="brand" href="#home" aria-label="WonderTravel home" onClick={scrollHome}>
            <img src="/branding/wondertravel-wordmark-header.png" alt="WonderTravel logo" width="720" height="180" loading="lazy" />
          </a>
          <p>Professional driver service for airport, city and intercity journeys across India.</p>
        </div>
        {FOOTER_COLUMNS.map(([heading, links]) => (
          <div className="foot-col" key={heading}>
            <h4>{heading}</h4>
            <ul>{links.map(link => <li key={link}><a href="#">{link}</a></li>)}</ul>
          </div>
        ))}
      </div>
      <div className="foot-bar">
        <p>© 2026 WonderTravel Cab Services · Delhi, Uttarakhand, Rajasthan and nearby routes</p>
        <div className="socials">
          {SOCIALS.map((Social, index) => <div className="soc" key={index}><Social /></div>)}
        </div>
      </div>
    </div>
  </footer>;
}
