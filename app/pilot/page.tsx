import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { MarketingShell } from '@/components/marketing-shell';
import { PilotDemo } from '@/components/pilot-demo';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { buildPageMetadata } from '@/lib/seo';

export const dynamic = 'force-static';

export const metadata: Metadata = buildPageMetadata({
  title: 'Fintech & Bank Pilot — Embeddable NIPOST Postcode KYC Widget',
  description:
    'Interactive Nigerian fintech and microfinance bank pilot showcase (PRD Goal G5): test the Shadow DOM <postcheck-address-widget> Web Component and 30-day pilot rollout plan.',
  path: '/pilot',
});

const PILOT_WEEKS = [
  {
    week: 'WEEK 01',
    title: 'Sandbox & L1 Server Proxy',
    desc: 'Connect your staging onboarding backend to PostCheck’s /api/postcode proxy at Level 1 (0 credits consumed) and ingest the Section 9 KYC JSON payload.',
  },
  {
    week: 'WEEK 02',
    title: 'Origin-Allowlisted Widget Embed',
    desc: 'Drop <postcheck-address-widget> (/widget/v1/postcheck-embed.js) into your Tier 2 savings, card-dispatch, or POS merchant form with HTTPS origin guard.',
  },
  {
    week: 'WEEK 03',
    title: 'Back-Book Audit & Webhooks',
    desc: 'Run legacy customer address records through the Batch Back-Book API and subscribe to signed X-PostCheck-Signature webhook events.',
  },
  {
    week: 'WEEK 04',
    title: 'Post-KYB L2/L3 Production Cutover',
    desc: 'Keep 85%+ of top-of-funnel checks on free L1 while escalating high-risk or corporate KYB accounts to L2 (house address) and L3 (building use).',
  },
];

export default function PilotPage() {
  return (
    <MarketingShell
      currentPath="/pilot"
      breadcrumbs={[
        { name: 'Live Sandbox', path: '/' },
        { name: 'Fintech & Bank Pilot', path: '/pilot' },
      ]}
    >
      <section className="mkt-hero coal-band">
        <div className="mkt-container mkt-hero-single">
          <div className="mkt-pill">
            <span className="mkt-pulsedot" aria-hidden="true" />
            PRD Goal G5 · Nigerian Fintech &amp; Microfinance Bank Pilot
          </div>

          <h1 className="mkt-display">
            Drop-in postcode{' '}
            <span className="gold-word">
              onboarding
              <svg viewBox="0 0 200 10" aria-hidden="true">
                <path
                  d="M3 7 C 60 2, 140 2, 197 6"
                  stroke="#EBC700"
                  strokeWidth="5"
                  fill="none"
                  strokeLinecap="round"
                />
              </svg>
            </span>{' '}
            for design-partner banks.
          </h1>

          <p className="mkt-lead">
            Experience how a Nigerian microfinance bank, digital neobank, or POS
            agent network embeds PostCheck’s Shadow DOM Web Component (
            <code>/widget/v1/postcheck-embed.js</code>) to capture and verify
            5-segment NIPOST postcodes in under a second.
          </p>
        </div>
      </section>

      <section className="mkt-section">
        <div className="mkt-container">
          <div className="mkt-section-header">
            <span className="eyebrow">INTERACTIVE PARTNER EMBED (GOAL G5)</span>
            <h2 className="mkt-h2">
              Live Web Component + Host Bank Event Receiver
            </h2>
            <p className="mkt-section-lead">
              The form on the left mounts our self-contained{' '}
              <code>&lt;postcheck-address-widget&gt;</code> custom element. When
              verified, it dispatches a composed{' '}
              <code>postcheck:verified</code> event across the Shadow DOM
              boundary to the host bank’s compliance listener on the right.
            </p>
          </div>

          <PilotDemo />
        </div>
      </section>

      <section className="mkt-section mkt-section-alt">
        <div className="mkt-container">
          <div className="mkt-section-header">
            <span className="eyebrow">30-DAY DESIGN-PARTNER ROLLOUT</span>
            <h2 className="mkt-h2">
              Four weeks from sandbox to production KYC
            </h2>
            <p className="mkt-section-lead">
              Structured for Nigerian fintech and microfinance bank compliance
              and engineering teams with zero PII retention under the{' '}
              <Link href="/privacy" className="inline-link">
                Nigeria Data Protection Act (NDPA)
              </Link>
              .
            </p>
          </div>

          <div className="mkt-feature-grid mkt-grid-2">
            {PILOT_WEEKS.map((w) => (
              <Card key={w.week} className="panel mkt-feature-card">
                <div className="mkt-step-header">
                  <span className="mkt-feature-index">{w.week}</span>
                  <Badge variant="gold">PILOT MILESTONE</Badge>
                </div>
                <h3>{w.title}</h3>
                <p>{w.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="mkt-section">
        <div className="mkt-container mkt-narrow">
          <Card className="panel mkt-scope-card">
            <div className="mkt-scope-col">
              <Badge variant="success">WHAT PARTNER BANKS GET IN PILOT</Badge>
              <ul role="list">
                <li>
                  <CheckCircle2 size={16} />
                  <span>
                    Zero-credit Level 1 postcode validation on 100% of new
                    account openings
                  </span>
                </li>
                <li>
                  <CheckCircle2 size={16} />
                  <span>
                    Encapsulated Shadow DOM widget (<code>delegatesFocus</code>)
                    or server-to-server JSON proxy
                  </span>
                </li>
                <li>
                  <CheckCircle2 size={16} />
                  <span>
                    Back-book CSV normalization audit for existing customer
                    records
                  </span>
                </li>
              </ul>
            </div>

            <div className="mkt-scope-col">
              <Badge variant="gold">HONESTY &amp; COMPLIANCE RULE</Badge>
              <ul role="list">
                <li>
                  <CheckCircle2 size={16} />
                  <span>
                    Confirms a structured 5-segment location reference; never
                    claims proof of identity or occupancy
                  </span>
                </li>
                <li>
                  <CheckCircle2 size={16} />
                  <span>
                    Complements existing BVN, NIN, and Tier-3 physical
                    verification workflows
                  </span>
                </li>
                <li>
                  <CheckCircle2 size={16} />
                  <span>
                    Backed by Viral Ad Media’s 500 welcome credits for L2/L3
                    escalation testing
                  </span>
                </li>
              </ul>
            </div>
          </Card>
        </div>
      </section>

      <section className="coal-band mkt-cta-band">
        <div className="mkt-container mkt-cta-inner">
          <h2>Ready to test the full verification workspace?</h2>
          <p>
            Return to the main PostCheck sandbox to run segment-aware
            autocomplete, 37-state catalog browsing, and the 4-check live
            NIPOST acceptance suite.
          </p>
          <div className="mkt-cta-row mkt-cta-center">
            <Button asChild size="lg" className="mkt-btn-gold">
              <Link href="/">
                Open verification workspace
                <ArrowRight size={16} className="button-arrow" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="mkt-btn-coal"
            >
              <Link href="/overview">Read programme overview</Link>
            </Button>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
