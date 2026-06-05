import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Lazily created so module evaluation during build doesn't fail without env vars
let _client: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (!_client) {
    _client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }
  return _client;
}

// Proxy keeps the same import surface — all existing usages unchanged
export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_, prop: string) {
    const client = getClient();
    const value = (client as unknown as Record<string, unknown>)[prop];
    return typeof value === 'function' ? (value as Function).bind(client) : value;
  },
});
