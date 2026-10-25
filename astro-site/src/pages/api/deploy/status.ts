import type { APIRoute } from 'astro';
import { readFile } from 'node:fs/promises';
import { verifyWebhook } from '../../../lib/webhookAuth';

export const prerender = false;

// Companion to /api/deploy/publish: that route fires the publish script detached and
// returns immediately (see its own comment for why), so this is the only way to check
// what actually happened without SSH access. Returns the tail of the same log file
// scripts/publish-batch.sh already writes to.
const LOG_PATH = '/home/zash7309/publish-repo-scripts/daily-publish.log';
const TAIL_LINES = 60;

export const GET: APIRoute = async ({ request }) => {
  if (import.meta.env.DEPLOY_TARGET !== 'o2switch') {
    return new Response(JSON.stringify({ error: 'Not available on this deployment target' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Signed with a timestamp (see lib/webhookAuth.ts) rather than a static bearer token.
  if (!verifyWebhook(request, '', import.meta.env.DEPLOY_WEBHOOK_SECRET)) {
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
    // The error text holds server paths; keep it in the server log only.
    console.error('[deploy/status] read failed:', err);
    return new Response(JSON.stringify({ error: 'Could not read log' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
