import { ROUTE_MATRIX } from './routeMatrix.js';
import { money, tomorrowISO } from '../lib/format.js';

/** Primary origin for pages/components that still assume a single implicit city (home, Uttarakhand guide). */
export const ORIGIN_CITY = 'Delhi';

/** "Nainital, Uttarakhand" -> "nainital" — the city alone, since the state is implied by the page. */
export const cityOf = destination => String(destination).split(',')[0].trim();

export const slugify = value => String(value)
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '');

export const routeSlug = (origin, destination) => `${slugify(origin)}-to-${slugify(cityOf(destination))}`;

/**
 * Town-centre coordinates for the origin and the hotspot-guide destinations, so those pages'
 * "Check fares and book" link can hand /results a real pickup/drop point instead of just a
 * label. Without coordinates the results page can never fetch a live quote for that trip (it
 * correctly refuses to guess), so the fare and distance shown there would depend entirely on
 * a compact-edit-bar re-search rather than working immediately from the guide page.
 */
export const CITY_POINTS = {
  Delhi: { lat: 28.6139, lon: 77.2090, state: 'Delhi' },
  Nainital: { lat: 29.3919, lon: 79.4542, state: 'Uttarakhand' },
  Rishikesh: { lat: 30.0869, lon: 78.2676, state: 'Uttarakhand' },
  Mussoorie: { lat: 30.4598, lon: 78.0664, state: 'Uttarakhand' },
  Dehradun: { lat: 30.3165, lon: 78.0322, state: 'Uttarakhand' },
  Mukteshwar: { lat: 29.4703, lon: 79.6473, state: 'Uttarakhand' },
  'Auli / Joshimath': { lat: 30.5270, lon: 79.5670, state: 'Uttarakhand' }
};

/** Builds a /results URL with real coordinates when both ends are known, so the results page can live-quote immediately. */
export function resultsHref(route) {
  const base = `pickup=${encodeURIComponent(route.origin)}&destination=${encodeURIComponent(route.destination)}&date=${tomorrowISO()}&time=12:00&tripType=one-way&distanceKm=${route.distanceKm}`;
  const from = CITY_POINTS[route.origin];
  const to = CITY_POINTS[route.city];
  if (!from || !to) return `/results?${base}`;
  const coords = `pickupLat=${from.lat}&pickupLon=${from.lon}&pickupState=${encodeURIComponent(from.state)}&dropLat=${to.lat}&dropLon=${to.lon}&dropState=${encodeURIComponent(to.state)}`;
  return `/results?${base}&${coords}`;
}

/**
 * One landing page per origin x destination pair in the matrix. Distances come from the
 * same OSRM/haversine pipeline the booking flow uses, so a published page can never quote
 * a distance the app disagrees with.
 */
export const ROUTE_PAGES = ROUTE_MATRIX.map(route => {
  const city = cityOf(route.destination);
  return {
    ...route,
    city,
    slug: routeSlug(route.origin, route.destination),
    path: `/cabs/${routeSlug(route.origin, route.destination)}`,
    // Highway average of roughly 45 km/h once stops and hill sections are allowed for.
    durationHours: Math.max(1, Math.round((route.distanceKm / 45) * 10) / 10)
  };
});

export const routePageBySlug = slug => ROUTE_PAGES.find(route => route.slug === slug);

/**
 * Static mirror of the sedan (5-seater) one-way slab rates from server/src/data/pricingClasses.js,
 * kept only as a fallback for page-level Offer/price schema when the live /vehicles fetch fails
 * or returns nothing at build time — search engines should never see a route page with no price
 * markup just because a build-time API call had a hiccup. The booking flow itself always uses the
 * live fare from the API, never this table; update both together if rates change.
 */
const FALLBACK_SEDAN_SLABS = [
  { upToKm: 300, perKm: 13 },
  { upToKm: 800, perKm: 12 },
  { upToKm: null, perKm: 11 }
];

export const fallbackSedanPerKm = distanceKm => {
  const slab = FALLBACK_SEDAN_SLABS.find(item => item.upToKm === null || distanceKm <= item.upToKm);
  return slab.perKm;
};

/** Cheapest-looking sedan "from" fare for a route, using a live rate when given, else the static fallback. */
export const sedanFareEstimate = (route, livePerKm) => {
  const perKm = livePerKm || fallbackSedanPerKm(route.distanceKm);
  return Math.round(perKm * route.distanceKm);
};

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
  const origin = route.origin;
  return [
    {
      q: `How far is ${route.city} from ${origin}?`,
      a: `${route.city} is about ${route.distanceKm} km from ${origin} by road, and the drive usually takes around ${formatDuration(route.durationHours)} depending on traffic and weather.`
    },
    {
      q: `What is the fare for a ${origin} to ${route.city} cab?`,
      a: sedanFare
        ? `A 5-seater sedan starts from about ${money(sedanFare)} for the one-way distance charge, with 7-seater vehicles priced higher. Driver allowance, GST and tolls are shown separately on the booking page.`
        : 'Fares are calculated per kilometre by vehicle class and shown in full on the booking page.'
    },
    {
      q: `Are toll and driver charges included in the ${route.city} fare?`,
      a: 'No. Tolls, parking and any state permit are paid at actual, so the quoted fare never turns out higher than the real cost. Driver allowance and GST are included in the displayed total.'
    },
    {
      q: `Can I book a one-way cab from ${origin} to ${route.city}?`,
      a: `Yes. One-way booking is available for this route — you pay only for the ${origin} to ${route.city} leg, with no return charge.`
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
          a: `Same-day booking is usually possible for the ${origin} to ${route.city} route, subject to vehicle availability at the time of booking.`
        },
    long
      ? {
          q: `Should I break the ${origin} to ${route.city} journey into stops?`,
          a: `At ${route.distanceKm} km, this is a long-distance trip. Planning a rest or meal stop partway is common, and the driver can suggest a convenient point along the route.`
        }
      : {
          q: `What is the cancellation policy?`,
          a: 'Trips can be cancelled or rescheduled ahead of the pickup time; check the exact cutoff and any charge on your booking confirmation.'
        }
  ];
};
