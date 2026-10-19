import type { Metadata } from 'next';
import { PostcodeWorkspace } from '@/components/postcode-workspace';
import {
  buildPageMetadata,
  getBreadcrumbSchema,
  getLocalBusinessSchema,
  getWebApplicationSchema,
} from '@/lib/seo';

export const metadata: Metadata = buildPageMetadata({
  title: 'PostCheck — Nigerian Postcode Verification & Onboarding Sandbox',
  description:
    'Verify 5-segment NIPOST postcodes (FC-01-A01-KP-27) in real time with segment-aware autocomplete, L1 validity lookup, 5-part assembly, and a 4-check staging suite.',
  path: '/',
});

export default function HomePage() {
  const jsonLd = [
    getLocalBusinessSchema(),
    getWebApplicationSchema(),
    getBreadcrumbSchema([{ name: 'Live Sandbox', path: '/' }]),
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PostcodeWorkspace />
    </>
  );
}
