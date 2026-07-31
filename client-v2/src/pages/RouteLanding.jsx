import { useMemo } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowRight, Clock, MapPin, Route as RouteIcon } from 'lucide-react';
import { useVehiclesQuery } from '../store/api/catalogApi.js';
import { money, tomorrowISO } from '../lib/format.js';
import { formatDuration, ORIGIN_CITY, ROUTE_PAGES, routePageBySlug } from '../data/routePages.js';
import PremiumCard from '../components/ui/PremiumCard.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';

const CLASS_LABEL = { '5-seater': 'Sedan · up to 4 passengers', '7-seater': 'SUV / MPV · up to 6 passengers' };

/** Cheapest published vehicle in each seating class, used for the "from" prices on the page. */
function cheapestByClass(vehicles = []) {
  const cheapest = {};
  for (const vehicle of vehicles) {
    const key = vehicle.pricingClass || (vehicle.seats > 5 ? '7-seater' : '5-seater');
    const perKm = vehicle.fare?.perKm;
    if (!perKm) continue;
    if (!cheapest[key] || perKm < cheapest[key].perKm) cheapest[key] = { perKm, name: vehicle.name };
  }
  return cheapest;
}

export default function RouteLanding() {
  const { slug } = useParams();
  const route = routePageBySlug(slug);
  const { data: vehicles } = useVehiclesQuery();

  const rates = useMemo(() => cheapestByClass(vehicles), [vehicles]);

  // Related routes in the same region give crawlers a path between the landing pages.
  const related = useMemo(() => (route
    ? ROUTE_PAGES.filter(item => item.region === route.region && item.slug !== route.slug).slice(0, 6)
    : []), [route]);

  if (!route) return <Navigate to="/" replace />;

  const bookHref = `/results?pickup=${encodeURIComponent(ORIGIN_CITY)}&destination=${encodeURIComponent(route.destination)}&date=${tomorrowISO()}&time=12:00&tripType=one-way&distanceKm=${route.distanceKm}`;
  const estimateFor = perKm => (perKm ? money(perKm * route.distanceKm) : null);
  const journeyScale = route.distanceKm > 450 ? 'a long-distance journey that may benefit from an early start and planned rest stops'
    : route.distanceKm > 250 ? 'a full intercity travel day with time allowed for traffic and meal breaks'
      : 'a shorter intercity journey that can usually be completed within the day';
  const roadContext = route.region === 'Uttarakhand'
    ? 'The final hill sections may take longer than plain-road kilometres suggest. Weather, seasonal traffic and local road conditions can change the schedule.'
    : 'Highway traffic, city entry time and planned stops can change the schedule, so the displayed duration is a planning estimate.';

  return <div className="route-landing page-shell">
    <nav className="route-crumbs" aria-label="Breadcrumb">
      <Link to="/">Home</Link>
      <span aria-hidden="true">/</span>
      <span aria-current="page">{ORIGIN_CITY} to {route.city}</span>
    </nav>

    <header className="route-hero">
      <StatusBadge>{route.region}</StatusBadge>
      <h1>{ORIGIN_CITY} to {route.city} Cab</h1>
      <p>
        Book a chauffeur-driven cab from {ORIGIN_CITY} to {route.city}. One-way and round-trip
        journeys, transparent per-kilometre fares, and a professional driver for the full trip.
      </p>
      <div className="route-facts">
        <div><RouteIcon aria-hidden="true" /><span>Distance</span><b>{route.distanceKm} km</b></div>
        <div><Clock aria-hidden="true" /><span>Approx. travel time</span><b>{formatDuration(route.durationHours)}</b></div>
        <div><MapPin aria-hidden="true" /><span>Region</span><b>{route.region}</b></div>
      </div>
      <Link className="btn btn-ember route-cta" to={bookHref}>Check fares and book <ArrowRight aria-hidden="true" /></Link>
    </header>

    <section className="route-fares">
      <h2>{ORIGIN_CITY} to {route.city} taxi fare</h2>
      <div className="route-fare-grid">
        {['5-seater', '7-seater'].map(key => {
          const rate = rates[key];
          return <PremiumCard key={key} className="route-fare-card">
            <h3>{CLASS_LABEL[key]}</h3>
            {rate
              ? <>
                  <div className="route-fare-amount">from {estimateFor(rate.perKm)}</div>
                  <p>₹{rate.perKm} per km · {route.distanceKm} km one way</p>
                </>
              : <p>Fares for this class are being updated. Please check the booking page.</p>}
          </PremiumCard>;
        })}
      </div>
      <p className="route-fine-print">
        Estimates cover the distance charge for a one-way trip and exclude driver allowance, GST,
        tolls, parking and any state permit. The booking page shows the full itemised fare before
        you confirm.
      </p>
    </section>

    <section className="route-planning">
      <div className="seo-guide-heading">
        <span className="eyebrow">Route planning</span>
        <h2>Plan your {ORIGIN_CITY} to {route.city} road journey</h2>
        <p>At approximately {route.distanceKm} km, this is {journeyScale}. {roadContext}</p>
      </div>
      <div className="route-planning-grid">
        <article><span>Before departure</span><h3>Confirm pickup and stops</h3><p>Share the precise pickup point, luggage count and any planned stopovers so the assigned vehicle and estimate match the actual journey.</p></article>
        <article><span>Trip format</span><h3>Choose one-way or round trip</h3><p>Book one-way for a direct drop. Choose round-trip or multi-day travel when the vehicle needs to stay with you or the itinerary includes several places.</p></article>
        <article><span>Fare clarity</span><h3>Review every component</h3><p>Check the distance charge, driver allowance and GST before booking. Tolls, parking and state permits are paid at actual where applicable.</p></article>
      </div>
      <p className="route-guide-link">New to outstation booking? <Link to="/intercity-cab-guide">Read the complete intercity cab guide</Link>. Travelling into the hills? See our <Link to="/uttarakhand-cabs">Uttarakhand cab planning guide</Link>.</p>
    </section>

    <section className="route-faq">
      <h2>Common questions</h2>
      <details><summary>How far is {route.city} from {ORIGIN_CITY}?</summary>
        <p>{route.city} is about {route.distanceKm} km from {ORIGIN_CITY} by road, and the drive usually
        takes around {formatDuration(route.durationHours)} depending on traffic and weather.</p></details>
      <details><summary>What does a cab from {ORIGIN_CITY} to {route.city} cost?</summary>
        <p>{rates['5-seater']
          ? `A 5-seater sedan starts from about ${estimateFor(rates['5-seater'].perKm)} for the one-way distance charge, with 7-seater vehicles priced higher.`
          : 'Fares are calculated per kilometre by vehicle class.'} Driver allowance, GST and tolls are
          shown separately on the booking page.</p></details>
      <details><summary>Is a round trip cheaper than two one-way journeys?</summary>
        <p>Usually yes. Round trips use a lower per-kilometre rate, though a minimum number of
        kilometres per day applies because the vehicle stays with you for the whole trip.</p></details>
      <details><summary>Are tolls and parking included?</summary>
        <p>No. Tolls, parking and any state permit are paid at actual, so you are never charged an
        estimate that turns out higher than the real cost.</p></details>
    </section>

    {related.length > 0 && <section className="route-related">
      <h2>Other {route.region} routes</h2>
      <ul>{related.map(item => <li key={item.slug}>
        <Link to={item.path}>{ORIGIN_CITY} to {item.city}<span>{item.distanceKm} km</span></Link>
      </li>)}</ul>
    </section>}
  </div>;
}
