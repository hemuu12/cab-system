import { Link } from 'react-router-dom';
import { ORIGIN_CITY, ROUTE_PAGES } from '../../data/routePages.js';

/**
 * Crawlable links into the per-route landing pages. Without an internal link from an
 * indexed page, those routes would only be reachable through the sitemap.
 */
export default function PopularRouteLinks() {
  return <section className="home-routes-seo" aria-labelledby="popular-routes-heading">
    <h2 id="popular-routes-heading">Popular cab routes from {ORIGIN_CITY}</h2>
    <ul>
      {ROUTE_PAGES.map(route => <li key={route.slug}>
        <Link to={route.path}>{ORIGIN_CITY} to {route.city} cab · {route.distanceKm} km</Link>
      </li>)}
    </ul>
  </section>;
}
