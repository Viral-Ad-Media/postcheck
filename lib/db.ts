import { Pool } from 'pg';
let pool: Pool | undefined;
export function getPool() {
 if(!process.env.DATABASE_URL) throw new Error('Database not configured');
 return pool ??= new Pool({connectionString:process.env.DATABASE_URL,max:5,connectionTimeoutMillis:10000,idleTimeoutMillis:20000});
}
