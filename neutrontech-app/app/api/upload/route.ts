import { type NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { getAuthUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const formData = await request.formData();
  const file = formData.get('file') as File | null;
  if (!file) return Response.json({ error: 'No file provided' }, { status: 400 });

  const ext  = file.name.split('.').pop() || 'jpg';
  const path = `posts/${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error } = await supabaseAdmin.storage
    .from('avatars')
    .upload(path, file, { contentType: file.type, upsert: false });

  if (error) return Response.json({ error: error.message }, { status: 500 });

  const { data } = supabaseAdmin.storage.from('avatars').getPublicUrl(path);
  return Response.json({ url: data.publicUrl });
}
