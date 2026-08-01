import { FEATURED_ROUTES } from './routes.js';
import { money } from '../lib/format.js';

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

/**
 * Six to eight Q&A pairs per route, varied by distance/region so pages don't
 * duplicate FAQ text against each other (search engines devalue that).
 * `sedanFare` is the cheapest 5-seater "from" price in rupees, or null if unknown.
 */
export const routeFaqs = (route, sedanFare) => {
  const isHill = route.region === 'Uttarakhand';
  const long = route.distanceKm > 450;
  return [
    {
      q: `How far is ${route.city} from ${ORIGIN_CITY}?`,
      a: `${route.city} is about ${route.distanceKm} km from ${ORIGIN_CITY} by road, and the drive usually takes around ${formatDuration(route.durationHours)} depending on traffic and weather.`
    },
    {
      q: `What is the fare for a ${ORIGIN_CITY} to ${route.city} cab?`,
      a: sedanFare
        ? `A 5-seater sedan starts from about ${money(sedanFare)} for the one-way distance charge, with 7-seater vehicles priced higher. Driver allowance, GST and tolls are shown separately on the booking page.`
        : 'Fares are calculated per kilometre by vehicle class and shown in full on the booking page.'
    },
    {
      q: `Are toll and driver charges included in the ${route.city} fare?`,
      a: 'No. Tolls, parking and any state permit are paid at actual, so the quoted fare never turns out higher than the real cost. Driver allowance and GST are included in the displayed total.'
    },
    {
      q: `Can I book a one-way cab from ${ORIGIN_CITY} to ${route.city}?`,
      a: `Yes. One-way booking is available for this route — you pay only for the ${ORIGIN_CITY} to ${route.city} leg, with no return charge.`
    },
    {
      q: `Is a round trip cheaper than two one-way journeys?`,
      a: 'Usually yes. Round trips use a lower per-kilometre rate, though a minimum number of kilometres per day applies because the vehicle stays with you for the whole trip.'
    },
    {
      q: `What cars are available for the ${route.city} route?`,
      a: 'Sedans (up to 4 passengers) and SUVs/MPVs (up to 6 passengers) are available on this route, each with a professional chauffeur for the full journey.'
    },
    isHill
      ? {
          q: `Is the ${route.city} route safe for night travel?`,
          a: 'Hill sections can be harder to drive after dark, so departures are usually planned to reach before evening where possible. Speak to support if you need a specific arrival time.'
        }
      : {
          q: `Can I book the same day for ${route.city}?`,
          a: `Same-day booking is usually possible for the ${ORIGIN_CITY} to ${route.city} route, subject to vehicle availability at the time of booking.`
        },
    long
      ? {
          q: `Should I break the ${ORIGIN_CITY} to ${route.city} journey into stops?`,
          a: `At ${route.distanceKm} km, this is a long-distance trip. Planning a rest or meal stop partway is common, and the driver can suggest a convenient point along the route.`
        }
      : {
          q: `What is the cancellation policy?`,
          a: 'Trips can be cancelled or rescheduled ahead of the pickup time; check the exact cutoff and any charge on your booking confirmation.'
        }
  ];
};
