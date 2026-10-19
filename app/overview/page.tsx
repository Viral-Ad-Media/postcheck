import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight,
  CheckCircle2,
  ShieldAlert,
} from 'lucide-react';
import { MarketingShell } from '@/components/marketing-shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { buildPageMetadata } from '@/lib/seo';

export const dynamic = 'force-static';

export const metadata: Metadata = buildPageMetadata({
  title: 'Overview — Postcode-First Address Verification for Nigerian Onboarding',
  description:
    'Discover how PostCheck integrates the official 5-segment NIPOST Postcode Gateway into Nigerian bank account opening, fintech KYC, and merchant onboarding.',
  path: '/overview',
});

const SECTORS_MARQUEE = [
  'Identity and onboarding',
  'Banking and agent networks',
  'Fintech KYC verification',
  'Delivery and logistics',
  'Telecoms and SIM registration',
  'Utilities and field services',
  'Property, insurance and health',
  'Emergency response',
];

const CRITERIA = [
  {
    num: '01',
    title: 'A working solution.',
    desc: 'Interactive capture workspace and 4-check live NIPOST staging suite with JSON evidence export.',
    weight: '25%',
  },
  {
    num: '02',
    title: 'Real postcode use.',
    desc: 'Direct server-side integration with /v1/search/autocomplete, /v1/lookup (L1), and /v1/assembly/assemble.',
    weight: '25%',
  },
  {
    num: '03',
    title: 'Practical value.',
    desc: 'Replaces ambiguous free-text Nigerian street descriptions at the exact moment of customer onboarding.',
    weight: '25%',
  },
  {
    num: '04',
    title: 'Strong execution.',
    desc: 'Strict server-only credential isolation, 10s upstream abort ceiling, and zero client secret exposure.',
    weight: '25%',
  },
];

const SESSIONS = [
  {
    date: 'Tue 27 Oct 2026',
    title: 'Session 1: Delivery, logistics and commerce',
    note: 'Shortlisting by Friday, 23 October',
    featured: false,
  },
  {
    date: 'Fri 6 Nov 2026',
    title: 'Session 2: Identity, banking and payments',
    note: 'PostCheck target showcase · Shortlisting by Tuesday, 3 November',
    featured: true,
  },
  {
    date: 'Sat 21 Nov 2026',
    title: 'Session 3: Public services, utilities and emergency response',
    note: 'Shortlisting by Tuesday, 17 November',
    featured: false,
  },
];

const FAQS = [
  {
    q: 'What problem does PostCheck solve during Nigerian customer onboarding?',
    a: 'Traditional onboarding forms ask users to type unstructured landmarks ("opposite yellow transformer, off Admiralty Way"), causing failed KYC reviews and N50bn–N80bn in annual misdelivery across Nigeria. PostCheck replaces guesswork with a structured 5-segment NIPOST postcode check before KYC submission.',
  },
  {
    q: 'Why does PostCheck use Lookup Level 1 (L1) by default?',
    a: 'Level 1 confirms whether a 5-segment postcode is valid and active in NIPOST’s registry without consuming commercial credits or pulling sensitive building coordinates (L5). This keeps top-of-funnel onboarding fast, free, and data-minimal under the Nigeria Data Protection Act (NDPA).',
  },
  {
    q: 'Does a valid postcode prove that the customer lives at that building?',
    a: 'No. PostCheck is intentionally transparent about scope: an L1 postcode check confirms that the location reference is structured and valid. Identity verification (BVN/NIN) and proof of residency (utility bill or field agent visit) remain distinct downstream checks.',
  },
  {
    q: 'How are NIPOST API credentials protected in PostCheck?',
    a: 'Your NIPOST secret key (nipost_test_*) lives exclusively in server-side environment variables and is sent only from the Next.js Route Handler (/api/postcode) via the X-API-Key header. It never reaches browser bundles, and any echoed token is automatically redacted.',
  },
];

export default function OverviewPage() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  };

  return (
    <MarketingShell
      currentPath="/overview"
      breadcrumbs={[
        { name: 'Live Sandbox', path: '/' },
        { name: 'Overview', path: '/overview' },
      ]}
      extraSchema={faqSchema}
    >
      <section className="mkt-hero coal-band">
        <div className="mkt-container mkt-hero-grid">
          <div className="mkt-hero-copy">
            <div className="mkt-pill">
              <span className="mkt-pulsedot" aria-hidden="true" />
              Nigeria’s digital postcode went live on 1 October 2026
            </div>

            <h1 className="mkt-display">
              A clearer{' '}
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
              step for Nigerian onboarding.
            </h1>

            <p className="mkt-lead">
              PostCheck brings the official 5-segment NIPOST postcode directly
              into bank account opening, fintech KYC, and merchant verification—
              turning ambiguous street descriptions into verifiable building
              codes in milliseconds.
            </p>

            <div className="mkt-cta-row">
              <Button asChild size="lg" className="mkt-btn-gold">
                <Link href="/">
                  Launch live sandbox
                  <ArrowRight size={16} className="button-arrow" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="mkt-btn-coal">
                <Link href="/how-it-works">
                  How the architecture works
                </Link>
              </Button>
            </div>

            <p className="mkt-hero-meta">
              Built by Viral Ad Media · Session 2: Identity, Banking &amp; Payments ·
              Uses official NIPOST test dataset · Explore{' '}
              <Link href="/sectors" className="mkt-inline-gold-link">
                8 industry playbooks
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="mkt-inline-gold-link">
                NDPA privacy controls
              </Link>
              .
            </p>
          </div>

          <div className="mkt-hero-stage">
            <Card className="mkt-showcase-card">
              <CardHeader className="mkt-showcase-head">
                <div>
                  <span className="eyebrow">CANONICAL SANDBOX POSTCODE</span>
                  <CardTitle className="mkt-showcase-title">
                    FC 01 A01 KP 27
                  </CardTitle>
                  <CardDescription>
                    Federal Capital Territory · Abaji (01) · District A01 · Area
                    KP · Building 27
                  </CardDescription>
                </div>
                <Badge variant="success">L1 VERIFIED</Badge>
              </CardHeader>

              <CardContent className="mkt-showcase-body">
                <img
                  src="/images/postcode-segments.svg"
                  alt="Diagram of NIPOST 5-segment postcode FC 01 A01 KP 27 showing State FC, LGA 01, District A01, Area KP, and Unit 27"
                  width={560}
                  height={220}
                  className="mkt-diagram-img"
                />

                <div className="mkt-showcase-checks">
                  <div className="mkt-mini-check">
                    <CheckCircle2 size={15} />
                    <span>Segment-aware autocomplete (<code>/v1/search/autocomplete</code>)</span>
                    <code>HTTP 200</code>
                  </div>
                  <div className="mkt-mini-check">
                    <CheckCircle2 size={15} />
                    <span>Level 1 validity lookup (<code>/v1/lookup?level=1</code>)</span>
                    <code>HTTP 200</code>
                  </div>
                  <div className="mkt-mini-check">
                    <CheckCircle2 size={15} />
                    <span>5-segment canonical assembly (<code>/v1/assembly/assemble</code>)</span>
                    <code>HTTP 200</code>
                  </div>
                  <div className="mkt-mini-check">
                    <CheckCircle2 size={15} />
                    <span>Malformed code rejection (<code>NOT-A-POSTCODE</code>)</span>
                    <code>HTTP 200</code>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <div className="mkt-marquee-bar" aria-hidden="true">
        <div className="mkt-marquee-track">
          {[...SECTORS_MARQUEE, ...SECTORS_MARQUEE].map((item, idx) => (
            <span key={item + idx} className="mkt-marquee-item">
              <span>{item}</span>
              <i className="mkt-marquee-dot" />
            </span>
          ))}
        </div>
      </div>

      <section className="mkt-section">
        <div className="mkt-container">
          <div className="mkt-section-header">
            <span className="eyebrow">THE POSTCODE ADVANTAGE</span>
            <h2 className="mkt-h2">One code for the exact building.</h2>
            <p className="mkt-section-lead">
              A street address can still leave a delivery rider, bank agent, or
              compliance officer guessing. Nigeria’s national postcode gives
              every addressable building an 11-character code across five
              hierarchical segments.
            </p>
          </div>

          <div className="mkt-feature-grid">
            <Card className="panel mkt-feature-card">
              <span className="mkt-feature-index">01 · HIERARCHY</span>
              <h3>Five parts. One building.</h3>
              <p>
                Every code resolves State (<code>AA</code>), Local Government Area (<code>99</code>),
                Postal District (<code>H77</code>), Postal Code Area (<code>BB</code>), and Building
                Unit (<code>55</code>) in a deterministic format.
              </p>
              <Link href="/how-it-works" className="mkt-card-link">
                Explore segment anatomy <ArrowRight size={14} />
              </Link>
            </Card>

            <Card className="panel mkt-feature-card">
              <span className="mkt-feature-index">02 · ZERO-CREDIT L1</span>
              <h3>Zero-credit L1 verification.</h3>
              <p>
                Search, Assembly, and Lookup Level 1 are free of credit charges
                on the NIPOST gateway—ideal for validating every customer’s
                address at the very start of onboarding across{' '}
                <Link href="/sectors" className="inline-link">
                  banking, fintech, and logistics
                </Link>
                .
              </p>
              <Link href="/" className="mkt-card-link">
                Try live L1 verification <ArrowRight size={14} />
              </Link>
            </Card>

            <Card className="panel mkt-feature-card">
              <span className="mkt-feature-index">03 · NDPA ISOLATION</span>
              <h3>Server-isolated credentials.</h3>
              <p>
                Secret keys (<code>nipost_test_*</code>) never leave the server. Our proxy
                enforces strict input validation, 10-second timeouts, and
                automatic token redaction.
              </p>
              <Link href="/privacy" className="mkt-card-link">
                Read security &amp; NDPA posture <ArrowRight size={14} />
              </Link>
            </Card>
          </div>
        </div>
      </section>

      <section className="coal-band mkt-impact-band">
        <div className="mkt-container mkt-impact-grid">
          <div>
            <p className="mkt-gold-kicker">WHY THIS INFRASTRUCTURE MATTERS</p>
            <p className="mkt-impact-figure">N50bn to N80bn</p>
            <p className="mkt-impact-copy">
              Estimated annual cost of misdelivery and failed address resolution
              in Nigeria. By validating a customer’s 5-segment postcode during
              account opening or checkout, businesses eliminate address typos
              before dispatch or field verification begins.
            </p>
          </div>

          <div className="mkt-impact-stats">
            <div className="mkt-stat-row">
              <span className="mkt-stat-num">37</span>
              <span className="mkt-stat-label">
                States + FCT covered by the precomputed NIPOST reference catalog
              </span>
            </div>
            <div className="mkt-stat-row">
              <span className="mkt-stat-num">5</span>
              <span className="mkt-stat-label">
                Hierarchical segments (<code>AA-99-H77-BB-55</code>) down to the individual
                building unit
              </span>
            </div>
            <div className="mkt-stat-row">
              <span className="mkt-stat-num">4 / 4</span>
              <span className="mkt-stat-label">
                Live NIPOST sandbox acceptance checks verified with exportable
                JSON evidence
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="mkt-section mkt-section-alt">
        <div className="mkt-container mkt-narrow">
          <div className="mkt-section-header">
            <span className="eyebrow">PROGRAMME ALIGNMENT</span>
            <h2 className="mkt-h2">Four criteria. One must-pass check.</h2>
            <p className="mkt-section-lead">
              PostCheck is engineered specifically against the official{' '}
              <em>Built on Nigeria’s Postcode</em> evaluation rubric.
            </p>
          </div>

          <div className="mkt-criteria-list">
            {CRITERIA.map((c) => (
              <div key={c.num} className="mkt-criteria-row">
                <span className="mkt-criteria-num">{c.num}</span>
                <p className="mkt-criteria-text">
                  <strong>{c.title}</strong> <span>{c.desc}</span>
                </p>
                <div className="mkt-criteria-track" aria-hidden="true">
                  <span style={{ width: c.weight }} />
                </div>
                <span className="mkt-criteria-weight">{c.weight}</span>
              </div>
            ))}

            <div className="mkt-criteria-row mkt-criteria-ndpa">
              <ShieldAlert size={18} className="mkt-ndpa-icon" />
              <p className="mkt-criteria-text">
                <strong>
                  Responsible data handling in line with the{' '}
                  <Link href="/privacy" className="inline-link">
                    Nigeria Data Protection Act (NDPA)
                  </Link>
                </strong>
              </p>
              <Badge variant="destructive">Pass or fail</Badge>
            </div>
          </div>
        </div>
      </section>

      <section className="mkt-section">
        <div className="mkt-container">
          <div className="mkt-section-header">
            <span className="eyebrow">THE SHOWCASE SERIES</span>
            <h2 className="mkt-h2">Three sessions. Three themes.</h2>
            <p className="mkt-section-lead">
              Convened by the Federal Ministry of Communications, Innovation and
              Digital Economy and NIPOST. See how PostCheck maps across{' '}
              <Link href="/sectors" className="inline-link">
                all eight target sectors
              </Link>
              .
            </p>
          </div>

          <div className="mkt-sessions-grid">
            {SESSIONS.map((s) => (
              <Card
                key={s.date}
                className={
                  'panel mkt-session-card' + (s.featured ? ' featured' : '')
                }
              >
                <div className="mkt-session-top">
                  <span className="mkt-session-date">{s.date}</span>
                  {s.featured && (
                    <Badge variant="gold">POSTCHECK TARGET</Badge>
                  )}
                </div>
                <h3>{s.title}</h3>
                <p>{s.note}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="mkt-section mkt-section-alt">
        <div className="mkt-container mkt-narrow">
          <div className="mkt-section-header">
            <span className="eyebrow">QUESTIONS &amp; ANSWERS</span>
            <h2 className="mkt-h2">Frequently asked questions</h2>
          </div>

          <div className="mkt-faq-list">
            {FAQS.map((item, idx) => (
              <details
                key={item.q}
                name="postcheck-faq"
                open={idx === 0}
                className="mkt-faq-item"
              >
                <summary className="mkt-faq-summary">{item.q}</summary>
                <div className="mkt-faq-content">
                  <p>{item.a}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="coal-band mkt-cta-band">
        <div className="mkt-container mkt-cta-inner">
          <h2>Ready to test live NIPOST postcode verification?</h2>
          <p>
            Run segment-aware autocomplete, L1 lookup, 5-part assembly, and the
            4-check acceptance suite directly in the sandbox workspace.
          </p>
          <div className="mkt-cta-row mkt-cta-center">
            <Button asChild size="lg" className="mkt-btn-gold">
              <Link href="/">
                Open live sandbox
                <ArrowRight size={16} className="button-arrow" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="mkt-btn-coal">
              <Link href="/sectors">Explore 8 sector playbooks</Link>
            </Button>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
