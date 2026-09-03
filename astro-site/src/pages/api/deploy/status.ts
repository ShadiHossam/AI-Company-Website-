import type { APIRoute } from 'astro';
import { readFile } from 'node:fs/promises';
import { timingSafeEqual } from 'node:crypto';

export const prerender = false;

// Companion to /api/deploy/publish: that route fires the publish script detached and
// returns immediately (see its own comment for why), so this is the only way to check
// what actually happened without SSH access. Returns the tail of the same log file
// scripts/publish-batch.sh already writes to.
const LOG_PATH = '/home/zash7309/publish-repo-scripts/daily-publish.log';
const TAIL_LINES = 60;

function secretsMatch(provided: string, expected: string): boolean {
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export const GET: APIRoute = async ({ request }) => {
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

  try {
    const content = await readFile(LOG_PATH, 'utf-8');
    const tail = content.split('\n').slice(-TAIL_LINES).join('\n');
    return new Response(JSON.stringify({ log: tail }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Could not read log', detail: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
