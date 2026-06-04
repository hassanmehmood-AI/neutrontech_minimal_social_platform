import { supabaseAdmin } from '@/lib/supabaseAdmin';
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
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { error } = await supabaseAdmin.from('posts').delete().eq('id', id);
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ success: true });
}
