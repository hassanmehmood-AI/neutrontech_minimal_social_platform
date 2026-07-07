import { type NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { db } from '@/lib/mockData';

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')?.toLowerCase().trim() ?? '';

  if (q) {
    supabaseAdmin.from('search_logs').insert({ query: q }).then(() => {});
  }

  // People from real Supabase profiles
  let peopleQuery = supabaseAdmin
    .from('profiles')
    .select('id, full_name, username, role, avatar_url');

  if (q) {
    peopleQuery = peopleQuery.or(
      `full_name.ilike.%${q}%,role.ilike.%${q}%,username.ilike.%${q}%`
    ) as typeof peopleQuery;
  }

  const { data: rawPeople } = await peopleQuery;
  const people = (rawPeople || []).map((u) => ({
    id: u.id,
    name: u.full_name || u.username || 'User',
    role: u.role || '',
    avatar: u.avatar_url || '',
  }));

  // Posts and topics still from mock data (feed posts have no title)
  const posts = db.searchPosts.filter(
    (p) =>
      !q ||
      p.title.toLowerCase().includes(q) ||
      p.content.toLowerCase().includes(q) ||
      p.tag.toLowerCase().includes(q)
  );
  const topics = db.topics.filter(
    (t) => !q || t.name.toLowerCase().includes(q) || t.category.toLowerCase().includes(q)
  );

  return Response.json({ people, posts, topics });
}
