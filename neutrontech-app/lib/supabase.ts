import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let client: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (client) return client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!url || !anonKey) {
    const missing = [
      !url && 'NEXT_PUBLIC_SUPABASE_URL',
      !anonKey && 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    ].filter((name): name is string => Boolean(name));
    throw new Error(
      `Supabase is not configured. Set ${missing.join(' and ')} in .env.local. Copy .env.example and restart the dev server.`
    );
  }

  client = createClient(url, anonKey);
  return client;
}

export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, property: string | symbol) {
    const instance = getClient();
    const value = Reflect.get(instance, property, instance);
    return typeof value === 'function' ? value.bind(instance) : value;
  },
});
