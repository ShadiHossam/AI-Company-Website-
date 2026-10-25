import type { APIRoute } from 'astro';
import { getSupabaseAdmin } from '../../../../lib/supabase';
import { sanitizeRichText } from '../../../../lib/sanitize';
import { isScheduled, todayInDubai } from '../../../../lib/scheduledPosts';
import { logActivity } from '../../../../lib/activityLog';

export const prerender = false;

const CSRF = (req: Request) => {
  const origin = req.headers.get('origin') ?? '';
  return import.meta.env.DEV || origin === (import.meta.env.SITE_URL ?? 'https://lenooai.com');
};

export const GET: APIRoute = async ({ locals, url }) => {
  if (!locals.user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const page = parseInt(url.searchParams.get('page') ?? '1', 10);
  const pageSize = 20;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const supabase = getSupabaseAdmin();
  const { data, error, count } = await supabase
    .from('blog_posts')
    .select('*', { count: 'exact' })
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(
    JSON.stringify({ data, total: count ?? 0, page, pageSize }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
};

export const POST: APIRoute = async ({ locals, request }) => {
  if (!locals.user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!CSRF(request)) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { title, slug, description, body_html, category } = body as Record<string, string>;
  if (!title || !slug || !description || !body_html || !category) {
    return new Response(
      JSON.stringify({ error: 'Missing required fields: title, slug, description, body_html, category' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // A scheduled post is stored as published with a future pub_date (see
  // lib/scheduledPosts.ts); the status column has no 'scheduled' value.
  if (body.status === 'scheduled' && (typeof body.pub_date !== 'string' || !isScheduled(body.pub_date))) {
    return new Response(
      JSON.stringify({ error: 'A scheduled post needs a future publish date' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
  const status = body.status === 'scheduled' ? 'published' : ((body.status as string) ?? 'draft');
  const now = todayInDubai();

  const insertData: Record<string, unknown> = {
    title,
    slug,
    description,
    // Same allowlist the public page renders with, applied on save too.
    body_html: sanitizeRichText(body_html),
    category,
    status,
    og_image: (body.og_image as string) ?? '/assets/og-blog.jpg',
    author_name: (body.author_name as string) ?? 'Lenoo AI',
    pub_date: status === 'published' ? ((body.pub_date as string) ?? now) : status === 'scheduled' ? ((body.pub_date as string) ?? null) : (body.pub_date as string) ?? null,
    meta_title: (body.meta_title as string) ?? null,
    meta_description: (body.meta_description as string) ?? null,
    focus_keyword: (body.focus_keyword as string) ?? null,
    ar_title: (body.ar_title as string) || null,
    ar_description: (body.ar_description as string) || null,
    ar_body_markdown: (body.ar_body_markdown as string) || null,
    ar_meta_title: (body.ar_meta_title as string) || null,
    ar_meta_description: (body.ar_meta_description as string) || null,
  };

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('blog_posts')
    .insert(insertData)
    .select()
    .single();

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Insert post→tag associations if any
  const tagIds = Array.isArray(body.tag_ids) ? body.tag_ids as string[] : [];
  if (tagIds.length > 0) {
    await supabase.from('blog_post_tags').insert(
      tagIds.map(tag_id => ({ post_id: data.id, tag_id }))
    );
  }

  // Write activity log if published
  if (status === 'published') {
    await logActivity({
      action: 'blog.published',
      entity_type: 'blog_post',
      entity_id: data.id,
      admin_email: locals.user.email,
      after_value: { title },
    });
  }

  return new Response(JSON.stringify({ data }), {
    status: 201,
    headers: { 'Content-Type': 'application/json' },
  });
};
