import Link from 'next/link';
import { AuthForm } from '@/components/auth-form';
import { authConfigured } from '@/lib/auth/config';
export const dynamic='force-dynamic';
export default async function ResetPassword({searchParams}:{searchParams:Promise<{token?:string;error?:string}>}){
 const {token,error}=await searchParams;
 if(!token||error)return <section className="pc-auth-card"><h1>Request a fresh reset link.</h1><Link href="/forgot-password">Reset your password →</Link></section>;
 return <AuthForm mode="reset-password" configured={authConfigured()} token={token}/>;
}
