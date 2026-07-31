import { IconPlay } from '../../components/design/icons.jsx';
import { TRUST_STATS } from './homeContent.js';

export default function HomeHero({ booking, onBookDriver, onSeeHowItWorks, verifiedReviewCount }) {
  const trustStats = [
    ...TRUST_STATS,
    [verifiedReviewCount ?? '—', '', 'Verified reviews']
  ];
  return <section className="hero" id="home">
    <div className="hero-bg">
      <svg className="road" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="rd" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0" stopColor="#F26B1D" stopOpacity=".22"/>
            <stop offset="1" stopColor="#F26B1D" stopOpacity="0"/>
          </linearGradient>
        </defs>
        <path d="M720 900 L560 420 Q700 380 720 360 Q740 380 880 420 Z" fill="url(#rd)"/>
        <line x1="720" y1="900" x2="720" y2="380" stroke="#D8B678" strokeOpacity=".18" strokeWidth="2" strokeDasharray="14 22"/>
      </svg>
    </div>
    <div className="wrap hero-grid">
      <div className="hero-copy reveal in">
        <span className="eyebrow">Driver-assisted intercity travel · Across India</span>
        <h1>India, <span className="it">beautifully</span> driven.</h1>
        <p className="lede">One-way, round-trip and multi-day cabs across India, with deeper local coverage throughout Uttarakhand. Choose any pickup and destination; driver and route details are confirmed before pickup.</p>
        <div className="hero-actions">
          <button className="btn btn-ember" type="button" onClick={onBookDriver}>Book a driver</button>
          <button className="btn btn-ghost" type="button" onClick={onSeeHowItWorks}>
            <IconPlay />
            See how it works
          </button>
        </div>
        <div className="trust">
          {trustStats.map(([value, symbol, label]) => (
            <div key={label}>
              <div className="t-n">{value}<span style={{ color: 'var(--gold)' }}>{symbol}</span></div>
              <div className="t-l">{label}</div>
            </div>
          ))}
        </div>
      </div>
      {booking}
    </div>
  </section>;
}
