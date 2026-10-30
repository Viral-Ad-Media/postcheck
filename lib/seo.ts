import type { Metadata } from 'next';

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://postcheck-nine.vercel.app';
export const SITE_NAME = 'PostCheck by Viral Ad Media';
export const OG_IMAGE_URL = `${SITE_URL}/og-image.png`;
export const OG_IMAGE_ALT =
  'PostCheck by Viral Ad Media — 5-Segment Nigerian Postcode Verification (FC 01 A01 KP 27) on NIPOST Gateway';

export function buildPageMetadata({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  const canonicalUrl = path === '/' ? SITE_URL : `${SITE_URL}${path}`;
  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: SITE_NAME,
      locale: 'en_NG',
      type: 'website',
      images: [
        {
          url: OG_IMAGE_URL,
          width: 1200,
          height: 630,
          alt: OG_IMAGE_ALT,
          type: 'image/png',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [
        {
          url: OG_IMAGE_URL,
          alt: OG_IMAGE_ALT,
        },
      ],
    },
  };
}

export function getLocalBusinessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${SITE_URL}/#localbusiness`,
    name: 'Viral Ad Media',
    alternateName: 'PostCheck by Viral Ad Media',
    description:
      'Nigerian digital product studio building PostCheck—structured 5-segment NIPOST postcode verification for banking, fintech KYC, and logistics onboarding.',
    url: SITE_URL,
    image: OG_IMAGE_URL,
    logo: `${SITE_URL}/icon.svg`,
    telephone: '+234-800-767-8245',
    email: 'hello@viraladmedia.com',
    priceRange: '₦₦',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Three Arms Zone, Abuja Municipal',
      addressLocality: 'Abuja',
      addressRegion: 'FCT',
      postalCode: 'FC-01-A01-KP-27',
      addressCountry: 'NG',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 9.0579,
      longitude: 7.4951,
    },
    areaServed: {
      '@type': 'Country',
      name: 'Nigeria',
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '08:00',
        closes: '18:00',
      },
    ],
    sameAs: ['https://pitch.postcode.gov.ng/', 'https://docs.postcode.gov.ng/'],
  };
}

export function getWebApplicationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    '@id': `${SITE_URL}/#webapp`,
    name: 'PostCheck',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'All',
    url: SITE_URL,
    description:
      'Postcode-first address verification step for Nigerian customer onboarding powered by the official NIPOST Postcode Gateway.',
    provider: {
      '@id': `${SITE_URL}/#localbusiness`,
    },
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'NGN',
      description: 'Free Level 1 (L1) postcode validity verification and autocomplete',
    },
  };
}

export function getBreadcrumbSchema(
  items: ReadonlyArray<{ name: string; path: string }>
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: item.name,
      item: item.path === '/' ? SITE_URL : `${SITE_URL}${item.path}`,
    })),
  };
}
