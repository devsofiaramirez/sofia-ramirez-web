// Metadatos de cada categoría de servicio: nombre visible, filtro del portafolio e ícono de línea
// (SVG de 24×24, trazos con currentColor). Reemplaza los emojis, que se ven distinto en cada celular.
import type { ServiceCategory } from './db';

export type CategoryMeta = { label: string; filter: string; icon: string };

export const CATEGORIES: Record<ServiceCategory, CategoryMeta> = {
  consultoria: {
    label: 'Asesoría B2B',
    filter: 'Asesoría',
    icon: '<path d="M8 11l2.5 2.5a2 2 0 0 0 2.8 0L17 10"/><path d="M3 12l3.5-3.5a3 3 0 0 1 4.2 0L12 10"/><path d="M21 12l-3.5-3.5a3 3 0 0 0-4.2 0"/><path d="M6 15l2 2m1-3l2.5 2.5"/>',
  },
  curso: {
    label: 'Formación',
    filter: 'Cursos',
    icon: '<path d="M2 9l10-5 10 5-10 5z"/><path d="M6 11v5c0 1.5 2.7 3 6 3s6-1.5 6-3v-5"/><path d="M22 9v6"/>',
  },
  bodega: {
    label: 'Logística',
    filter: 'Logística',
    icon: '<path d="M3 21V8l9-5 9 5v13"/><path d="M7 21v-8h10v8"/><path d="M7 17h10"/>',
  },
};

export function categoryMeta(category: string): CategoryMeta {
  return CATEGORIES[category as ServiceCategory] ?? { label: category, filter: category, icon: '<circle cx="12" cy="12" r="4"/>' };
}
