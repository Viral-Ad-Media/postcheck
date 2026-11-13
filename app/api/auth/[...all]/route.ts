import { getAuth } from '@/lib/auth/server';
import { authConfigured } from '@/lib/auth/config';
import { emailConfigured } from '@/lib/auth/email';
export const runtime='nodejs';
export const dynamic='force-dynamic';
async function handle(request:Request) {
 const headers={'Cache-Control':'private, no-store','Referrer-Policy':'no-referrer'};
 if(!authConfigured()) return Response.json({message:'Authentication is temporarily unavailable.'},{status:503,headers});
 const path=new URL(request.url).pathname;
 if(['/sign-up/email','/request-password-reset','/send-verification-email'].some(s=>path.endsWith(s))&&!emailConfigured()) return Response.json({message:'Email delivery is being configured. Please try again later.'},{status:503,headers});
 try {
  const response=await getAuth().handler(request);
  const result=new Response(response.body,{status:response.status,headers:response.headers});
  for(const [key,value] of Object.entries(headers)) result.headers.set(key,value);
  return result;
 } catch {return Response.json({message:'Authentication is temporarily unavailable.'},{status:503,headers});}
}
export const GET=handle;
export const POST=handle;
