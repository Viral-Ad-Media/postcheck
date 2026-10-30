import type { Metadata } from 'next';
import { currentUser } from '@/lib/supabase/server';
import { roleFor, canVerify } from '@/lib/access';
import { redirect } from 'next/navigation';
export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Dashboard', robots: { index: false, follow: false } };
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await currentUser();
  if (!user) redirect('/login');
  if (!canVerify(roleFor(user))) return <main className="pc-account-main"><h1>Workspace access unavailable</h1><p>Your account does not have access to verification tools. Contact the project owner.</p><a href="/">Return to public pages</a></main>;
  return children;
}
