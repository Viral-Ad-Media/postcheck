import 'server-only';
import { callNipost } from '@/lib/nipost';
import { allowedWidgetOrigin, createRateLimiter, parseWidgetOrigins } from '@/lib/widget';

// Public, anonymous endpoint for <postcheck-address-widget> on allowlisted partner origins.
// Level 1 lookup only: no account data, no credits, no other NIPOST operations.
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const limit = createRateLimiter();
const baseHeaders = { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', Vary: 'Origin' };

function cors(request: Request) {
  const origin = allowedWidgetOrigin(
    request.headers.get('origin'),
    new URL(request.url).origin,
    parseWidgetOrigins(process.env.POSTCHECK_WIDGET_ORIGINS)
  );
  return origin
    ? { ...baseHeaders, 'Access-Control-Allow-Origin': origin, 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Max-Age': '600' }
    : null;
}

export async function OPTIONS(request: Request) {
  const headers = cors(request);
  return new Response(null, { status: headers ? 204 : 403, headers: headers ?? baseHeaders });
}

export async function POST(request: Request) {
  const headers = cors(request);
  if (!headers) return Response.json({ error: 'Origin not allowed for this widget' }, { status: 403, headers: baseHeaders });
  const client = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const rate = limit(client);
  if (!rate.allowed)
    return Response.json({ error: 'Too many requests. Please wait and retry.' }, { status: 429, headers: { ...headers, 'Retry-After': String(rate.retryAfter) } });
  if (Number(request.headers.get('content-length') || 0) > 1024)
    return Response.json({ error: 'Request too large' }, { status: 413, headers });
  try {
    const raw = await request.text();
    if (raw.length > 1024) return Response.json({ error: 'Request too large' }, { status: 413, headers });
    const body = JSON.parse(raw);
    const code = body?.input?.code;
    if (body?.operation !== 'lookup' || typeof code !== 'string')
      return Response.json({ error: 'Only postcode lookup is supported' }, { status: 400, headers });
    const result = await callNipost('lookup', { code }, process.env.NIPOST_API_KEY);
    return Response.json(result, { status: result.status, headers });
  } catch {
    return Response.json({ error: 'Invalid request body' }, { status: 400, headers });
  }
}
