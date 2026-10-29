'use client';
import Link from 'next/link';
import { useActionState, useState } from 'react';
import { Eye, EyeOff, Loader2, ArrowRight, ShieldCheck } from 'lucide-react';
import { authenticate } from '@/app/auth/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
const titles: Record<string, string> = { login: 'Welcome back.', signup: 'Your workspace starts here.', 'forgot-password': 'Let’s get you back in.', 'reset-password': 'A fresh start.', 'resend-confirmation': 'Confirm your email.' };
const descriptions: Record<string, string> = { login: 'Sign in to verify postcodes and continue your work.', signup: 'Create an account to explore postcode-first onboarding.', 'forgot-password': 'Enter your email and we’ll send you a reset link.', 'reset-password': 'Choose a strong new password for your account.', 'resend-confirmation': 'Request a fresh confirmation link for your account.' };
export function AuthForm({ mode, configured, notice }: { mode: string; configured: boolean; notice?: string }) {
  const [state, action, pending] = useActionState(authenticate.bind(null, mode), { message: '' });
  const [visible, setVisible] = useState(false);
  const needsPassword = ['login', 'signup', 'reset-password'].includes(mode);
  const newPassword = mode === 'signup' || mode === 'reset-password';
  return <section className="pc-auth-card" aria-labelledby="auth-title">
    <span className="pc-auth-eyebrow"><ShieldCheck size={15} /> YOUR POSTCHECK ACCOUNT</span>
    <h1 id="auth-title">{titles[mode]}</h1><p className="pc-auth-description">{descriptions[mode]}</p>
    {!configured && <p className="pc-auth-notice" role="alert">Authentication is being configured. Please try again shortly.</p>}
    {notice && <p className="pc-auth-notice" role="status">{notice}</p>}
    <form action={action} className="pc-auth-form">
      {mode !== 'reset-password' && <div className="pc-auth-field"><Label htmlFor="email">Email address</Label><Input id="email" name="email" type="email" autoComplete="email" placeholder="you@company.com" maxLength={254} required disabled={pending} /></div>}
      {needsPassword && <div className="pc-auth-field"><Label htmlFor="password">{newPassword ? 'New password' : 'Password'}</Label><div className="pc-auth-password"><Input id="password" name="password" type={visible ? 'text' : 'password'} autoComplete={newPassword ? 'new-password' : 'current-password'} minLength={newPassword ? 12 : 1} maxLength={128} required disabled={pending} aria-describedby={newPassword ? 'password-help' : undefined} /><button type="button" onClick={() => setVisible(!visible)} aria-label={visible ? 'Hide password' : 'Show password'} aria-pressed={visible}>{visible ? <EyeOff size={18} /> : <Eye size={18} />}</button></div>{newPassword && <small id="password-help">Use at least 12 characters. A memorable passphrase works well.</small>}</div>}
      {newPassword && <div className="pc-auth-field"><Label htmlFor="confirm">Confirm password</Label><Input id="confirm" name="confirm" type={visible ? 'text' : 'password'} autoComplete="new-password" minLength={12} maxLength={128} required disabled={pending} /></div>}
      {mode === 'login' && <Link className="pc-auth-forgot" href="/forgot-password">Forgot password?</Link>}
      {state.message && <p className="pc-auth-notice" role={state.success ? 'status' : 'alert'}>{state.message}</p>}
      <Button type="submit" size="lg" disabled={pending || !configured} className="pc-auth-submit">{pending ? <><Loader2 className="spin" size={17} /> Please wait…</> : <>{mode === 'login' ? 'Sign in' : mode === 'signup' ? 'Create account' : mode === 'reset-password' ? 'Update password' : 'Send email link'}<ArrowRight size={16} /></>}</Button>
    </form>
    <div className="pc-auth-links">{mode === 'login' ? <><span>New to PostCheck? <Link href="/signup">Create an account</Link></span><Link href="/resend-confirmation">Resend confirmation email</Link></> : <Link href="/login">Back to sign in</Link>}</div>
    <p className="pc-auth-footnote">We use your email to manage your account. <Link href="/privacy">Privacy details</Link></p>
  </section>;
}
