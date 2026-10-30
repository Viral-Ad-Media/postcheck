import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { once } from 'node:events';
let authRequests=0; let adminRequests=0;
const fakeAuth=createServer((req,res)=>{
 authRequests++;
 const token=req.headers.authorization?.replace('Bearer ','');
 let subject='';
 try {subject=JSON.parse(Buffer.from(token.split('.')[1],'base64url').toString()).sub;} catch {}
 if(subject.startsWith('test-role-')) {
  const role=subject.slice(10);
  if(req.url?.includes('/rest/v1/rpc/postcheck_admin_snapshot')) {
   adminRequests++;
   res.writeHead(role==='superadmin'?200:403,{'Content-Type':'application/json'});
   res.end(JSON.stringify(role==='superadmin'?{total:1,confirmed:1,disabled:0,users:[],audit:[]}:{message:'Access denied'}));return;
  }
  res.writeHead(200,{'Content-Type':'application/json'});
  res.end(JSON.stringify({id:subject,aud:'authenticated',role:'authenticated',email:'synthetic@example.invalid',email_confirmed_at:'2026-01-01T00:00:00Z',app_metadata:{postcheck_role:role},user_metadata:{postcheck_role:'owner'},created_at:'2026-01-01T00:00:00Z'})); return;
 }
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
 for(const path of ['/dashboard','/dashboard/pilot','/dashboard/account','/dashboard/operations','/dashboard/admin']){
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
 for(const report of ['kpis','budget','access','acceptance']) {
  const response=await fetch(base+'/api/operations/'+report); assert.equal(response.status,401);
 }
 function roleCookie(role) {
  const token=[{alg:'HS256',typ:'JWT'},{sub:'test-role-'+role,exp:Math.floor(Date.now()/1000)+3600},'test-signature'].map(x=>typeof x==='string'?x:Buffer.from(JSON.stringify(x)).toString('base64url')).join('.');
  return 'sb-127-auth-token=base64-'+Buffer.from(JSON.stringify({...forged,access_token:token})).toString('base64url');
 }
 for(const role of ['superadmin','owner','build_lead','qa','participant','demo_editor','disabled','unexpected']) {
  const h={cookie:roleCookie(role)};
  const staff=['superadmin','owner','build_lead','qa'].includes(role);
  for(const report of ['kpis','budget','access','acceptance']) {
   const response=await fetch(base+'/api/operations/'+report,{headers:h});
   assert.equal(response.status,report==='budget'?(['superadmin','owner'].includes(role)?200:403):(staff?200:403),role+' '+report);
   assert.match(response.headers.get('cache-control'),/no-store/);
  }
  const status=await fetch(base+'/api/postcode',{headers:h});
  assert.equal(status.status,['superadmin','owner','build_lead','qa','participant'].includes(role)?200:403,role+' postcode GET');
  if(['demo_editor','disabled','unexpected'].includes(role)) {
   const post=await fetch(base+'/api/postcode',{method:'POST',headers:h}); assert.equal(post.status,403);
  }
  const before=adminRequests;
  const adminPage=await fetch(base+'/dashboard/admin',{headers:h});
  const adminHtml=await adminPage.text();
  if(role==='superadmin') {assert.equal(adminPage.status,200);assert.ok(adminHtml.includes('Manage PostCheck'));assert.ok(adminHtml.includes('Total accounts'));}
  else {assert.ok(!adminHtml.includes('Manage PostCheck'));assert.equal(adminRequests,before,'Non-admin must not query account directory');}
  const page=await fetch(base+'/dashboard/operations',{headers:h});
  const html=await page.text();
  if(staff) {assert.equal(page.status,200);assert.ok(html.includes('KPI scorecard'));}
  if(!['superadmin','owner'].includes(role)) assert.ok(!html.includes('250,000'),role+' must not receive budget page data');
  if(!staff) assert.ok(!html.includes('KPI scorecard'),role+' must not receive operations page data');
 }
 console.log('Passed: role matrix, export permissions, private caching; 11 public pages, 5 protected routes, both API methods, invalid callback and forged-session rejection.');
} finally {next.kill();fakeAuth.close();}
