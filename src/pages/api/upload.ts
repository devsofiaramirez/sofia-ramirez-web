export const prerender = false;
import type { APIRoute } from 'astro';
import { sanitizeFolderName } from '@/lib/utils';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10 MB
const MAX_VIDEO_SIZE = 200 * 1024 * 1024; // 200 MB

export const POST: APIRoute = async ({ request, locals }) => {
  if (!locals.user) return Response.json({ error: 'No autorizado' }, { status: 401 });

  const form = await request.formData().catch(() => null);
  const file = form?.get('file') as File | null;
  const folder = sanitizeFolderName(form?.get('folder')?.toString() ?? 'misc');

  if (!file || !(file instanceof File)) {
    return Response.json({ error: 'No se recibió ningún archivo' }, { status: 400 });
  }

  const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);
  const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type);
  if (!isImage && !isVideo) {
    return Response.json({ error: `Tipo no permitido: ${file.type}` }, { status: 400 });
  }

  const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
  if (file.size > maxSize) {
    return Response.json({ error: `Archivo supera el límite (${isVideo ? '200MB' : '10MB'})` }, { status: 400 });
  }

  const { MEDIA, R2_PUBLIC_URL } = locals.runtime.env;
  if (!MEDIA) return Response.json({ error: 'R2 no configurado' }, { status: 500 });

  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'bin';
  const base = file.name.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9]/g, '-').substring(0, 60).toLowerCase();
  const key = `${folder}/${Date.now()}-${base}.${ext}`;

  const buffer = await file.arrayBuffer();
  await MEDIA.put(key, buffer, { httpMetadata: { contentType: file.type } });

  return Response.json({
    success: true,
    url: `${R2_PUBLIC_URL}/${key}`,
    key,
    type: isImage ? 'image' : 'video',
    size: file.size,
  });
};
