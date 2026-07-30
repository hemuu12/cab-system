import { Link, useNavigate } from 'react-router-dom';
import { useMobileMenu } from '../../hooks/useMobileMenu.js';
import { firstNameOf } from '../../lib/format.js';
import NavProfile from '../../components/design/NavProfile.jsx';
import { SUPPORT_PHONE } from '../../components/design/Floats.jsx';

/** Nav labels map onto home-page anchors, matching the original design script. */
const NAV_LINKS = [
  ['/', 'Home'],
  ['/#why', 'About'],
  ['/#fleet', 'Fleet'],
  ['/#testi', 'Tours'],
  [`tel:${SUPPORT_PHONE}`, 'Support']
];

const MOBILE_LINKS = [
  ['/', 'Home'],
  ['/#why', 'Why WonderTravel'],
  ['/#fleet', 'Vehicles'],
  ['/#testi', 'Guest stories'],
  [`tel:${SUPPORT_PHONE}`, 'Support']
];

export default function ResultsNav({ user, onLogout }) {
  const navigate = useNavigate();
  const { open, close, toggle, toggleRef } = useMobileMenu();

  const go = (event, href) => {
    event.preventDefault();
    close();
    if (href.startsWith('tel:')) window.location.href = href;
    else navigate(href);
  };

  return <nav>
    <div className="wrap nav-in">
      <Link className="brand" to="/" aria-label="WonderTravel home">
        <img src="/branding/wondertravel-wordmark-header.png" alt="WonderTravel logo" width="720" height="180" />
      </Link>
      <ul className="nav-links">
        {NAV_LINKS.map(([href, label]) => (
          <li key={label}>
            <a href={href} className={label === 'Fleet' ? 'on' : undefined} onClick={event => go(event, href)}>{label}</a>
          </li>
        ))}
      </ul>
      <div className="nav-cta">
        <NavProfile user={user} onLogout={onLogout} />
        <button className="btn btn-gold" type="button" onClick={() => navigate('/#book')}>Book a ride</button>
      </div>
      <button
        ref={toggleRef}
        className={`mobile-toggle${open ? ' open' : ''}`}
        type="button"
        aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
        aria-expanded={open}
        aria-controls="mobileNav"
        onClick={toggle}
      ><span /></button>
      <div className={`mobile-menu${open ? ' open' : ''}`} id="mobileNav">
        {MOBILE_LINKS.map(([href, label]) => (
          <a key={label} href={href} onClick={event => go(event, href)}>{label}</a>
        ))}
        {user ? <>
          {user.role === 'admin' && <Link className="mobile-account" to="/admin" onClick={close}>Admin dashboard</Link>}
          <Link to="/account" onClick={close}>{firstNameOf(user.name)} · My profile &amp; trips</Link>
        </> : <Link className="mobile-account" to="/login" onClick={close}>Member login</Link>}
        {user && <button className="mobile-logout" type="button" onClick={() => { onLogout(); close(); }}>Log out</button>}
        <button className="mobile-primary" type="button" onClick={() => { close(); navigate('/#book'); }}>Book a ride</button>
      </div>
    </div>
  </nav>;
}
