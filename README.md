# sofia-ramirez-web

Sitio de Sofía Ramírez (asesoría, cursos y logística de importaciones China–Cúcuta) + panel admin, en un solo proyecto Astro con SSR híbrido sobre Cloudflare Pages, D1 y R2.

Arquitectura y decisiones documentadas en `GUIA-PANEL-ADMIN-ASTRO-CLOUDFLARE.md` (raíz de `Desktop`) y en `lineamientos/`.

## Requisitos

- Node **18.20.8+** o **20.3+** (hay un `.node-version` — con `fnm`/`nvm` corre `fnm use` o `nvm use` en esta carpeta).
- Cuenta de Cloudflare con D1 y R2 habilitados.

## Desarrollo local

```bash
npm install
cp .dev.vars.example .dev.vars   # y edita JWT_SECRET
npm run db:migrate:local
npm run dev
```

Primer arranque: entrar a `/admin/setup` para crear el primer usuario (esa ruta se autodeshabilita después).

## Estructura

- `src/pages/` — páginas públicas (estáticas por defecto) y `/admin/*` + `/api/*` (SSR, `export const prerender = false`).
- `src/lib/` — `auth.ts` (JWT+PBKDF2), `db.ts` (queries D1), `session.ts`, `utils.ts`.
- `migrations/0001_initial.sql` — schema D1: `users`, `site_settings` (mini-CMS), `services`, `testimonials`.
- `src/components/` — Hero, ServicesGrid, Testimonials, PromoModal, `admin/FileUploader.astro`.

## Pendiente antes de producción

- [ ] Reemplazar los `PlaceholderImage` por las fotos reales de Sofía (ver lista de imágenes acordada en el chat).
- [ ] Subir logo/isotipo real si Sofía tiene uno — hoy `BrandLogo.astro` es un wordmark tipográfico provisional.
- [ ] Generar `public/og-default.jpg` (1200×630, JPEG sólido — WhatsApp no muestra PNG transparente).
- [ ] `wrangler d1 create sofia-ramirez-db` → pegar `database_id` en `wrangler.toml`.
- [ ] `wrangler r2 bucket create sofia-ramirez-media` → habilitar acceso público → pegar la URL en `[vars].R2_PUBLIC_URL` de `wrangler.toml`.
- [ ] `wrangler pages secret put JWT_SECRET`.
- [ ] Conectar el repo a Cloudflare Pages (build command `npm run build`, output `dist`), agregar bindings D1/R2.
- [ ] Confirmar dominio final en `site` de `astro.config.mjs`, en `robots.txt` y en `SEO.astro`.
