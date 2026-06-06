import { type NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { getAuthUser } from '@/lib/auth';

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
