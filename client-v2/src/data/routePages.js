import { FEATURED_ROUTES } from './routes.js';

export const ORIGIN_CITY = 'Delhi';

/** "Nainital, Uttarakhand" -> "nainital" — the city alone, since the state is implied by the page. */
export const cityOf = destination => String(destination).split(',')[0].trim();

export const slugify = value => String(value)
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '');

export const routeSlug = destination => `${slugify(ORIGIN_CITY)}-to-${slugify(cityOf(destination))}`;

/**
 * One landing page per seeded destination. Distances come from the same table the
 * booking flow uses, so a published page can never quote a distance the app disagrees with.
 */
export const ROUTE_PAGES = FEATURED_ROUTES.map(route => {
  const city = cityOf(route.destination);
  return {
    ...route,
    city,
    slug: routeSlug(route.destination),
    path: `/cabs/${routeSlug(route.destination)}`,
    // Highway average of roughly 45 km/h once stops and hill sections are allowed for.
    durationHours: Math.max(1, Math.round((route.distanceKm / 45) * 10) / 10)
  };
});

export const routePageBySlug = slug => ROUTE_PAGES.find(route => route.slug === slug);

export const formatDuration = hours => {
  const whole = Math.floor(hours);
  const minutes = Math.round((hours - whole) * 60);
  return minutes ? `${whole}h ${minutes}m` : `${whole}h`;
};
