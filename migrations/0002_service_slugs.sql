-- Cada servicio/curso pasa a tener su propia URL indexable (/servicios/[slug]) en vez de vivir
-- solo como ancla dentro del home — mejor SEO a largo plazo (decisión tomada 2026-07-29).
ALTER TABLE services ADD COLUMN slug TEXT;

UPDATE services SET slug = 'asesoria-empresas-importaciones' WHERE id = 1 AND slug IS NULL;
UPDATE services SET slug = 'curso-importaciones-china-colombia' WHERE id = 2 AND slug IS NULL;
UPDATE services SET slug = 'bodega-logistica-china-cucuta' WHERE id = 3 AND slug IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_services_slug ON services(slug);
