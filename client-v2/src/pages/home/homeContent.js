/** Static copy from the design source, kept as data so the JSX stays readable. */

export const TRUST_STATS = [
  ['20', '+', 'Years serving India'],
  ['4.9', '★', 'Average guest rating'],
  ['50k', '+', 'Completed journeys']
];

/** Route chips per region; the first eight of each group show before "view all". */
export const ROUTE_GROUPS = [
  {
    title: 'Uttarakhand',
    subtitle: 'Hill stations, pilgrimage routes and leisure tours',
    chips: [
      ['Rishikesh, Uttarakhand', 'Rishikesh · 240 km', true],
      ['Nainital, Uttarakhand', 'Nainital · 320 km', true],
      ['Haridwar, Uttarakhand', 'Haridwar · 220 km'],
      ['Dehradun, Uttarakhand', 'Dehradun · 255 km'],
      ['Mussoorie, Uttarakhand', 'Mussoorie · 290 km'],
      ['Jim Corbett / Ramnagar, Uttarakhand', 'Jim Corbett · 250 km'],
      ['Haldwani, Uttarakhand', 'Haldwani · 285 km'],
      ['Lansdowne, Uttarakhand', 'Lansdowne · 260 km'],
      ['Bhimtal, Uttarakhand', 'Bhimtal · 305 km'],
      ['Mukteshwar, Uttarakhand', 'Mukteshwar · 350 km'],
      ['Almora, Uttarakhand', 'Almora · 365 km'],
      ['Ranikhet, Uttarakhand', 'Ranikhet · 380 km'],
      ['Kausani, Uttarakhand', 'Kausani · 415 km'],
      ['Kotdwar, Uttarakhand', 'Kotdwar · 215 km'],
      ['Auli / Joshimath, Uttarakhand', 'Auli/Joshimath · 500 km'],
      ['Kedarnath (Gaurikund), Uttarakhand', 'Kedarnath · 465 km'],
      ['Badrinath, Uttarakhand', 'Badrinath · 525 km'],
      ['Gangotri, Uttarakhand', 'Gangotri · 500 km'],
      ['Yamunotri (Janki Chatti), Uttarakhand', 'Yamunotri · 430 km']
    ]
  },
  {
    title: 'Rajasthan',
    subtitle: 'Heritage cities, wildlife trips and longer tours',
    chips: [
      ['Jaipur, Rajasthan', 'Jaipur · 280 km', true],
      ['Ranthambore, Rajasthan', 'Ranthambore · 390 km', true],
      ['Neemrana, Rajasthan', 'Neemrana · 125 km'],
      ['Alwar, Rajasthan', 'Alwar · 165 km'],
      ['Sariska, Rajasthan', 'Sariska · 200 km'],
      ['Bharatpur, Rajasthan', 'Bharatpur · 220 km'],
      ['Ajmer, Rajasthan', 'Ajmer · 400 km'],
      ['Pushkar, Rajasthan', 'Pushkar · 415 km'],
      ['Mandawa, Rajasthan', 'Mandawa · 260 km'],
      ['Bikaner, Rajasthan', 'Bikaner · 450 km'],
      ['Bundi, Rajasthan', 'Bundi · 470 km'],
      ['Kota, Rajasthan', 'Kota · 520 km'],
      ['Chittorgarh, Rajasthan', 'Chittorgarh · 590 km'],
      ['Jodhpur, Rajasthan', 'Jodhpur · 620 km'],
      ['Udaipur, Rajasthan', 'Udaipur · 660 km'],
      ['Mount Abu, Rajasthan', 'Mount Abu · 760 km'],
      ['Jaisalmer, Rajasthan', 'Jaisalmer · 780 km']
    ]
  },
  {
    title: 'Delhi & Nearby',
    subtitle: 'Flexible day trips and short outstation journeys',
    chips: [
      ['Agra, Uttar Pradesh', 'Agra · 235 km', true],
      ['Mathura, Uttar Pradesh', 'Mathura · 180 km', true],
      ['Meerut, Uttar Pradesh', 'Meerut · 85 km'],
      ['Vrindavan, Uttar Pradesh', 'Vrindavan · 185 km'],
      ['Chandigarh', 'Chandigarh · 250 km']
    ]
  }
];

/** Number of chips visible before the "view all" toggle expands a group. */
export const VISIBLE_CHIPS = 8;

export const FEATURES = [
  ['IconShield', 'Trusted since 2005', 'Two decades of dependable journeys for families and businesses.'],
  ['IconClockRing', 'Here around the clock', 'Booking assistance and trip support, whenever you travel.'],
  ['IconPulse', 'Honest pricing', 'Your fare is explained upfront, with no surprise surge charges.'],
  ['IconPerson', 'Local road knowledge', 'Professional drivers familiar with regional routes and conditions.']
];

/** Placeholder fleet shown before the vehicle API responds. */
export const FLEET_FALLBACK = [
  { tier: 'Signature', name: 'Executive', seats: 4, description: 'A premium four-seat experience for business travel and special occasions.', price: '₹45' },
  { tier: 'Group', name: 'Tempo Traveller', seats: 12, description: 'Comfortable 10–26 seat options for groups, tours and celebrations.', price: '₹22' },
  { tier: 'Comfort', name: 'Comfort Sedan', seats: 4, description: 'An efficient four-seater for airport transfers and everyday city travel.', price: '₹15' },
  { tier: 'Family', name: 'Premium SUV', seats: 6, description: 'A spacious six-seater for families, luggage and longer intercity routes.', price: '₹19' }
];

export const TESTIMONIALS = [
  ['Aditya Mehra', 'Local Guide · Google', 'Consistent pricing and a driver who knew the Delhi–Agra route perfectly. Our driver made the entire family journey feel effortless.'],
  ['Pooja Shah', 'Local Guide · Google', 'The car was clean and well maintained. Our driver was humble, punctual and knew the Mumbai–Pune expressway well. Extremely helpful throughout.'],
  ['Suresh Rao', 'Verified · Google', 'Bengaluru to Coorg over four days — our driver was professional, proactive and calm throughout. He felt like our own local guide.'],
  ['Meera Reddy', 'Local Guide · Google', 'Travelling with them felt like family. The team coordinated our Hyderabad airport pickup beautifully. Service and behaviour were excellent.'],
  ['Vikram Iyer', 'Verified · Google', 'Thanks for arranging a wonderful driver for our Chennai–Pondicherry trip. The whole service was excellent and my clients were delighted.'],
  ['Ananya Sharma', 'Local Guide · Google', 'Our family holiday was memorable. WonderTravel made our Delhi–Uttarakhand journey seamless from start to finish.']
];

export const FOOTER_COLUMNS = [
  ['Company', ['About us', 'Our story', 'Careers', 'Blog']],
  ['Services', ['Airport transfers', 'Intercity travel', 'Local rentals', 'Group tours']],
  ['Help', ['Contact support', 'Safety standards', 'Booking terms', 'Privacy policy']]
];
