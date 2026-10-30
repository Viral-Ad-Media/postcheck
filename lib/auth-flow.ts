import type { SupabaseClient } from '@supabase/supabase-js';
export type AuthState = { message: string; success?: boolean; destination?: string };
export function callbackDestination(next: string | null) {
  return next === '/reset-password' ? '/reset-password' : '/dashboard';
}
export async function runAuthFlow(mode: string, form: FormData, client: Pick<SupabaseClient, 'auth'>, origin: string): Promise<AuthState> {
  const email = String(form.get('email') ?? '').trim();
  const password = String(form.get('password') ?? '');
  const modes = ['login', 'signup', 'forgot-password', 'reset-password', 'resend-confirmation'];
  if (!modes.includes(mode)) return { message: 'Invalid request.' };
  if (mode !== 'reset-password' && (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) return { message: 'Enter a valid email address.' };
  const needsPassword = ['login', 'signup', 'reset-password'].includes(mode);
  const newPassword = ['signup', 'reset-password'].includes(mode);
  if (needsPassword && (!password || password.length > 128)) return { message: 'Enter your password (maximum 128 characters).' };
  if (newPassword && password.length < 12) return { message: 'Use at least 12 characters for your password.' };
  if (newPassword && password !== form.get('confirm')) return { message: 'Passwords do not match.' };
  const callback = new URL('/auth/callback', origin).href;
  if (mode === 'login') {
    const { data, error } = await client.auth.signInWithPassword({ email, password });
    if (error || !data.user?.email_confirmed_at) return { message: 'Unable to sign in. Check your credentials and confirm your email.' };
    return { message: '', destination: '/dashboard' };
  }
  if (mode === 'signup') {
    const { error } = await client.auth.signUp({ email, password, options: { emailRedirectTo: callback } });
    if (error) return { message: 'Unable to create an account. Please try again later or sign in if you already registered.' };
    return { success: true, message: 'Check your inbox for a confirmation link. If you already have an account, sign in instead.' };
  }
  if (mode === 'resend-confirmation') {
    const { error } = await client.auth.resend({ type: 'signup', email, options: { emailRedirectTo: callback } });
    if (error) return { message: 'Unable to request an email right now. Please wait and try again.' };
    return { success: true, message: 'If confirmation is needed for this account, a new link will be sent to your inbox.' };
  }
  if (mode === 'forgot-password') {
    const { error } = await client.auth.resetPasswordForEmail(email, { redirectTo: callback + '?next=/reset-password' });
    if (error) return { message: 'Unable to request a reset email right now. Please wait and try again.' };
    return { success: true, message: 'If an account exists for this email, you will receive a password reset link.' };
  }
  const { data, error: authError } = await client.auth.getUser();
  if (authError || !data.user?.email_confirmed_at) return { message: 'Your reset session is invalid or expired. Request a new reset link.' };
  const { error } = await client.auth.updateUser({ password });
  if (error) return { message: 'Unable to update your password. Try a different password or request a new reset link.' };
  const { error: signOutError } = await client.auth.signOut({ scope: 'global' });
  if (signOutError) return { success: true, message: 'Password updated, but we could not sign out other sessions. Please try signing out again.' };
  return { message: '', destination: '/login?reset=success' };
}
