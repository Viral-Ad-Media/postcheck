import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight,
  Check,
} from 'lucide-react';
import { MarketingShell } from '@/components/marketing-shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { buildPageMetadata } from '@/lib/seo';

export const dynamic = 'force-static';

export const metadata: Metadata = buildPageMetadata({
  title: 'How It Works — NIPOST 5-Segment Postcode & L1 Lookup Architecture',
  description:
    'Learn how Nigeria’s 5-segment postcode (AA-99-H77-BB-55), graded lookup levels (L1–L5), and PostCheck’s server-isolated verification proxy work.',
  path: '/how-it-works',
});

const SEGMENTS_DETAIL = [
  {
    code: 'FC',
    template: 'AA',
    name: 'State',
    format: '2 letters (alpha)',
    desc: 'Identifies one of Nigeria’s 36 states or the Federal Capital Territory (e.g. FC for FCT, EK for Ekiti, LA for Lagos).',
    tone: 'c0',
  },
  {
    code: '01',
    template: '99',
    name: 'LGA',
    format: '2 digits (01–99)',
    desc: 'Zero-filled Local Government Area code within the state (e.g. 01 Abaji, 02 Abuja Municipal).',
    tone: 'c1',
  },
  {
    code: 'A01',
    template: 'H77',
    name: 'District',
    format: '3 alphanumeric',
    desc: 'Postal District (PD) code subdividing the LGA into structured delivery and administrative zones.',
    tone: 'c2',
  },
  {
    code: 'KP',
    template: 'BB',
    name: 'Area',
    format: '2 letters (alpha)',
    desc: 'Postal Code Area (PCA) identifying a localized neighborhood block or street cluster inside the district.',
    tone: 'c3',
  },
  {
    code: '27',
    template: '55',
    name: 'Building Unit',
    format: '2 digits (01–99)',
    desc: 'Zero-filled building unit number pinpointing the specific addressable property inside the area.',
    tone: 'c4',
  },
];

const LOOKUP_LEVELS = [
  {
    attr: 'Validity & canonical format status',
    l1: true,
    l2: true,
    l3: true,
    l4: true,
    l5: true,
  },
  {
    attr: 'Administrative address (State, LGA, Locality, Zone)',
    l1: false,
    l2: true,
    l3: true,
    l4: true,
    l5: true,
  },
  {
    attr: 'Recent house address string',
    l1: false,
    l2: true,
    l3: true,
    l4: true,
    l5: true,
  },
  {
    attr: 'Building use status (Residential / Commercial / Public)',
    l1: false,
    l2: false,
    l3: true,
    l4: true,
    l5: true,
  },
  {
    attr: 'Extended building metadata',
    l1: false,
    l2: false,
    l3: false,
    l4: true,
    l5: true,
  },
  {
    attr: 'Point geometry (Exact GPS coordinates)',
    l1: false,
    l2: false,
    l3: false,
    l4: false,
    l5: true,
  },
];

export default function HowItWorksPage() {
  return (
    <MarketingShell
      currentPath="/how-it-works"
      breadcrumbs={[
        { name: 'Live Sandbox', path: '/' },
        { name: 'How It Works', path: '/how-it-works' },
      ]}
    >
      <section className="mkt-hero coal-band">
        <div className="mkt-container mkt-hero-single">
          <div className="mkt-pill">
            <span className="mkt-pulsedot" aria-hidden="true" />
            NIPOST Postcode Gateway · API v1 Architecture
          </div>

          <h1 className="mkt-display">
            One code. Five{' '}
            <span className="gold-word">
              segments
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
            . Built for verification.
          </h1>

          <p className="mkt-lead">
            Nigeria’s national postcode is a 12-character formatted string (11
            alphanumeric characters across 5 hierarchical segments) that maps
            every addressable building from state level down to the individual
            property unit. Test it directly in our{' '}
            <Link href="/" className="mkt-inline-gold-link">
              live verification sandbox
            </Link>{' '}
            or read the{' '}
            <Link href="/overview" className="mkt-inline-gold-link">
              programme overview
            </Link>
            .
          </p>
        </div>
      </section>

      <section className="mkt-section">
        <div className="mkt-container">
          <div className="mkt-section-header">
            <span className="eyebrow">POSTCODE ANATOMY</span>
            <h2 className="mkt-h2">How the 5 segments map to Nigeria</h2>
            <p className="mkt-section-lead">
              The NIPOST gateway accepts dashed (<code>FC-01-A01-KP-27</code>), spaced (<code>FC
              01 A01 KP 27</code>), or compact (<code>FC01A01KP27</code>) inputs interchangeably
              and normalizes them to a canonical hierarchy.
            </p>
          </div>

          <div className="mkt-diagram-frame">
            <img
              src="/images/postcode-segments.svg"
              alt="Five-segment breakdown of Nigerian postcode FC-01-A01-KP-27 showing State, Local Government Area, Postal District, Postal Code Area, and Building Unit"
              width={560}
              height={220}
              className="mkt-diagram-img"
            />
          </div>

          <div className="mkt-segment-grid">
            {SEGMENTS_DETAIL.map((seg, i) => (
              <Card key={seg.name} className="panel mkt-segment-card">
                <div className="mkt-segment-top">
                  <span className={'code-cell ' + seg.tone}>{seg.code}</span>
                  <Badge variant="secondary">0{i + 1}</Badge>
                </div>
                <h3>{seg.name}</h3>
                <p className="mkt-segment-format">
                  Template <code>{seg.template}</code> · {seg.format}
                </p>
                <p className="mkt-segment-desc">{seg.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="mkt-section mkt-section-alt">
        <div className="mkt-container">
          <div className="mkt-section-header">
            <span className="eyebrow">THREE-STEP WORKFLOW</span>
            <h2 className="mkt-h2">From user keystroke to verified KYC record</h2>
            <p className="mkt-section-lead">
              PostCheck orchestrates three official NIPOST gateway endpoints
              through a hardened Next.js server route handler aligned with{' '}
              <Link href="/privacy" className="inline-link">
                NDPA data minimization rules
              </Link>
              .
            </p>
          </div>

          <div className="mkt-diagram-frame">
            <img
              src="/images/verification-architecture.svg"
              alt="Architecture diagram illustrating browser client calling Next.js /api/postcode server proxy which authenticates with X-API-Key against api.postcode.gov.ng"
              width={760}
              height={200}
              className="mkt-diagram-img mkt-diagram-wide"
            />
          </div>

          <div className="mkt-feature-grid">
            <Card className="panel mkt-feature-card">
              <div className="mkt-step-header">
                <span className="mkt-feature-index">STEP 01 · CAPTURE</span>
                <Badge variant="gold">AUTOCOMPLETE</Badge>
              </div>
              <h3>Segment-aware capture</h3>
              <p>
                As the customer types a partial postcode or assembles individual
                segments, PostCheck calls{' '}
                <code>GET /v1/search/autocomplete</code> or{' '}
                <code>POST /v1/assembly/assemble</code> with a 400ms debounce and
                automatic request cancellation.
              </p>
            </Card>

            <Card className="panel mkt-feature-card">
              <div className="mkt-step-header">
                <span className="mkt-feature-index">STEP 02 · L1 LOOKUP</span>
                <Badge variant="gold">0 CREDITS</Badge>
              </div>
              <h3>Server-side L1 lookup</h3>
              <p>
                When the user clicks Verify, our backend calls{' '}
                <code>GET /v1/lookup?code=…&amp;level=1</code> with the server-side{' '}
                <code>X-API-Key</code> header, enforcing level 1 and a strict
                10-second timeout ceiling.
              </p>
            </Card>

            <Card className="panel mkt-feature-card">
              <div className="mkt-step-header">
                <span className="mkt-feature-index">STEP 03 · HANDOFF</span>
                <Badge variant="gold">KYC RECORD</Badge>
              </div>
              <h3>Downstream KYC handoff</h3>
              <p>
                Once the canonical postcode is verified, your onboarding flow
                stores the normalized <code>FC-01-A01-KP-27</code> reference
                alongside separate identity (BVN/NIN) and proof-of-address
                artefacts across{' '}
                <Link href="/sectors" className="inline-link">
                  banking and industry workflows
                </Link>
                .
              </p>
            </Card>
          </div>
        </div>
      </section>

      <section className="mkt-section">
        <div className="mkt-container">
          <div className="mkt-section-header">
            <span className="eyebrow">GRADED ACCESS LEVELS</span>
            <h2 className="mkt-h2">Understanding Lookup Levels L1 to L5</h2>
            <p className="mkt-section-lead">
              NIPOST grades lookup responses into five cumulative levels.
              PostCheck deliberately locks verification to <strong>L1</strong>{' '}
              so top-of-funnel onboarding remains free (no credits consumed) and
              data-minimal.
            </p>
          </div>

          <Card className="panel mkt-table-card">
            <div className="mkt-table-scroll">
              <table className="mkt-table">
                <thead>
                  <tr>
                    <th>Returned Attribute</th>
                    <th className="highlight-col">
                      L1 <Badge variant="gold">PostCheck</Badge>
                    </th>
                    <th>L2</th>
                    <th>L3</th>
                    <th>L4</th>
                    <th>L5</th>
                  </tr>
                </thead>
                <tbody>
                  {LOOKUP_LEVELS.map((row) => (
                    <tr key={row.attr}>
                      <td>{row.attr}</td>
                      <td className="highlight-col">
                        {row.l1 ? <Check size={16} className="mkt-check" aria-label="Included" /> : '—'}
                      </td>
                      <td>
                        {row.l2 ? <Check size={16} className="mkt-check" aria-label="Included" /> : '—'}
                      </td>
                      <td>
                        {row.l3 ? <Check size={16} className="mkt-check" aria-label="Included" /> : '—'}
                      </td>
                      <td>
                        {row.l4 ? <Check size={16} className="mkt-check" aria-label="Included" /> : '—'}
                      </td>
                      <td>
                        {row.l5 ? <Check size={16} className="mkt-check" aria-label="Included" /> : '—'}
                      </td>
                    </tr>
                  ))}
                  <tr className="mkt-table-foot">
                    <td>Billing &amp; Access Tier</td>
                    <td className="highlight-col">
                      <strong>Free (0 credits)</strong>
                    </td>
                    <td>Commercial</td>
                    <td>Commercial</td>
                    <td>Commercial</td>
                    <td>Restricted KYB</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </section>

      <section className="coal-band mkt-cta-band">
        <div className="mkt-container mkt-cta-inner">
          <h2>See the 4-check acceptance suite in action</h2>
          <p>
            Run real calls against <code>https://api.postcode.gov.ng</code> and
            inspect the raw JSON evidence for every operation.
          </p>
          <div className="mkt-cta-row mkt-cta-center">
            <Button asChild size="lg" className="mkt-btn-gold">
              <Link href="/">
                Open live sandbox
                <ArrowRight size={16} className="button-arrow" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="mkt-btn-coal">
              <Link href="/sectors">View sector use cases</Link>
            </Button>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
