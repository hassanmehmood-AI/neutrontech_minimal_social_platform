import { type NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { timeAgo } from '@/lib/utils';

function transform(p: Record<string, unknown>) {
  const profile = p.profiles as Record<string, string> | null;
  return {
    id: p.id,
    userId: p.user_id,
    author: profile?.full_name || 'Unknown User',
    avatar: profile?.avatar_url || '',
    time: timeAgo(p.created_at as string),
    tag: (p.tag as string) || '',
    content: (p.content as string) || '',
    images: (p.images as string[]) || [],
    videoUrl: (p.video_url as string) || undefined,
    likes: (p.likes as number) || 0,
    comments: (p.comments as number) || 0,
  };
}

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('posts')
    .select('*, profiles(full_name, avatar_url)')
    .order('created_at', { ascending: false });

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json((data || []).map(transform));
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { userId, author, avatar, content, images, videoUrl, tag } = body;

  if (!content && (!images || images.length === 0) && !videoUrl) {
    return Response.json({ error: 'Post must have content or media' }, { status: 400 });
  }

  // Only store permanent URLs — blob: URLs are temporary browser objects
  const persistableImages = (images || []).filter((url: string) => !url.startsWith('blob:'));
  const persistableVideo = videoUrl && !videoUrl.startsWith('blob:') ? videoUrl : null;

  if (userId) {
    // Logged-in user: save to Supabase
    const { data, error } = await supabaseAdmin
      .from('posts')
      .insert({
        user_id: userId,
        content: content || '',
        images: persistableImages,
        video_url: persistableVideo,
        tag: tag || null,
      })
      .select('*, profiles(full_name, avatar_url)')
      .single();

    if (error) return Response.json({ error: error.message }, { status: 500 });

    return Response.json(
      { ...transform(data as Record<string, unknown>), images: images || [], videoUrl },
      { status: 201 }
    );
  }

  // Fallback: return a local-only post (no persistence)
  return Response.json(
    {
      id: Date.now(),
      userId: null,
      author: author ?? 'You',
      avatar: avatar ?? '',
      time: 'Just now',
      tag: tag ?? '',
      content: content ?? '',
      images: images ?? [],
      videoUrl,
      likes: 0,
      comments: 0,
    },
    { status: 201 }
  );
}
