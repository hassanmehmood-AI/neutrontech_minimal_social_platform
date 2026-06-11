import { type NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { getAuthUser } from '@/lib/auth';
import { timeAgo } from '@/lib/utils';

// NOTE: Replies require this one-time migration in Supabase SQL editor:
// ALTER TABLE comments ADD COLUMN IF NOT EXISTS parent_id bigint REFERENCES comments(id) ON DELETE CASCADE;

function mapComment(c: Record<string, unknown>, replyCount = 0) {
  const profile = c.profiles as Record<string, string> | null;
  return {
    id: c.id,
    userId: c.user_id,
    author: profile?.full_name || 'Unknown',
    avatar: profile?.avatar_url || '',
    content: c.content,
    time: timeAgo(c.created_at as string),
    replyCount,
  };
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const url = new URL(req.url);
  const parentId = url.searchParams.get('parent_id');

  if (parentId) {
    // Fetch replies for a specific comment
    const { data, error } = await supabaseAdmin
      .from('comments')
      .select('*, profiles(full_name, avatar_url)')
      .eq('post_id', id)
      .eq('parent_id', parentId)
      .order('created_at', { ascending: true });

    if (error) return Response.json({ error: error.message }, { status: 500 });
    return Response.json((data || []).map((c) => mapComment(c as Record<string, unknown>)));
  }

  // Fetch top-level comments only (parent_id IS NULL)
  const { data, error } = await supabaseAdmin
    .from('comments')
    .select('*, profiles(full_name, avatar_url)')
    .eq('post_id', id)
    .is('parent_id', null)
    .order('created_at', { ascending: true });

  // Graceful fallback if parent_id column doesn't exist yet
  if (error) {
    if (error.message.includes('parent_id')) {
      const { data: allData, error: allError } = await supabaseAdmin
        .from('comments')
        .select('*, profiles(full_name, avatar_url)')
        .eq('post_id', id)
        .order('created_at', { ascending: true });
      if (allError) return Response.json({ error: allError.message }, { status: 500 });
      return Response.json((allData || []).map((c) => mapComment(c as Record<string, unknown>)));
    }
    return Response.json({ error: error.message }, { status: 500 });
  }

  // Get reply counts for all top-level comments in one query
  const replyCounts: Record<string, number> = {};
  if (data && data.length > 0) {
    const commentIds = data.map((c: { id: number }) => c.id);
    const { data: replyData } = await supabaseAdmin
      .from('comments')
      .select('parent_id')
      .in('parent_id', commentIds);
    (replyData || []).forEach((r: { parent_id: string }) => {
      replyCounts[r.parent_id] = (replyCounts[r.parent_id] || 0) + 1;
    });
  }

  return Response.json(
    (data || []).map((c) => mapComment(c as Record<string, unknown>, replyCounts[String(c.id)] || 0))
  );
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser(request);
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const { content, parent_id } = await request.json();
  if (!content?.trim()) return Response.json({ error: 'Content required' }, { status: 400 });

  const insertData: Record<string, unknown> = {
    post_id: Number(id),
    user_id: user.id,
    content: content.trim(),
  };
  if (parent_id) insertData.parent_id = Number(parent_id);

  const { data, error } = await supabaseAdmin
    .from('comments')
    .insert(insertData)
    .select('*, profiles(full_name, avatar_url)')
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });

  // Only increment post comment count for top-level comments
  if (!parent_id) {
    const { data: post } = await supabaseAdmin
      .from('posts').select('comments').eq('id', id).single();
    await supabaseAdmin
      .from('posts').update({ comments: (post?.comments || 0) + 1 }).eq('id', id);
  }

  return Response.json(mapComment(data as Record<string, unknown>), { status: 201 });
}
