'use server';
import { getAuth } from '@/lib/auth/server';
import { headers,cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { AuthState } from '@/lib/auth-flow';
export async function signOut(_previous:AuthState,_form:FormData):Promise<AuthState>{
 try {
  await getAuth().api.signOut({headers:await headers()});
  const jar=await cookies();
  for(const cookie of jar.getAll()) if(cookie.name.startsWith('better-auth.')||cookie.name.startsWith('__Secure-better-auth.'))jar.delete(cookie.name);
 }catch{return {message:'Unable to sign out. Please try again.'};}
 redirect('/login');
}
