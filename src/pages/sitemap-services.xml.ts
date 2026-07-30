// @astrojs/sitemap solo indexa rutas estáticas generadas en build. Como /servicios/[slug] es SSR
// (el contenido vive en D1 y puede cambiar sin rebuild), este sitemap complementario se genera
// en cada request a partir de los servicios activos. Referenciado como segunda entrada en robots.txt.
export const prerender = false;
import type { APIRoute } from 'astro';
import { getActiveServices } from '@/lib/db';

export const GET: APIRoute = async ({ locals, site }) => {
  const db = locals.runtime.env.DB;
  const services = await getActiveServices(db);

  const urls = services
    .map((s) => {
      const loc = new URL(`/servicios/${s.slug}`, site).toString();
      return `<url><loc>${loc}</loc><lastmod>${s.updated_at.replace(' ', 'T')}Z</lastmod></url>`;
    })
    .join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml' },
  });
};
