import { type NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { getAuthUser } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser(request);
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  const { data: post, error: postError } = await supabaseAdmin
    .from('posts')
    .select('likes')
    .eq('id', id)
    .single();

  if (postError) return Response.json({ error: 'Post not found' }, { status: 404 });

  const { data: existing } = await supabaseAdmin
    .from('likes')
    .select('id')
    .eq('post_id', id)
    .eq('user_id', user.id)
    .maybeSingle();

  let newLikes: number;
  let liked: boolean;

  if (existing) {
    await supabaseAdmin.from('likes').delete().eq('id', existing.id);
    newLikes = Math.max(0, (post.likes as number) - 1);
    liked = false;
  } else {
    await supabaseAdmin.from('likes').insert({ post_id: Number(id), user_id: user.id });
    newLikes = (post.likes as number) + 1;
    liked = true;
  }

  await supabaseAdmin.from('posts').update({ likes: newLikes }).eq('id', id);
  return Response.json({ liked, likes: newLikes });
}
