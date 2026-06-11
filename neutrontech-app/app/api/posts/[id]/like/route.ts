import { type NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { getAuthUser } from '@/lib/auth';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const { data: likesData, error } = await supabaseAdmin
    .from('likes')
    .select('user_id')
    .eq('post_id', id);

  if (error) return Response.json({ error: error.message }, { status: 500 });
  if (!likesData?.length) return Response.json([]);

  const userIds = likesData.map((l: { user_id: string }) => l.user_id);

  const { data: profiles } = await supabaseAdmin
    .from('profiles')
    .select('id, full_name, avatar_url')
    .in('id', userIds);

  const profileMap = Object.fromEntries(
    (profiles || []).map((p: { id: string; full_name: string; avatar_url: string }) => [p.id, p])
  );

  return Response.json(
    userIds.map((uid: string) => ({
      id: uid,
      name: (profileMap[uid] as { full_name?: string } | undefined)?.full_name || 'Unknown',
      avatar: (profileMap[uid] as { avatar_url?: string } | undefined)?.avatar_url || '',
    }))
  );
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const [user, { id }] = await Promise.all([getAuthUser(request), params]);
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const [{ data: post, error: postError }, { data: existing }] = await Promise.all([
    supabaseAdmin.from('posts').select('likes').eq('id', id).single(),
    supabaseAdmin.from('likes').select('id').eq('post_id', id).eq('user_id', user.id).maybeSingle(),
  ]);

  if (postError) return Response.json({ error: 'Post not found' }, { status: 404 });

  const isLiked = !!existing;
  const newLikes = Math.max(0, (post.likes as number) + (isLiked ? -1 : 1));

  await Promise.all([
    isLiked
      ? supabaseAdmin.from('likes').delete().eq('id', existing!.id)
      : supabaseAdmin.from('likes').insert({ post_id: Number(id), user_id: user.id }),
    supabaseAdmin.from('posts').update({ likes: newLikes }).eq('id', id),
  ]);

  return Response.json({ liked: !isLiked, likes: newLikes });
}
