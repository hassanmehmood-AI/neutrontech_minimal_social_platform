import { type NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { getAuthUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const emailName = user.email?.split('@')[0] || 'user';
    const fullName = user.user_metadata?.full_name;
    // Repeated logins must preserve existing profile edits and permissions.
    const { error } = await supabaseAdmin.from('profiles').upsert({
      id: user.id,
      username: emailName + '_' + user.id.substring(0, 4),
      full_name: typeof fullName === 'string' && fullName.trim() ? fullName.trim() : emailName,
      avatar_url: null,
    }, { onConflict: 'id', ignoreDuplicates: true });

    if (error) return Response.json({ error: 'Unable to prepare profile' }, { status: 500 });
    return Response.json({ success: true });
  } catch {
    return Response.json({ error: 'Unable to prepare profile' }, { status: 500 });
  }
}
