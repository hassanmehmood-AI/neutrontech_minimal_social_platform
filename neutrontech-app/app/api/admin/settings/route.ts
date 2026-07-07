import { type NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { requireAdmin } from '@/lib/adminAuth';

export async function GET(request: NextRequest) {
  const { response } = await requireAdmin(request);
  if (response) return response;

  const { data, error } = await supabaseAdmin
    .from('app_settings')
    .select('allow_signups, post_approval, public_profiles, contact_form')
    .eq('id', 1)
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data);
}

export async function PATCH(request: NextRequest) {
  const { response } = await requireAdmin(request);
  if (response) return response;

  const body = await request.json();
  const updateData: Record<string, boolean> = {};
  for (const key of ['allow_signups', 'post_approval', 'public_profiles', 'contact_form'] as const) {
    if (typeof body[key] === 'boolean') updateData[key] = body[key];
  }

  const { data, error } = await supabaseAdmin
    .from('app_settings')
    .update(updateData)
    .eq('id', 1)
    .select('allow_signups, post_approval, public_profiles, contact_form')
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data);
}
