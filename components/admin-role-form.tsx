'use client';
import { useActionState } from 'react';
import { changeRole } from '@/app/(protected)/dashboard/admin/actions';
export function AdminRoleForm({id,role,email}:{id:string;role:string;email:string}) {
 const [state,action,pending]=useActionState(changeRole,{message:''});
 return <form action={action} className="pc-admin-role-form"><input type="hidden" name="userId" value={id}/><select aria-label={`Role for ${email}`} name="role" defaultValue={role} disabled={pending}>{['owner','build_lead','qa','demo_editor','participant','disabled'].map(r=><option key={r} value={r}>{r}</option>)}</select><input aria-label={`Reason for changing ${email}`} name="reason" required minLength={8} maxLength={500} placeholder="Reason for role change" disabled={pending}/><button disabled={pending}>{pending?'Saving…':'Save role'}</button><p role="status">{state.message}</p></form>;
}
