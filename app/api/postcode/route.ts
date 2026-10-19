import 'server-only';
import { callNipost, runBatch, runSuite, type Operation } from '@/lib/nipost';

export const dynamic = 'force-dynamic';
const headers = {
  'Cache-Control': 'no-store',
  'X-Content-Type-Options': 'nosniff',
};
export const runtime = 'nodejs';
export const maxDuration = 60;

const ALLOWED_OPERATIONS: ReadonlyArray<Operation> = [
  'search',
  'lookup',
  'assemble',
  'disassemble',
  'states',
  'lgas',
  'districts',
  'areas',
  'bad-postcode',
];

const key = () => process.env.NIPOST_API_KEY;

export async function GET() {
  return Response.json(
    {
      configured: !!key()?.startsWith('nipost_test_'),
      environment: 'test',
      level: 1,
    },
    { headers }
  );
}

export async function POST(request: Request) {
  const origin = request.headers.get('origin');
  if (origin && origin !== new URL(request.url).origin)
    return Response.json(
      { error: 'Cross-origin request rejected' },
      { status: 403, headers }
    );
  if (Number(request.headers.get('content-length') || 0) > 4096)
    return Response.json(
      { error: 'Request too large' },
      { status: 413, headers }
    );
  try {
    const raw = await request.text();
    if (raw.length > 4096)
      return Response.json(
        { error: 'Request too large' },
        { status: 413, headers }
      );
    const body = JSON.parse(raw);
    if (body?.operation === 'suite')
      return Response.json({ results: await runSuite(key()) }, { headers });
    if (body?.operation === 'batch') {
      const rawCodes = Array.isArray(body?.input?.codes)
        ? body.input.codes.map((x: unknown) => String(x))
        : [];
      if (rawCodes.length === 0 || rawCodes.length > 10) {
        return Response.json(
          { error: 'Provide between 1 and 10 postcodes for batch audit.' },
          { status: 400, headers }
        );
      }
      return Response.json(
        { items: await runBatch(rawCodes, key()) },
        { headers }
      );
    }
    if (!ALLOWED_OPERATIONS.includes(body?.operation))
      return Response.json(
        { error: 'Unsupported operation' },
        { status: 400, headers }
      );
    const result = await callNipost(
      body.operation as Operation,
      body.input ?? {},
      key()
    );
    return Response.json(result, { status: result.status, headers });
  } catch {
    return Response.json(
      { error: 'Invalid request body' },
      { status: 400, headers }
    );
  }
}
