export const FEATURED_ROUTES = [
  { destination: 'Haldwani, Uttarakhand', distanceKm: 285, region: 'Uttarakhand' },
  { destination: 'Rishikesh, Uttarakhand', distanceKm: 240, region: 'Uttarakhand' },
  { destination: 'Haridwar, Uttarakhand', distanceKm: 220, region: 'Uttarakhand' },
  { destination: 'Dehradun, Uttarakhand', distanceKm: 255, region: 'Uttarakhand' },
  { destination: 'Mussoorie, Uttarakhand', distanceKm: 290, region: 'Uttarakhand' },
  { destination: 'Nainital, Uttarakhand', distanceKm: 320, region: 'Uttarakhand' },
  { destination: 'Bhimtal, Uttarakhand', distanceKm: 305, region: 'Uttarakhand' },
  { destination: 'Mukteshwar, Uttarakhand', distanceKm: 350, region: 'Uttarakhand' },
  { destination: 'Jim Corbett / Ramnagar, Uttarakhand', distanceKm: 250, region: 'Uttarakhand' },
  { destination: 'Lansdowne, Uttarakhand', distanceKm: 260, region: 'Uttarakhand' },
  { destination: 'Kotdwar, Uttarakhand', distanceKm: 215, region: 'Uttarakhand' },
  { destination: 'Almora, Uttarakhand', distanceKm: 365, region: 'Uttarakhand' },
  { destination: 'Ranikhet, Uttarakhand', distanceKm: 380, region: 'Uttarakhand' },
  { destination: 'Kausani, Uttarakhand', distanceKm: 415, region: 'Uttarakhand' },
  { destination: 'Auli / Joshimath, Uttarakhand', distanceKm: 500, region: 'Uttarakhand' },
  { destination: 'Kedarnath (Gaurikund), Uttarakhand', distanceKm: 465, region: 'Uttarakhand' },
  { destination: 'Badrinath, Uttarakhand', distanceKm: 525, region: 'Uttarakhand' },
  { destination: 'Gangotri, Uttarakhand', distanceKm: 500, region: 'Uttarakhand' },
  { destination: 'Yamunotri (Janki Chatti), Uttarakhand', distanceKm: 430, region: 'Uttarakhand' },
  { destination: 'Jaipur, Rajasthan', distanceKm: 280, region: 'Rajasthan' },
  { destination: 'Neemrana, Rajasthan', distanceKm: 125, region: 'Rajasthan' },
  { destination: 'Alwar, Rajasthan', distanceKm: 165, region: 'Rajasthan' },
  { destination: 'Sariska, Rajasthan', distanceKm: 200, region: 'Rajasthan' },
  { destination: 'Bharatpur, Rajasthan', distanceKm: 220, region: 'Rajasthan' },
  { destination: 'Ranthambore, Rajasthan', distanceKm: 390, region: 'Rajasthan' },
  { destination: 'Ajmer, Rajasthan', distanceKm: 400, region: 'Rajasthan' },
  { destination: 'Pushkar, Rajasthan', distanceKm: 415, region: 'Rajasthan' },
  { destination: 'Mandawa, Rajasthan', distanceKm: 260, region: 'Rajasthan' },
  { destination: 'Bikaner, Rajasthan', distanceKm: 450, region: 'Rajasthan' },
  { destination: 'Bundi, Rajasthan', distanceKm: 470, region: 'Rajasthan' },
  { destination: 'Kota, Rajasthan', distanceKm: 520, region: 'Rajasthan' },
  { destination: 'Chittorgarh, Rajasthan', distanceKm: 590, region: 'Rajasthan' },
  { destination: 'Jodhpur, Rajasthan', distanceKm: 620, region: 'Rajasthan' },
  { destination: 'Udaipur, Rajasthan', distanceKm: 660, region: 'Rajasthan' },
  { destination: 'Mount Abu, Rajasthan', distanceKm: 760, region: 'Rajasthan' },
  { destination: 'Jaisalmer, Rajasthan', distanceKm: 780, region: 'Rajasthan' },
  { destination: 'Agra, Uttar Pradesh', distanceKm: 235, region: 'North India' },
  { destination: 'Mathura, Uttar Pradesh', distanceKm: 180, region: 'North India' },
  { destination: 'Vrindavan, Uttar Pradesh', distanceKm: 185, region: 'North India' },
  { destination: 'Meerut, Uttar Pradesh', distanceKm: 85, region: 'North India' },
  { destination: 'Chandigarh', distanceKm: 250, region: 'North India' }
];

const normalize = value => value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

export function findRoute(destination) {
  const target = normalize(destination || '');
  return FEATURED_ROUTES.find(route => {
    const routeName = normalize(route.destination);
    const city = routeName.split(' ')[0];
    return target === routeName || target.startsWith(city) || routeName.startsWith(target);
  });
}
