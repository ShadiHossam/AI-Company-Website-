import type { APIRoute } from 'astro';
import { getSupabaseAdmin, supabaseConfigured } from '../../../../lib/supabase';

export const prerender = false;

const CSRF = (req: Request) => {
  const origin = req.headers.get('origin') ?? '';
  return import.meta.env.DEV || origin === (import.meta.env.SITE_URL ?? 'https://aegisai.ae');
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

  if (!supabaseConfigured) {
    return new Response(
      JSON.stringify({ error: 'Database not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env.local file.' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
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

  const { title, slug, description, body_markdown, category } = body as Record<string, string>;
  if (!title || !slug || !description || !body_markdown || !category) {
    return new Response(
      JSON.stringify({ error: 'Missing required fields: title, slug, description, body_markdown, category' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const status = (body.status as string) ?? 'draft';
  const now = new Date().toISOString().split('T')[0];

  const insertData: Record<string, unknown> = {
    title,
    slug,
    description,
    body_markdown,
    category,
    status,
    og_image: (body.og_image as string) ?? '/assets/og-blog.jpg',
    author_name: (body.author_name as string) ?? 'Aegis AI',
    pub_date: status === 'published' ? ((body.pub_date as string) ?? now) : (body.pub_date as string) ?? null,
    meta_title: (body.meta_title as string) ?? null,
    meta_description: (body.meta_description as string) ?? null,
    focus_keyword: (body.focus_keyword as string) ?? null,
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

  // Write activity log if published
  if (status === 'published') {
    await supabase.from('activity_log').insert({
      action: 'blog.published',
      entity_type: 'blog_post',
      entity_id: data.id,
      user_id: locals.user.id,
      details: { title },
    });
  }

  return new Response(JSON.stringify({ data }), {
    status: 201,
    headers: { 'Content-Type': 'application/json' },
  });
};
