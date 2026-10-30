import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo';

export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/overview', '/how-it-works', '/sectors', '/privacy', '/llms.txt'],
        disallow: ['/api/', '/dashboard', '/auth/', '/login', '/signup', '/forgot-password', '/reset-password', '/resend-confirmation'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
