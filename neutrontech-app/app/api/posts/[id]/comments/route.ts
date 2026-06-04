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
    .from('comments')
    .select('*, profiles(full_name, avatar_url)')
    .eq('post_id', id)
    .order('created_at', { ascending: true });

  if (error) return Response.json({ error: error.message }, { status: 500 });

  return Response.json(
    (data || []).map((c) => {
      const profile = c.profiles as Record<string, string> | null;
      return {
        id: c.id,
        userId: c.user_id,
        author: profile?.full_name || 'Unknown',
        avatar: profile?.avatar_url || '',
        content: c.content,
        time: timeAgo(c.created_at),
      };
    })
  );
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser(request);
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const { content } = await request.json();
  if (!content?.trim()) return Response.json({ error: 'Content required' }, { status: 400 });

  const { data, error } = await supabaseAdmin
    .from('comments')
    .insert({ post_id: Number(id), user_id: user.id, content: content.trim() })
    .select('*, profiles(full_name, avatar_url)')
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });

  // Keep comment count on the post in sync
  const { data: post } = await supabaseAdmin
    .from('posts').select('comments').eq('id', id).single();
  await supabaseAdmin
    .from('posts').update({ comments: (post?.comments || 0) + 1 }).eq('id', id);

  const profile = data.profiles as Record<string, string> | null;
  return Response.json({
    id: data.id,
    userId: data.user_id,
    author: profile?.full_name || 'Unknown',
    avatar: profile?.avatar_url || '',
    content: data.content,
    time: 'Just now',
  }, { status: 201 });
}
