import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { callbackDestination } from '@/lib/auth-flow';
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  const next = callbackDestination(request.nextUrl.searchParams.get('next'));
  const headers = { 'Cache-Control': 'private, no-store', 'Referrer-Policy': 'no-referrer' };
  if (code) {
    try {
      const client = await createClient();
      const { error } = await client.auth.exchangeCodeForSession(code);
      if (!error) return NextResponse.redirect(new URL(next, request.url), { headers });
    } catch { /* Never expose tokens or provider error details. */ }
  }
  return NextResponse.redirect(new URL('/login?error=link', request.url), { headers });
}
