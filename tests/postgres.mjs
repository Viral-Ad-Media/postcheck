import { PGlite } from '@electric-sql/pglite';
import { Pool } from 'pg';
// Embedded PostgreSQL engine; no production credentials or network access.
export async function testPool(){
 const engine=new PGlite();await engine.waitReady;
 const pool=new Pool();
 const client={query:async(sql,params)=>{const r=await engine.query(typeof sql==='string'?sql:sql.text,params??sql.values??[]);return {...r,rowCount:r.rows.length||r.affectedRows||0,command:(typeof sql==='string'?sql:sql.text).split(' ')[0].toUpperCase()};},release(){},on(){},removeListener(){}};
 pool.connect=async()=>client;pool.query=client.query;pool.end=()=>engine.close();return pool;
}
