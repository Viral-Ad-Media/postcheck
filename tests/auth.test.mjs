import test from 'node:test';
import assert from 'node:assert/strict';
import { runAuthFlow } from '../lib/auth-flow.ts';
function form(values={}) {const f=new FormData();for(const [k,v] of Object.entries({email:'tester@example.com',password:'long-test-passphrase',confirm:'long-test-passphrase',...values}))f.set(k,v);return f;}
test('invalid forms never call authentication',async()=>{
 for(const [mode,values] of [['invalid',{}],['signup',{email:'bad'}],['signup',{password:'short',confirm:'short'}],['reset-password',{}],['signup',{confirm:'wrong'}],['login',{password:'x'.repeat(129)}]]){
 let calls=0;const r=await runAuthFlow(mode,form(values),async()=>{calls++;return {ok:true};});assert.ok(r.message);assert.equal(calls,0);
 }
});
test('fixed callbacks and reset token transport',async()=>{
 for(const [mode,path,field,value] of [['signup','sign-up/email','callbackURL','/login?confirmed=success'],['forgot-password','request-password-reset','redirectTo','/reset-password'],['resend-confirmation','send-verification-email','callbackURL','/login?confirmed=success'],['reset-password','reset-password','token','test-token']]){
 const r=await runAuthFlow(mode,form({token:'test-token',redirectTo:'https://evil.example'}),async(p,b)=>{assert.equal(p,path);assert.equal(b[field],value);return {ok:true};});assert.ok(r.success||r.destination);
 }
});
test('failed provider requests never claim success or leak details',async()=>{
 for(const mode of ['login','signup','forgot-password','reset-password','resend-confirmation']){
 const r=await runAuthFlow(mode,form({token:'token'}),async()=>({ok:false,data:{message:'secret provider detail'}}));assert.equal(r.destination,undefined);assert.notEqual(r.success,true);assert.doesNotMatch(r.message,/secret provider/);
 }
});
test('login uses server role routing and optional remember me',async()=>{
 const r=await runAuthFlow('login',form(),async(p,b)=>{assert.equal(p,'sign-in/email');assert.equal(b.rememberMe,false);return {ok:true};});assert.equal(r.destination,'/auth/callback');
});
test('network failure is recoverable',async()=>{assert.match((await runAuthFlow('login',form(),async()=>{throw Error('offline');})).message,/try again/);});
