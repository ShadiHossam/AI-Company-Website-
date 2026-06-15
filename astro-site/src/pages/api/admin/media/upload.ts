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

  const arrayBuffer = await file.arrayBuffer();

  // Validate file type by magic bytes (not client-controlled MIME type)
  const bytes = new Uint8Array(arrayBuffer.slice(0, 12));
  const isJpeg = bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF;
  const isPng = bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47;
  const isGif = bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x38;
  const isWebp = bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46
    && bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50;
  const isAvif = bytes[4] === 0x66 && bytes[5] === 0x74 && bytes[6] === 0x79 && bytes[7] === 0x70;
  if (!isJpeg && !isPng && !isGif && !isWebp && !isAvif) {
    return new Response(JSON.stringify({ error: 'Only image files (JPEG, PNG, GIF, WebP, AVIF) are allowed' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

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
    await supabase.storage.createBucket('media', { public: true });
    const retry = await supabase.storage
      .from('media')
      .upload(filename, arrayBuffer, { contentType: file.type, upsert: false });
    uploadError = retry.error;
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
    return new Response(JSON.stringify({ error: 'Failed to save file record' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(
    JSON.stringify({ id: data.id, public_url: publicUrl, filename: data.filename }),
    { status: 201, headers: { 'Content-Type': 'application/json' } }
  );
};
