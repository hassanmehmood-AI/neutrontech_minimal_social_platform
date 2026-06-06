import { type NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { getAuthUser } from '@/lib/auth';
import { timeAgo } from '@/lib/utils';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const [viewer, { id }] = await Promise.all([getAuthUser(request), params]);

  const { data: user, error } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return Response.json({ error: 'User not found' }, { status: 404 });

  const [{ data: rawPosts }, { data: viewerLikes }] = await Promise.all([
    supabaseAdmin
      .from('posts')
      .select('*, profiles(full_name, avatar_url)')
      .eq('user_id', id)
      .order('created_at', { ascending: false }),
    viewer
      ? supabaseAdmin.from('likes').select('post_id').eq('user_id', viewer.id)
      : Promise.resolve({ data: [] }),
  ]);

  const likedIds = new Set((viewerLikes || []).map((l: { post_id: number }) => l.post_id));

  const posts = (rawPosts || []).map((p) => {
    const profile = p.profiles as Record<string, string> | null;
    return {
      id: p.id,
      userId: p.user_id,
      author: profile?.full_name || user.full_name || 'Unknown',
      avatar: profile?.avatar_url || user.avatar_url || '',
      time: timeAgo(p.created_at),
      tag: p.tag || '',
      content: p.content || '',
      images: p.images || [],
      videoUrls: (p.video_urls as string[]) || [],
      likes: p.likes || 0,
      comments: p.comments || 0,
      likedByMe: likedIds.has(Number(p.id)),
    };
  });

  return Response.json({ user, posts });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser(request);
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  if (user.id !== id) return Response.json({ error: 'Forbidden' }, { status: 403 });

  const body = await request.json();

  const updateData: Record<string, unknown> = {};
  if (body.name   !== undefined) updateData.full_name  = body.name;
  if (body.bio    !== undefined) updateData.bio        = body.bio;
  if (body.role   !== undefined) updateData.role       = body.role;
  if (body.avatar !== undefined) updateData.avatar_url = body.avatar;
  if (body.cover  !== undefined) updateData.cover_url  = body.cover;

  const { data, error } = await supabaseAdmin
    .from('profiles')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data);
}
