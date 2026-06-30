import type { APIRoute } from 'astro';
import { getSupabaseAdmin } from '../../../../lib/supabase';

export const prerender = false;

export const GET: APIRoute = async ({ locals }) => {
  if (!locals.user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const supabase = getSupabaseAdmin();

  // Fetch all media URLs
  const { data: mediaRows, error: mediaErr } = await supabase
    .from('media')
    .select('id, public_url');

  if (mediaErr || !mediaRows) {
    return new Response(JSON.stringify({ error: 'Failed to load media' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Fetch all blog post content fields that may reference images
  const { data: posts } = await supabase
    .from('blog_posts')
    .select('body_markdown, ar_body_markdown, og_image');

  // Build a usage count map: media_id → count
  const usageCount: Record<string, number> = {};

  if (posts) {
    for (const media of mediaRows) {
      const url = media.public_url;
      let count = 0;
      for (const post of posts) {
        if (post.body_markdown?.includes(url)) count++;
        if (post.ar_body_markdown?.includes(url)) count++;
        if (post.og_image === url) count++;
      }
      if (count > 0) usageCount[media.id] = count;
    }
  }

  return new Response(JSON.stringify({ usage: usageCount }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
