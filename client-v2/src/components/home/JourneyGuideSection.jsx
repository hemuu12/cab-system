'use client';

import {
  CalendarRange, CarFront, ClipboardCheck, MapPinned, Navigation, Repeat2, UserRoundCheck
} from 'lucide-react';

const STEPS = [
  {
    Icon: MapPinned,
    title: 'Set your journey',
    copy: 'Choose pickup, destination, trip format, travel date and pickup time.'
  },
  {
    Icon: CarFront,
    title: 'Compare vehicles',
    copy: 'Review seating, luggage space, vehicle photos and the displayed fare estimate.'
  },
  {
    Icon: ClipboardCheck,
    title: 'Confirm the details',
    copy: 'Add passenger information, check the fare breakdown and create the booking.'
  },
  {
    Icon: UserRoundCheck,
    title: 'Prepare for pickup',
    copy: 'Keep your booking reference handy. Driver contact details are shared before pickup.'
  }
];

const TRIP_FORMATS = [
  {
    Icon: Navigation,
    label: 'One way',
    title: 'Travel from pickup to destination',
    copy: 'A direct outstation booking for the route and date you select.'
  },
  {
    Icon: Repeat2,
    label: 'Round trip',
    title: 'Plan the return journey together',
    copy: 'Choose the number of travel days and compare the resulting fare estimate.'
  },
  {
    Icon: CalendarRange,
    label: 'Outstation',
    title: 'Build a longer road journey',
    copy: 'Use the multi-day option for longer travel on a listed or reviewed route.'
  }
];

export default function JourneyGuideSection({ onPlanJourney }) {
  return <section className="journey-guide pad" id="how">
    <div className="wrap">
      <div className="sec-head reveal">
        <span className="eyebrow">How booking works</span>
        <h2>From route search to <span className="it">pickup</span></h2>
        <p>Four clear steps, with the important journey information shown before you confirm.</p>
      </div>
      <div className="journey-steps">
        {STEPS.map(({ Icon, title, copy }, index) => <article className="journey-step reveal" key={title}>
          <div className="journey-step-top"><span>0{index + 1}</span><i><Icon /></i></div>
          <h3>{title}</h3>
          <p>{copy}</p>
        </article>)}
      </div>
      <div className="trip-format-head reveal">
        <div><span className="eyebrow">Choose your format</span><h3>A journey shape for every plan.</h3></div>
        <button className="btn btn-gold" type="button" onClick={onPlanJourney}>Start planning</button>
      </div>
      <div className="trip-format-grid">
        {TRIP_FORMATS.map(({ Icon, label, title, copy }) => <article className="trip-format-card reveal" key={label}>
          <i><Icon /></i>
          <span>{label}</span>
          <h4>{title}</h4>
          <p>{copy}</p>
        </article>)}
      </div>
    </div>
  </section>;
}
