import { AuthForm } from '@/components/auth-form';
import { authConfigured } from '@/lib/auth/config';
export const dynamic = 'force-dynamic';
export default async function Page({searchParams}: {searchParams: Promise<Record<string, string | undefined>>}) {
  const params = await searchParams;
  const notice = params.confirmed === 'success' ? 'Email confirmed. You can now sign in.' : params.error === 'link' ? 'This link is invalid or expired. Request a fresh link and open it in the same browser where you started.' : params.reset === 'success' ? 'Password updated. Sign in with your new password.' : undefined;
  return <AuthForm mode="login" configured={authConfigured()} notice={notice} />;
}
