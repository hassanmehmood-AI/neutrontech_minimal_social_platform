import { type NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { timeAgo } from '@/lib/utils';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const { data: user, error } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return Response.json({ error: 'User not found' }, { status: 404 });

  const { data: rawPosts } = await supabaseAdmin
    .from('posts')
    .select('*, profiles(full_name, avatar_url)')
    .eq('user_id', id)
    .order('created_at', { ascending: false });

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
      videoUrl: p.video_url || undefined,
      likes: p.likes || 0,
      comments: p.comments || 0,
    };
  });

  return Response.json({ user, posts });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  const { data, error } = await supabaseAdmin
    .from('profiles')
    .update({
      full_name: body.name,
      bio: body.bio,
      role: body.role,
      avatar_url: body.avatar,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data);
}
