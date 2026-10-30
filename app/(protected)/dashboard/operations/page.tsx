import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { currentUser } from '@/lib/supabase/server';
import { roleFor, canViewOperations, canViewBudget } from '@/lib/access';
import { kpis, budget, accessMatrix, acceptance } from '@/lib/pilot-plan';
import { AccountMenu } from '@/components/account-menu';
export default async function Operations() {
 const user = await currentUser();
 if (!user) redirect('/login');
 const role = roleFor(user);
 if (!canViewOperations(role)) notFound();
 return <div className="pc-auth-shell"><header className="pc-auth-header"><Link href="/dashboard">← Verification dashboard</Link><AccountMenu email={user.email}/></header><main className="pc-ops">
 <span className="pc-auth-eyebrow">FOUR-WEEK PILOT · INTERNAL PLANNING</span><h1>Pilot operations</h1><p>Proposed targets and work-package fees. Actual results are not yet recorded. Download the editable CSV templates to track evidence and approvals.</p>
 <div className="pc-ops-banner">Demo due October 30, 2026 · Application due November 2, 2026. These dates follow the project brief; confirm the organizer’s submission cutoff before sending.</div>
 <section><h2>KPI scorecard</h2><a href="/api/operations/kpis">Download KPI tracker (CSV)</a><div className="pc-ops-scroll"><table><thead><tr>{['KPI','Proposed target','Owner','Due / cadence','Evidence'].map(x=><th key={x}>{x}</th>)}</tr></thead><tbody>{kpis.map(([id,...cells])=><tr key={id}>{cells.map((cell,i)=><td key={i}>{cell}</td>)}</tr>)}</tbody></table></div></section>
 {canViewBudget(role) && <section><h2>Budget proposal · NGN</h2><a href="/api/operations/budget">Download proposed budget (CSV)</a><p>Unapproved fixed-scope contractor fees. Previously completed work requires a separate agreement. No payment is initiated here.</p><div className="pc-ops-scroll"><table><thead><tr><th>Work package</th><th>Proposed fee</th><th>Acceptance basis</th></tr></thead><tbody>{budget.map(([name,fee,basis])=><tr key={name}><td>{name}</td><td>₦{fee.toLocaleString('en-NG')}</td><td>{basis}</td></tr>)}</tbody></table></div><p><strong>Subtotal ₦490,000 · reserve ₦49,000 · ceiling ₦539,000.</strong> Platform charges and applicable taxes excluded. Proposed milestones: 30% scope acceptance, 40% reviewable delivery, 30% accepted handover.</p></section>}
 <section><h2>Access matrix</h2><a href="/api/operations/access">Download access matrix (CSV)</a><p>Application roles do not grant GitHub, Vercel, or Supabase organization permissions. No shared customer database is enabled.</p><div className="pc-ops-scroll"><table><thead><tr>{['Role','Verification','Operations','Budget','Data scope','Infrastructure'].map(x=><th key={x}>{x}</th>)}</tr></thead><tbody>{accessMatrix.map(([role,...cells])=><tr key={role}><th scope="row">{role}</th>{cells.map((cell,i)=><td key={i}>{cell}</td>)}</tr>)}</tbody></table></div></section>
 <section><h2>Release acceptance</h2><a href="/api/operations/acceptance">Download acceptance checklist (CSV)</a><ul>{acceptance.map(([id,name,procedure])=><li key={id}><strong>{name}:</strong> {procedure}</li>)}</ul><p>Record real results before marking any check passed. A valid postcode is a location reference, not proof of identity or residence.</p></section>
 </main></div>;
}
