import { currentUser } from '@/lib/auth/server';
import { roleFor, isSuperadmin } from '@/lib/access';
export const dynamic='force-dynamic';
export async function GET(request:Request){
 const user=await currentUser();
 const destination=user?(isSuperadmin(roleFor(user))?'/dashboard/admin':'/dashboard'):'/login?error=link';
 return new Response(null,{status:307,headers:{Location:new URL(destination,request.url).href,'Cache-Control':'private, no-store','Referrer-Policy':'no-referrer'}});
}
