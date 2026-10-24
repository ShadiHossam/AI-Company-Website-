import type { APIRoute } from 'astro';
import { getSupabaseAdmin } from '../../../../../lib/supabase';

export const prerender = false;

// GET /api/admin/applications/[id]/cv — redirects to a 5-minute signed URL for
// the applicant's CV in the private `cvs` bucket. Auth and the "applications"
// section check happen in the middleware.
export const GET: APIRoute = async ({ locals, params, redirect }) => {
  if (!locals.user) return new Response('Unauthorized', { status: 401 });

  const supabase = getSupabaseAdmin();
  const { data: app, error } = await supabase
    .from('job_applications')
    .select('cv_url')
    .eq('id', params.id!)
    .single();
  if (error || !app?.cv_url) return new Response('Not found', { status: 404 });

  const { data: signed, error: signError } = await supabase.storage
    .from('cvs')
    .createSignedUrl(app.cv_url, 300, { download: true });
  if (signError || !signed) {
    console.error('[applications/cv] sign failed:', signError?.message);
    return new Response('CV unavailable', { status: 502 });
  }
  return redirect(signed.signedUrl, 302);
};
