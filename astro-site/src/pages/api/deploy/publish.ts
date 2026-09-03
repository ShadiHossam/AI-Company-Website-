import type { APIRoute } from 'astro';
import { spawn } from 'node:child_process';
import { timingSafeEqual } from 'node:crypto';

export const prerender = false;

// Triggers the existing o2switch daily-publish pipeline (pick from queue -> commit ->
// push -> build+verify staging -> build+verify prod) over plain HTTPS instead of SSH.
//
// Why this exists: GitHub Actions runners can reach this site over HTTPS (it's a public
// website) but cannot reach o2switch over SSH — o2switch's firewall rejects connections
// from GitHub's runner IPs outright ("Connection timed out"), confirmed by a live test.
// This route runs ON the o2switch server already (same account/permissions the cron job
// already used), so no SSH hop is needed — GitHub Actions just POSTs a bearer secret here
// on its schedule instead of the o2switch crontab firing the script directly.
//
// Fire-and-forget by design: the actual publish (commit/push/build x2/restart x2/verify)
// can take minutes, longer than a cPanel reverse-proxy's request timeout can be trusted
// to allow. The script already has its own mkdir-based lock (see publish-batch.sh), so
// firing it detached and returning immediately is safe even if EN and AR are triggered
// back-to-back — the second run just waits for the first's lock.
const SCRIPTS: Record<string, string> = {
  en: '/home/zash7309/publish-repo-scripts/daily-publish-en.sh',
  ar: '/home/zash7309/publish-repo-scripts/daily-publish-ar.sh',
};

function secretsMatch(provided: string, expected: string): boolean {
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export const POST: APIRoute = async ({ request }) => {
  // Only meaningful on the o2switch Node deployment — the scripts this triggers don't
  // exist on Vercel, and Vercel's serverless functions can't run a detached child process
  // that outlives the request anyway.
  if (import.meta.env.DEPLOY_TARGET !== 'o2switch') {
    return new Response(JSON.stringify({ error: 'Not available on this deployment target' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const expected = import.meta.env.DEPLOY_WEBHOOK_SECRET;
  const auth = request.headers.get('authorization') ?? '';
  const provided = auth.startsWith('Bearer ') ? auth.slice(7) : '';

  if (!expected || !provided || !secretsMatch(provided, expected)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let target: string | undefined;
  try {
    const body = await request.json();
    target = body?.target;
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body, expected {"target":"en"|"ar"}' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const script = target ? SCRIPTS[target] : undefined;
  if (!script) {
    return new Response(JSON.stringify({ error: 'target must be "en" or "ar"' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const child = spawn('/bin/bash', [script], { detached: true, stdio: 'ignore' });
  child.unref();

  return new Response(JSON.stringify({ status: 'started', target }), {
    status: 202,
    headers: { 'Content-Type': 'application/json' },
  });
};
