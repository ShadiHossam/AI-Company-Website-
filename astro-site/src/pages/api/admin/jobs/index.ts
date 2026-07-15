import type { APIRoute } from 'astro';
import { getSupabaseAdmin } from '../../../../lib/supabase';

export const prerender = false;

const CSRF_CHECK = (req: Request) => {
  const origin = req.headers.get('origin') ?? '';
  const siteUrl = import.meta.env.SITE_URL ?? 'https://lenooai.com';
  return import.meta.env.DEV || origin === siteUrl;
};

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

// GET /api/admin/jobs — list all jobs
export const GET: APIRoute = async ({ locals }) => {
  if (!locals.user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .is('deleted_at', null)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });

  if (error) return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  return new Response(JSON.stringify({ jobs: data ?? [] }), { headers: { 'Content-Type': 'application/json' } });
};

// POST /api/admin/jobs — create a new job
export const POST: APIRoute = async ({ locals, request }) => {
  if (!locals.user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  if (!CSRF_CHECK(request)) return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });

  let body: Record<string, unknown>;
  try { body = await request.json(); } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 });
  }

  const { title, department, location, job_type, description, requirements, nice_to_have, benefits, salary_range, published, sort_order } = body as Record<string, unknown>;

  if (!title || !description) {
    return new Response(JSON.stringify({ error: 'title and description are required' }), { status: 400 });
  }

  const slug = slugify(String(title));
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from('jobs')
    .insert({
      title: String(title).trim(),
      slug,
      department: department ? String(department).trim() : null,
      location: location ? String(location).trim() : 'Dubai, UAE',
      job_type: job_type ? String(job_type).trim() : 'Full-time',
      description: String(description).trim(),
      requirements: requirements ?? [],
      nice_to_have: nice_to_have ?? [],
      benefits: benefits ?? [],
      salary_range: salary_range ? String(salary_range).trim() : null,
      published: Boolean(published),
      sort_order: Number(sort_order ?? 0),
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return new Response(JSON.stringify({ error: 'A job with that title already exists' }), { status: 409 });
    }
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }

  return new Response(JSON.stringify({ job: data }), { status: 201, headers: { 'Content-Type': 'application/json' } });
};
