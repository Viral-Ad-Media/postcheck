import { compare } from 'bcryptjs';
import { hashPassword, verifyPassword } from 'better-auth/crypto';
export const password = {
  hash: hashPassword,
  async verify({hash, password}: {hash:string;password:string}) {
    // Supabase bcrypt hashes remain valid; new passwords use Better Auth scrypt.
    if (/^\$2[aby]\$/.test(hash)) return compare(password, hash.replace(/^\$2y\$/, '$2b$'));
    try { return await verifyPassword({hash,password}); } catch { return false; }
  },
};
