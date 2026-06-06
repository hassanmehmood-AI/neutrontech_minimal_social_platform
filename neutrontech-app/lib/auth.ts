import { type NextRequest } from 'next/server';
import { supabaseAdmin } from './supabaseAdmin';

export async function getAuthUser(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '') ?? '';
  if (!token) return null;

  const { data: { user } } = await supabaseAdmin.auth.getUser(token);
  return user ?? null;
}
