import { type NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { requireAdmin } from '@/lib/adminAuth';

export async function GET(request: NextRequest) {
  const { response } = await requireAdmin(request);
  if (response) return response;

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [
    { count: totalUsers },
    { count: totalPosts },
    { count: openContactRequests },
    { data: authUsers },
  ] = await Promise.all([
    supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('posts').select('*', { count: 'exact', head: true }),
    supabaseAdmin
      .from('contact_requests')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'new'),
    supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 }),
  ]);

  const activeUsers = (authUsers?.users || []).filter(
    (u) => u.last_sign_in_at && u.last_sign_in_at >= sevenDaysAgo
  ).length;

  return Response.json({
    totalUsers: totalUsers ?? 0,
    activeUsers,
    totalPosts: totalPosts ?? 0,
    contactRequests: openContactRequests ?? 0,
  });
}
