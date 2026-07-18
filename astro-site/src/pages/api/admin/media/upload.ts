import type { APIRoute } from 'astro';
import { getSupabaseAdmin } from '../../../../lib/supabase';

export const prerender = false;

const CSRF = (req: Request) => {
  const origin = req.headers.get('origin') ?? '';
  return import.meta.env.DEV || origin === (import.meta.env.SITE_URL ?? 'https://lenooai.com');
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

  // Validate file size first (cheap check before reading buffer)
  if (file.size > MAX_SIZE) {
    return new Response(JSON.stringify({ error: 'File exceeds 10 MB limit' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const altText = (formData.get('alt_text') as string | null) ?? '';

  // Generate unique filename
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_').replace(/\s+/g, '_');
  const timestamp = Date.now();
  const filename = `${timestamp}-${safeName}`;

  // SVG excluded: it's an XML document that can carry <script>, unlike raster formats.
  if (!file.type.startsWith('image/') || file.type === 'image/svg+xml') {
    return new Response(JSON.stringify({ error: 'Only image files are allowed (SVG not supported)' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const arrayBuffer = await file.arrayBuffer();

  const supabase = getSupabaseAdmin();

  // Upload to Supabase Storage
  let { error: uploadError } = await supabase.storage
    .from('media')
    .upload(filename, arrayBuffer, {
      contentType: file.type,
      upsert: false,
    });

  // Auto-create the bucket on first use if it doesn't exist yet
  if (uploadError && uploadError.message.toLowerCase().includes('bucket not found')) {
    try {
      await supabase.storage.createBucket('media', { public: true });
      const retry = await supabase.storage
        .from('media')
        .upload(filename, arrayBuffer, { contentType: file.type, upsert: false });
      uploadError = retry.error;
    } catch {
      // bucket creation failed, keep original upload error
    }
  }

  if (uploadError) {
    console.error('[media/upload] storage error:', uploadError.message);
    return new Response(JSON.stringify({ error: 'Upload failed' }), {
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
    console.error('[media/upload] db error:', dbError.message);
    await supabase.storage.from('media').remove([filename]);
    return new Response(JSON.stringify({ error: 'DB insert failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(
    JSON.stringify({ id: data.id, public_url: publicUrl, filename: data.filename }),
    { status: 201, headers: { 'Content-Type': 'application/json' } }
  );
};
