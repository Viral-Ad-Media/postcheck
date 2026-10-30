import Link from 'next/link';
import { PilotDemo } from '@/components/pilot-demo';
import { AccountMenu } from '@/components/account-menu';
export default function PilotWorkspace() {
  return <div className="pc-auth-shell"><header className="pc-auth-header"><Link href="/dashboard">← Verification dashboard</Link><AccountMenu /></header><main className="pc-pilot-main"><h1>Fintech pilot workspace</h1><p>Authenticated, same-origin widget demonstration. Use test data only.</p><PilotDemo /></main></div>;
}
