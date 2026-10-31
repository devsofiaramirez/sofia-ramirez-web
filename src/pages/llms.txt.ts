// Resumen en texto para asistentes de IA. Se arma con los servicios y datos del panel, así no se desactualiza.
export const prerender = false;
import type { APIRoute } from 'astro';
import { getActiveServices, getSiteSettings } from '@/lib/db';
import { buildWhatsappUrl } from '@/lib/utils';

export const GET: APIRoute = async ({ locals, site }) => {
  const db = locals.runtime.env.DB;
  const [services, settings] = await Promise.all([getActiveServices(db), getSiteSettings(db)]);
  const url = (path: string) => new URL(path, site).toString();
  const oneLine = (text: string) => text.replace(/\s+/g, ' ').trim();

  const lines = [
    '# Sofía Ramírez: importaciones y logística China–Colombia',
    '',
    '> Consultora e importadora. Asesoría a empresas, cursos de importación y gestión de bodegas y logística desde China hasta Colombia, con bodega propia en Cúcuta (Norte de Santander).',
    '',
    '## Servicios',
    ...services.map((s) => `- [${s.title}](${url(`/servicios/${s.slug}`)}): ${oneLine(s.description)}`),
    '',
    '## Más información',
    `- [Cómo trabajamos](${url('/como-trabajamos')}): cotización y plan, compra y control en China, transporte y trámites, y entrega acordada.`,
    `- [Cursos](${url('/cursos')}): formación práctica para aprender a importar desde China.`,
    '',
    '## Contacto',
    `- WhatsApp: ${buildWhatsappUrl(settings.whatsapp_number ?? '', settings.whatsapp_message ?? '')}`,
    ...(settings.contact_email ? [`- Correo: ${settings.contact_email}`] : []),
    '- Ubicación: Cúcuta, Norte de Santander, Colombia',
    '',
  ];

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
