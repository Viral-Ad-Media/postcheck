import Link from 'next/link';
import { ArrowRight, ArrowUpRight, ChevronRight } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  getBreadcrumbSchema,
  getLocalBusinessSchema,
  getWebApplicationSchema,
} from '@/lib/seo';

const NAV_LINKS = [
  { href: '/overview', label: 'Overview' },
  { href: '/how-it-works', label: 'How it works' },
  { href: '/sectors', label: 'Sectors' },
  { href: '/pilot', label: 'Fintech Pilot' },
  { href: '/privacy', label: 'Privacy & NDPA' },
] as const;

export function MarketingShell({
  currentPath,
  breadcrumbs,
  extraSchema,
  children,
}: Readonly<{
  currentPath: string;
  breadcrumbs: ReadonlyArray<{ name: string; path: string }>;
  extraSchema?: Record<string, unknown>;
  children: React.ReactNode;
}>) {
  const jsonLd = [
    getLocalBusinessSchema(),
    getWebApplicationSchema(),
    getBreadcrumbSchema(breadcrumbs),
    ...(extraSchema ? [extraSchema] : []),
  ];

  return (
    <div className="mkt-shell">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <a href="#mkt-main" className="mkt-skip-link">
        Skip to content
      </a>

      <div className="mkt-ministry-bar">
        Built on Nigeria’s Postcode · Session 2: Identity, Banking & Payments ·
        PostCheck by Viral Ad Media
      </div>

      <div className="hairline" aria-hidden="true" />

      <header className="mkt-header">
        <div className="mkt-header-inner">
          <Link
            href="/overview"
            className="mkt-brand"
            aria-label="PostCheck by Viral Ad Media — Overview"
          >
            <img
              src="/icon.svg"
              alt="PostCheck stacked gold bars and green dot emblem"
              width={34}
              height={34}
              className="mkt-logo-img"
            />
            <span className="mkt-brand-text">
              PostCheck<span className="brand-dot">.</span>
            </span>
            <Badge variant="gold" className="mkt-brand-badge">
              NIPOST L1
            </Badge>
          </Link>

          <nav aria-label="Primary" className="mkt-nav">
            <div className="mkt-nav-links">
              {NAV_LINKS.map((item) => {
                const active = currentPath === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    className={'mkt-nav-link' + (active ? ' active' : '')}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>

            <div className="mkt-nav-actions">
              <ThemeToggle />

              <Button asChild size="sm" className="mkt-sandbox-cta">
                <Link href="/">
                  Verification workspace
                  <ArrowRight size={14} className="button-arrow" />
                </Link>
              </Button>
            </div>
          </nav>
        </div>
      </header>

      <nav aria-label="Breadcrumb" className="mkt-breadcrumb-bar">
        <ol className="mkt-breadcrumb-list">
          {breadcrumbs.map((crumb, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            return (
              <li key={crumb.path + crumb.name} className="mkt-breadcrumb-item">
                {idx > 0 && <ChevronRight size={13} aria-hidden="true" />}
                {isLast ? (
                  <span aria-current="page">{crumb.name}</span>
                ) : (
                  <Link href={crumb.path}>{crumb.name}</Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>

      <main id="mkt-main" className="mkt-main">
        {children}
      </main>

      <div className="hairline" aria-hidden="true" />

      <footer className="mkt-footer coal-band">
        <div className="mkt-footer-inner">
          <div className="mkt-footer-brand">
            <div className="mkt-footer-logo">
              <img
                src="/icon.svg"
                alt="PostCheck logo mark"
                width={30}
                height={30}
                className="mkt-logo-img"
              />
              <span>
                PostCheck<span className="brand-dot">.</span>
              </span>
            </div>
            <p>
              Postcode-first address verification for Nigerian customer
              onboarding. Engineered by <strong>Viral Ad Media</strong> on the
              official NIPOST Postcode Gateway for the{' '}
              <em>Built on Nigeria’s Postcode</em> showcase.
            </p>
            <address className="mkt-business-address">
              Viral Ad Media · Three Arms Zone, Abuja Municipal, FCT · Postcode{' '}
              <code>FC-01-A01-KP-27</code> · +234 800 767 8245
            </address>
          </div>

          <div className="mkt-footer-col">
            <p className="mkt-footer-heading">Product & Pages</p>
            <Link href="/">Live verification workspace</Link>
            <Link href="/pilot">Fintech pilot &amp; Web Component</Link>
            <Link href="/overview">Programme overview</Link>
            <Link href="/how-it-works">How 5-segment lookup works</Link>
            <Link href="/sectors">Eight priority sectors</Link>
            <Link href="/privacy">Privacy & NDPA compliance</Link>
          </div>

          <div className="mkt-footer-col">
            <p className="mkt-footer-heading">Resources & Feeds</p>
            <Link href="/privacy#accessibility">Accessibility statement</Link>
            <a href="/sitemap.xml">XML Sitemap</a>
            <a href="/llms.txt">LLMs.txt index</a>
            <a
              href="https://docs.postcode.gov.ng/"
              target="_blank"
              rel="noreferrer"
            >
              NIPOST API Docs <ArrowUpRight size={12} />
            </a>
            <a
              href="https://pitch.postcode.gov.ng/"
              target="_blank"
              rel="noreferrer"
            >
              Built on Nigeria’s Postcode <ArrowUpRight size={12} />
            </a>
          </div>
        </div>

        <div className="mkt-footer-bottom">
          <p>PostCheck by Viral Ad Media · Server-isolated NIPOST L1 gateway</p>
          <p>Aligned with the Nigeria Data Protection Act (NDPA) 2023</p>
        </div>
      </footer>
    </div>
  );
}
