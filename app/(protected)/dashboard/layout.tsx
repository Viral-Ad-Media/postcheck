import type { Metadata } from 'next';
import { currentUser } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Dashboard', robots: { index: false, follow: false } };
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  if (!await currentUser()) redirect('/login');
  return children;
}
