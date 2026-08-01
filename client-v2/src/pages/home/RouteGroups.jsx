import { useState } from 'react';
import { ROUTE_GROUPS, VISIBLE_CHIPS } from './homeContent.js';

function RouteGroup({ group, onChooseRoute }) {
  const [expanded, setExpanded] = useState(false);
  const canExpand = group.chips.length > VISIBLE_CHIPS;
  return <article className="route-group reveal">
    <h3>{group.title}</h3><p>{group.subtitle}</p>
    <div className="route-chips">
      {group.chips.map(([route, label, popular], index) => (
        <button
          key={route}
          className={`route-chip${popular ? ' popular' : ''}`}
          type="button"
          hidden={!expanded && index >= VISIBLE_CHIPS}
          onClick={() => onChooseRoute(route)}
        >{label}</button>
      ))}
    </div>
    {canExpand && <button className="route-more" type="button" aria-expanded={expanded} onClick={() => setExpanded(value => !value)}>
      {expanded ? 'Show fewer routes' : `View all ${group.chips.length} routes`}
    </button>}
  </article>;
}

export default function RouteGroups({ onChooseRoute }) {
  return <section className="route-service pad" id="routes">
    <div className="wrap">
      <div className="sec-head reveal">
        <span className="eyebrow">One-way, round-trip and outstation cab service across India</span>
        <h2>One-way, round-trip and <span className="it">multi-day travel</span></h2>
        <p>Start from any city and travel anywhere in India. Explore a few popular destinations below, with extra coverage for our home state of Uttarakhand.</p>
      </div>
      <div className="route-groups">
        {ROUTE_GROUPS.map(group => <RouteGroup key={group.title} group={group} onChooseRoute={onChooseRoute} />)}
      </div>
      <p className="service-note">Choose 1–30 travel days. One-way, round-trip and outstation options use the route and fare information shown during booking.</p>
    </div>
  </section>;
}
