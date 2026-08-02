'use client';

import { IconArrowRight, IconClockRing, IconPerson, IconPulse, IconShield } from '../design/icons.jsx';
import { FEATURES } from './homeContent.js';

const FEATURE_ICONS = { IconShield, IconClockRing, IconPulse, IconPerson };

export default function WhySection({ onBook }) {
  return <section className="why pad" id="why">
    <div className="wrap why-grid">
      <div className="why-copy reveal">
        <span className="eyebrow">What the app shows</span>
        <h2>Clear details for<br />every <span className="it">listed route</span>.</h2>
        <p>Choose from the vehicles, routes and fare details currently listed in the app. Driver and final trip details are confirmed before pickup.</p>
        <button className="btn btn-gold" type="button" onClick={onBook}>Plan a journey
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
