/** Static copy from the design source, kept as data so the JSX stays readable. */

export const TRUST_STATS = [
  ['2026', '', 'Service launched'],
  ['3', '', 'Trip formats']
];

/** Route chips per region; the first eight of each group show before "view all". */
export const ROUTE_GROUPS = [
  {
    title: 'Uttarakhand',
    subtitle: 'Our home ground · hill stations, pilgrimages and local escapes',
    chips: [
      ['Rishikesh, Uttarakhand', 'Rishikesh', true],
      ['Nainital, Uttarakhand', 'Nainital', true],
      ['Haridwar, Uttarakhand', 'Haridwar'],
      ['Dehradun, Uttarakhand', 'Dehradun'],
      ['Mussoorie, Uttarakhand', 'Mussoorie'],
      ['Jim Corbett / Ramnagar, Uttarakhand', 'Jim Corbett'],
      ['Haldwani, Uttarakhand', 'Haldwani'],
      ['Lansdowne, Uttarakhand', 'Lansdowne'],
      ['Bhimtal, Uttarakhand', 'Bhimtal'],
      ['Mukteshwar, Uttarakhand', 'Mukteshwar'],
      ['Almora, Uttarakhand', 'Almora'],
      ['Ranikhet, Uttarakhand', 'Ranikhet'],
      ['Kausani, Uttarakhand', 'Kausani'],
      ['Kotdwar, Uttarakhand', 'Kotdwar'],
      ['Auli / Joshimath, Uttarakhand', 'Auli / Joshimath'],
      ['Kedarnath (Gaurikund), Uttarakhand', 'Kedarnath'],
      ['Badrinath, Uttarakhand', 'Badrinath'],
      ['Gangotri, Uttarakhand', 'Gangotri'],
      ['Yamunotri (Janki Chatti), Uttarakhand', 'Yamunotri']
    ]
  },
  {
    title: 'North & West India',
    subtitle: 'Mountains, heritage cities, deserts and coastal drives',
    chips: [
      ['Jaipur, Rajasthan', 'Jaipur', true],
      ['Manali, Himachal Pradesh', 'Manali', true],
      ['Agra, Uttar Pradesh', 'Agra'],
      ['Amritsar, Punjab', 'Amritsar'],
      ['Shimla, Himachal Pradesh', 'Shimla'],
      ['Srinagar, Jammu and Kashmir', 'Srinagar'],
      ['Udaipur, Rajasthan', 'Udaipur'],
      ['Jaisalmer, Rajasthan', 'Jaisalmer'],
      ['Ahmedabad, Gujarat', 'Ahmedabad'],
      ['Kutch, Gujarat', 'Kutch'],
      ['Mumbai, Maharashtra', 'Mumbai'],
      ['Goa', 'Goa']
    ]
  },
  {
    title: 'South, Central & East',
    subtitle: 'City transfers, scenic road trips and multi-day journeys',
    chips: [
      ['Bengaluru, Karnataka', 'Bengaluru', true],
      ['Kochi, Kerala', 'Kochi', true],
      ['Hyderabad, Telangana', 'Hyderabad'],
      ['Chennai, Tamil Nadu', 'Chennai'],
      ['Coorg, Karnataka', 'Coorg'],
      ['Munnar, Kerala', 'Munnar'],
      ['Puducherry', 'Puducherry'],
      ['Bhopal, Madhya Pradesh', 'Bhopal'],
      ['Varanasi, Uttar Pradesh', 'Varanasi'],
      ['Kolkata, West Bengal', 'Kolkata'],
      ['Bhubaneswar, Odisha', 'Bhubaneswar'],
      ['Guwahati, Assam', 'Guwahati']
    ]
  }
];

/** Number of chips visible before the "view all" toggle expands a group. */
export const VISIBLE_CHIPS = 8;

export const FEATURES = [
  ['IconShield', 'Operating since 2026', 'WonderTravel began operations in 2026.'],
  ['IconClockRing', 'Booking support', 'Contact our team for route and booking questions.'],
  ['IconPulse', 'Fare breakdowns', 'Review the base fare, driver allowance, toll and GST before confirming.'],
  ['IconPerson', 'Route details first', 'Distance and trip details are shown before you choose a vehicle.']
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
  ['Explore', [['Plan a journey', '#book'], ['Intercity cab guide', '/intercity-cab-guide'], ['Uttarakhand cabs', '/uttarakhand-cabs'], ['Listed routes', '#routes'], ['Available vehicles', '#fleet']]],
  ['Participate', [['Guest feedback', '#testi'], ['Partner updates', '#partner']]],
  ['Contact', [['Help & FAQ', '/help'], ['WhatsApp', 'https://wa.me/919675286699'], ['Call 9675286699', 'tel:+919675286699']]],
  ['Legal', [['Terms of Service', '/terms'], ['Privacy Policy', '/privacy'], ['Cancellation & Refund Policy', '/cancellation-refund-policy']]]
];
