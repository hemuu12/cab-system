'use client';

import { IconDriver, IconFleet, IconGhostCar, IconGhostPerson, IconLock } from '../design/icons.jsx';

/**
 * Partner onboarding is not open yet, so both cards render the disabled
 * "Coming soon" state from the design. `onApply` stays wired for when it opens.
 */
const PARTNER_CARDS = [
  {
    key: 'fleet-partner',
    Icon: IconFleet,
    Ghost: IconGhostCar,
    title: <>Put your fleet<br />to better use.</>,
    copy: 'Register interest in supplying vehicles when partner onboarding opens.'
  },
  {
    key: 'chauffeur',
    Icon: IconDriver,
    Ghost: IconGhostPerson,
    title: <>Professional driver?<br />Drive with pride.</>,
    copy: 'Register interest in driving with WonderTravel when applications open.'
  }
];

export default function PartnerSection() {
  return <section className="pad" id="partner">
    <div className="wrap">
      <div className="sec-head reveal">
        <span className="eyebrow">Grow with WonderTravel</span>
        <h2>Build your future <span className="it">on the road</span></h2>
        <p>Driver and fleet-partner applications are not open yet. Availability will be announced here.</p>
      </div>
      <div className="partner-status reveal">
        <span className="coming-badge"><IconLock />Partner onboarding coming soon</span>
      </div>
      <div className="partner-grid">
        {PARTNER_CARDS.map(({ key, Icon, Ghost, title, copy }) => (
          <div className="pcard is-coming reveal" key={key}>
            <span className="coming-badge pcard-status">Coming soon</span>
            <div className="ghost"><Ghost /></div>
            <div>
              <div className="ic"><Icon /></div>
              <h3>{title}</h3>
              <p>{copy}</p>
            </div>
            <button className="btn" type="button" disabled aria-disabled="true"><IconLock />Coming soon</button>
          </div>
        ))}
      </div>
    </div>
  </section>;
}
