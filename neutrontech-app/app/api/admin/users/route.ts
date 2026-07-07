import { type NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { requireAdmin } from '@/lib/adminAuth';

export async function GET(request: NextRequest) {
  const { response } = await requireAdmin(request);
  if (response) return response;

  const [{ data: profiles, error }, { data: authUsers }] = await Promise.all([
    supabaseAdmin
      .from('profiles')
      .select('id, username, full_name, avatar_url, is_admin, is_super_admin, created_at')
      .order('created_at', { ascending: false }),
    supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 }),
  ]);

  if (error) return Response.json({ error: error.message }, { status: 500 });

  const lastSignInById = new Map(
    (authUsers?.users || []).map((u) => [u.id, u.last_sign_in_at])
  );

  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;

  const users = (profiles || []).map((p) => {
    const lastSignInAt = lastSignInById.get(p.id) ?? null;
    const active = !!lastSignInAt && new Date(lastSignInAt).getTime() >= thirtyDaysAgo;
    return {
      id: p.id,
      username: p.username,
      name: p.full_name || p.username || 'User',
      avatar: p.avatar_url || '',
      isAdmin: p.is_admin,
      isSuperAdmin: p.is_super_admin,
      status: active ? 'active' : 'inactive',
      joined: p.created_at,
    };
  });

  return Response.json(users);
}
