import type { Metadata, Viewport } from 'next';
import {
  OG_IMAGE_ALT,
  OG_IMAGE_URL,
  SITE_NAME,
  SITE_URL,
} from '@/lib/seo';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: 'PostCheck',
  title: {
    default: 'PostCheck — Nigerian Postcode Verification by Viral Ad Media',
    template: '%s | PostCheck — Viral Ad Media',
  },
  description:
    'Postcode-first address verification for Nigerian customer onboarding. Validate 5-segment NIPOST postcodes (AA-99-H77-BB-55) at Level 1.',
  alternates: {
    canonical: SITE_URL,
  },
  icons: {
    icon: [{ url: '/icon.svg', type: 'image/svg+xml' }],
    shortcut: ['/icon.svg'],
    apple: [{ url: '/icon.svg', type: 'image/svg+xml' }],
  },
  openGraph: {
    title: 'PostCheck — Nigerian Postcode Verification by Viral Ad Media',
    description:
      'Postcode-first address verification for Nigerian customer onboarding. Validate 5-segment NIPOST postcodes at Level 1.',
    url: SITE_URL,
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
    title: 'PostCheck — Nigerian Postcode Verification by Viral Ad Media',
    description:
      'Postcode-first address verification for Nigerian customer onboarding. Validate 5-segment NIPOST postcodes at Level 1.',
    images: [
      {
        url: OG_IMAGE_URL,
        alt: OG_IMAGE_ALT,
      },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FFFFFF' },
    { media: '(prefers-color-scheme: dark)', color: '#1A1B26' },
  ],
};

const themeScript = `(function(){try{var s=localStorage.getItem("bnp-theme");var m=document.querySelector('meta[name="color-scheme"]');if(m)m.content=(s==="light"||s==="dark")?s:"light dark";var t=(s==="light"||s==="dark")?s:(window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light");document.documentElement.setAttribute("data-theme",t)}catch(e){document.documentElement.setAttribute("data-theme","light")}})();`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-NG" suppressHydrationWarning>
      <head>
        <meta name="color-scheme" content="light dark" />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
