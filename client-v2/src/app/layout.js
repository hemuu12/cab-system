import { Cormorant_Garamond, Inter } from 'next/font/google';
import Providers from './providers.jsx';
import ScrollManager from '../components/ScrollManager.jsx';
import { LogoutTransition } from '../components/LoadingScreen.jsx';
import '../styles/globals.css';

export const SITE_URL = 'https://www.wondertravel.online';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-display-family',
  display: 'swap'
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans-family',
  display: 'swap'
});

export const metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: 'WonderTravel',
  title: {
    default: 'WonderTravel — Intercity Cabs Across India',
    template: '%s'
  },
  description: 'WonderTravel driver-operated cabs across India — one-way, round-trip and outstation, with extensive coverage throughout Uttarakhand.',
  authors: [{ name: 'WonderTravel Cab Services' }],
  robots: { index: true, follow: true, 'max-image-preview': 'large' },
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'WonderTravel'
  },
  formatDetection: { telephone: false },
  icons: {
    icon: [
      { url: '/branding/favicon.ico' },
      { url: '/branding/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/branding/favicon-16.png', sizes: '16x16', type: 'image/png' }
    ],
    apple: [{ url: '/branding/apple-touch-icon.png', sizes: '180x180' }]
  },
  openGraph: {
    type: 'website',
    siteName: 'WonderTravel',
    title: 'WonderTravel — India, beautifully driven.',
    description: 'Driver-operated cabs across India — one-way, round-trip and outstation, with extensive coverage throughout Uttarakhand.',
    url: SITE_URL,
    locale: 'en_IN',
    images: [{
      url: `${SITE_URL}/branding/wondertravel-social-preview.jpg`,
      width: 1200,
      height: 630,
      alt: 'WonderTravel gold logo'
    }]
  },
  twitter: {
    card: 'summary_large_image',
    site: '@wondertravel08',
    title: 'WonderTravel — India, beautifully driven.',
    description: 'Driver-operated one-way, round-trip and outstation journeys across India, with roots in Uttarakhand.',
    images: [`${SITE_URL}/branding/wondertravel-social-preview.jpg`]
  },
  alternates: { canonical: '/' }
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#0b0f14',
  colorScheme: 'dark'
};

const ORG_SCHEMA = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: `${SITE_URL}/`,
      name: 'WonderTravel',
      inLanguage: 'en-IN'
    },
    {
      '@type': ['Organization', 'TaxiService'],
      '@id': `${SITE_URL}/#business`,
      name: 'WonderTravel Cab Services',
      url: `${SITE_URL}/`,
      logo: `${SITE_URL}/branding/wondertravel-wordmark.png`,
      image: `${SITE_URL}/branding/wondertravel-social-preview.jpg`,
      telephone: '+91-9675286699',
      priceRange: '₹₹',
      description: 'Driver-operated one-way, round-trip and outstation journeys across India, with roots in Uttarakhand.',
      areaServed: 'India',
      sameAs: ['https://twitter.com/wondertravel08']
    },
    {
      '@type': 'Service',
      '@id': `${SITE_URL}/#service`,
      name: 'Driver-operated cab journeys — one-way, round-trip and outstation',
      serviceType: 'One-way, round-trip and outstation cab travel',
      provider: { '@id': `${SITE_URL}/#business` },
      areaServed: 'India',
      url: `${SITE_URL}/`
    }
  ]
};

export default function RootLayout({ children }) {
  return (
    <html lang="en-IN" className={`${cormorant.variable} ${inter.variable}`}>
      <head>
        <link rel="dns-prefetch" href="https://cab-system-puce.vercel.app" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ORG_SCHEMA) }}
        />
      </head>
      <body suppressHydrationWarning>
        <Providers>
          <ScrollManager />
          <LogoutTransition />
          {children}
        </Providers>
        <noscript>
          <main>
            <h1>WonderTravel — Intercity Cabs Across India</h1>
            <p>Driver-operated one-way, round-trip and outstation journeys across India, with extensive local coverage throughout Uttarakhand.</p>
            <p>Call <a href="tel:+919675286699">9675286699</a> or contact WonderTravel on <a href="https://wa.me/919675286699">WhatsApp</a> for booking assistance.</p>
          </main>
        </noscript>
      </body>
    </html>
  );
}
