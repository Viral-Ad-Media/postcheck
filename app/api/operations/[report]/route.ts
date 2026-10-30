import { currentUser } from '@/lib/supabase/server';
import { roleFor, canDownload } from '@/lib/access';
import { reportCsv } from '@/lib/pilot-plan';
export const dynamic = 'force-dynamic';
export async function GET(_request: Request, { params }: { params: Promise<{ report: string }> }) {
 const headers = { 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff' };
 const user = await currentUser();
 if (!user) return Response.json({ error: 'Sign in required' }, { status: 401, headers });
 const { report } = await params;
 if (!canDownload(roleFor(user), report)) return Response.json({ error: 'Access denied' }, { status: 403, headers });
 const body = reportCsv(report);
 if (!body) return Response.json({ error: 'Report not found' }, { status: 404, headers });
 return new Response(body, { headers: { ...headers, 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="postcheck-${report}.csv"` } });
}
