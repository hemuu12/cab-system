import { writeFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import path from 'path';
import { ROUTE_PAGES } from '../client-v2/src/data/routePages.js';

const SITE_URL = 'https://www.wondertravel.online';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const target = path.resolve(__dirname, '../client-v2/public/sitemap.xml');

const today = new Date().toISOString().slice(0, 10);

const entry = ({ loc, priority, changefreq }) => `  <url>
    <loc>${loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;

const urls = [
  { loc: `${SITE_URL}/`, priority: '1.0', changefreq: 'weekly' },
  { loc: `${SITE_URL}/results`, priority: '0.7', changefreq: 'weekly' },
  { loc: `${SITE_URL}/intercity-cab-guide`, priority: '0.9', changefreq: 'monthly' },
  { loc: `${SITE_URL}/uttarakhand-cabs`, priority: '0.9', changefreq: 'monthly' },
  ...ROUTE_PAGES.map(route => ({
    loc: `${SITE_URL}${route.path}`,
    priority: '0.8',
    changefreq: 'monthly'
  }))
];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(entry).join('\n')}
</urlset>
`;

await writeFile(target, sitemap, 'utf8');
console.log(`Wrote ${urls.length} URLs to ${path.relative(process.cwd(), target)}`);
