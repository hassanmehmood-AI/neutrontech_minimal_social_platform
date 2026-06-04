import { createClient } from '@supabase/supabase-js';
import { type NextRequest } from 'next/server';

export async function getAuthUser(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '') ?? '';
  if (!token) return null;

  const { data: { user } } = await createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: `Bearer ${token}` } } }
  ).auth.getUser();

  return user ?? null;
}
