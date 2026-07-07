import { type NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { requireAdmin } from '@/lib/adminAuth';
import { timeAgo } from '@/lib/utils';

export async function GET(request: NextRequest) {
  const { response } = await requireAdmin(request);
  if (response) return response;

  const { data, error } = await supabaseAdmin
    .from('contact_requests')
    .select('id, name, email, message, status, created_at')
    .order('created_at', { ascending: false });

  if (error) return Response.json({ error: error.message }, { status: 500 });

  const requests = (data || []).map((r) => ({
    id: r.id,
    name: r.name || 'Unknown',
    email: r.email || '',
    message: r.message || '',
    status: r.status,
    time: timeAgo(r.created_at as string),
  }));

  return Response.json(requests);
}
