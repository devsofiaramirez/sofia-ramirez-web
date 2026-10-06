// @astrojs/sitemap solo indexa rutas estáticas generadas en build. Como el inicio, las páginas de
// sección (/servicios, /cursos, /como-trabajamos, /testimonios, /cotizar) y /servicios/[slug] son SSR
// (el contenido vive en D1 y puede cambiar sin rebuild), este sitemap complementario se genera
// en cada request. Referenciado como segunda entrada en robots.txt.
export const prerender = false;
import type { APIRoute } from 'astro';
import { getActiveServices, getSiteSettings } from '@/lib/db';
import { getQuoteConfig } from '@/lib/quote';

export const GET: APIRoute = async ({ locals, site }) => {
  const db = locals.runtime.env.DB;
  const [services, settings] = await Promise.all([getActiveServices(db), getSiteSettings(db)]);

  const sections = ['/', '/servicios', '/cursos', '/como-trabajamos', '/testimonios'];
  if (getQuoteConfig(settings).enabled) sections.push('/cotizar');

  const urls = [
    ...sections.map((path) => `<url><loc>${new URL(path, site).toString()}</loc></url>`),
    ...services.map((s) => {
      const loc = new URL(`/servicios/${s.slug}`, site).toString();
      return `<url><loc>${loc}</loc><lastmod>${s.updated_at.replace(' ', 'T')}Z</lastmod></url>`;
    }),
  ].join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml' },
  });
};
