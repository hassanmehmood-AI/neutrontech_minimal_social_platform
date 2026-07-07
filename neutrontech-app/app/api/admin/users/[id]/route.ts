import { type NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { requireAdmin } from '@/lib/adminAuth';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, isSuperAdmin, response } = await requireAdmin(request);
  if (response) return response;

  const { id } = await params;
  const body = await request.json();

  if (typeof body.isAdmin !== 'boolean') {
    return Response.json({ error: 'isAdmin (boolean) is required' }, { status: 400 });
  }

  if (user!.id === id && body.isAdmin === false) {
    return Response.json({ error: 'Cannot remove your own admin access' }, { status: 400 });
  }

  if (body.isAdmin === true && !isSuperAdmin) {
    return Response.json({ error: 'Only the super admin can appoint new admins' }, { status: 403 });
  }

  const { data: target } = await supabaseAdmin
    .from('profiles')
    .select('is_super_admin')
    .eq('id', id)
    .single();

  if (target?.is_super_admin) {
    return Response.json({ error: 'Cannot modify a super admin account' }, { status: 403 });
  }

  const { data, error } = await supabaseAdmin
    .from('profiles')
    .update({ is_admin: body.isAdmin })
    .eq('id', id)
    .select('id, is_admin')
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, response } = await requireAdmin(request);
  if (response) return response;

  const { id } = await params;

  if (user!.id === id) {
    return Response.json({ error: 'Cannot delete your own account' }, { status: 400 });
  }

  const { data: target } = await supabaseAdmin
    .from('profiles')
    .select('is_super_admin')
    .eq('id', id)
    .single();

  if (target?.is_super_admin) {
    return Response.json({ error: 'Cannot delete a super admin account' }, { status: 403 });
  }

  const { error } = await supabaseAdmin.auth.admin.deleteUser(id);
  if (error) return Response.json({ error: error.message }, { status: 500 });

  return Response.json({ success: true });
}
