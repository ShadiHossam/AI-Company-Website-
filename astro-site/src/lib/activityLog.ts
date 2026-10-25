import { getSupabaseAdmin } from './supabase';

export interface ActivityEntry {
  action: string;
  entity_type?: string | null;
  entity_id?: string | null;
  admin_email: string;
  before_value?: unknown;
  after_value?: unknown;
}

// Audit-log write shared by the admin API routes. A failure is logged, never
// thrown: the action it records has already happened. Before this, every route
// ignored the insert's error, which is how a column mismatch once dropped all
// blog/trash entries without anyone noticing.
export async function logActivity(entry: ActivityEntry): Promise<void> {
  const { error } = await getSupabaseAdmin().from('activity_log').insert(entry);
  if (error) console.error(`[activity_log] ${entry.action} not recorded:`, error.message);
}
