import {writeFile} from 'node:fs/promises';
import {getMigrations} from 'better-auth/db/migration';
import {createAuth} from '../lib/auth/core.ts';
import {testPool} from '../tests/postgres.mjs';
const pool=await testPool();
try{const auth=createAuth(pool,'http://localhost:3000','schema-generation-only-not-a-production-secret',async()=>{});const migration=await getMigrations(auth.options);await writeFile('migrations/001-better-auth.sql',await migration.compileMigrations());await migration.runMigrations();console.log('Generated and validated PostgreSQL auth schema.');}finally{await pool.end();}
