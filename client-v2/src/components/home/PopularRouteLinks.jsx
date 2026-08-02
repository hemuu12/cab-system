'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, MapPin, Route } from 'lucide-react';
import { ORIGIN_CITY, ROUTE_PAGES } from '../../data/routePages.js';

const INITIAL_ROUTE_COUNT = 8;

/** A compact route directory with Uttarakhand-first guides shown initially. */
export default function PopularRouteLinks() {
  const [expanded, setExpanded] = useState(false);
  const visibleRoutes = expanded ? ROUTE_PAGES : ROUTE_PAGES.slice(0, INITIAL_ROUTE_COUNT);

  return <section className="home-routes-seo" aria-labelledby="popular-routes-heading">
    <div className="home-routes-seo-head">
      <div>
        <span className="eyebrow">Route-by-route details</span>
        <h2 id="popular-routes-heading">Popular intercity cab guides</h2>
        <p>Useful distance and travel-time references. Your actual pickup can be anywhere in India.</p>
      </div>
      <span className="home-routes-count"><Route aria-hidden="true" /> {ROUTE_PAGES.length} guides</span>
    </div>

    <ul>
      {visibleRoutes.map(route => <li key={route.slug}>
        <Link href={route.path}>
          <MapPin aria-hidden="true" />
          <span>
            <strong>{ORIGIN_CITY} to {route.city}</strong>
            <small>{route.region} · {route.distanceKm} km</small>
          </span>
        </Link>
      </li>)}
    </ul>

    <button
      className={`home-routes-toggle${expanded ? ' expanded' : ''}`}
      type="button"
      aria-expanded={expanded}
      onClick={() => setExpanded(value => !value)}
    >
      {expanded ? 'Show fewer routes' : `View all ${ROUTE_PAGES.length} route guides`}
      <ChevronDown aria-hidden="true" />
    </button>
  </section>;
}
