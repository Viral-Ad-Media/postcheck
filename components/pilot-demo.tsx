'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Building2,
  Check,
  ClipboardCheck,
  Code2,
  Copy,
  ShieldCheck,
  Terminal,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type PilotScenarioId = 'mfb_tier2' | 'neobank_card' | 'pos_merchant';

const SCENARIOS: Record<
  PilotScenarioId,
  {
    name: string;
    partnerLabel: string;
    applicantLabel: string;
    defaultApplicant: string;
    defaultPhone: string;
    slaReplace: string;
    sampleCode: string;
  }
> = {
  mfb_tier2: {
    name: 'Lagos MFB · Tier 2 Savings KYC',
    partnerLabel: 'Balogun Microfinance Bank (CBN Tier 2 Onboarding)',
    applicantLabel: 'Account holder full name (Test Data)',
    defaultApplicant: 'Chinedu Okafor (Demo Tier 2 Applicant)',
    defaultPhone: '+234 802 000 0419',
    slaReplace: 'Replaces 48-hour utility bill manual review & ₦2,500 visit',
    sampleCode: 'FC-01-A01-KP-27',
  },
  neobank_card: {
    name: 'Neobank · Debit Card Dispatch',
    partnerLabel: 'KoboWave Digital Bank (Card Logistics Queue)',
    applicantLabel: 'Card recipient name (Test Data)',
    defaultApplicant: 'Zainab Abdullahi (Demo Cardholder)',
    defaultPhone: '+234 809 000 0812',
    slaReplace: 'Eliminates ambiguous street landmark failed card deliveries',
    sampleCode: 'FC-01-A01-KP-27',
  },
  pos_merchant: {
    name: 'POS Network · Agent Terminal KYC',
    partnerLabel: 'NaijaPay POS Acquirer (Merchant KYB Step)',
    applicantLabel: 'Registered business / agent name (Test Data)',
    defaultApplicant: 'Alaba Electronics Hub Ltd (Demo Merchant)',
    defaultPhone: '+234 803 000 0551',
    slaReplace: 'Pins merchant kiosk to canonical 5-segment building unit',
    sampleCode: 'EK-01-A03-FK-01',
  },
};

export function PilotDemo() {
  const [scenarioId, setScenarioId] = useState<PilotScenarioId>('mfb_tier2');
  const scenario = SCENARIOS[scenarioId];

  const [applicantName, setApplicantName] = useState(scenario.defaultApplicant);
  const [applicantPhone, setApplicantPhone] = useState(scenario.defaultPhone);
  const [widgetEventPayload, setWidgetEventPayload] = useState<Record<
    string,
    unknown
  > | null>(null);
  const [copiedEvent, setCopiedEvent] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);
  const widgetHostRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setApplicantName(SCENARIOS[scenarioId].defaultApplicant);
    setApplicantPhone(SCENARIOS[scenarioId].defaultPhone);
  }, [scenarioId]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (!document.querySelector('script[data-postcheck-widget="v1"]')) {
      const script = document.createElement('script');
      script.src = '/widget/v1/postcheck-embed.js';
      script.async = true;
      script.setAttribute('data-postcheck-widget', 'v1');
      document.body.appendChild(script);
    }

    const host = widgetHostRef.current;
    if (host && !host.querySelector('postcheck-address-widget')) {
      const el = document.createElement('postcheck-address-widget');
      el.setAttribute(
        'data-publishable-key',
        'nipost_pk_test_vam_session2_demo'
      );
      el.setAttribute('data-api-endpoint', '/api/postcode');
      el.setAttribute('data-initial-postcode', scenario.sampleCode);
      host.appendChild(el);
    }

    function onVerified(e: Event) {
      const custom = e as CustomEvent<Record<string, unknown>>;
      if (custom.detail && typeof custom.detail === 'object') {
        setWidgetEventPayload(custom.detail);
      }
    }

    window.addEventListener('postcheck:verified', onVerified);
    return () => {
      window.removeEventListener('postcheck:verified', onVerified);
    };
  }, [scenario.sampleCode]);

  const embedCode = `<!-- Same-origin authenticated demo. Requires a signed-in PostCheck session. -->
<postcheck-address-widget
  data-publishable-key="nipost_pk_test_vam_session2_demo"
  data-allowed-origin="https://onboarding.partnerfintech.ng"
  data-api-endpoint="/api/postcode"
  data-initial-postcode="${scenario.sampleCode}"
></postcheck-address-widget>
<script
  src="https://postcheck.viraladmedia.com/widget/v1/postcheck-embed.js"
  async
></script>`;

  function copyEventJson() {
    if (!widgetEventPayload) return;
    navigator.clipboard?.writeText(JSON.stringify(widgetEventPayload, null, 2));
    setCopiedEvent(true);
    setTimeout(() => setCopiedEvent(false), 1800);
  }

  function copyEmbedSnippet() {
    navigator.clipboard?.writeText(embedCode);
    setCopiedEmbed(true);
    setTimeout(() => setCopiedEmbed(false), 1800);
  }

  return (
    <div className="phase2-grid">
      {/* Left: Partner Fintech / Bank Host Checkout Form mounting <postcheck-address-widget> */}
      <Card className="panel">
        <CardHeader className="panel-heading">
          <span className="panel-icon">
            <Building2 size={20} />
          </span>
          <div>
            <CardTitle>{scenario.partnerLabel}</CardTitle>
            <CardDescription>{scenario.slaReplace}</CardDescription>
          </div>
          <CardAction>
            <Badge variant="gold">LIVE WEB COMPONENT</Badge>
          </CardAction>
        </CardHeader>

        <CardContent className="panel-body">
          <fieldset className="onboarding-fieldset">
            <legend className="onboarding-tier-label">
              Select Nigerian partner pilot scenario (Goal G5)
            </legend>
            <div
              className="onboarding-radios"
              role="radiogroup"
              aria-label="Fintech and bank pilot scenarios"
            >
              {(Object.keys(SCENARIOS) as PilotScenarioId[]).map((id) => (
                <label
                  key={id}
                  className={
                    'onboarding-radio-pill' +
                    (scenarioId === id ? ' active' : '')
                  }
                >
                  <input
                    type="radio"
                    name="pilot-scenario"
                    value={id}
                    checked={scenarioId === id}
                    onChange={() => setScenarioId(id)}
                  />
                  <span>{SCENARIOS[id].name}</span>
                </label>
              ))}
            </div>

            <div className="onboarding-grid">
              <div className="onboarding-field">
                <Label htmlFor="pilot-applicant-name">
                  {scenario.applicantLabel}
                </Label>
                <Input
                  id="pilot-applicant-name"
                  name="pilot-applicant-name"
                  value={applicantName}
                  onChange={(e) => setApplicantName(e.target.value)}
                />
              </div>
              <div className="onboarding-field">
                <Label htmlFor="pilot-applicant-phone">
                  Phone number (Test Data)
                </Label>
                <Input
                  id="pilot-applicant-phone"
                  name="pilot-applicant-phone"
                  type="tel"
                  inputMode="tel"
                  value={applicantPhone}
                  onChange={(e) => setApplicantPhone(e.target.value)}
                />
              </div>
            </div>

            {/* Live Shadow-DOM Web Component mounted from /widget/v1/postcheck-embed.js */}
            <div
              ref={widgetHostRef}
              aria-label="Embedded PostCheck Web Component"
            />
          </fieldset>
        </CardContent>

        <CardFooter className="panel-bottom">
          <ShieldCheck size={14} />
          Encapsulated via Shadow DOM (`delegatesFocus: true`) so host bank CSS
          never collides with the NIPOST postcode step.
        </CardFooter>
      </Card>

      {/* Right: Host Application Event Listener & Embed Snippet */}
      <div className="capture-stack">
        <Card className="panel">
          <CardHeader className="panel-heading">
            <span className="panel-icon">
              <Terminal size={20} />
            </span>
            <div>
              <CardTitle>
                Host Bank Event Receiver (<code>postcheck:verified</code>)
              </CardTitle>
              <CardDescription>
                Click &ldquo;Try sample&rdquo; or &ldquo;Verify L1&rdquo; inside
                the widget on the left to watch the host bank receive the real
                DOM custom event.
              </CardDescription>
            </div>
            <CardAction>
              {widgetEventPayload ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={copyEventJson}
                >
                  {copiedEvent ? (
                    <>
                      <Check size={13} /> Copied event
                    </>
                  ) : (
                    <>
                      <Copy size={13} /> Copy event JSON
                    </>
                  )}
                </Button>
              ) : (
                <Badge variant="secondary">LISTENING FOR EVENT</Badge>
              )}
            </CardAction>
          </CardHeader>

          <CardContent className="panel-body">
            {widgetEventPayload ? (
              <div className="bank-compliance-view" aria-live="polite">
                <div className="bank-compliance-head">
                  <div>
                    <span className="eyebrow">
                      EVENT RECEIVED BY {scenario.name.toUpperCase()}
                    </span>
                    <h4>
                       Applicant: {applicantName} · Postcode{' '}
                      <code>{String(widgetEventPayload.postcode ?? '')}</code>
                    </h4>
                  </div>
                  <Badge
                    variant={
                      widgetEventPayload.verdict === 'verified'
                        ? 'success'
                        : 'destructive'
                    }
                  >
                    {String(widgetEventPayload.verdict ?? 'verified')}
                  </Badge>
                </div>
                <pre>
                  {JSON.stringify(
                    {
                      partner_context: {
                        institution: scenario.partnerLabel,
                        applicant_demo: applicantName,
                        phone_demo: applicantPhone,
                        test_data_only: true,
                      },
                      widget_event_detail: widgetEventPayload,
                    },
                    null,
                    2
                  )}
                </pre>
              </div>
            ) : (
              <p className="empty-log-note">
                No <code>postcheck:verified</code> event dispatched yet. Click{' '}
                <strong>Try sample: FC-01-A01-KP-27</strong> inside the widget
                on the left to trigger a live L1 lookup and emit the KYC handoff
                event.
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="panel">
          <CardHeader className="panel-heading">
            <span className="panel-icon">
              <Code2 size={20} />
            </span>
            <div>
              <CardTitle>
                Drop-In Web Component Snippet (<code>/widget/v1/postcheck-embed.js</code>)
              </CardTitle>
              <CardDescription>
                One script tag mounts the Shadow DOM postcode verifier in any
                React, Angular, Vue, or server-rendered bank onboarding page.
              </CardDescription>
            </div>
            <CardAction>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={copyEmbedSnippet}
              >
                {copiedEmbed ? (
                  <>
                    <Check size={13} /> Copied HTML
                  </>
                ) : (
                  <>
                    < ClipboardCheck size={13} /> Copy HTML
                  </>
                )}
              </Button>
            </CardAction>
          </CardHeader>

          <CardContent className="panel-body">
            <div className="bank-compliance-view">
              <pre>{embedCode}</pre>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
