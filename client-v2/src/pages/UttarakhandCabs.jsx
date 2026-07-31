import { ArrowRight, CloudSun, Luggage, Mountain, Route as RouteIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ORIGIN_CITY, ROUTE_PAGES } from '../data/routePages.js';

const UTTARAKHAND_ROUTES = ROUTE_PAGES.filter(route => route.region === 'Uttarakhand');

const TRAVEL_REGIONS = [
  ['Dehradun, Rishikesh and Haridwar', 'City transfers, spiritual journeys and onward connections into the Garhwal hills.'],
  ['Nainital, Bhimtal and Mukteshwar', 'Lake-district stays and Kumaon hill journeys where travel time can vary with road and weather conditions.'],
  ['Corbett, Ramnagar and Haldwani', 'Wildlife-area transfers, rail connections and gateways for onward Kumaon travel.'],
  ['Char Dham road gateways', 'Multi-day itineraries towards Gaurikund, Badrinath, Gangotri and Janki Chatti need realistic driving days and flexible timing.']
];

export default function UttarakhandCabs() {
  return <article className="seo-guide page-shell">
    <nav className="route-crumbs" aria-label="Breadcrumb">
      <Link to="/">Home</Link><span aria-hidden="true">/</span><span aria-current="page">Uttarakhand cabs</span>
    </nav>

    <header className="seo-guide-hero uttarakhand-guide-hero">
      <span className="eyebrow">Our home ground</span>
      <h1>Uttarakhand intercity and outstation cab services</h1>
      <p>Plan driver-assisted journeys to Uttarakhand from cities across India, as well as local transfers between the state’s towns, hill stations and pilgrimage roadheads. Choose your own pickup; the route details are confirmed before departure.</p>
      <div className="seo-guide-actions">
        <Link className="button button-ember" to="/#book">Plan an Uttarakhand journey <ArrowRight /></Link>
        <Link className="button button-ghost" to="/intercity-cab-guide">Read the cab booking guide</Link>
      </div>
    </header>

    <section className="seo-guide-section">
      <div className="seo-guide-heading">
        <span className="eyebrow">Where we help you travel</span>
        <h2>From gateways to mountain destinations</h2>
        <p>Uttarakhand journeys are not all the same. A short city transfer, a hill-station holiday and a multi-day pilgrimage each need a different route plan.</p>
      </div>
      <div className="seo-card-grid seo-region-grid">
        {TRAVEL_REGIONS.map(([title, text]) => <article key={title}><Mountain /><h3>{title}</h3><p>{text}</p></article>)}
      </div>
    </section>

    <section className="seo-guide-split">
      <div className="seo-guide-heading">
        <span className="eyebrow">Hill-road planning</span>
        <h2>Allow time for the road, not only the kilometres</h2>
        <p>Mountain distances can take longer than the same distance on a plain highway. Weather, seasonal traffic, road work and daylight can all affect the schedule, so published times are planning estimates rather than promises.</p>
      </div>
      <dl className="seo-definition-list">
        <div><dt><CloudSun /> Check conditions</dt><dd>Review weather and local road updates shortly before departure, especially during monsoon and winter.</dd></div>
        <div><dt><RouteIcon /> Build a realistic day</dt><dd>Keep room for meal breaks, changing road conditions and check-in times on longer hill routes.</dd></div>
        <div><dt><Luggage /> Match vehicle and luggage</dt><dd>Choose capacity for passengers and bags together, particularly for family and multi-day travel.</dd></div>
      </dl>
    </section>

    <section className="route-related uttarakhand-route-directory">
      <div className="seo-guide-heading">
        <span className="eyebrow">Detailed route references</span>
        <h2>Popular {ORIGIN_CITY} to Uttarakhand cab routes</h2>
        <p>These guides provide a distance and travel-time reference from {ORIGIN_CITY}. You can still enter a different pickup city in the booking form.</p>
      </div>
      <ul>{UTTARAKHAND_ROUTES.map(route => <li key={route.slug}>
        <Link to={route.path}><span>{ORIGIN_CITY} to {route.city} cab</span><small>{route.distanceKm} km</small></Link>
      </li>)}</ul>
    </section>

    <section className="seo-guide-cta">
      <span className="eyebrow">Flexible pickup</span>
      <h2>Your Uttarakhand journey can begin anywhere in India.</h2>
      <p>Enter your actual starting point and destination to view the relevant vehicles and fare breakdown.</p>
      <Link className="button button-gold" to="/#book">Start planning <ArrowRight /></Link>
    </section>
  </article>;
}
