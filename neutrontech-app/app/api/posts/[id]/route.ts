import { type NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { getAuthUser } from '@/lib/auth';
import { timeAgo } from '@/lib/utils';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { data, error } = await supabaseAdmin
    .from('posts')
    .select('*, profiles(full_name, avatar_url)')
    .eq('id', id)
    .single();

  if (error) return Response.json({ error: 'Post not found' }, { status: 404 });

  const profile = data.profiles as Record<string, string> | null;
  return Response.json({
    id: data.id,
    userId: data.user_id,
    author: profile?.full_name || 'Unknown User',
    avatar: profile?.avatar_url || '',
    time: timeAgo(data.created_at),
    tag: data.tag || '',
    content: data.content || '',
    images: data.images || [],
    videoUrl: data.video_url || undefined,
    likes: data.likes || 0,
    comments: data.comments || 0,
  });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser(request);
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  // Verify the post belongs to this user before deleting
  const { data: post, error: fetchError } = await supabaseAdmin
    .from('posts')
    .select('user_id')
    .eq('id', id)
    .single();

  if (fetchError) return Response.json({ error: 'Post not found' }, { status: 404 });
  if (post.user_id !== user.id) return Response.json({ error: 'Forbidden' }, { status: 403 });

  const { error } = await supabaseAdmin.from('posts').delete().eq('id', id);
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ success: true });
}
