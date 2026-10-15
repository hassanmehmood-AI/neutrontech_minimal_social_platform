import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Lazily created so module evaluation during build doesn't fail without env vars
let _client: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (!_client) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

    if (!url || !serviceRoleKey) {
      const missing = [
        !url && 'NEXT_PUBLIC_SUPABASE_URL',
        !serviceRoleKey && 'SUPABASE_SERVICE_ROLE_KEY',
      ].filter((name): name is string => Boolean(name));
      throw new Error(
        `Supabase admin is not configured. Set ${missing.join(' and ')} in .env.local. Copy .env.example and restart the dev server.`
      );
    }

    _client = createClient(url, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });
  }
  return _client;
}

// Proxy keeps the same import surface — all existing usages unchanged
export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_, prop: string | symbol) {
    const client = getClient();
    const value = Reflect.get(client, prop, client);
    return typeof value === 'function' ? value.bind(client) : value;
  },
});
