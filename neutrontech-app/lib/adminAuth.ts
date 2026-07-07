import { type NextRequest } from 'next/server';
import { supabaseAdmin } from './supabaseAdmin';
import { getAuthUser } from './auth';

export async function requireAdmin(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) {
    return { user: null, isSuperAdmin: false, response: Response.json({ error: 'Unauthorized' }, { status: 401 }) };
  }

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('is_admin, is_super_admin')
    .eq('id', user.id)
    .single();

  if (!profile?.is_admin) {
    return { user: null, isSuperAdmin: false, response: Response.json({ error: 'Forbidden' }, { status: 403 }) };
  }

  return { user, isSuperAdmin: !!profile.is_super_admin, response: null };
}
