import { betterAuth } from 'better-auth';
import { randomUUID } from 'node:crypto';
import type { Pool } from 'pg';
import { password } from './password.ts';
export function createAuth(pool:Pool, baseURL:string, secret:string, sendEmail:(to:string,url:string,purpose:'verify'|'reset')=>Promise<void>) {
 return betterAuth({
  appName:'PostCheck', baseURL, secret, database:pool,
  trustedOrigins:[baseURL],
  logger:{disabled:true},
  advanced:{database:{generateId:()=>randomUUID()}},
  user:{additionalFields:{role:{type:'string',required:true,defaultValue:'participant',input:false}}},
  emailAndPassword:{enabled:true,minPasswordLength:12,maxPasswordLength:128,requireEmailVerification:true,autoSignIn:false,revokeSessionsOnPasswordReset:true,password,
   sendResetPassword:async({user,url})=>sendEmail(user.email,url,'reset')},
  emailVerification:{sendOnSignUp:true,autoSignInAfterVerification:false,sendVerificationEmail:async({user,url})=>sendEmail(user.email,url,'verify')},
  session:{cookieCache:{enabled:false}},
  rateLimit:{enabled:true,storage:'database',window:60,max:30,customRules:{'/sign-in/email':{window:60,max:5},'/sign-up/email':{window:60,max:3},'/request-password-reset':{window:60,max:3},'/send-verification-email':{window:60,max:3}}},
 });
}
