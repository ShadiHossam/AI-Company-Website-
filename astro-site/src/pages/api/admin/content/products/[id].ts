import type { APIRoute } from 'astro';
import { getSupabaseAdmin } from '../../../../../lib/supabase';

export const prerender = false;

const CSRF = (req: Request) => {
  const origin = req.headers.get('origin') ?? '';
  const siteUrl = import.meta.env.SITE_URL ?? 'https://aegisai.ae';
  return import.meta.env.DEV || origin === siteUrl;
};

export const PATCH: APIRoute = async ({ locals, params, request }) => {
  if (!locals.user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  if (!CSRF(request)) return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });

  const supabase = getSupabaseAdmin();
  try {
    const body = await request.json();
    const {
      slug, name, tagline, description, status_badge,
      feature_tags, features, sort_order, published,
      ar_name, ar_tagline, ar_description, ar_feature_tags, ar_features,
    } = body;

    const updates: Record<string, unknown> = {};
    if (slug !== undefined) updates.slug = slug;
    if (name !== undefined) updates.name = name;
    if (tagline !== undefined) updates.tagline = tagline;
    if (description !== undefined) updates.description = description;
    if (status_badge !== undefined) updates.status_badge = status_badge;
    if (feature_tags !== undefined) updates.feature_tags = Array.isArray(feature_tags) ? feature_tags : (feature_tags as string).split(',').map((s: string) => s.trim()).filter(Boolean);
    if (features !== undefined) updates.features = Array.isArray(features) ? features : (features as string).split('\n').map((s: string) => s.trim()).filter(Boolean);
    if (sort_order !== undefined) updates.sort_order = sort_order;
    if (published !== undefined) updates.published = published;
    if (ar_name !== undefined) updates.ar_name = ar_name;
    if (ar_tagline !== undefined) updates.ar_tagline = ar_tagline;
    if (ar_description !== undefined) updates.ar_description = ar_description;
    if (ar_feature_tags !== undefined) updates.ar_feature_tags = Array.isArray(ar_feature_tags) ? ar_feature_tags : (ar_feature_tags as string).split(',').map((s: string) => s.trim()).filter(Boolean);
    if (ar_features !== undefined) updates.ar_features = Array.isArray(ar_features) ? ar_features : (ar_features as string).split('\n').map((s: string) => s.trim()).filter(Boolean);

    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', params.id!)
      .select()
      .single();

    if (error) throw error;
    return new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json' } });
  } catch {

    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
};

export const DELETE: APIRoute = async ({ locals, params, request }) => {
  if (!locals.user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  if (!CSRF(request)) return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });

  const supabase = getSupabaseAdmin();
  try {
    const { error } = await supabase.from('products').update({ deleted_at: new Date().toISOString() }).eq('id', params.id!);
    if (error) throw error;
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch {

    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
};
