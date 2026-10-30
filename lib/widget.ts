/** Partner embed access: an origin allowlist plus a best-effort per-client rate limit. */
export function parseWidgetOrigins(raw: string | undefined): string[] {
  return (raw ?? '')
    .split(',')
    .map((item) => {
      try {
        const url = new URL(item.trim());
        return url.protocol === 'https:' || url.hostname === 'localhost' ? url.origin.toLowerCase() : '';
      } catch {
        return '';
      }
    })
    .filter(Boolean);
}

/** Returns the origin to echo in CORS headers, or null when the caller is not allowed. */
export function allowedWidgetOrigin(origin: string | null, siteOrigin: string, allowlist: ReadonlyArray<string>): string | null {
  if (!origin) return null;
  let normalized: string;
  try { normalized = new URL(origin).origin.toLowerCase(); } catch { return null; }
  if (normalized === siteOrigin.toLowerCase()) return origin;
  return allowlist.includes(normalized) ? origin : null;
}

export const WIDGET_RATE_LIMIT = { max: 30, windowMs: 60_000 };

export function createRateLimiter({ max, windowMs } = WIDGET_RATE_LIMIT) {
  const hits = new Map<string, { count: number; resetAt: number }>();
  return (client: string, now = Date.now()) => {
    if (hits.size > 5000) for (const [k, v] of hits) if (v.resetAt <= now) hits.delete(k);
    const entry = hits.get(client);
    if (!entry || entry.resetAt <= now) {
      hits.set(client, { count: 1, resetAt: now + windowMs });
      return { allowed: true, retryAfter: 0 };
    }
    entry.count++;
    return entry.count > max
      ? { allowed: false, retryAfter: Math.ceil((entry.resetAt - now) / 1000) }
      : { allowed: true, retryAfter: 0 };
  };
}
