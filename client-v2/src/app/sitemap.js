import { ROUTE_PAGES } from '../data/routePages.js';

const SITE_URL = 'https://www.wondertravel.online';

export default function sitemap() {
  const today = new Date().toISOString().slice(0, 10);

  return [
    { url: `${SITE_URL}/`, lastModified: today, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${SITE_URL}/results`, lastModified: today, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${SITE_URL}/intercity-cab-guide`, lastModified: today, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${SITE_URL}/uttarakhand-cabs`, lastModified: today, changeFrequency: 'monthly', priority: 0.9 },
    ...ROUTE_PAGES.map(route => ({
      url: `${SITE_URL}${route.path}`,
      lastModified: today,
      changeFrequency: 'monthly',
      priority: 0.8
    }))
  ];
}
