import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { once } from 'node:events';
const next=spawn(process.execPath,['node_modules/next/dist/bin/next','start','--hostname','127.0.0.1','--port','0'],{
 env:{...process.env,DATABASE_URL:'',BETTER_AUTH_SECRET:'',POSTCHECK_WIDGET_ORIGINS:'https://kyc.bank.ng',NIPOST_API_KEY:''},stdio:['ignore','pipe','pipe']
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
 const rejected=await fetch(base+'/api/postcode',{headers:{cookie:'better-auth.session_token=forged.signature'}});assert.equal(rejected.status,401);
 for(const report of ['kpis','budget','access','acceptance'])assert.equal((await fetch(base+'/api/operations/'+report)).status,401);
 const partner={'Content-Type':'application/json',Origin:'https://kyc.bank.ng'};
 const pre=await fetch(base+'/api/widget',{method:'OPTIONS',headers:{Origin:'https://kyc.bank.ng','Access-Control-Request-Method':'POST'}});
 assert.equal(pre.status,204);assert.equal(pre.headers.get('access-control-allow-origin'),'https://kyc.bank.ng');
 const badPre=await fetch(base+'/api/widget',{method:'OPTIONS',headers:{Origin:'https://evil.example'}});
 assert.equal(badPre.status,403);assert.equal(badPre.headers.get('access-control-allow-origin'),null);
 const lookup=await fetch(base+'/api/widget',{method:'POST',headers:partner,body:JSON.stringify({operation:'lookup',input:{code:'FC-01-A01-KP-27'}})});
 assert.equal(lookup.status,503,'Anonymous partner lookup reaches the NIPOST client (unconfigured key in test)');
 assert.equal((await lookup.json()).error.code,'not_configured');assert.equal(lookup.headers.get('access-control-allow-origin'),'https://kyc.bank.ng');
 for(const op of ['suite','batch','search','assemble']) {
  const r=await fetch(base+'/api/widget',{method:'POST',headers:partner,body:JSON.stringify({operation:op,input:{code:'X'}})});assert.equal(r.status,400,op);
 }
 for(const origin of ['https://evil.example',undefined]) {
  const r=await fetch(base+'/api/widget',{method:'POST',headers:{'Content-Type':'application/json',...(origin?{Origin:origin}:{})},body:JSON.stringify({operation:'lookup',input:{code:'FC-01-A01-KP-27'}})});
  assert.equal(r.status,403,String(origin));
 }
 console.log('Passed: widget CORS/allowlist, anonymous export restrictions, private caching; 11 public pages, 5 protected routes, both API methods, invalid callback and forged-session rejection.');
} finally {next.kill();}
