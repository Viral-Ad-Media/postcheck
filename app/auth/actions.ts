'use server';
import { createClient } from '@/lib/supabase/server';
import { runAuthFlow, type AuthState } from '@/lib/auth-flow';
import { redirect } from 'next/navigation';
export async function authenticate(mode: string, _previous: AuthState, form: FormData): Promise<AuthState> {
  let result: AuthState;
  try {
    const origin = new URL(process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')).origin;
    result = await runAuthFlow(mode, form, await createClient(), origin);
  } catch { return { message: 'Authentication is temporarily unavailable. Please try again later.' }; }
  if (result.destination) redirect(result.destination);
  return result;
}
export async function signOut(_previous: AuthState, _form: FormData): Promise<AuthState> {
  try {
    const { error } = await (await createClient()).auth.signOut();
    if (error) return { message: 'Unable to sign out. Please try again.' };
  } catch { return { message: 'Unable to sign out. Please try again.' }; }
  redirect('/login');
}
