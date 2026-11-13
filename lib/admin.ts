import type { Pool } from 'pg';
export async function adminSnapshot(pool:Pool, actor:string, page:number) {
 const db=await pool.connect();
 try {
  await db.query('BEGIN');
  const access=await db.query('SELECT id FROM "user" WHERE id=$1 AND role=\'superadmin\' AND "emailVerified"=true FOR SHARE',[actor]);
  if(!access.rowCount) throw new Error('Forbidden');
  const counts=await db.query(`SELECT count(*)::int total, count(*) FILTER (WHERE "emailVerified")::int confirmed, count(*) FILTER (WHERE role='disabled')::int disabled FROM "user"`);
  const users=await db.query(`SELECT id,email,role,"createdAt" created_at, CASE WHEN "emailVerified" THEN "createdAt" ELSE NULL END email_confirmed_at FROM "user" ORDER BY "createdAt",id LIMIT 25 OFFSET $1`,[Math.max(0,Math.min(page,100000))*25]);
  const audit=await db.query('SELECT * FROM postcheck_role_audit ORDER BY created_at DESC,id DESC LIMIT 100');
  await db.query('COMMIT');return {...counts.rows[0],users:users.rows,audit:audit.rows};
 } catch(e){await db.query('ROLLBACK');throw e;} finally{db.release();}
}
export async function setRole(pool:Pool,actor:string,target:string,role:string,reason:string) {
 if(actor===target || !['owner','build_lead','qa','demo_editor','participant','disabled'].includes(role) || reason.trim().length<8 || reason.length>500) throw new Error('Invalid change');
 const db=await pool.connect();
 try {
  await db.query('BEGIN');
  const access=await db.query('SELECT id FROM "user" WHERE id=$1 AND role=\'superadmin\' AND "emailVerified"=true FOR SHARE',[actor]);
  if(!access.rowCount) throw new Error('Forbidden');
  const previous=await db.query('SELECT role FROM "user" WHERE id=$1 FOR UPDATE',[target]);
  if(!previous.rowCount || previous.rows[0].role==='superadmin') throw new Error('Protected account');
  await db.query('UPDATE "user" SET role=$1,"updatedAt"=now() WHERE id=$2',[role,target]);
  await db.query('INSERT INTO postcheck_role_audit(actor_id,target_id,old_role,new_role,reason) VALUES($1,$2,$3,$4,$5)',[actor,target,previous.rows[0].role,role,reason.trim()]);
  await db.query('DELETE FROM "session" WHERE "userId"=$1',[target]);
  await db.query('COMMIT');
 }catch(e){await db.query('ROLLBACK');throw e;}finally{db.release();}
}
