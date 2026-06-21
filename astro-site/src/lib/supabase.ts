import { createClient } from '@supabase/supabase-js';
import ws from 'ws';

// Node 20 lacks native WebSocket; polyfill it for Supabase Realtime
if (!globalThis.WebSocket) {
  (globalThis as any).WebSocket = ws;
}

const SUPABASE_URL = import.meta.env.SUPABASE_URL ?? '';
export const supabaseConfigured = SUPABASE_URL.length > 0 && !SUPABASE_URL.includes('placeholder');

// When credentials are placeholders, return a chainable mock that resolves immediately
// so none of the 38+ API routes hang waiting for a connection that will never succeed.
function createMockClient() {
  const empty = { data: null, error: null, count: 0, status: 200, statusText: 'OK' };
  const chain: any = new Proxy(Promise.resolve(empty), {
    get(_t, prop) {
      if (prop === 'then' || prop === 'catch' || prop === 'finally') {
        return Promise.resolve(empty)[prop as 'then'].bind(Promise.resolve(empty));
      }
      return () => chain;
    },
  });
  const client: any = new Proxy({} as any, {
    get(_t, prop) {
      if (prop === 'from' || prop === 'rpc') return () => chain;
      return () => chain;
    },
  });
  return client;
}

let _adminClient: ReturnType<typeof createClient> | null = null;

export function getSupabaseAdmin() {
  if (!supabaseConfigured) return createMockClient();
  if (!_adminClient) {
    _adminClient = createClient(
      SUPABASE_URL,
      import.meta.env.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );
  }
  return _adminClient;
}
