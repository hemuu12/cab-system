import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useMobileMenu } from '../../hooks/useMobileMenu.js';
import { firstNameOf } from '../../lib/format.js';
import NavProfile from '../../components/design/NavProfile.jsx';

const SECTION_LINKS = [
  ['#home', 'Home'],
  ['#how', 'How it works'],
  ['#routes', 'Routes'],
  ['#fleet', 'Vehicles'],
  ['#testi', 'Reviews']
];

const scrollToSection = (event, href) => {
  const target = href.length > 1 ? document.querySelector(href) : null;
  if (!target) return;
  event.preventDefault();
  target.scrollIntoView({ behavior: 'smooth' });
};

export default function HomeNav({ user, onLogout, onPlanJourney }) {
  const [scrolled, setScrolled] = useState(false);
  const { open, close, toggle, toggleRef } = useMobileMenu();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return <nav id="nav" className={scrolled ? 'scrolled' : ''}>
    <div className="wrap nav-in">
      <a className="brand" href="#home" aria-label="WonderTravel home" onClick={event => scrollToSection(event, '#home')}>
        <img src="/branding/wondertravel-wordmark-header.png" alt="WonderTravel logo" width="720" height="180" decoding="async" fetchPriority="high" />
      </a>
      <ul className="nav-links">
        {SECTION_LINKS.map(([href, label]) => (
          <li key={href}><a href={href} onClick={event => scrollToSection(event, href)}>{label}</a></li>
        ))}
      </ul>
      <div className="nav-cta">
        <NavProfile user={user} onLogout={onLogout} />
        <button className="btn btn-gold" type="button" onClick={onPlanJourney}>Plan a journey</button>
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
        {SECTION_LINKS.map(([href, label]) => (
          <a key={href} href={href} onClick={event => { scrollToSection(event, href); close(); }}>{label}</a>
        ))}
        {user ? <>
          {user.role === 'admin' && <Link className="mobile-account" to="/admin" onClick={close}>Admin dashboard</Link>}
          <Link to="/account" onClick={close}>{firstNameOf(user.name)} · My profile &amp; trips</Link>
        </> : <Link className="mobile-account" to="/login" onClick={close}>Member login</Link>}
        {user && <button className="mobile-logout" type="button" onClick={() => { onLogout(); close(); }}>Log out</button>}
        <button className="mobile-primary" type="button" onClick={() => { close(); onPlanJourney(); }}>Plan a journey</button>
      </div>
    </div>
  </nav>;
}
