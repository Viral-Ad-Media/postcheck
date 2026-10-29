import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { authConfigured, authConfig } from '@/lib/supabase/config';
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  response.headers.set('Cache-Control', 'private, no-store, max-age=0');
  if (!authConfigured()) return response;
  const { url, key } = authConfig();
  const client = createServerClient(url, key, {
    global: { fetch: (input, init) => fetch(input, { ...init, signal: AbortSignal.timeout(10000) }) },
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(items, cacheHeaders) {
        items.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        items.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        Object.entries(cacheHeaders ?? {}).forEach(([name, value]) => response.headers.set(name, value));
        response.headers.set('Cache-Control', 'private, no-store, max-age=0');
      },
    },
  });
  try { await client.auth.getUser(); } catch { /* Route-level verification fails closed. */ }
  return response;
}
export const config = { matcher: ['/dashboard/:path*', '/api/postcode', '/auth/:path*', '/login', '/signup', '/forgot-password', '/reset-password', '/resend-confirmation'] };
