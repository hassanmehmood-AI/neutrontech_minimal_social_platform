import { type NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { getAuthUser } from '@/lib/auth';
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
    videoUrls: (p.video_urls as string[]) || [],
    likes: (p.likes as number) || 0,
    comments: (p.comments as number) || 0,
  };
}

export async function GET(request: NextRequest) {
  const user = await getAuthUser(request);

  const [{ data, error }, { data: userLikes }] = await Promise.all([
    supabaseAdmin
      .from('posts')
      .select('*, profiles(full_name, avatar_url)')
      .order('created_at', { ascending: false }),
    user
      ? supabaseAdmin.from('likes').select('post_id').eq('user_id', user.id)
      : Promise.resolve({ data: [] }),
  ]);

  if (error) return Response.json({ error: error.message }, { status: 500 });

  const likedIds = new Set((userLikes || []).map((l: { post_id: number }) => l.post_id));
  return Response.json(
    (data || []).map((p) => ({ ...transform(p), likedByMe: likedIds.has(Number(p.id)) }))
  );
}

export async function POST(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { content, images, videoUrls, tag } = body;

  if (!content && (!images || images.length === 0) && (!videoUrls || videoUrls.length === 0)) {
    return Response.json({ error: 'Post must have content or media' }, { status: 400 });
  }

  const persistableImages = (images || []).filter((url: string) => !url.startsWith('blob:'));
  const persistableVideos = (videoUrls || []).filter((url: string) => !url.startsWith('blob:'));

  const { data, error } = await supabaseAdmin
    .from('posts')
    .insert({
      user_id: user.id,
      content: content || '',
      images: persistableImages,
      video_urls: persistableVideos,
      tag: tag || null,
    })
    .select('*, profiles(full_name, avatar_url)')
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });

  return Response.json(
    { ...transform(data as Record<string, unknown>), images: images || [], videoUrls: videoUrls || [] },
    { status: 201 }
  );
}
