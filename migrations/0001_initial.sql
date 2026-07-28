-- Usuarios del panel admin
CREATE TABLE IF NOT EXISTS users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  name          TEXT    NOT NULL,
  email         TEXT    NOT NULL UNIQUE,
  password_hash TEXT    NOT NULL,
  role          TEXT    NOT NULL DEFAULT 'admin'
                CHECK(role IN ('super_admin', 'admin')),
  is_active     INTEGER NOT NULL DEFAULT 1,
  created_at    TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- Configuración global del sitio (mini-CMS key-value): hero, contacto, redes, modal
CREATE TABLE IF NOT EXISTS site_settings (
  key        TEXT PRIMARY KEY,
  value      TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

INSERT OR IGNORE INTO site_settings (key, value) VALUES
  ('hero_title',            'Tu aliada estratégica en importaciones y logística'),
  ('hero_subtitle',         'Asesoría, formación y gestión de bodegas para llevar tu negocio de China a Cúcuta sin fricción.'),
  ('hero_video_url',        ''),
  ('whatsapp_number',       '573000000000'),
  ('whatsapp_message',      'Hola Sofía, quiero más información sobre tus servicios de importación.'),
  ('social_instagram',      ''),
  ('social_facebook',       ''),
  ('social_tiktok',         ''),
  ('social_linkedin',       ''),
  ('contact_email',         'contacto@sofiaramirez.com'),
  ('promo_modal_enabled',   '0'),
  ('promo_modal_image',     ''),
  ('promo_modal_text',      ''),
  ('promo_modal_button_text', 'Quiero saber más'),
  ('promo_modal_button_url', '');

-- Servicios y cursos (Patrón B: lista con orden y estado)
CREATE TABLE IF NOT EXISTS services (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  category       TEXT    NOT NULL DEFAULT 'consultoria'
                 CHECK(category IN ('consultoria', 'curso', 'bodega')),
  title          TEXT    NOT NULL,
  description    TEXT    NOT NULL DEFAULT '',
  image_url      TEXT,               -- URL de R2, o ruta relativa si es placeholder
  cta_text       TEXT    NOT NULL DEFAULT 'Más información',
  cta_url        TEXT,
  is_active      INTEGER NOT NULL DEFAULT 1,
  display_order  INTEGER NOT NULL DEFAULT 0,
  created_at     TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at     TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_services_active ON services(is_active);
CREATE INDEX IF NOT EXISTS idx_services_order  ON services(display_order);

INSERT OR IGNORE INTO services (id, category, title, description, cta_text, display_order) VALUES
  (1, 'consultoria', 'Asesoría y Consultoría a Empresas', 'Acompañamiento estratégico en B2B para estructurar tus importaciones desde cero.', 'Agenda una asesoría', 0),
  (2, 'curso',       'Cursos y Capacitaciones en Importaciones', 'Formación práctica para aprender a importar sin intermediarios ni sobrecostos.', 'Ver cursos disponibles', 1),
  (3, 'bodega',      'Gestión de Bodegas y Logística China–Cúcuta', 'Consolidación, bodegaje y transporte de carga desde China hasta Cúcuta.', 'Cotiza tu carga', 2);

-- Testimonios de empresas / comerciantes (Patrón B: lista con orden y estado)
CREATE TABLE IF NOT EXISTS testimonials (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  author_name    TEXT    NOT NULL,
  author_role    TEXT    NOT NULL DEFAULT '',  -- ej. "Dueña, Comercial XYZ"
  quote          TEXT    NOT NULL,
  photo_url      TEXT,
  rating         INTEGER NOT NULL DEFAULT 5 CHECK(rating BETWEEN 1 AND 5),
  is_active      INTEGER NOT NULL DEFAULT 1,
  display_order  INTEGER NOT NULL DEFAULT 0,
  created_at     TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at     TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_testimonials_active ON testimonials(is_active);
CREATE INDEX IF NOT EXISTS idx_testimonials_order  ON testimonials(display_order);

INSERT OR IGNORE INTO testimonials (id, author_name, author_role, quote, rating, display_order) VALUES
  (1, 'Nombre pendiente', 'Comerciante, Cúcuta', 'Testimonio de ejemplo — reemplazar desde el panel admin en /admin/testimonios.', 5, 0);
