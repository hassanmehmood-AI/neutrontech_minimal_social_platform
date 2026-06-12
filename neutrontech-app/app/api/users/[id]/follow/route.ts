import { type NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { getAuthUser } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const [user, { id }] = await Promise.all([getAuthUser(request), params]);
  if (!user) return Response.json({ following: false });

  const { data } = await supabaseAdmin
    .from('follows')
    .select('id')
    .eq('follower_id', user.id)
    .eq('following_id', id)
    .maybeSingle();

  return Response.json({ following: !!data });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const [user, { id }] = await Promise.all([getAuthUser(request), params]);
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  if (user.id === id) return Response.json({ error: 'Cannot follow yourself' }, { status: 400 });

  const { data: existing } = await supabaseAdmin
    .from('follows')
    .select('id')
    .eq('follower_id', user.id)
    .eq('following_id', id)
    .maybeSingle();

  const isFollowing = !!existing;

  if (isFollowing) {
    await supabaseAdmin.from('follows').delete().eq('id', existing!.id);
  } else {
    await Promise.all([
      supabaseAdmin.from('follows').insert({ follower_id: user.id, following_id: id }),
      supabaseAdmin.from('notifications').insert({
        user_id: id,
        actor_id: user.id,
        type: 'follow',
        read: false,
      }),
    ]);
  }

  // Read the updated follower count from DB (trigger has already updated it)
  const { data: updated } = await supabaseAdmin
    .from('profiles')
    .select('followers')
    .eq('id', id)
    .single();

  return Response.json({ following: !isFollowing, followers: updated?.followers ?? 0 });
}
