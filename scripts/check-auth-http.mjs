import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { once } from 'node:events';
let authRequests=0;
const fakeAuth=createServer((req,res)=>{
 authRequests++;
 res.writeHead(401,{'Content-Type':'application/json'});
 res.end(JSON.stringify({code:'bad_jwt',message:'Invalid JWT'}));
});
fakeAuth.listen(0,'127.0.0.1');await once(fakeAuth,'listening');
const apiPort=fakeAuth.address().port;
const next=spawn(process.execPath,['node_modules/next/dist/bin/next','start','--hostname','127.0.0.1','--port','0'],{
 env:{...process.env,NEXT_PUBLIC_SUPABASE_URL:`http://127.0.0.1:${apiPort}`,NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:'test-public-key',NEXT_PUBLIC_SITE_URL:'http://localhost:3000'},stdio:['ignore','pipe','pipe']
});
let output='';let errors='';next.stderr.on('data',d=>errors+=d);
try {
 const base=await new Promise((resolve,reject)=>{
  const timeout=setTimeout(()=>reject(new Error('Server startup timed out: '+errors)),20000);
  next.stdout.on('data',d=>{output+=d;const url=output.match(/http:\/\/127\.0\.0\.1:\d+/)?.[0];if(output.includes('Ready')&&url){clearTimeout(timeout);resolve(url);}});
  next.once('exit',code=>{clearTimeout(timeout);reject(new Error('Server exited: '+code+' '+errors));});
 });
 for(const path of ['/','/overview','/how-it-works','/sectors','/privacy','/pilot','/login','/signup','/forgot-password','/resend-confirmation','/reset-password']){
  const r=await fetch(base+path);assert.equal(r.status,200,path);const html=await r.text();
  if(path==='/') assert.ok(!html.includes('id="postcode"'),'Root must not render the verification workspace');
  if(path==='/pilot') assert.ok(html.includes('Open pilot workspace'));
 }
 for(const path of ['/dashboard','/dashboard/pilot','/dashboard/account']){
  const r=await fetch(base+path,{redirect:'manual'});assert.equal(r.status,307,path);assert.equal(r.headers.get('location'),'/login');
 }
 for(const method of ['GET','POST']){
  const r=await fetch(base+'/api/postcode',{method});assert.equal(r.status,401);assert.equal((await r.json()).error,'Sign in required');assert.match(r.headers.get('cache-control'),/no-store/);
 }
 const cb=await fetch(base+'/auth/callback?next=https://evil.example',{redirect:'manual'});assert.equal(cb.status,307);assert.equal(new URL(cb.headers.get('location')).pathname,'/login');assert.match(cb.headers.get('cache-control'),/no-store/);
 const jwt=[{alg:'HS256',typ:'JWT'},{sub:'forged-user',exp:Math.floor(Date.now()/1000)+3600},'invalid-signature'].map(x=>typeof x==='string'?x:Buffer.from(JSON.stringify(x)).toString('base64url')).join('.');
 const forged={access_token:jwt,refresh_token:'forged',expires_at:Math.floor(Date.now()/1000)+3600,expires_in:3600,token_type:'bearer',user:{id:'forged-user',email_confirmed_at:'2026-01-01T00:00:00Z'}};
 const cookie='sb-127-auth-token=base64-'+Buffer.from(JSON.stringify(forged)).toString('base64url');
 const rejected=await fetch(base+'/api/postcode',{headers:{cookie}});assert.equal(rejected.status,401);assert.ok(authRequests>0,'Forged session must be verified against the auth server');
 console.log('Passed: 11 public pages, 3 protected routes, both API methods, invalid callback and forged-session rejection.');
} finally {next.kill();fakeAuth.close();}
