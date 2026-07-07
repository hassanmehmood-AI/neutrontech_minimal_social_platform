import { type NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { requireAdmin } from '@/lib/adminAuth';

export async function GET(request: NextRequest) {
  const { response } = await requireAdmin(request);
  if (response) return response;

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabaseAdmin
    .from('search_logs')
    .select('query')
    .gte('created_at', sevenDaysAgo);

  if (error) return Response.json({ error: error.message }, { status: 500 });

  const counts = new Map<string, number>();
  for (const row of data || []) {
    const q = (row.query || '').trim().toLowerCase();
    if (!q) continue;
    counts.set(q, (counts.get(q) || 0) + 1);
  }

  const keywords = Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([query, count]) => ({ query, count }));

  return Response.json(keywords);
}
