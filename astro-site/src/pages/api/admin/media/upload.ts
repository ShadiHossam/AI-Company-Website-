import type { APIRoute } from 'astro';
import { getSupabaseAdmin } from '../../../../lib/supabase';

export const prerender = false;

const CSRF = (req: Request) => {
  const origin = req.headers.get('origin') ?? '';
  return import.meta.env.DEV || origin === (import.meta.env.SITE_URL ?? 'https://aegisai.ae');
};

const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

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

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid form data' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const file = formData.get('file') as File | null;
  if (!file) {
    return new Response(JSON.stringify({ error: 'No file provided' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Validate MIME type
  if (!file.type.startsWith('image/')) {
    return new Response(JSON.stringify({ error: 'Only image files are allowed' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Validate file size
  if (file.size > MAX_SIZE) {
    return new Response(JSON.stringify({ error: 'File exceeds 10 MB limit' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const altText = (formData.get('alt_text') as string | null) ?? '';

  // Generate unique filename
  const ext = file.name.split('.').pop() ?? 'jpg';
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_').replace(/\s+/g, '_');
  const timestamp = Date.now();
  const filename = `${timestamp}-${safeName}`;

  const arrayBuffer = await file.arrayBuffer();

  const supabase = getSupabaseAdmin();

  // Upload to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from('media')
    .upload(filename, arrayBuffer, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    return new Response(JSON.stringify({ error: `Upload failed: ${uploadError.message}` }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Get public URL
  const { data: urlData } = supabase.storage.from('media').getPublicUrl(filename);
  const publicUrl = urlData.publicUrl;

  // Insert row into media table
  const { data, error: dbError } = await supabase
    .from('media')
    .insert({
      filename: file.name,
      storage_path: filename,
      public_url: publicUrl,
      file_size: file.size,
      alt_text: altText || null,
    })
    .select()
    .single();

  if (dbError) {
    // Attempt cleanup of uploaded file
    await supabase.storage.from('media').remove([filename]);
    return new Response(JSON.stringify({ error: `DB insert failed: ${dbError.message}` }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(
    JSON.stringify({ id: data.id, public_url: publicUrl, filename: data.filename }),
    { status: 201, headers: { 'Content-Type': 'application/json' } }
  );
};
