import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight,
  CheckCircle2,
  LockKeyhole,
} from 'lucide-react';
import { MarketingShell } from '@/components/marketing-shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { buildPageMetadata } from '@/lib/seo';

export const dynamic = 'force-static';

export const metadata: Metadata = buildPageMetadata({
  title: 'Privacy & NDPA Compliance — Responsible Postcode Data Governance',
  description:
    'How PostCheck aligns with the Nigeria Data Protection Act (NDPA) 2023 through data minimization, server-only credential isolation, and scope transparency.',
  path: '/privacy',
});

const NDPA_PILLARS = [
  {
    num: '01',
    title: 'Data Minimization (L1 Only)',
    desc: 'PostCheck queries NIPOST Lookup Level 1 exclusively. No customer names, BVN/NIN identifiers, phone numbers, residential street strings (L2), or exact GPS point geometry (L5) are requested or stored.',
  },
  {
    num: '02',
    title: 'Server-Side Credential Isolation',
    desc: 'Your NIPOST secret test key (nipost_test_*) is read only inside the server-side Next.js Route Handler. Production keys (nipost_live_*) are rejected in sandbox mode, and echoed secrets are scrubbed.',
  },
  {
    num: '03',
    title: 'Explicit Scope Honesty',
    desc: 'PostCheck clearly informs operators and users that a valid postcode confirms a location reference only—it never claims to prove personal identity or physical occupancy.',
  },
  {
    num: '04',
    title: 'Bounded Upstream Proxy',
    desc: 'Every upstream request enforces a 10-second AbortController timeout, redirect: "error", cache: "no-store", and a 100 KB response ceiling to prevent data leakage or memory exhaustion.',
  },
];

export default function PrivacyPage() {
  return (
    <MarketingShell
      currentPath="/privacy"
      breadcrumbs={[
        { name: 'Home', path: '/' },
        { name: 'Privacy & NDPA', path: '/privacy' },
      ]}
    >
      <section className="mkt-hero coal-band">
        <div className="mkt-container mkt-hero-single">
          <div className="mkt-pill">
            <span className="mkt-pulsedot" aria-hidden="true" />
            Nigeria Data Protection Act (NDPA) · Must-Pass Criterion
          </div>

          <h1 className="mkt-display">
            Responsible data handling{' '}
            <span className="gold-word">
              by design
              <svg viewBox="0 0 200 10" aria-hidden="true">
                <path
                  d="M3 7 C 60 2, 140 2, 197 6"
                  stroke="#EBC700"
                  strokeWidth="5"
                  fill="none"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            .
          </h1>

          <p className="mkt-lead">
            In the <em>Built on Nigeria’s Postcode</em> programme, responsible
            data handling under the Nigeria Data Protection Act is a mandatory
            pass/fail gate. PostCheck enforces strict privacy and security
            boundaries across our{' '}
            <Link href="/how-it-works" className="mkt-inline-gold-link">
              API v1 verification proxy
            </Link>{' '}
            and{' '}
            <Link href="/dashboard" className="mkt-inline-gold-link">
              interactive sandbox
            </Link>
            .
          </p>
        </div>
      </section>

      <section className="mkt-section">
        <div className="mkt-container">
          <div className="mkt-section-header">
            <span className="eyebrow">NDPA COMPLIANCE ARCHITECTURE</span>
            <h2 className="mkt-h2">Four safeguards built into the code</h2>
          </div>

          <div className="mkt-diagram-frame">
            <img
              src="/images/verification-architecture.svg"
              alt="Security boundary diagram showing browser client isolated from NIPOST API credentials via Next.js server route handler"
              width={760}
              height={200}
              className="mkt-diagram-img mkt-diagram-wide"
            />
          </div>

          <div className="mkt-feature-grid mkt-grid-2">
            {NDPA_PILLARS.map((p) => (
              <Card key={p.title} className="panel mkt-feature-card">
                <span className="mkt-feature-index">SAFEGUARD {p.num}</span>
                <h3>{p.title}</h3>
                <p>{p.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="mkt-section mkt-section-alt">
        <div className="mkt-container mkt-narrow">
          <div className="mkt-section-header">
            <span className="eyebrow">VERIFICATION BOUNDARIES</span>
            <h2 className="mkt-h2">
              What PostCheck verifies vs. what remains separate
            </h2>
            <p className="mkt-section-lead">
              Compare how this separation works across{' '}
              <Link href="/sectors" className="inline-link">
                banking, KYC, and delivery workflows
              </Link>
              .
            </p>
          </div>

          <Card className="panel mkt-scope-card">
            <div className="mkt-scope-col">
              <Badge variant="success">INCLUDED IN POSTCHECK (PHASE 1)</Badge>
              <ul>
                <li>
                  <CheckCircle2 size={16} />
                  <span>
                    5-segment postcode format &amp; segment-aware autocomplete
                  </span>
                </li>
                <li>
                  <CheckCircle2 size={16} />
                  <span>
                    Level 1 validity lookup against NIPOST’s public-building
                    sandbox dataset
                  </span>
                </li>
                <li>
                  <CheckCircle2 size={16} />
                  <span>
                    Canonical assembly of State, LGA, District, Area, and Unit
                  </span>
                </li>
                <li>
                  <CheckCircle2 size={16} />
                  <span>
                    Redacted JSON evidence export for technical verification
                  </span>
                </li>
              </ul>
            </div>

            <div className="mkt-scope-col">
              <Badge variant="gold">SEPARATE DOWNSTREAM KYC CHECKS</Badge>
              <ul>
                <li>
                  <LockKeyhole size={16} />
                  <span>
                    Customer identity verification (BVN, NIN, or passport)
                  </span>
                </li>
                <li>
                  <LockKeyhole size={16} />
                  <span>
                    Proof of residence / occupancy (utility bill or physical
                    verification)
                  </span>
                </li>
                <li>
                  <LockKeyhole size={16} />
                  <span>
                    Commercial L2–L5 attributes (street strings &amp; GPS point
                    geometry)
                  </span>
                </li>
              </ul>
            </div>
          </Card>
        </div>
      </section>

      <section id="accessibility" className="mkt-section">
        <div className="mkt-container mkt-narrow">
          <div className="mkt-section-header">
            <span className="eyebrow">INCLUSIVE DESIGN</span>
            <h2 className="mkt-h2">Accessibility commitment</h2>
            <p className="mkt-section-lead">
              PostCheck is built with accessible semantic HTML disclosures,
              keyboard-first focus rings, and full support for system motion and
              theme preferences.
            </p>
          </div>

          <div className="mkt-a11y-grid">
            <Card className="panel mkt-feature-card">
              <h3>Keyboard &amp; Screen Reader Ready</h3>
              <p>
                Every interactive control includes visible focus indicators,
                semantic ARIA live regions (<code>aria-live=&quot;polite&quot;</code>)
                for verification results, and skip-to-content navigation.
              </p>
            </Card>
            <Card className="panel mkt-feature-card">
              <h3>Reduced Motion &amp; High Contrast</h3>
              <p>
                Houdini <code>@property --animation-reduced</code> tokens
                automatically respect <code>prefers-reduced-motion: reduce</code>,
                and both Light and Dark themes maintain strong contrast ratios.
              </p>
            </Card>
          </div>
        </div>
      </section>

      <section className="coal-band mkt-cta-band">
        <div className="mkt-container mkt-cta-inner">
          <h2>Verify our security &amp; privacy posture live</h2>
          <p>
            Inspect the live API test suite and export the redacted staging
            evidence report from the workspace.
          </p>
          <div className="mkt-cta-row mkt-cta-center">
            <Button asChild size="lg" className="mkt-btn-gold">
              <Link href="/dashboard">
                Open live sandbox
                <ArrowRight size={16} className="button-arrow" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="mkt-btn-coal">
              <Link href="/overview">Back to overview</Link>
            </Button>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
