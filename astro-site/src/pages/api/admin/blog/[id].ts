import type { APIRoute } from 'astro';
import { getSupabaseAdmin } from '../../../../lib/supabase';

export const prerender = false;

const CSRF = (req: Request) => {
  const origin = req.headers.get('origin') ?? '';
  return import.meta.env.DEV || origin === (import.meta.env.SITE_URL ?? 'https://lenooai.com');
};

export const GET: APIRoute = async ({ locals, params }) => {
  if (!locals.user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { id } = params;
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('id', id!)
    .single();

  if (error || !data) {
    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ data }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};

export const PATCH: APIRoute = async ({ locals, params, request }) => {
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

  const { id } = params;
  const supabase = getSupabaseAdmin();

  const createVersion = body._create_version === true;

  // Fetch current post to check status transition and optionally snapshot
  const { data: existing } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('id', id!)
    .single();

  const newStatus = body.status as string | undefined;
  const isPublishing = newStatus === 'published' && existing?.status !== 'published';

  // Allowlist the columns that can be updated — prevents mass assignment
  const allowedFields = [
    'title', 'slug', 'description', 'body_html', 'body_markdown', 'category',
    'status', 'og_image', 'author_name', 'pub_date',
    'meta_title', 'meta_description', 'focus_keyword',
    'ar_title', 'ar_description', 'ar_body_markdown',
    'ar_meta_title', 'ar_meta_description',
  ] as const;

  const updates: Record<string, unknown> = {};
  for (const field of allowedFields) {
    if (field in body) updates[field] = body[field];
  }

  // Auto-set pub_date when first publishing
  if (isPublishing && !updates.pub_date && !existing?.pub_date) {
    updates.pub_date = new Date().toISOString().split('T')[0];
  }

  updates.updated_at = new Date().toISOString();

  // Snapshot the current post as a new version before overwriting
  if (createVersion && existing) {
    const { data: maxVer } = await supabase
      .from('blog_post_versions')
      .select('version_num')
      .eq('post_id', id)
      .order('version_num', { ascending: false })
      .limit(1)
      .single();

    await supabase.from('blog_post_versions').insert({
      post_id: id,
      version_num: (maxVer?.version_num ?? 0) + 1,
      title: existing.title,
      slug: existing.slug,
      description: existing.description,
      body_markdown: existing.body_markdown,
      body_html: existing.body_html,
      category: existing.category,
      og_image: existing.og_image,
      status: existing.status,
      pub_date: existing.pub_date,
      author_name: existing.author_name,
      meta_title: existing.meta_title,
      meta_description: existing.meta_description,
    });
  }

  const { data, error } = await supabase
    .from('blog_posts')
    .update(updates)
    .eq('id', id!)
    .select()
    .single();

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Sync tags if tag_ids provided
  if (Array.isArray(body.tag_ids)) {
    const tagIds = body.tag_ids as string[];
    await supabase.from('blog_post_tags').delete().eq('post_id', id!);
    if (tagIds.length > 0) {
      await supabase.from('blog_post_tags').insert(
        tagIds.map(tag_id => ({ post_id: id!, tag_id }))
      );
    }
  }

  // Write activity log
  const action = isPublishing ? 'blog.published' : 'blog.updated';
  await supabase.from('activity_log').insert({
    action,
    entity_type: 'blog_post',
    entity_id: id,
    admin_email: locals.user.email,
    after_value: { title: data.title },
  });

  return new Response(JSON.stringify({ data }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};

export const DELETE: APIRoute = async ({ locals, params, request }) => {
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

  const { id } = params;
  const supabase = getSupabaseAdmin();

  // Fetch title for activity log before deleting
  const { data: existing } = await supabase
    .from('blog_posts')
    .select('title')
    .eq('id', id!)
    .single();

  const { error } = await supabase
    .from('blog_posts')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id!);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  await supabase.from('activity_log').insert({
    action: 'blog.deleted',
    entity_type: 'blog_post',
    entity_id: id,
    admin_email: locals.user.email,
    before_value: { title: existing?.title ?? '' },
  });

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
