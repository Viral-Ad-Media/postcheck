/** Only call with a user returned by Supabase auth.getUser(), never cookie claims. */
export type AppRole = 'superadmin' | 'owner' | 'build_lead' | 'qa' | 'demo_editor' | 'participant' | 'disabled';
type VerifiedUser = { app_metadata?: Record<string, unknown> };
export function roleFor(user: VerifiedUser): AppRole {
  const value = user.app_metadata?.postcheck_role;
  if (value === undefined || value === null) return 'participant';
  return ['superadmin', 'owner', 'build_lead', 'qa', 'demo_editor', 'participant', 'disabled'].includes(String(value)) && typeof value === 'string' ? value as AppRole : 'disabled';
}
export function canVerify(role: AppRole) { return ['superadmin', 'owner', 'build_lead', 'qa', 'participant'].includes(role); }
export function canViewOperations(role: AppRole) { return ['superadmin', 'owner', 'build_lead', 'qa'].includes(role); }
export function canViewBudget(role: AppRole) { return role === 'owner' || role === 'superadmin'; }
export function canDownload(role: AppRole, report: string) {
  return report === 'budget' ? canViewBudget(role) : ['kpis','access','acceptance'].includes(report) && canViewOperations(role);
}

export function isSuperadmin(role: AppRole) { return role === 'superadmin'; }
