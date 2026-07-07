import { type NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { requireAdmin } from '@/lib/adminAuth';
import { timeAgo } from '@/lib/utils';

export async function GET(request: NextRequest) {
  const { response } = await requireAdmin(request);
  if (response) return response;

  const { data, error } = await supabaseAdmin
    .from('posts')
    .select('id, content, tag, status, likes, comments, created_at, profiles(full_name)')
    .order('created_at', { ascending: false });

  if (error) return Response.json({ error: error.message }, { status: 500 });

  const posts = (data || []).map((p) => {
    const profile = p.profiles as unknown as { full_name: string | null } | null;
    return {
      id: p.id,
      title: (p.content || '').slice(0, 80),
      author: profile?.full_name || 'Unknown User',
      status: p.status,
      likes: p.likes || 0,
      comments: p.comments || 0,
      time: timeAgo(p.created_at as string),
    };
  });

  return Response.json(posts);
}
