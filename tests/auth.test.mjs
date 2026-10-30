import test from 'node:test';
import assert from 'node:assert/strict';
import { runAuthFlow, callbackDestination } from '../lib/auth-flow.ts';
const origin = 'https://postcheck-nine.vercel.app';
function form(values = {}) { const f = new FormData(); for (const [k,v] of Object.entries({email:'tester@example.com',password:'long-test-passphrase',confirm:'long-test-passphrase',...values})) f.set(k,v);return f; }
function client(overrides = {}) {
 const calls=[];
 const auth=Object.fromEntries(['signUp','signInWithPassword','resetPasswordForEmail','resend','getUser','updateUser','signOut'].map(name=>[name,async(...args)=>{calls.push({name,args});return overrides[name] ?? {data:{user:{id:'test-user',email_confirmed_at:'2026-10-29T00:00:00Z'}},error:null};}]));
 return {auth,calls};
}
test('callback targets cannot redirect outside the app or into arbitrary routes',()=>{
 for(const next of ['https://evil.example','//evil.example','/admin','/reset-password?next=https://evil.example',null]) assert.equal(callbackDestination(next),'/dashboard');
 assert.equal(callbackDestination('/reset-password'),'/reset-password');
});
test('invalid modes, emails, short passwords and mismatched passwords never call provider',async()=>{
 for (const [mode,values] of [['invalid',{}],['signup',{email:'bad'}],['signup',{password:'short',confirm:'short'}],['reset-password',{confirm:'wrong'}],['login',{password:'x'.repeat(129)}]]) {
  const c=client();const r=await runAuthFlow(mode,form(values),c,origin);assert.ok(r.message);assert.equal(r.destination,undefined);assert.equal(c.calls.length,0);
 }
});
test('signup uses the exact confirmation callback and does not redirect before confirmation',async()=>{
 const c=client();const r=await runAuthFlow('signup',form(),c,origin);assert.equal(r.success,true);assert.equal(r.destination,undefined);assert.equal(c.calls[0].args[0].options.emailRedirectTo,origin+'/auth/callback');
});
test('login requires provider success and verified email',async()=>{
 for (const response of [{data:{user:null},error:{message:'invalid'}},{data:{user:{id:'unconfirmed'}},error:null}]){
  const r=await runAuthFlow('login',form(),client({signInWithPassword:response}),origin);assert.equal(r.destination,undefined);assert.match(r.message,/Unable to sign in/);
 }
 assert.equal((await runAuthFlow('login',form(),client(),origin)).destination,'/dashboard');
});
test('recovery uses the allowlisted reset destination and generic account acknowledgement',async()=>{
 const c=client();const r=await runAuthFlow('forgot-password',form(),c,origin);assert.equal(r.success,true);assert.match(r.message,/If an account exists/);assert.equal(c.calls[0].args[1].redirectTo,origin+'/auth/callback?next=/reset-password');
});
test('email delivery errors are not reported as successful sends',async()=>{
 for(const [mode,method] of [['forgot-password','resetPasswordForEmail'],['resend-confirmation','resend'],['signup','signUp']]) {
  const r=await runAuthFlow(mode,form(),client({[method]:{error:{message:'smtp error'},data:null}}),origin);assert.notEqual(r.success,true);assert.equal(r.destination,undefined);assert.doesNotMatch(r.message,/smtp/);
 }
});
test('resend confirmation has the correct signup type and callback',async()=>{
 const c=client();await runAuthFlow('resend-confirmation',form(),c,origin);assert.equal(c.calls[0].args[0].type,'signup');assert.equal(c.calls[0].args[0].options.emailRedirectTo,origin+'/auth/callback');
});
test('password reset fails closed on an invalid session without updating password',async()=>{
 const c=client({getUser:{data:{user:null},error:{message:'expired'}}});const r=await runAuthFlow('reset-password',form(),c,origin);assert.match(r.message,/invalid or expired/);assert.deepEqual(c.calls.map(x=>x.name),['getUser']);
});
test('password update revokes refresh sessions globally and returns to login',async()=>{
 const c=client();const r=await runAuthFlow('reset-password',form(),c,origin);assert.equal(r.destination,'/login?reset=success');assert.deepEqual(c.calls.map(x=>x.name),['getUser','updateUser','signOut']);assert.equal(c.calls[2].args[0].scope,'global');
});
test('failed update does not sign out or claim completion',async()=>{
 const c=client({updateUser:{error:{message:'weak password'},data:null}});const r=await runAuthFlow('reset-password',form(),c,origin);assert.equal(r.destination,undefined);assert.deepEqual(c.calls.map(x=>x.name),['getUser','updateUser']);
});
