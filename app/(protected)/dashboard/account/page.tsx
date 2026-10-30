import Link from 'next/link';
import { roleFor, canViewOperations, isSuperadmin } from '@/lib/access';
import { currentUser } from '@/lib/supabase/server';
import { AccountMenu } from '@/components/account-menu';
export default async function Account() {
  const user = await currentUser();
  return <div className="pc-auth-shell"><header className="pc-auth-header"><Link href="/dashboard">← Verification dashboard</Link><AccountMenu email={user?.email} /></header><main className="pc-account-main"><section className="pc-auth-card"><h1>Your account</h1><p className="pc-auth-description">Signed in as {user?.email}</p>{user && isSuperadmin(roleFor(user)) && <p><Link href="/dashboard/admin">Superadmin dashboard →</Link></p>}<p>Email verified · Role: {user ? roleFor(user) : "none"}</p>{user && canViewOperations(roleFor(user)) && <p><Link href="/dashboard/operations">Open pilot operations →</Link></p>}<Link href="/forgot-password">Reset your password by email →</Link><p className="pc-auth-footnote">Postcode history stays in this browser, scoped to your account. It is not synced to a database.</p></section></main></div>;
}
