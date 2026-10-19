import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { MarketingShell } from '@/components/marketing-shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { buildPageMetadata } from '@/lib/seo';

export const dynamic = 'force-static';

export const metadata: Metadata = buildPageMetadata({
  title: 'Sectors — Eight Nigerian Industries Where Verified Postcodes Matter',
  description:
    'How Nigerian banks, fintechs, logistics operators, telecoms, utilities, and emergency services use PostCheck for structured 5-segment postcode onboarding.',
  path: '/sectors',
});

const SECTORS = [
  {
    num: '01',
    title: 'Identity and onboarding',
    session: 'Session 2 · Featured',
    problem:
      'Unstructured street text ("behind yellow transformer, Lekki Phase 1") stalls automated KYC queues and requires manual compliance review.',
    solution:
      'Capture and validate a canonical 5-segment postcode (FC-01-A01-KP-27) at L1 before triggering downstream BVN/NIN or physical address checks.',
    featured: true,
  },
  {
    num: '02',
    title: 'Banking and agent networks',
    session: 'Session 2 · Featured',
    problem:
      'Tier-2 and Tier-3 account upgrades and POS terminal deployments struggle to map merchant locations consistently across 774 LGAs.',
    solution:
      'Standardize every agent outlet and customer branch record to a verified State + LGA + District + Area + Building Unit code.',
    featured: true,
  },
  {
    num: '03',
    title: 'Delivery and logistics',
    session: 'Session 1',
    problem:
      'Riders spend 15–25 minutes per drop-off calling customers for directions, driving up failed delivery rates and fuel costs.',
    solution:
      'Validate the destination postcode at checkout so dispatch routing starts with a confirmed Postal District and Postal Code Area.',
    featured: false,
  },
  {
    num: '04',
    title: 'Telecoms',
    session: 'Cross-sector',
    problem:
      'Fibre-to-the-home (FTTH) feasibility checks and SIM registration records suffer from inconsistent subscriber address formatting.',
    solution:
      'Index subscriber buildings and coverage boxes by their 11-character NIPOST postcode for instant serviceability lookups.',
    featured: false,
  },
  {
    num: '05',
    title: 'Utilities and field services',
    session: 'Session 3',
    problem:
      'Prepaid meter installations and DisCo field maintenance crews cannot reliably match customer account records to physical properties.',
    solution:
      'Bind every meter serial number to a validated NIPOST building unit code during customer registration.',
    featured: false,
  },
  {
    num: '06',
    title: 'Retail and distribution',
    session: 'Session 1',
    problem:
      'FMCG distributors and B2B marketplaces lose visibility into informal kiosk and wholesaler locations across secondary cities.',
    solution:
      'Use segment-aware autocomplete or 5-part assembly so field sales reps capture accurate outlet postcodes in seconds.',
    featured: false,
  },
  {
    num: '07',
    title: 'Property, insurance and health',
    session: 'Session 2 & 3',
    problem:
      'Property underwriting, policy issuance, and HMO clinic mapping rely on ambiguous neighborhood names with overlapping boundaries.',
    solution:
      'Anchor every insured asset and healthcare facility to an unambiguous NIPOST administrative hierarchy.',
    featured: false,
  },
  {
    num: '08',
    title: 'Emergency response',
    session: 'Session 3',
    problem:
      'Ambulance and fire crews lose critical minutes translating verbal landmark directions during high-stress emergency calls.',
    solution:
      'Allow callers and dispatch systems to share a 5-segment building code that resolves immediately to a known district and unit.',
    featured: false,
  },
];

export default function SectorsPage() {
  return (
    <MarketingShell
      currentPath="/sectors"
      breadcrumbs={[
        { name: 'Live Sandbox', path: '/' },
        { name: 'Sectors', path: '/sectors' },
      ]}
    >
      <section className="mkt-hero coal-band">
        <div className="mkt-container mkt-hero-single">
          <div className="mkt-pill">
            <span className="mkt-pulsedot" aria-hidden="true" />
            Where it matters · Built on Nigeria’s Postcode
          </div>

          <h1 className="mkt-display">
            Eight sectors where an{' '}
            <span className="gold-word">
              address
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
            becomes money.
          </h1>

          <p className="mkt-lead">
            One clean postcode integration in an identity or payment onboarding
            flow reaches every Nigerian business that relies on verified customer
            locations. Review our{' '}
            <Link href="/how-it-works" className="mkt-inline-gold-link">
              5-segment technical architecture
            </Link>{' '}
            or test the{' '}
            <Link href="/" className="mkt-inline-gold-link">
              interactive sandbox
            </Link>
            .
          </p>
        </div>
      </section>

      <section className="mkt-section">
        <div className="mkt-container">
          <div className="mkt-section-header">
            <span className="eyebrow">BEFORE &amp; AFTER POSTCHECK</span>
            <h2 className="mkt-h2">
              Replacing free-text guesswork with structured certainty
            </h2>
          </div>

          <div className="mkt-compare-container">
            <div className="mkt-compare-grid">
              <Card className="panel mkt-compare-card legacy">
                <div className="mkt-compare-head">
                  <XCircle size={18} />
                  <span>Legacy Onboarding Form</span>
                  <Badge variant="destructive">UNSTRUCTURED</Badge>
                </div>
                <div className="mkt-compare-sample">
                  <code>
                    &quot;No 4 beside second yellow transformer, off NTA Road,
                    back of hotel, Abuja&quot;
                  </code>
                </div>
                <ul className="mkt-compare-list">
                  <li>Cannot be validated programmatically at signup</li>
                  <li>Fails automated KYC / AML address matching</li>
                  <li>Causes rider calls and failed card/parcel deliveries</li>
                </ul>
              </Card>

              <Card className="panel mkt-compare-card modern">
                <div className="mkt-compare-head">
                  <CheckCircle2 size={18} />
                  <span>PostCheck Postcode Step</span>
                  <Badge variant="success">NIPOST L1 VERIFIED</Badge>
                </div>
                <div className="mkt-compare-sample">
                  <code>FC-01-A01-KP-27</code>
                  <small>
                    State: FC · LGA: 01 · District: A01 · Area: KP · Unit: 27
                  </small>
                </div>
                <ul className="mkt-compare-list">
                  <li>Segment-aware autocomplete guides input in real time</li>
                  <li>Instant L1 validity check via server-side NIPOST API</li>
                  <li>
                    Zero-credit lookup cost and{' '}
                    <Link href="/privacy" className="inline-link">
                      NDPA-compliant zero PII exposure
                    </Link>
                  </li>
                </ul>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section className="mkt-section mkt-section-alt">
        <div className="mkt-container">
          <div className="mkt-section-header">
            <span className="eyebrow">INDUSTRY PLAYBOOKS</span>
            <h2 className="mkt-h2">Built for Nigeria’s core industries</h2>
            <p className="mkt-section-lead">
              PostCheck focuses on{' '}
              <Link href="/overview" className="inline-link">
                Session 2 (Identity, Banking &amp; Payments)
              </Link>{' '}
              while supporting all eight national priority sectors.
            </p>
          </div>

          <div className="mkt-sector-grid">
            {SECTORS.map((s) => (
              <div key={s.title} className="mkt-sector-cq">
                <Card
                  className={
                    'panel mkt-sector-card' + (s.featured ? ' featured' : '')
                  }
                >
                  <div className="mkt-sector-top">
                    <span className="mkt-feature-index">SECTOR {s.num}</span>
                    <Badge variant={s.featured ? 'gold' : 'secondary'}>
                      {s.session}
                    </Badge>
                  </div>
                  <h3>{s.title}</h3>
                  <div className="mkt-sector-body">
                    <div>
                      <strong>The friction</strong>
                      <p>{s.problem}</p>
                    </div>
                    <div>
                      <strong>With PostCheck</strong>
                      <p>{s.solution}</p>
                    </div>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="coal-band mkt-cta-band">
        <div className="mkt-container mkt-cta-inner">
          <h2>Test the onboarding step in the live sandbox</h2>
          <p>
            Experience segment-aware search, 5-part postcode assembly, and L1
            verification right now.
          </p>
          <div className="mkt-cta-row mkt-cta-center">
            <Button asChild size="lg" className="mkt-btn-gold">
              <Link href="/">
                Open live sandbox
                <ArrowRight size={16} className="button-arrow" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="mkt-btn-coal">
              <Link href="/privacy">Review NDPA &amp; privacy governance</Link>
            </Button>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
