import type { APIRoute } from 'astro';
import { getSupabaseAdmin } from '../../../../lib/supabase';

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

  const postId = url.searchParams.get('post_id');
  if (!postId) {
    return new Response(JSON.stringify({ error: 'post_id required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const supabase = getSupabaseAdmin();
  const versionId = url.searchParams.get('version_id');

  if (versionId) {
    const { data, error } = await supabase
      .from('blog_post_versions')
      .select('*')
      .eq('id', versionId)
      .eq('post_id', postId)
      .single();

    if (error || !data) {
      return new Response(JSON.stringify({ error: 'Version not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ data }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { data, error } = await supabase
    .from('blog_post_versions')
    .select('id, version_num, saved_at, title, status')
    .eq('post_id', postId)
    .order('version_num', { ascending: false })
    .limit(50);

  if (error) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ data }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
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

  let body: { action: string; post_id: string; version_id: string };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (body.action !== 'restore' || !body.post_id || !body.version_id) {
    return new Response(JSON.stringify({ error: 'Invalid request' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const supabase = getSupabaseAdmin();

  const { data: version, error: vErr } = await supabase
    .from('blog_post_versions')
    .select('*')
    .eq('id', body.version_id)
    .eq('post_id', body.post_id)
    .single();

  if (vErr || !version) {
    return new Response(JSON.stringify({ error: 'Version not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Snapshot current post state so the restore itself is undoable
  const { data: current } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('id', body.post_id)
    .single();

  if (current) {
    const { data: maxVer } = await supabase
      .from('blog_post_versions')
      .select('version_num')
      .eq('post_id', body.post_id)
      .order('version_num', { ascending: false })
      .limit(1)
      .single();

    await supabase.from('blog_post_versions').insert({
      post_id: body.post_id,
      version_num: (maxVer?.version_num ?? 0) + 1,
      title: current.title,
      slug: current.slug,
      description: current.description,
      body_markdown: current.body_markdown,
      category: current.category,
      og_image: current.og_image,
      status: current.status,
      pub_date: current.pub_date,
      author_name: current.author_name,
      meta_title: current.meta_title,
      meta_description: current.meta_description,
    });
  }

  const { data: updated, error: updateErr } = await supabase
    .from('blog_posts')
    .update({
      title: version.title,
      slug: version.slug,
      description: version.description,
      body_markdown: version.body_markdown,
      category: version.category,
      og_image: version.og_image,
      status: version.status,
      pub_date: version.pub_date,
      author_name: version.author_name,
      meta_title: version.meta_title,
      meta_description: version.meta_description,
      updated_at: new Date().toISOString(),
    })
    .eq('id', body.post_id)
    .select()
    .single();

  if (updateErr) {
    return new Response(JSON.stringify({ error: updateErr.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  await supabase.from('activity_log').insert({
    action: 'blog.restored',
    entity_type: 'blog_post',
    entity_id: body.post_id,
    user_id: locals.user.id,
    details: { title: updated.title, restored_from_version: version.version_num },
  });

  return new Response(JSON.stringify({ data: updated }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
