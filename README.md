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

## Rediseño "Confianza Logística" (octubre 2026)

- **Paleta:** azul marino (marca), fondos claros y ámbar (acción). Tokens en `src/styles/global.css`
  (`--color-brand`, `--color-accent`, `--color-accent-text`…). Regla de contraste: el ámbar nunca lleva
  texto blanco; los botones ámbar llevan texto azul marino. Secciones oscuras con la clase `.scope-dark`.
- **Páginas propias, sin "#" en la URL:** `/`, `/servicios`, `/cursos` (servicios de categoría "curso"),
  `/como-trabajamos`, `/testimonios`, `/cotizar` (solo si el cotizador está prendido) y `/servicios/[slug]`.
  El inicio muestra un resumen de cada sección con enlace a su página. Todas van en `sitemap-services.xml`.
- **Movimiento:** transiciones entre páginas (`ClientRouter` de Astro; la foto del servicio "viaja" de la
  tarjeta al detalle), desplazamiento suave (Lenis) y animaciones con el scroll (GSAP + ScrollTrigger) en
  `src/scripts/motion.ts` y `site.ts`. Quien tenga activo "reducir movimiento" ve todo quieto.
  Ojo: con `ClientRouter` los scripts quedan vivos entre páginas: cada componente engancha su lógica en
  `astro:page-load` con un selector propio y suelta sus oyentes en `astro:before-swap`.
- **Cotizador** (`QuoteWizard.astro`, `src/lib/quote.ts`): 3 preguntas editables + nombre opcional que arman
  un WhatsApp ya escrito. Se configura en Panel → Configuración → Cotizador. **Arranca apagado**; con sesión
  iniciada se ve en `/cotizar?vista=cotizador`. No necesita migración (claves en `site_settings` con valores
  por defecto en código).
- **Modal promocional:** ya no sale al entrar. Panel → "¿Cuándo aparece?": a los 8 s, a media página o al
  intentar salir. Una vez por visita; la imagen se descarga solo al mostrarse.
- **Fotos:** el panel las reduce en el navegador antes de subirlas (WebP, máx. 1800 px). Guía para generar
  las provisionales con IA: `ASSETS-NECESARIOS.md`.
- **Fuentes:** Manrope e Inter servidas desde el sitio (`@fontsource-variable`, solo subconjunto latino) y
  precargadas: evita el salto del título al cargar (CLS) y la pérdida de la letra al navegar.
- El globo animado (`GlobalRoutes.astro`) y el candado flotante del admin se quitaron; el acceso al panel
  quedó como texto pequeño en el pie.

## Publicar

Cloudflare Pages está conectado a `main` en GitHub: **hacer push a `main` publica el sitio**. La base D1
y R2 de producción están en la cuenta de Cloudflare de Sofía (no en la de Alíviate): los cambios de este
rediseño no requieren migración.

## Pendiente antes de producción

- [ ] Reemplazar los `PlaceholderImage` por las fotos reales de Sofía (ver lista de imágenes acordada en el chat).
- [ ] Subir logo/isotipo real si Sofía tiene uno — hoy `BrandLogo.astro` es un wordmark tipográfico provisional.
- [ ] Generar `public/og-default.jpg` (1200×630, JPEG sólido — WhatsApp no muestra PNG transparente).
- [ ] `wrangler d1 create sofia-ramirez-db` → pegar `database_id` en `wrangler.toml`.
- [ ] `wrangler r2 bucket create sofia-ramirez-media` → habilitar acceso público → pegar la URL en `[vars].R2_PUBLIC_URL` de `wrangler.toml`.
- [ ] `wrangler pages secret put JWT_SECRET`.
- [ ] Conectar el repo a Cloudflare Pages (build command `npm run build`, output `dist`), agregar bindings D1/R2.
- [ ] Confirmar dominio final en `site` de `astro.config.mjs`, en `robots.txt` y en `SEO.astro`.
