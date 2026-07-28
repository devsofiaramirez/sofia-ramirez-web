<aside>
<img src="i" alt="i" width="40px" />

**Documento interno (Astro).** Objetivo: que cada proyecto salga a producción con una base técnica de SEO sólida, contenido pensado para ganar el clic frente a la competencia, y visibilidad en buscadores tradicionales y en buscadores con IA (Google AI Overviews, ChatGPT Search, Perplexity, Gemini).

</aside>

## Cómo usar este documento

- **Devs:** secciones **1** y **3** (checklist técnica).
- **Marketing/Contenido:** secciones **2** y **4**.
- **Release gate:** sección **6** = *“no sale a producción sin esto”*.

> No hace falta memorizarlo: úsalo como lista de verificación **por página** y **por release**.
> 

---

## 0. Filosofía y expectativas realistas

- <strong>Astro nos da ventaja técnica, no ranking gratis</strong>
    
    Astro sirve HTML estático por defecto y solo hidrata las “islas” interactivas, así que arrancamos sin el lastre de JS de frameworks como Next o Gatsby. Eso elimina varios obstáculos técnicos antes de empezar.
    
    Pero Astro no genera solo los canonical, ni el JSON-LD, ni las meta descriptions: **hay que cablearlo**. Y no convierte contenido flojo en contenido útil, ni consigue enlaces, ni entiende al cliente mejor que la competencia.
    
    La ventaja se materializa solo si hacemos bien las decisiones de intención, estructura, metadatos, schema, imágenes y enlazado interno.
    
- <strong>“SEO perfecto” no existe como estado final</strong>
    
    El SEO es un proceso continuo: contenido fresco, revisión semanal de Search Console, corrección de regresiones.
    
    Este documento define el **estándar mínimo de calidad** con el que cada proyecto debe salir, y el listón para superar a la competencia.
    
- <strong>El 70/30 del 2026</strong>
    
    Aproximadamente el 70% del trabajo para aparecer en respuestas de IA es el SEO de siempre reencuadrado; solo un 30% son movimientos nuevos. No hay canal mágico separado: hay que hacer bien lo fundamental y añadir una capa nueva encima.
    

---

## 1. Fundamentos técnicos (devs)

### 1.1 Renderizado y rastreabilidad

- **El contenido importante debe estar en el HTML servido**, no inyectado por JS del cliente.
    - En Astro esto es el default (SSR/SSG), pero cuidado con islas `client:only` que rendericen contenido indexable: si un buscador o bot de IA no ejecuta ese JS, ese contenido **no existe** para él.
- **Nada crítico detrás de login, paywall o interacción** (acordeones que cargan por fetch, “cargar más”, etc.) si queremos que se indexe o se cite.
- Verificar con **“Ver código fuente”** (no con el inspector) que **título, H1, texto principal y enlaces** estén presentes.

### 1.2 Metadatos por página (title + description)

**Reglas de `<title>`**

- Único por página (no repetir el mismo título en dos URLs).
- ~50–60 caracteres.
- Palabra/entidad principal cerca del inicio. Marca al final: `Tema principal | Marca`.
- Refleja la intención de esa página, no un genérico.

**Reglas de `meta description`**

- Única por página, ~140–160 caracteres.
- No es factor de ranking directo, pero **sí influye en el CTR** (ver sección 2.4).
- Si no se define, Google inventa una del cuerpo; preferimos controlarla en páginas clave.

<aside>
⚠️

**Gotcha frecuente en Astro:** definir `title`/`description` en el frontmatter del `.md`/`.mdx` y **nunca usarlo en el layout**. Hay que pasarlo como prop al `<head>`.

</aside>

### 1.3 URL canónica en cada página

Si una página es alcanzable en más de una URL (con/sin barra final, con query params, paginada, con filtros, con UTM), los buscadores la tratan como duplicada y **reparten señal** entre variantes.

Checklist:

- Emitir `<link rel="canonical" href="URL absoluta">` en **todas** las páginas.
- Canonical **absoluta** (con dominio), no relativa.
- Definir política de **trailing slash** y ser consistente (Astro config + enlaces internos).

### 1.4 Open Graph y Twitter/X Cards

Controlan cómo se ve el enlace al compartirlo (WhatsApp, LinkedIn, X, Slack, iMessage). No es ranking, pero sí **CTR social**.

**Mínimo por página**

- `og:title`, `og:description`, `og:type`, `og:url` (canónica), `og:image`, `og:site_name`, `og:locale`
- `twitter:card` (`summary_large_image`), `twitter:title`, `twitter:description`, `twitter:image`

**Requisitos de `og:image`**

- 1200×630 px
- URL absoluta
- < 1 MB
- Texto legible
- Idealmente una OG por post/página; si no hay presupuesto, generar OG dinámicas en build (Astro + Satori/`@vercel/og`).

### 1.5 Datos estructurados (Schema.org / JSON-LD)

Se inyectan como:

```html
<script type="application/ld+json">{...}</script>
```

**Schemas típicos por tipo de página**

- **Organization** / **WebSite** — a nivel sitio (layout base). `WebSite` habilita el sitelinks searchbox.
- **BreadcrumbList** — páginas internas.
- **Article** / **BlogPosting** — artículos (author, publisher, fechas, image).
- **Product** + **Offer** + **AggregateRating** — fichas de producto.
- **FAQPage** — FAQs reales (útil para AEO aunque Google limite su visualización).
- **HowTo** — tutoriales.
- **LocalBusiness** — si hay sede física.

**Reglas**

- El schema debe **reflejar lo visible en la página** (marcar cosas que no aparecen = riesgo de penalización).
- **No duplicar** schema en layout y en el cuerpo del Markdown (gotcha típico en Astro).
- Validar siempre con Rich Results Test y Schema Markup Validator antes de mergear.
- En Astro conviene tipar el objeto y volcarlo con `set:html={JSON.stringify(schema)}`.

### 1.6 Sitemap y robots.txt (incluye bots IA 2026)

**Sitemap**

- Instalar `@astrojs/sitemap`, añadir `sitemap()` a `integrations` y definir `site` en `astro.config.mjs`.
- Astro genera `sitemap-index.xml` en build.
- Referenciarlo desde `robots.txt`.
- Excluir del sitemap páginas no indexables (thank-you pages, filtros infinitos, etc.).

**robots.txt** (decisión estratégica, no copy-paste)

- Permitir rastreo del contenido público.
- No bloquear CSS/JS necesarios para renderizar.

**Separar bots de búsqueda IA vs bots de entrenamiento**

- Para *aparecer citados* en IA, permitir bots de búsqueda/recuperación:
    - `OAI-SearchBot`, `ChatGPT-User` (OpenAI)
    - `Claude-SearchBot` (Anthropic)
    - `PerplexityBot`, `Perplexity-User`
- Para *entrenamiento* (`GPTBot`, `Google-Extended`, `ClaudeBot`, `CCBot`, `Applebot-Extended`, `Bytespider`) la decisión es de negocio/legal (bloquearlos no afecta tu ranking en Google ni tu posibilidad de ser citado en búsquedas en vivo).

<aside>
⚠️

Si usas Cloudflare u otro CDN/WAF, **verifica que no esté bloqueando por defecto estos bots** (causa común de “no aparecemos en IA”).

</aside>

### 1.7 Rutas, estructura de URLs y redirecciones

- URLs cortas y legibles con palabras: `/servicios/seo-tecnico` (no `/p?id=482`).
- Estructura jerárquica coherente.
- **301 permanente** cuando cambie un slug (mantener mapa versionado).
- Evitar cadenas (301 → 301 → 301) y bucles.
- Definir estrategia de indexación para paginación, tags, categorías y búsqueda interna (¿index/noindex? ¿canonical?).

### 1.8 Internacionalización (i18n) y hreflang

Si el portal es multi-idioma:

- Configurar `locales` y `defaultLocale` en `astro.config.mjs`.
- Subdirectorios (`/en/`, `/es/`) recomendados en la mayoría de casos.
- Generar URLs con `getRelativeLocaleUrl()` / `getAbsoluteLocaleUrl()` (no concatenar strings).

**hreflang (obligatorio)**

- En cada página emitir `<link rel="alternate" hreflang="xx" href="...">` para **cada** idioma + `hreflang="x-default"`.
- Deben ser recíprocos.
- Sitemap multi-idioma y canónicos por locale.
- <strong>Cuidado con traducciones parciales</strong>
    
    Algunas integraciones emiten hreflang y entradas de sitemap para páginas que caen a contenido de *fallback*. Si hay idiomas con cobertura desigual, controlar manualmente que no se anuncien traducciones inexistentes.
    

### 1.9 Imágenes

- Usar `<Image>` / `<Picture>` de Astro para assets en `src/assets/`.
    - Genera AVIF/WebP, tamaños responsivos, y añade `width`/`height` automáticamente (clave para CLS).
- `alt` descriptivo en imágenes informativas. Decorativas: `alt=""`.
- `loading="lazy"` below-the-fold.
    - La imagen del hero (LCP) **no** debe ir lazy y conviene precargarla.
- Nombres de archivo con palabras (no `IMG_2931.jpg`).

### 1.10 Core Web Vitals (umbrales 2026)

Google evalúa con datos reales (CrUX), no solo laboratorio.

| Métrica | Qué mide | Umbral “bueno” (2026) |
| --- | --- | --- |
| **LCP** | carga del elemento principal | **≤ 2.5 s** |
| **INP** | respuesta a interacciones | **≤ 200 ms** |
| **CLS** | estabilidad visual | **≤ 0.1** |

Puntos clave:

- Se pasa cuando **≥ 75%** de visitas están en “bueno” (percentil 75) en ventana móvil de **28 días**.
- INP reemplazó a FID en 2024.
- Prioridad: primero lo que esté en rojo; luego **INP**, luego **LCP**, luego **CLS**.

**Cómo atacarlas (resumen)**

- **LCP:** preload hero, CSS crítico inline, fuentes con `font-display: swap`, HTML estático.
- **INP:** menos JS, romper tareas largas, diferir trabajo no crítico, no hidratar secciones completas por un solo botón.
- **CLS:** `width`/`height` explícitos, reservar espacio para contenido dinámico, fuentes con `swap`.

<aside>
🔎

Un 100 en Lighthouse en tu portátil no garantiza nada. Guíate por datos de campo (CrUX/Search Console) y espera semanas tras deploy (ventana de 28 días).

</aside>

### 1.11 Otros técnicos que no se pueden olvidar

- HTTPS sin contenido mixto.
- Un solo `<h1>` por página + jerarquía lógica.
- Enlaces internos con anchor descriptivo (no “clic aquí”).
- 404 útil y que devuelva 404 real (no soft 404 con 200).
- RSS (`@astrojs/rss`) si hay blog.
- Content Collections con validación Zod (evita romper frontmatter/schema).

---

## 2. Contenido y marketing (para ganar el clic y el tráfico)

### 2.1 Intención de búsqueda antes que palabra clave

- Cada página responde a **una intención**: informacional, comercial, transaccional o navegacional.
- Investigar qué ya rankea y el formato esperado (lista, comparativa, guía, ficha). Copiar el formato ganador y superar el contenido.
- Adueñarse de comparativas (“X vs Y”) y “mejores de” (alta conversión + alta citación en IA).

### 2.2 E-E-A-T (Experiencia, Expertise, Autoridad, Confianza)

- Autor real y visible (ideal: bio + schema `Person`).
- Citar fuentes autorizadas.
- Estadísticas con fuente + citas de expertos con nombre.
- Página “Sobre nosotros”, contacto, políticas (especialmente en temas sensibles).
- Contenido people-first (keyword stuffing penaliza).

### 2.3 Estructura del contenido (para snippets y para IA)

- **Respuesta directa primero**, contexto después.
- Primer párrafo de cada sección = definición o respuesta.
- Un tema por sección.
- Formatos escaneables (listas, tablas, pasos).
- Pregunta-respuesta + `FAQPage` donde aplique.

### 2.4 El SERP: cómo se ve nuestro resultado (CTR)

- Title con beneficio/respuesta concreta.
- Description con razón para elegirnos (dato, garantía, diferenciador).
- Schema para enriquecer resultado (estrellas, breadcrumbs, FAQ, fecha).
- Revisar en Search Console: muchas impresiones + bajo CTR = oportunidad de reescritura.

### 2.5 Enlazado interno y arquitectura

- Páginas importantes a pocos clics de la home.
- Enlazar contenidos relacionados con anchor descriptivo.
- Clusters: pilar + subtemas.

### 2.6 Frescura y mantenimiento

- Actualizar `dateModified` cuando cambie de verdad.
- Cadencia sostenible > ráfagas.
- Refrescar contenido que cae antes de crear nuevo.

### 2.7 Conversión

- CWV y contenido afectan conversiones.
- CTA claro por página.
- Medir conversión por landing orgánica de entrada.

---

## 3. GEO / AEO: visibilidad en buscadores con IA (2026)

### 3.1 Conceptos

- **AEO:** ser la respuesta extraída (snippets, asistentes, AI Overviews).
- **GEO:** ser citado/recomendado dentro de una respuesta generativa.
- **LLMO:** subset técnico de GEO.

### 3.2 Cómo funciona la cita (pipeline RAG)

Rastrea → recupera pasajes relevantes → pondera señales E-E-A-T → cita 2–5 fuentes.

### 3.3 Tácticas con evidencia

1. Base de SEO sólida (secciones 1 y 2): **sin ranking, no hay cita**.
2. Permitir bots de búsqueda IA y verificar CDN/WAF.
3. Front-load de respuestas + formato escaneable.
4. Fuentes autorizadas + estadísticas con fuente + expertos con nombre.
5. Sembrar la marca en fuentes confiables y generar búsquedas de marca.
6. Comparativas y “mejores de”.
7. Schema: ayuda a rich results; matiz: no es la palanca principal de la cita.
- <strong>Sobre <code>llms.txt</code> (honestidad interna)</strong>
    
    Es un estándar emergente para guiar a sistemas de IA sobre la estructura del sitio. Puede generarse en build (también `llms-full.txt`).
    
    Pero la evidencia de utilidad hoy es débil: un análisis de Ahrefs (mayo 2026) en 137.000 dominios encontró que el 97% de `llms.txt` no recibió ninguna petición de bots de recuperación de IA, y Google declaró que no lo lee.
    
    Recomendación: implementarlo si el costo es trivial, pero no venderlo como pieza fundamental. Priorizar puntos 1–6.
    

---

## 4. Medición y gobernanza

### 4.1 Herramientas base

- Google Search Console (revisión semanal ~1 h).
- PageSpeed Insights / CrUX.
- Bing Webmaster Tools.
- Tracking de visibilidad en IA (ChatGPT/Perplexity/AI Overviews).
- Analítica (conversión por landing orgánica).

### 4.2 Responsables (evitar “huérfanos”)

| Área | Dueño |
| --- | --- |
| Renderizado, canonical, hreflang, sitemap, robots, redirecciones, CWV, schema técnico | Devs |
| Intención/keywords, calidad/frescura, title/description, enlazado editorial, E-E-A-T | Marketing/Contenido |
| Estructura para snippets/IA | Compartido |
| Medición y priorización | Compartido |

---

## 5. Componentes reutilizables sugeridos (Astro)

- Componente `<SEO />` con props (`title`, `description`, `canonical`, `image`, `type`, `locale`, `noindex`, `jsonLd`) que renderice en `<head>`: title, meta description, canonical, OG, Twitter, hreflang y JSON-LD.
- Defaults centralizados (site name, OG por defecto, locale).
- Generación en build: sitemap, RSS, OG images dinámicas, opcional `llms.txt`.
- Validación en CI: rich results/schema + check de Lighthouse/CWV para evitar regresiones.

---

## 6. Checklist de “no sale a producción sin esto”

### 6.1 Por página

- [ ]  `<title>` único, ≤ 60 car., con intención
- [ ]  `meta description` única, ~150 car., escrita para el clic
- [ ]  `<link rel="canonical">` absoluta
- [ ]  OG completo + Twitter card, con imagen 1200×630
- [ ]  JSON-LD correcto, validado y no duplicado
- [ ]  Un solo `<h1>` y jerarquía correcta
- [ ]  Respuesta directa en el primer párrafo/primera sección
- [ ]  Imágenes con `<Image>` de Astro, `alt` real, hero sin lazy y precargado
- [ ]  hreflang recíproco + `x-default` (si multi-idioma)
- [ ]  Enlaces internos con anchor descriptivo
- [ ]  `noindex`/canonical decidido para paginación, tags, búsqueda interna

### 6.2 Por sitio / release

- [ ]  `site` configurado en `astro.config.mjs`
- [ ]  Sitemap generado y referenciado en `robots.txt`
- [ ]  robots con decisión explícita sobre bots IA (búsqueda permitida; entrenamiento según negocio/legal)
- [ ]  CDN/WAF no bloquea `OAI-SearchBot`, `Claude-SearchBot`, `PerplexityBot`, etc.
- [ ]  HTTPS sin contenido mixto
- [ ]  Mapa de redirecciones 301 (sin cadenas ni bucles)
- [ ]  404 real y útil
- [ ]  CWV en verde (campo): LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1
- [ ]  Search Console + Bing Webmaster Tools verificados, sitemap enviado
- [ ]  Alertas de regresión CWV (INP>160ms, LCP>2.0s, CLS>0.08)
- [ ]  Schema `Organization`/`WebSite` a nivel sitio
- [ ]  Autor real y señales E-E-A-T donde aplique

---

## Umbrales de referencia rápida (2026)

- **LCP** ≤ 2.5 s · **INP** ≤ 200 ms · **CLS** ≤ 0.1 (p75, datos de campo)
- **Title** ≤ ~60 car. · **Meta description** ~140–160 car. · **OG image** 1200×630
- Aprobación CWV: **75%** de visitas en “bueno”, ventana **28 días**