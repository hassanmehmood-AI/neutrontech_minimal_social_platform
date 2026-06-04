import { type NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(request: NextRequest) {
  const { userId, fullName, email } = await request.json();

  const username = email.split('@')[0] + '_' + userId.substring(0, 4);

  const { error } = await supabaseAdmin.from('profiles').insert({
    id: userId,
    username,
    full_name: fullName || email.split('@')[0],
    avatar_url: null,
  });

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ success: true });
}
