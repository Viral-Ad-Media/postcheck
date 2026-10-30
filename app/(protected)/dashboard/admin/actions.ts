'use server';
import { currentUser, createClient } from '@/lib/supabase/server';
import { isSuperadmin, roleFor } from '@/lib/access';
import { revalidatePath } from 'next/cache';
export async function changeRole(_previous: {message:string}, form: FormData) {
 const user=await currentUser();
 if(!user || !isSuperadmin(roleFor(user))) return {message:'Access denied.'};
 const target=String(form.get('userId') || '');
 const role=String(form.get('role') || '');
 const reason=String(form.get('reason') || '').trim();
 if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(target) || !['owner','build_lead','qa','demo_editor','participant','disabled'].includes(role) || reason.length<8 || reason.length>500) return {message:'Choose a valid role and provide an 8–500 character reason.'};
 if(target===user.id) return {message:'You cannot change your own role.'};
 try {
  const {error}=await (await createClient()).rpc('postcheck_admin_set_role',{target_user:target,desired_role:role,change_reason:reason});
  if(error) return {message:'Role was not changed. Check permission and try again.'};
 } catch {return {message:'Role service unavailable. No change confirmed.'};}
 revalidatePath('/dashboard/admin');
 return {message:'Role saved. Application access is checked on subsequent requests. Platform memberships and session revocation are managed separately.'};
}
