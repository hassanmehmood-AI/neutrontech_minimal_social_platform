import { type NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { requireAdmin } from '@/lib/adminAuth';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { response } = await requireAdmin(request);
  if (response) return response;

  const { id } = await params;
  const body = await request.json();

  if (body.status !== 'pending' && body.status !== 'published') {
    return Response.json({ error: "status must be 'pending' or 'published'" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('posts')
    .update({ status: body.status })
    .eq('id', id)
    .select('id, status')
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data);
}
