import Link from 'next/link';
import { AuthForm } from '@/components/auth-form';
import { currentUser } from '@/lib/supabase/server';
export const dynamic = 'force-dynamic';
export default async function ResetPassword() {
  if (!await currentUser()) return <section className="pc-auth-card"><h1>Open your reset link.</h1><p className="pc-auth-description">Use the link in your email in the same browser where you requested it. If it has expired, request a new one.</p><Link href="/forgot-password">Request a new reset link →</Link></section>;
  return <AuthForm mode="reset-password" configured />;
}
