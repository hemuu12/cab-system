import { IconArrowRight, IconClockRing, IconPerson, IconPulse, IconShield } from '../../components/design/icons.jsx';
import { FEATURES } from './homeContent.js';

const FEATURE_ICONS = { IconShield, IconClockRing, IconPulse, IconPerson };

export default function WhySection({ onBook }) {
  return <section className="why pad" id="why">
    <div className="wrap why-grid">
      <div className="why-copy reveal">
        <span className="eyebrow">The WonderTravel promise</span>
        <h2>One standard of care.<br />Wherever <span className="it">India</span> takes you.</h2>
        <p>Every journey combines a well-kept vehicle, a background-verified driver, responsive trip support and an upfront fare. From an early airport pickup to a multi-day road trip, the details are handled before you step outside.</p>
        <button className="btn btn-gold" type="button" onClick={onBook}>Book with confidence
          <IconArrowRight />
        </button>
      </div>
      <div className="feat-grid reveal">
        {FEATURES.map(([iconName, title, copy]) => {
          const Icon = FEATURE_ICONS[iconName];
          return <div className="feat" key={title}>
            <div className="ic"><Icon /></div>
            <h3>{title}</h3><p>{copy}</p>
          </div>;
        })}
      </div>
    </div>
  </section>;
}
