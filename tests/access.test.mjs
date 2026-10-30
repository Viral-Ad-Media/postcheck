import test from 'node:test';
import assert from 'node:assert/strict';
import { roleFor, canVerify, canViewOperations, canViewBudget, canDownload } from '../lib/access.ts';
import { budget, kpis, reportCsv } from '../lib/pilot-plan.ts';
test('Self-editable metadata cannot grant staff access',()=>{
 assert.equal(roleFor({user_metadata:{postcheck_role:'owner'}}),'participant');
 assert.equal(canViewOperations(roleFor({app_metadata:{},user_metadata:{role:'owner'}})),false);
});
test('Explicit invalid or disabled role fails closed',()=>{
 for(const value of ['admin','OWNER','',{},['owner'],'disabled']) {
  const role=roleFor({app_metadata:{postcheck_role:value}});
  assert.equal(canVerify(role),false); assert.equal(canViewOperations(role),false);
 }
});
test('Full permission matrix and exports',()=>{
 for(const role of ['superadmin','owner','build_lead','qa','demo_editor','participant','disabled']) {
  assert.equal(canVerify(role),['superadmin','owner','build_lead','qa','participant'].includes(role));
  assert.equal(canViewOperations(role),['superadmin','owner','build_lead','qa'].includes(role));
  assert.equal(canViewBudget(role),['superadmin','owner'].includes(role));
  assert.equal(canDownload(role,'budget'),['superadmin','owner'].includes(role));
  assert.equal(canDownload(role,'kpis'),canViewOperations(role));
  assert.equal(canDownload(role,'../../secret'),false);
 }
});
test('Planning exports have no fabricated results and totals reconcile',()=>{
 assert.equal(budget.reduce((sum,row)=>sum+row[1],0),490000);
 assert.equal(kpis.length,9);
 assert.match(reportCsv('kpis'),/Not measured/);
 assert.match(reportCsv('budget'),/Unapproved/);
 assert.match(reportCsv('acceptance'),/Not run/);
 assert.equal(reportCsv('unknown'),null);
});
