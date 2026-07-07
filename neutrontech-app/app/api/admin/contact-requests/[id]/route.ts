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

  if (body.status !== 'new' && body.status !== 'resolved') {
    return Response.json({ error: "status must be 'new' or 'resolved'" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('contact_requests')
    .update({ status: body.status })
    .eq('id', id)
    .select('id, status')
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { response } = await requireAdmin(request);
  if (response) return response;

  const { id } = await params;

  const { error } = await supabaseAdmin.from('contact_requests').delete().eq('id', id);
  if (error) return Response.json({ error: error.message }, { status: 500 });

  return Response.json({ success: true });
}
