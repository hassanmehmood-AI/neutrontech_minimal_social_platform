import { type NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { getAuthUser } from '@/lib/auth';
import { timeAgo } from '@/lib/utils';

export async function GET(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: notifications, error } = await supabaseAdmin
    .from('notifications')
    .select('id, type, read, created_at, actor_id')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(30);

  if (error) return Response.json({ error: error.message }, { status: 500 });
  if (!notifications?.length) return Response.json([]);

  const actorIds = [...new Set(notifications.map((n) => n.actor_id as string))];
  const { data: profiles } = await supabaseAdmin
    .from('profiles')
    .select('id, full_name, avatar_url')
    .in('id', actorIds);

  const profileMap = Object.fromEntries(
    (profiles || []).map((p) => [p.id, p])
  );

  return Response.json(
    notifications.map((n) => {
      const actor = profileMap[n.actor_id as string] as { id: string; full_name: string; avatar_url: string } | undefined;
      return {
        id: n.id,
        type: n.type,
        read: n.read,
        time: timeAgo(n.created_at as string),
        actor: {
          id: n.actor_id,
          name: actor?.full_name || 'Someone',
          avatar: actor?.avatar_url || '',
        },
      };
    })
  );
}

export async function PATCH(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  let body: { id?: string } = {};
  try { body = await request.json(); } catch { /* no body = mark all */ }

  if (body.id) {
    await supabaseAdmin
      .from('notifications')
      .update({ read: true })
      .eq('id', body.id)
      .eq('user_id', user.id);
  } else {
    await supabaseAdmin
      .from('notifications')
      .update({ read: true })
      .eq('user_id', user.id)
      .eq('read', false);
  }

  return Response.json({ ok: true });
}
