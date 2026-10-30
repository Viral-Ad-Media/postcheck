/**
 * PostCheck Embeddable Onboarding Widget v1 (/widget/v1/postcheck-embed.js)
 * Built by Viral Ad Media (Lagos Team) for NIPOST Postcode API v1.
 *
 * Usage:
 *   <postcheck-address-widget
 *     data-publishable-key="nipost_pk_test_vam_session2_demo"
 *   ></postcheck-address-widget>
 *   <script src="https://postcheck-nine.vercel.app/widget/v1/postcheck-embed.js" async></script>
 *
 * Lookups go to /api/widget on the host that served this script. That host only
 * answers origins listed in its POSTCHECK_WIDGET_ORIGINS setting. Override with
 * data-api-endpoint if needed.
 */
(function () {
  if (typeof window === 'undefined' || typeof HTMLElement === 'undefined') {
    return;
  }

  const SAMPLE_CODE = 'FC-01-A01-KP-27';

  const scriptEl =
    document.currentScript ||
    document.querySelector('script[src*="/widget/v1/postcheck-embed.js"]');
  let DEFAULT_ENDPOINT = '/api/widget';
  try {
    if (scriptEl && scriptEl.src) {
      DEFAULT_ENDPOINT = new URL('/api/widget', scriptEl.src).href;
    }
  } catch {
    /* Keep the relative default. */
  }

  // Shared constructed stylesheet across all widget instances (modern-web-guidance: shadow-dom)
  const styles = `
    :host {
      display: block;
      font-family: "DM Sans", system-ui, -apple-system, sans-serif;
      color: #16161e;
    }
    .pc-widget {
      border: 1.5px solid #e4e5ea;
      border-radius: 14px;
      background: #ffffff;
      padding: 18px;
      box-shadow: 0 2px 10px rgba(22, 22, 30, 0.04);
    }
    .pc-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      margin-bottom: 12px;
    }
    .pc-badge {
      font-family: "JetBrains Mono", ui-monospace, monospace;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      padding: 3px 8px;
      border-radius: 999px;
      background: rgba(235, 199, 0, 0.18);
      color: #1a1a2c;
      border: 1px solid #d6b500;
    }
    .pc-badge.ok {
      background: #eaf5ee;
      color: #0e7a43;
      border-color: #dcebe1;
    }
    .pc-badge.err {
      background: rgba(198, 42, 32, 0.1);
      color: #c62a20;
      border-color: rgba(198, 42, 32, 0.25);
    }
    .pc-label {
      display: block;
      font-size: 12.5px;
      font-weight: 600;
      color: #16161e;
      margin-bottom: 6px;
    }
    .pc-row {
      display: flex;
      gap: 8px;
      align-items: center;
    }
    .pc-input {
      flex: 1;
      height: 42px;
      padding: 0 12px;
      border-radius: 10px;
      border: 1.5px solid #e4e5ea;
      background: #f7f7f9;
      font-family: "JetBrains Mono", ui-monospace, monospace;
      font-size: 13.5px;
      color: #16161e;
    }
    .pc-input:focus-visible {
      outline: 3px solid #ebc700;
      outline-offset: 2px;
      background: #ffffff;
    }
    .pc-btn {
      height: 42px;
      padding: 0 16px;
      border-radius: 999px;
      border: 1px solid #d6b500;
      background: linear-gradient(160deg, #f6dc4d, #ebc700 55%, #e0be00);
      color: #1a1a2c;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
    }
    .pc-btn:disabled {
      opacity: 0.55;
      cursor: not-allowed;
    }
    .pc-btn:focus-visible,
    .pc-sample-btn:focus-visible {
      outline: 3px solid #ebc700;
      outline-offset: 2px;
    }
    .pc-subrow {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 8px;
      font-size: 11.5px;
      color: #5a5b66;
    }
    .pc-sample-btn {
      font-family: "JetBrains Mono", ui-monospace, monospace;
      font-size: 11px;
      font-weight: 600;
      padding: 3px 9px;
      border-radius: 999px;
      border: 1px solid #e4e5ea;
      background: #f7f7f9;
      color: #16161e;
      cursor: pointer;
    }
    .pc-segments {
      list-style: none;
      margin: 12px 0 0;
      padding: 0;
      display: grid;
      grid-template-columns: repeat(5, minmax(0, 1fr));
      gap: 6px;
    }
    .pc-seg {
      padding: 6px 4px;
      border-radius: 8px;
      background: #f7f7f9;
      border: 1px solid #e4e5ea;
      text-align: center;
    }
    .pc-seg small {
      display: block;
      font-size: 9px;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: #6a6c75;
    }
    .pc-seg strong {
      font-family: "JetBrains Mono", ui-monospace, monospace;
      font-size: 12.5px;
      color: #16161e;
    }
    .pc-status {
      margin: 10px 0 0;
      font-size: 12px;
      line-height: 1.5;
      color: #5a5b66;
    }
    .pc-foot {
      margin: 10px 0 0;
      padding-top: 8px;
      border-top: 1px solid #eeeff3;
      font-size: 10.5px;
      color: #6a6c75;
    }
  `;

  let sharedSheet = null;
  if (
    typeof CSSStyleSheet !== 'undefined' &&
    'replaceSync' in CSSStyleSheet.prototype
  ) {
    sharedSheet = new CSSStyleSheet();
    sharedSheet.replaceSync(styles);
  }

  // Module-scoped template cloned once per widget instance (modern-web-guidance: shadow-dom)
  const widgetTemplate = document.createElement('template');
  widgetTemplate.innerHTML = `
    <div class="pc-widget" part="card">
      <div class="pc-head">
        <label class="pc-label" for="pc-postcode-input">
          NIPOST 5-Segment Postcode (PostCheck Widget)
        </label>
        <span class="pc-badge" id="pc-verdict-badge">READY · L1</span>
      </div>
      <div class="pc-row">
        <input
          id="pc-postcode-input"
          class="pc-input"
          type="text"
          name="nipost-postcode"
          autocomplete="postal-code"
          autocorrect="off"
          autocapitalize="characters"
          spellcheck="false"
          maxlength="64"
          placeholder="e.g. FC-01-A01-KP-27"
          aria-describedby="pc-help-text pc-status-msg"
        />
        <button type="button" class="pc-btn" id="pc-verify-btn">
          Verify L1
        </button>
      </div>
      <div class="pc-subrow">
        <span id="pc-help-text">State · LGA · District · Area · Building Unit</span>
        <button type="button" class="pc-sample-btn" id="pc-sample-btn">
          Try sample: FC-01-A01-KP-27
        </button>
      </div>
      <ul class="pc-segments" id="pc-segments-list" role="list" aria-label="Decoded postcode segments" hidden></ul>
      <p class="pc-status" id="pc-status-msg" aria-live="polite">
        Enter a 5-segment Nigerian postcode to verify against NIPOST Level 1.
      </p>
      <p class="pc-foot">
        Honesty rule: a valid postcode confirms a location reference; identity (BVN/NIN) and proof of residence remain separate checks.
      </p>
    </div>
  `;

  function parseFiveSegments(raw) {
    const clean = String(raw || '')
      .replace(/[ -]/g, '')
      .toUpperCase();
    if (!/^[A-Z]{2}[0-9]{2}[A-Z0-9]{3}[A-Z]{2}[0-9]{2}$/.test(clean)) {
      return null;
    }
    const state = clean.slice(0, 2);
    const lga = clean.slice(2, 4);
    const district = clean.slice(4, 7);
    const area = clean.slice(7, 9);
    const unit = clean.slice(9, 11);
    return {
      canonical: clean,
      dashed: `${state}-${lga}-${district}-${area}-${unit}`,
      display: `${state} ${lga} ${district} ${area} ${unit}`,
      segments: { state, lga, district, area, unit },
    };
  }

  class PostcheckAddressWidget extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open', delegatesFocus: true });
      if (sharedSheet && 'adoptedStyleSheets' in this.shadowRoot) {
        this.shadowRoot.adoptedStyleSheets = [sharedSheet];
      } else {
        const styleEl = document.createElement('style');
        styleEl.textContent = styles;
        this.shadowRoot.append(styleEl);
      }
      this.shadowRoot.append(widgetTemplate.content.cloneNode(true));
    }

    connectedCallback() {
      const inputEl = this.shadowRoot.getElementById('pc-postcode-input');
      const verifyBtn = this.shadowRoot.getElementById('pc-verify-btn');
      const sampleBtn = this.shadowRoot.getElementById('pc-sample-btn');

      if (!inputEl || !verifyBtn || !sampleBtn) return;

      const initialCode = this.getAttribute('data-initial-postcode');
      if (initialCode) {
        inputEl.value = initialCode;
      }

      verifyBtn.addEventListener('click', () => {
        this.verifyPostcode(inputEl.value);
      });

      inputEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.isComposing) {
          e.preventDefault();
          this.verifyPostcode(inputEl.value);
        }
      });

      sampleBtn.addEventListener('click', () => {
        inputEl.value = SAMPLE_CODE;
        this.verifyPostcode(SAMPLE_CODE);
      });
    }

    async verifyPostcode(rawInput) {
      const code = String(rawInput || '').trim();
      const badgeEl = this.shadowRoot.getElementById('pc-verdict-badge');
      const statusEl = this.shadowRoot.getElementById('pc-status-msg');
      const segListEl = this.shadowRoot.getElementById('pc-segments-list');
      const verifyBtn = this.shadowRoot.getElementById('pc-verify-btn');

      if (!code) {
        statusEl.textContent = 'Enter a 5-segment postcode first.';
        return;
      }

      const endpoint = this.getAttribute('data-api-endpoint') || DEFAULT_ENDPOINT;
      const pubKey =
        this.getAttribute('data-publishable-key') ||
        'nipost_pk_test_vam_session2_demo';

      verifyBtn.disabled = true;
      badgeEl.className = 'pc-badge';
      badgeEl.textContent = 'CHECKING L1…';
      statusEl.textContent = 'Contacting PostCheck NIPOST L1 gateway…';

      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            operation: 'lookup',
            input: { code, level: 1 },
          }),
        });
        const body = await res.json().catch(() => ({}));
        if (res.status === 403 || res.status === 429) {
          badgeEl.className = 'pc-badge err';
          badgeEl.textContent = res.status === 403 ? 'NOT ENABLED' : 'TRY AGAIN SOON';
          statusEl.textContent =
            res.status === 403
              ? 'This site is not yet enabled for PostCheck verification.'
              : 'Too many checks from this device. Please wait a minute and retry.';
          return;
        }
        const fmt = parseFiveSegments(body?.data?.postcode || code);
        const isVerified =
          body?.ok &&
          (body?.data?.valid === true || body?.data?.status === 'not_found');

        if (fmt) {
          segListEl.innerHTML = '';
          const labels = [
            ['State', fmt.segments.state],
            ['LGA', fmt.segments.lga],
            ['District', fmt.segments.district],
            ['Area', fmt.segments.area],
            ['Unit', fmt.segments.unit],
          ];
          for (const [lbl, val] of labels) {
            const li = document.createElement('li');
            li.className = 'pc-seg';
            const sm = document.createElement('small');
            sm.textContent = lbl;
            const st = document.createElement('strong');
            st.textContent = val;
            li.append(sm, st);
            segListEl.append(li);
          }
          segListEl.hidden = false;
        } else {
          segListEl.hidden = true;
        }

        badgeEl.className = 'pc-badge ' + (isVerified ? 'ok' : 'err');
        badgeEl.textContent = isVerified
          ? 'VERIFIED · L1'
          : 'NOT VERIFIED';
        statusEl.textContent = isVerified
          ? `Canonical NIPOST postcode ${fmt ? fmt.dashed : code} verified at Level 1 (${body.durationMs || 0} ms).`
          : body?.error?.message ||
            'NIPOST rejected this input as an invalid postcode format.';

        const handoffPayload = {
          postcode: fmt ? fmt.dashed : code,
          display: fmt ? fmt.display : code,
          compact: fmt ? fmt.canonical : code,
          segments: fmt ? fmt.segments : null,
          verdict: isVerified ? 'verified' : 'not_verified',
          level: 1,
          publishable_key: pubKey,
          checked_at: body?.at || new Date().toISOString(),
          duration_ms: body?.durationMs || 0,
          source: 'NIPOST Postcode API — test environment',
          api_response: body?.data || body?.error || null,
        };

        const evt = new CustomEvent('postcheck:verified', {
          bubbles: true,
          composed: true,
          detail: handoffPayload,
        });
        this.dispatchEvent(evt);
        window.dispatchEvent(
          new CustomEvent('postcheck:verified', { detail: handoffPayload })
        );
      } catch {
        badgeEl.className = 'pc-badge err';
        badgeEl.textContent = 'NETWORK ERROR';
        statusEl.textContent =
          'Could not reach PostCheck verification. Please retry. If this continues, this site may not be enabled for the widget yet.';
      } finally {
        verifyBtn.disabled = false;
      }
    }
  }

  if (!customElements.get('postcheck-address-widget')) {
    customElements.define('postcheck-address-widget', PostcheckAddressWidget);
  }

  // Also upgrade any <div id="postcheck-address-step"> container automatically
  function upgradeLegacyMountContainers() {
    const legacyEl = document.getElementById('postcheck-address-step');
    if (
      legacyEl &&
      !legacyEl.querySelector('postcheck-address-widget')
    ) {
      const widget = document.createElement('postcheck-address-widget');
      for (const attr of legacyEl.getAttributeNames()) {
        if (attr.startsWith('data-')) {
          widget.setAttribute(attr, legacyEl.getAttribute(attr) || '');
        }
      }
      legacyEl.append(widget);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', upgradeLegacyMountContainers);
  } else {
    upgradeLegacyMountContainers();
  }
})();
