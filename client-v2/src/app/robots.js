const SITE_URL = 'https://www.wondertravel.online';

export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin',
        '/account',
        '/checkout',
        '/confirmation',
        '/login',
        '/forgot-password',
        '/*?pickup=',
        '/*?drop='
      ]
    },
    sitemap: `${SITE_URL}/sitemap.xml`
  };
}
