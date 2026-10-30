'use client';
import Link from 'next/link';
import { useActionState } from 'react';
import { signOut } from '@/app/auth/actions';
import { Button } from '@/components/ui/button';
export function AccountMenu({ email }: { email?: string }) {
  const [state, action, pending] = useActionState(signOut, { message: '' });
  return <div className="pc-account-menu"><Link href="/dashboard/account" title={email}>Account</Link><form action={action}><Button variant="outline" size="sm" disabled={pending}>{pending ? 'Signing out…' : 'Sign out'}</Button></form>{state.message && <span role="alert">{state.message}</span>}</div>;
}
