import { PostcodeWorkspace } from '@/components/postcode-workspace';
import { currentUser } from '@/lib/auth/server';
import { redirect } from 'next/navigation';
export default async function Dashboard() {
  const user = await currentUser();
  if (!user) redirect('/login');
  return <PostcodeWorkspace userId={user.id} email={user.email} />;
}
