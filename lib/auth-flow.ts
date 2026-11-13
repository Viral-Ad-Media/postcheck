export type AuthState={message:string;success?:boolean;destination?:string};
type Sender=(path:string,body:Record<string,unknown>)=>Promise<{ok:boolean;data?:unknown}>;
export async function runAuthFlow(mode:string,form:FormData,send:Sender):Promise<AuthState> {
 const email=String(form.get('email')??'').trim();
 const password=String(form.get('password')??'');
 if(!['login','signup','forgot-password','reset-password','resend-confirmation'].includes(mode))return {message:'Invalid request.'};
 if(mode!=='reset-password'&&(email.length>254||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)))return {message:'Enter a valid email address.'};
 if(['login','signup','reset-password'].includes(mode)&&(!password||password.length>128))return {message:'Enter your password (maximum 128 characters).'};
 if(['signup','reset-password'].includes(mode)){
  if(password.length<12)return {message:'Use at least 12 characters for your password.'};
  if(password!==form.get('confirm'))return {message:'Passwords do not match.'};
 }
 const token=String(form.get('token')||'');
 if(mode==='reset-password'&&(!token||token.length>512))return {message:'This reset link is invalid. Request a new link.'};
 const requests:Record<string,[string,Record<string,unknown>]>={
  login:['sign-in/email',{email,password,rememberMe:form.get('remember')==='on'}],
  signup:['sign-up/email',{email,password,name:String(form.get('name')||email.split('@')[0]).slice(0,100),callbackURL:'/login?confirmed=success'}],
  'forgot-password':['request-password-reset',{email,redirectTo:'/reset-password'}],
  'resend-confirmation':['send-verification-email',{email,callbackURL:'/login?confirmed=success'}],
  'reset-password':['reset-password',{token,newPassword:password}],
 };
 try {
  const [path,body]=requests[mode];const result=await send(path,body);
  if(!result.ok)return {message:mode==='login'?'Unable to sign in. Check your credentials and confirm your email.':'Unable to complete this request. The link may have expired, email delivery may be unavailable, or too many requests were made. Try again later.'};
  if(mode==='login')return {message:'',destination:'/auth/callback'};
  if(mode==='reset-password')return {message:'',destination:'/login?reset=success'};
  return {success:true,message:mode==='signup'?'Check your inbox for a confirmation link. If you already registered, sign in instead.':mode==='forgot-password'?'If an account exists, you will receive a password reset link.':'If confirmation is needed, a new link will be sent.'};
 }catch{return {message:'Unable to reach authentication. Please try again.'};}
}
