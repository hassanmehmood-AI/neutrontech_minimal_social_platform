import { type NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  const { data: settings } = await supabaseAdmin
    .from('app_settings')
    .select('contact_form')
    .eq('id', 1)
    .single();

  if (settings && settings.contact_form === false) {
    return Response.json({ error: 'The contact form is currently disabled' }, { status: 403 });
  }

  const body = await request.json();
  const name = (body.name || '').trim();
  const email = (body.email || '').trim();
  const message = (body.message || '').trim();

  if (!name || !email || !message) {
    return Response.json({ error: 'Name, email, and message are required' }, { status: 400 });
  }
  if (!EMAIL_RE.test(email)) {
    return Response.json({ error: 'Enter a valid email address' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('contact_requests')
    .insert({ name, email, message })
    .select('id, created_at')
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });

  return Response.json(data, { status: 201 });
}
