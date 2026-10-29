import 'server-only';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { cache } from 'react';
import { authConfigured, authConfig } from './config';
export async function createClient() {
  const { url, key } = authConfig();
  const jar = await cookies();
  return createServerClient(url, key, {
    global: { fetch: (input, init) => fetch(input, { ...init, signal: AbortSignal.timeout(10000) }) },
    cookies: {
      getAll: () => jar.getAll(),
      setAll(items) {
        try { items.forEach(({ name, value, options }) => jar.set(name, value, options)); }
        catch { /* Server Components cannot write cookies. Proxy refreshes the session. */ }
      },
    },
  });
}
// Verify with the auth server; never authorize from cookie contents or getSession().
export const currentUser = cache(async () => {
  if (!authConfigured()) return null;
  try {
    const client = await createClient();
    const { data, error } = await client.auth.getUser();
    return error || !data.user?.email_confirmed_at ? null : data.user;
  } catch { return null; }
});
