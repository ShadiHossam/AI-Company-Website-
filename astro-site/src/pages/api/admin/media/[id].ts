import type { APIRoute } from 'astro';
import { getSupabaseAdmin } from '../../../../lib/supabase';

export const prerender = false;

const CSRF = (req: Request) => {
  const origin = req.headers.get('origin') ?? '';
  return import.meta.env.DEV || origin === (import.meta.env.SITE_URL ?? 'https://aegisai.ae');
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

  // Fetch storage_path before deleting
  const { data: existing, error: fetchError } = await supabase
    .from('media')
    .select('storage_path')
    .eq('id', id!)
    .single();

  if (fetchError || !existing) {
    return new Response(JSON.stringify({ error: 'Media not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Delete from DB
  const { error: dbError } = await supabase
    .from('media')
    .delete()
    .eq('id', id!);

  if (dbError) {
    return new Response(JSON.stringify({ error: dbError.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Delete from Supabase Storage
  const { error: storageError } = await supabase.storage
    .from('media')
    .remove([existing.storage_path]);

  if (storageError) {
    // DB row already deleted — log but don't fail the request
    console.error('Storage delete failed:', storageError.message);
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
