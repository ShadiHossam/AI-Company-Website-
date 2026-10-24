// One-off: copies each admin's role from user_metadata to app_metadata.
//
// extractRole() in src/lib/jwt.ts now reads only app_metadata.role, because any
// signed-in user can rewrite their own user_metadata. Run this BEFORE deploying
// that change, or every admin is locked out with ?error=no_role:
//
//   node scripts/migrate-roles-to-app-metadata.mjs          # dry run
//   node scripts/migrate-roles-to-app-metadata.mjs --apply
//
// Reads SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY from .env.local. Admins must
// sign in again afterwards (or wait up to an hour) to get a token with the new claim.
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const env = Object.fromEntries(
  readFileSync(join(root, '.env.local'), 'utf8')
    .split('\n')
    .map((l) => l.match(/^\s*([A-Z0-9_]+)\s*=\s*"?([^"]*)"?\s*$/))
    .filter(Boolean)
    .map((m) => [m[1], m[2]])
);
const url = env.SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error('SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY missing in .env.local');

const apply = process.argv.includes('--apply');
const headers = { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' };

const res = await fetch(`${url}/auth/v1/admin/users?per_page=1000`, { headers });
if (!res.ok) throw new Error(`list users: ${res.status} ${await res.text()}`);
const { users } = await res.json();

for (const u of users) {
  const userRole = u.user_metadata?.role;
  const appRole = u.app_metadata?.role;
  if (!userRole || appRole) {
    console.log(`skip    ${u.email} (app_metadata.role=${appRole ?? '-'}, user_metadata.role=${userRole ?? '-'})`);
    continue;
  }
  if (!apply) {
    console.log(`would   ${u.email}: app_metadata.role = ${userRole}`);
    continue;
  }
  // Supabase merges app_metadata/user_metadata on update, so the other keys
  // (provider, providers, name...) are kept. user_metadata.role is cleared so a
  // stale copy can't be mistaken for the real one later.
  const upd = await fetch(`${url}/auth/v1/admin/users/${u.id}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ app_metadata: { role: userRole }, user_metadata: { role: null } }),
  });
  if (!upd.ok) throw new Error(`${u.email}: ${upd.status} ${await upd.text()}`);
  console.log(`updated ${u.email}: app_metadata.role = ${userRole}`);
}
if (!apply) console.log('\nDry run. Re-run with --apply to write.');
