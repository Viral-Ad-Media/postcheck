import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { currentUser, createClient } from '@/lib/supabase/server';
import { isSuperadmin, roleFor } from '@/lib/access';
import { AccountMenu } from '@/components/account-menu';
import { AdminRoleForm } from '@/components/admin-role-form';
type AdminSnapshot={total:number;confirmed:number;disabled:number;users:Array<{id:string;email:string;role:string;created_at:string;email_confirmed_at:string|null}>;audit:Array<{id:number;actor_id:string;target_id:string;old_role:string;new_role:string;reason:string;created_at:string}>};
export default async function Admin({searchParams}:{searchParams:Promise<{page?:string}>}) {
 const user=await currentUser();
 if(!user) redirect('/login');
 if(!isSuperadmin(roleFor(user))) notFound();
 const {page:raw}=await searchParams;
 const page=/^\d+$/.test(raw||'')?Math.min(Number(raw),100000):0;
 let snapshot:AdminSnapshot|null=null;
 try {const {data,error}=await (await createClient()).rpc('postcheck_admin_snapshot',{page_number:page});if(!error && data) snapshot=data as AdminSnapshot;} catch {}
 return <div className="pc-auth-shell"><header className="pc-auth-header"><Link href="/dashboard">PostCheck.</Link><AccountMenu email={user.email}/></header><main className="pc-ops"><span className="pc-auth-eyebrow">SUPERADMIN</span><h1>Manage PostCheck</h1><p>Signed in as {user.email}. Review accounts, manage application roles, and oversee the pilot.</p><p><Link href="/dashboard/operations">Pilot KPIs, budget and access matrix →</Link></p>
 {!snapshot ? <section role="alert"><h2>Account directory unavailable</h2><p>Unable to load administration data. Confirm the database migration and connection, then reload. No account changes have been made.</p></section> : <>
 <div className="pc-admin-grid"><div className="pc-admin-card">Total accounts<strong>{snapshot.total}</strong></div><div className="pc-admin-card">Email confirmed<strong>{snapshot.confirmed}</strong></div><div className="pc-admin-card">Application access disabled<strong>{snapshot.disabled}</strong></div></div>
 <section><h2>Accounts</h2><p>Role changes take effect on subsequent server requests. Disabling app access does not remove platform memberships or erase browser-local history. Superadmin roles cannot be changed here.</p><div className="pc-ops-scroll"><table><thead><tr><th>Account</th><th>Email status</th><th>Role</th><th>Change role</th></tr></thead><tbody>{snapshot.users.map(u=><tr key={u.id}><td>{u.email}<small style={{display:'block'}}>{u.id}</small></td><td>{u.email_confirmed_at?'Confirmed':'Pending confirmation'}</td><td>{u.role}</td><td>{u.role==='superadmin'||u.id===user.id?'Protected account':<AdminRoleForm id={u.id} email={u.email} role={u.role}/>}</td></tr>)}</tbody></table></div><nav aria-label="Account pages">{page>0&&<Link href={`/dashboard/admin?page=${page-1}`}>← Previous</Link>} <span>Page {page+1}</span> {(page+1)*25<snapshot.total&&<Link href={`/dashboard/admin?page=${page+1}`}>Next →</Link>}</nav></section>
 <section><h2>Recent role changes</h2>{snapshot.audit.length===0?<p>No role changes recorded through this dashboard.</p>:<div className="pc-ops-scroll"><table><thead><tr><th>Time (UTC)</th><th>Actor / target</th><th>Change</th><th>Reason</th></tr></thead><tbody>{snapshot.audit.map(a=><tr key={a.id}><td>{new Date(a.created_at).toISOString()}</td><td>{a.actor_id}<br/>{a.target_id}</td><td>{a.old_role} → {a.new_role}</td><td>{a.reason}</td></tr>)}</tbody></table></div>}</section>
 </>}
 </main></div>;
}
