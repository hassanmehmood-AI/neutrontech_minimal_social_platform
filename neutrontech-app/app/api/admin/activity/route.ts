import { type NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { requireAdmin } from '@/lib/adminAuth';

type Range = 'today' | 'week' | 'month';

function bucketConfig(range: Range) {
  const now = new Date();
  if (range === 'today') {
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    const labels = Array.from({ length: 24 }, (_, h) => `${String(h).padStart(2, '0')}:00`);
    return { start, bucketOf: (d: Date) => d.getHours(), labels };
  }
  if (range === 'week') {
    const start = new Date(now);
    start.setDate(start.getDate() - 6);
    start.setHours(0, 0, 0, 0);
    const labels = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      return d.toLocaleDateString('en-US', { weekday: 'short' });
    });
    return {
      start,
      bucketOf: (d: Date) => Math.floor((d.getTime() - start.getTime()) / 86400000),
      labels,
    };
  }
  const start = new Date(now);
  start.setDate(start.getDate() - 29);
  start.setHours(0, 0, 0, 0);
  const labels = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  });
  return {
    start,
    bucketOf: (d: Date) => Math.floor((d.getTime() - start.getTime()) / 86400000),
    labels,
  };
}

export async function GET(request: NextRequest) {
  const { response } = await requireAdmin(request);
  if (response) return response;

  const range = (request.nextUrl.searchParams.get('range') as Range) || 'today';
  const { start, bucketOf, labels } = bucketConfig(range);
  const startIso = start.toISOString();

  const [{ data: posts }, { data: comments }, { data: signups }] = await Promise.all([
    supabaseAdmin.from('posts').select('created_at').gte('created_at', startIso),
    supabaseAdmin.from('comments').select('created_at').gte('created_at', startIso),
    supabaseAdmin.from('profiles').select('created_at').gte('created_at', startIso),
  ]);

  const counts = new Array(labels.length).fill(0);
  for (const rows of [posts, comments, signups]) {
    for (const row of rows || []) {
      const idx = bucketOf(new Date(row.created_at as string));
      if (idx >= 0 && idx < counts.length) counts[idx]++;
    }
  }

  return Response.json({
    labels,
    counts,
    total: counts.reduce((a, b) => a + b, 0),
  });
}
