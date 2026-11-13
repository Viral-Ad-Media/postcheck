import { readFile } from 'node:fs/promises';
import { Pool } from 'pg';
import { getMigrations } from 'better-auth/db/migration';
import { createAuth } from '../lib/auth/core.ts';
if(!process.env.DATABASE_URL || !process.env.BETTER_AUTH_SECRET) throw new Error('Set DATABASE_URL and BETTER_AUTH_SECRET');
const pool=new Pool({connectionString:process.env.DATABASE_URL});
try {
 const auth=createAuth(pool,process.env.BETTER_AUTH_URL||'http://localhost:3000',process.env.BETTER_AUTH_SECRET,async()=>{throw new Error('Migration does not send mail');});
 const {runMigrations}=await getMigrations(auth.options);await runMigrations();
 const sql=await readFile(new URL('../migrations/002-role-audit.sql',import.meta.url),'utf8');
 await pool.query(sql);
 console.log('Better Auth schema and role audit ready.');
}finally{await pool.end();}
