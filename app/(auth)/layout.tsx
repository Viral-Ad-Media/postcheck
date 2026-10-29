import type { Metadata } from 'next';
import Link from 'next/link';
import { MapPin, ShieldCheck, Check } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
export const metadata: Metadata = { robots: { index: false, follow: false } };
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <div className="pc-auth-shell"><header className="pc-auth-header"><Link href="/" className="mkt-brand"><img src="/icon.svg" width={32} height={32} alt="" />PostCheck<span className="brand-dot">.</span></Link><div><ThemeToggle /><Link href="/">Back to home</Link></div></header><main className="pc-auth-main"><aside className="pc-auth-story"><span className="pc-auth-eyebrow">BUILT FOR NIGERIAN ONBOARDING</span><h2>A clearer address.<br />A better start.</h2><p>One secure workspace to capture, validate, and understand Nigerian postcodes.</p><div className="pc-auth-code"><MapPin size={25} /><span>FC · 01 · A01 · KP · 27</span></div><ul><li><Check size={17} /> Segment-aware postcode search</li><li><Check size={17} /> L1 validation with clear evidence</li><li><ShieldCheck size={17} /> Secure access to your workspace</li></ul><small>A valid postcode is a location reference, not proof of identity or residence.</small></aside>{children}</main><footer className="pc-auth-footer">PostCheck by Viral Ad Media · Built for Nigeria</footer></div>;
}
