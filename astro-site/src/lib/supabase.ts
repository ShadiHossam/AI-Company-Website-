import { createClient } from '@supabase/supabase-js';
import ws from 'ws';

export function getSupabaseAdmin() {
  return createClient(
    import.meta.env.SUPABASE_URL,
    import.meta.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: { autoRefreshToken: false, persistSession: false },
      realtime: { transport: ws },
    }
  );
}
