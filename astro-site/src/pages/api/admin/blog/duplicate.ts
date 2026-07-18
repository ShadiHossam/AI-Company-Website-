import type { APIRoute } from 'astro';
import { getSupabaseAdmin } from '../../../../lib/supabase';

export const prerender = false;

const CSRF = (req: Request) => {
  const origin = req.headers.get('origin') ?? '';
  return import.meta.env.DEV || origin === (import.meta.env.SITE_URL ?? 'https://lenooai.com');
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

  let body: { id: string };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!body.id) {
    return new Response(JSON.stringify({ error: 'id required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const supabase = getSupabaseAdmin();

  const { data: source, error: fetchErr } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('id', body.id)
    .single();

  if (fetchErr || !source) {
    return new Response(JSON.stringify({ error: 'Post not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Make slug unique by appending timestamp
  const copySlug = `${source.slug}-copy-${Date.now().toString(36)}`;

  const { data, error } = await supabase
    .from('blog_posts')
    .insert({
      title: `${source.title} (Copy)`,
      slug: copySlug,
      description: source.description,
      body_markdown: source.body_markdown,
      body_html: source.body_html,
      category: source.category,
      status: 'draft',
      og_image: source.og_image,
      author_name: source.author_name,
      meta_title: source.meta_title,
      meta_description: source.meta_description,
      focus_keyword: source.focus_keyword,
      ar_title: source.ar_title,
      ar_description: source.ar_description,
      ar_body_markdown: source.ar_body_markdown,
      ar_meta_title: source.ar_meta_title,
      ar_meta_description: source.ar_meta_description,
      pub_date: null,
    })
    .select()
    .single();

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  await supabase.from('activity_log').insert({
    action: 'blog.duplicated',
    entity_type: 'blog_post',
    entity_id: data.id,
    admin_email: locals.user.email,
    after_value: { title: data.title, source_id: body.id },
  });

  return new Response(JSON.stringify({ data }), {
    status: 201,
    headers: { 'Content-Type': 'application/json' },
  });
};
