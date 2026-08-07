const DESTINATION_PROFILES = {
  'Kainchi Dham': {
    overview: 'Kainchi Dham is a roadside spiritual destination in the Kumaon hills, associated with Neem Karoli Baba. A cab can reach the ashram entrance directly, making it easy to combine with Bhowali, Bhimtal or Nainital.',
    highlights: ['Kainchi Dham Ashram', 'Bhimtal Lake', 'Naini Lake', 'Ghorakhal and Bhowali'],
    delhiApproach: ['Delhi and Ghaziabad', 'Hapur and Moradabad corridor', 'Haldwani', 'Bhowali', 'Kainchi Dham']
  },
  Nainital: {
    overview: 'Nainital is a Kumaon hill station centred on Naini Lake. The final climb is slower than the plains section, and parking or local traffic controls can affect the exact drop point during busy periods.',
    highlights: ['Naini Lake', 'Mall Road', 'Snow View', 'G B Pant High Altitude Zoo'],
    delhiApproach: ['Delhi and Ghaziabad', 'Hapur and Moradabad corridor', 'Haldwani', 'Kathgodam', 'Nainital']
  },
  Bhimtal: {
    overview: 'Bhimtal is a quieter Kumaon lake destination with straightforward road access through Haldwani and Kathgodam. It also works well as a base for Sattal, Naukuchiatal and Kainchi Dham.',
    highlights: ['Bhimtal Lake', 'Sattal', 'Naukuchiatal', 'Kainchi Dham'],
    delhiApproach: ['Delhi and Ghaziabad', 'Hapur and Moradabad corridor', 'Haldwani', 'Kathgodam', 'Bhimtal']
  },
  Mussoorie: {
    overview: 'Mussoorie is reached by a winding climb above Dehradun. An early departure helps avoid city and hill-station congestion, especially on weekends and during the summer travel season.',
    highlights: ['Mall Road', 'Lal Tibba', 'Company Garden', 'Kempty Falls'],
    delhiApproach: ['Delhi', 'Meerut', 'Muzaffarnagar', 'Dehradun', 'Mussoorie']
  },
  Rishikesh: {
    overview: 'Rishikesh combines riverside spiritual areas, yoga centres and onward access to the Garhwal Himalayas. Pickup and drop timing should allow for weekend traffic and local restrictions near the riverfront.',
    highlights: ['Triveni Ghat', 'Ram Jhula area', 'Beatles Ashram', 'Neer Garh Waterfall'],
    delhiApproach: ['Delhi', 'Meerut', 'Muzaffarnagar', 'Haridwar bypass', 'Rishikesh']
  },
  Haridwar: {
    overview: 'Haridwar is a major pilgrimage city on the Ganga and an important gateway to Rishikesh and the Char Dham routes. Evening aarti and festival traffic can add time near the central ghats.',
    highlights: ['Har Ki Pauri', 'Mansa Devi Temple', 'Chandi Devi Temple', 'Ganga aarti'],
    delhiApproach: ['Delhi', 'Meerut', 'Muzaffarnagar', 'Roorkee', 'Haridwar']
  },
  Dehradun: {
    overview: 'Dehradun is the state capital and a practical road hub for Mussoorie, Rishikesh and the wider Garhwal region. City traffic varies considerably by pickup area and time of day.',
    highlights: ["Robber's Cave", 'Sahastradhara', 'Forest Research Institute', 'Mindrolling Monastery'],
    delhiApproach: ['Delhi', 'Meerut', 'Muzaffarnagar', 'Roorkee', 'Dehradun']
  },
  'Jim Corbett / Ramnagar': {
    overview: 'Ramnagar is the main road gateway for Corbett travel. Safari entry depends on the booked zone and permit, so the resort, gate and reporting time should be shared before departure.',
    highlights: ['Corbett safari zones', 'Ramnagar', 'Garjiya Devi area', 'Corbett Museum'],
    delhiApproach: ['Delhi and Ghaziabad', 'Hapur', 'Moradabad', 'Kashipur', 'Ramnagar']
  },
  'Kedarnath (Gaurikund)': {
    overview: 'The road journey ends around the Sonprayag–Gaurikund access area; Kedarnath temple itself is reached beyond the roadhead. This is a multi-day pilgrimage that needs time for registration, local transport and the trek.',
    highlights: ['Guptkashi', 'Sonprayag', 'Gaurikund roadhead', 'Triyuginarayan area'],
    delhiApproach: ['Delhi', 'Rishikesh', 'Devprayag and Rudraprayag', 'Guptkashi and Sonprayag', 'Gaurikund roadhead']
  },
  Badrinath: {
    overview: 'Badrinath is reached by road through the Alaknanda valley and Joshimath. The long mountain journey is best planned over multiple days, with seasonal opening dates and road conditions checked before travel.',
    highlights: ['Badrinath Temple', 'Tapt Kund', 'Mana village', 'Joshimath'],
    delhiApproach: ['Delhi', 'Rishikesh', 'Devprayag and Rudraprayag', 'Karnaprayag and Joshimath', 'Badrinath']
  },
  Agra: {
    overview: 'Agra is a popular same-day or overnight intercity journey, with fast road access from Delhi. Monument opening times, city traffic and any planned Fatehpur Sikri stop should be included in the itinerary.',
    highlights: ['Taj Mahal', 'Agra Fort', 'Mehtab Bagh', 'Fatehpur Sikri'],
    delhiApproach: ['Delhi', 'Noida', 'Yamuna Expressway', 'Agra']
  },
  Jaipur: {
    overview: 'Jaipur works as a direct one-way transfer, weekend return trip or the starting point for a longer Rajasthan itinerary. Old-city traffic can affect sightseeing and hotel transfer times.',
    highlights: ['Amber Fort', 'City Palace', 'Hawa Mahal', 'Jantar Mantar'],
    delhiApproach: ['Delhi', 'Gurugram', 'Neemrana', 'Shahpura', 'Jaipur']
  },
  Vrindavan: {
    overview: 'Vrindavan is a short pilgrimage and leisure route from Delhi, often combined with Mathura. Temple schedules, festival crowds and restricted lanes can affect the final vehicle drop point.',
    highlights: ['Banke Bihari Temple', 'Prem Mandir', 'ISKCON Vrindavan', 'Mathura'],
    delhiApproach: ['Delhi', 'Noida', 'Yamuna Expressway', 'Vrindavan']
  },
  Chandigarh: {
    overview: 'Chandigarh is a well-connected intercity destination and a common onward hub for Punjab, Himachal Pradesh and the Himalayan foothills. The journey is largely on major highways.',
    highlights: ['Rock Garden', 'Sukhna Lake', 'Capitol Complex', 'Zakir Hussain Rose Garden'],
    delhiApproach: ['Delhi', 'Panipat', 'Karnal', 'Ambala', 'Chandigarh']
  }
};

const REGION_FALLBACKS = {
  Uttarakhand: route => ({
    overview: `${route.city} is an Uttarakhand road destination where hill gradients, weather and local traffic can make travel time more important than distance alone. Plan daylight arrival where practical and keep some schedule flexibility.`,
    highlights: ['Scenic road viewpoints', 'Local markets', 'Regional temples', 'Nearby hill towns']
  }),
  Rajasthan: route => ({
    overview: `${route.city} can be booked as a direct transfer or included in a longer Rajasthan circuit. An early start is useful for longer distances, and sightseeing stops should be agreed before departure.`,
    highlights: ['Historic centre', 'Forts and palaces', 'Local markets', 'Regional food stops']
  }),
  'North India': route => ({
    overview: `${route.city} is served as a direct intercity transfer as well as part of a wider North India itinerary. Highway traffic, city entry and planned stops determine the final arrival time.`,
    highlights: ['City landmarks', 'Local markets', 'Food and rest stops', 'Nearby day-trip places']
  })
};

const AIRPORTS = {
  Delhi: 'Delhi airport',
  Dehradun: 'Dehradun airport',
  Haridwar: 'Dehradun airport or Haridwar railway station',
  Jaipur: 'Jaipur airport',
  Lucknow: 'Lucknow airport',
  Chandigarh: 'Chandigarh airport'
};

export function routeGuideContent(route) {
  const profile = DESTINATION_PROFILES[route.city] || REGION_FALLBACKS[route.region]?.(route) || REGION_FALLBACKS['North India'](route);
  return {
    ...profile,
    approach: route.origin === 'Delhi' ? profile.delhiApproach || [] : [],
    services: [
      { label: 'One-way cab', copy: `Choose a direct ${route.origin} to ${route.city} drop when the vehicle does not need to stay for the return journey.` },
      { label: 'Round trip', copy: `Keep the same chauffeur-driven vehicle for the return or for local travel around ${route.city}. Daily minimum kilometres may apply.` },
      { label: 'Airport or station pickup', copy: `Start from ${AIRPORTS[route.origin] || `${route.origin} airport or railway station`} with the arrival details and pickup point confirmed before travel.` },
      { label: 'Multi-stop outstation', copy: 'Add sightseeing, overnight halts or nearby destinations. Share the full itinerary so the vehicle and fare match the actual plan.' }
    ]
  };
}

export const POPULAR_DESTINATION_GUIDE_COUNT = Object.keys(DESTINATION_PROFILES).length;
