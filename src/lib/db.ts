// Todas las queries a D1, tipadas. Sin ORM: SQL puro con prepare().bind().
import { slugify } from './utils';

export type User = {
  id: number; name: string; email: string; password_hash: string;
  role: 'super_admin' | 'admin'; is_active: number;
  created_at: string; updated_at: string;
};

export type ServiceCategory = 'consultoria' | 'curso' | 'bodega';

export type Service = {
  id: number; category: ServiceCategory; title: string; slug: string; description: string;
  image_url: string | null; video_url: string | null; cta_text: string; cta_url: string | null;
  is_active: number; display_order: number;
  created_at: string; updated_at: string;
};

export type Testimonial = {
  id: number; author_name: string; author_role: string; quote: string;
  photo_url: string | null; rating: number;
  is_active: number; display_order: number;
  created_at: string; updated_at: string;
};

export type SiteSetting = { key: string; value: string; updated_at: string };

// ─── Usuarios ────────────────────────────────────────────────────────────────
export function findUserByEmail(db: D1Database, email: string) {
  return db.prepare('SELECT * FROM users WHERE email = ? AND is_active = 1').bind(email).first<User>();
}

export async function countUsers(db: D1Database): Promise<number> {
  const r = await db.prepare('SELECT COUNT(*) as cnt FROM users').first<{ cnt: number }>();
  return r?.cnt ?? 0;
}

// ─── site_settings (mini-CMS key-value) ─────────────────────────────────────
export async function getSiteSettings(db: D1Database): Promise<Record<string, string>> {
  const r = await db.prepare('SELECT key, value FROM site_settings').all<SiteSetting>();
  return Object.fromEntries(r.results.map(s => [s.key, s.value]));
}

export async function setSiteSetting(db: D1Database, key: string, value: string) {
  return db
    .prepare("INSERT INTO site_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = datetime('now')")
    .bind(key, value).run();
}

export async function setSiteSettings(db: D1Database, entries: Record<string, string>) {
  const statements = Object.entries(entries).map(([key, value]) =>
    db.prepare("INSERT INTO site_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = datetime('now')")
      .bind(key, value)
  );
  return db.batch(statements);
}

// ─── services (Patrón B: lista con orden y estado) ──────────────────────────
export async function getActiveServices(db: D1Database): Promise<Service[]> {
  const r = await db
    .prepare('SELECT * FROM services WHERE is_active = 1 ORDER BY display_order ASC')
    .all<Service>();
  return r.results;
}

export async function getAllServices(db: D1Database): Promise<Service[]> {
  const r = await db.prepare('SELECT * FROM services ORDER BY display_order ASC').all<Service>();
  return r.results;
}

export async function getServiceById(db: D1Database, id: number) {
  return db.prepare('SELECT * FROM services WHERE id = ?').bind(id).first<Service>();
}

export async function getServiceBySlug(db: D1Database, slug: string) {
  return db.prepare('SELECT * FROM services WHERE slug = ? AND is_active = 1').bind(slug).first<Service>();
}

export async function isSlugTaken(db: D1Database, slug: string, excludeId?: number): Promise<boolean> {
  const row = await db.prepare('SELECT id FROM services WHERE slug = ? AND id != ?').bind(slug, excludeId ?? -1).first<{ id: number }>();
  return !!row;
}

/** A partir de un título (o un slug ya escrito a mano), arma un slug único agregando -2, -3... si hace falta. */
export async function generateUniqueServiceSlug(db: D1Database, base: string, excludeId?: number): Promise<string> {
  const root = slugify(base);
  let candidate = root;
  let n = 2;
  while (await isSlugTaken(db, candidate, excludeId)) {
    candidate = `${root}-${n}`;
    n++;
  }
  return candidate;
}

export async function updateService(db: D1Database, id: number, data: Record<string, unknown>) {
  const keys = Object.keys(data);
  if (keys.length === 0) return;
  const set = keys.map(k => `${k} = ?`).join(', ');
  const values = Object.values(data);
  return db
    .prepare(`UPDATE services SET ${set}, updated_at = datetime('now') WHERE id = ?`)
    .bind(...values, id).run();
}

export async function createService(db: D1Database, data: {
  category: ServiceCategory; title: string; slug: string; description: string;
  image_url?: string | null; video_url?: string | null; cta_text: string; cta_url?: string | null; display_order: number;
}) {
  return db.prepare(
    'INSERT INTO services (category, title, slug, description, image_url, video_url, cta_text, cta_url, display_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).bind(data.category, data.title, data.slug, data.description, data.image_url ?? null, data.video_url ?? null, data.cta_text, data.cta_url ?? null, data.display_order).run();
}

export async function deleteService(db: D1Database, id: number) {
  return db.prepare('DELETE FROM services WHERE id = ?').bind(id).run();
}

export function reorderServices(db: D1Database, orderedIds: number[]) {
  const statements = orderedIds.map((id, index) =>
    db.prepare('UPDATE services SET display_order = ? WHERE id = ?').bind(index, id)
  );
  return db.batch(statements);
}

// ─── testimonials (Patrón B: lista con orden y estado) ──────────────────────
export async function getActiveTestimonials(db: D1Database): Promise<Testimonial[]> {
  const r = await db
    .prepare('SELECT * FROM testimonials WHERE is_active = 1 ORDER BY display_order ASC')
    .all<Testimonial>();
  return r.results;
}

export async function getAllTestimonials(db: D1Database): Promise<Testimonial[]> {
  const r = await db.prepare('SELECT * FROM testimonials ORDER BY display_order ASC').all<Testimonial>();
  return r.results;
}

export async function getTestimonialById(db: D1Database, id: number) {
  return db.prepare('SELECT * FROM testimonials WHERE id = ?').bind(id).first<Testimonial>();
}

export async function updateTestimonial(db: D1Database, id: number, data: Record<string, unknown>) {
  const keys = Object.keys(data);
  if (keys.length === 0) return;
  const set = keys.map(k => `${k} = ?`).join(', ');
  const values = Object.values(data);
  return db
    .prepare(`UPDATE testimonials SET ${set}, updated_at = datetime('now') WHERE id = ?`)
    .bind(...values, id).run();
}

export async function createTestimonial(db: D1Database, data: {
  author_name: string; author_role: string; quote: string;
  photo_url?: string | null; rating: number; display_order: number;
}) {
  return db.prepare(
    'INSERT INTO testimonials (author_name, author_role, quote, photo_url, rating, display_order) VALUES (?, ?, ?, ?, ?, ?)'
  ).bind(data.author_name, data.author_role, data.quote, data.photo_url ?? null, data.rating, data.display_order).run();
}

export async function deleteTestimonial(db: D1Database, id: number) {
  return db.prepare('DELETE FROM testimonials WHERE id = ?').bind(id).run();
}

export function reorderTestimonials(db: D1Database, orderedIds: number[]) {
  const statements = orderedIds.map((id, index) =>
    db.prepare('UPDATE testimonials SET display_order = ? WHERE id = ?').bind(index, id)
  );
  return db.batch(statements);
}
