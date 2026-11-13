import 'server-only';
import { cache } from 'react';
import { headers } from 'next/headers';
import { getPool } from '@/lib/db';
import { createAuth } from './core';
import { authConfigured, authOrigin } from './config';
import { sendAuthEmail } from './email';
let instance:ReturnType<typeof createAuth>|undefined;
export function getAuth() {
 if(!authConfigured()) throw new Error('Authentication not configured');
 return instance ??= createAuth(getPool(),authOrigin(),process.env.BETTER_AUTH_SECRET!,sendAuthEmail);
}
export const currentUser=cache(async()=>{
 if(!authConfigured()) return null;
 try {
  const session=await getAuth().api.getSession({headers:await headers(),query:{disableCookieCache:true}});
  if(!session?.user.emailVerified) return null;
  return session.user;
 } catch {return null;}
});
