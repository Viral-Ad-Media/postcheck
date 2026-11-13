'use server';
import { setRole } from '@/lib/admin';
import { getPool } from '@/lib/db';
import { currentUser } from '@/lib/auth/server';
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
  await setRole(getPool(),user.id,target,role,reason);
 } catch {return {message:'Role service unavailable. No change confirmed.'};}
 revalidatePath('/dashboard/admin');
 return {message:'Role saved. Application access is checked on subsequent requests. Existing app sessions have been revoked. Platform memberships are managed separately.'};
}
