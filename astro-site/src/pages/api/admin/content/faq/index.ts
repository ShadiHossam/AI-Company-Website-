import type { APIRoute } from 'astro';
import { getSupabaseAdmin } from '../../../../../lib/supabase';

export const prerender = false;

const CSRF = (req: Request) => {
  const origin = req.headers.get('origin') ?? '';
  const siteUrl = import.meta.env.SITE_URL ?? 'https://aegisai.ae';
  return import.meta.env.DEV || origin === siteUrl;
};

export const GET: APIRoute = async ({ locals, url }) => {
  if (!locals.user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

  const supabase = getSupabaseAdmin();
  try {
    const section = url.searchParams.get('section');
    let query = supabase
      .from('faq_items')
      .select('*')
      .order('section', { ascending: true })
      .order('sort_order', { ascending: true });

    if (section) query = query.eq('section', section);

    const { data, error } = await query;
    if (error) throw error;

    return new Response(JSON.stringify(data ?? []), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {

    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
};

export const POST: APIRoute = async ({ locals, request }) => {
  if (!locals.user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  if (!CSRF(request)) return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });

  const supabase = getSupabaseAdmin();
  try {
    const body = await request.json();
    const { question, answer, question_ar, answer_ar, section, sort_order = 0, published = true } = body;

    if (!question || !answer || !section) {
      return new Response(JSON.stringify({ error: 'question, answer, and section are required' }), { status: 400 });
    }

    const { data, error } = await supabase
      .from('faq_items')
      .insert({ question, answer, question_ar: question_ar || null, answer_ar: answer_ar || null, section, sort_order, published })
      .select()
      .single();

    if (error) throw error;
    return new Response(JSON.stringify(data), { status: 201, headers: { 'Content-Type': 'application/json' } });
  } catch {

    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
};
