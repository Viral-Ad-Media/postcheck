export function authConfigured() { return Boolean(process.env.DATABASE_URL && process.env.BETTER_AUTH_SECRET); }
export function authOrigin() {
 const origin=process.env.BETTER_AUTH_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
 return new URL(origin).origin;
}
