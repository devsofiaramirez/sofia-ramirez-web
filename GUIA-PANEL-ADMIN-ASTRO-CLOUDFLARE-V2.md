# Guía v2: Panel Admin desacoplado (Astro + D1 + R2) para un sitio Next.js estático
### Aprendido en el proyecto LKP Arquitectos (2026-07) — evoluciona la guía original basada en CEINT

---

## 0. Cuándo usar esta guía vs. la original (CEINT)

La guía original (`GUIA-PANEL-ADMIN-ASTRO-CLOUDFLARE.md`) asume que **todo el sitio es un solo proyecto Astro** con renderizado híbrido (`prerender = false` en `/admin/*`, estático en el resto). Esa guía sigue siendo válida **si el sitio público también es Astro**.

**Usá esta guía v2 cuando el sitio público sea Next.js** (o cualquier framework donde no puedas mezclar estático+dinámico página por página en Cloudflare). Concretamente, esto aplicó porque:

> Next.js 16 introdujo un nuevo sistema de "Proxy" que exige runtime Node.js completo, incompatible con Cloudflare Workers (le falta `async_hooks`). Esto bloquea tanto `@cloudflare/next-on-pages` (deprecado) como el adapter actual `@opennextjs/cloudflare` para este caso de uso. Ver: [cloudflare/workers-sdk#13755](https://github.com/cloudflare/workers-sdk/issues/13755).

Si tu framework público SÍ soporta hybrid rendering en Cloudflare sin bugs (Astro, SvelteKit, Remix con adapter maduro), la guía original de un-solo-proyecto es más simple y preferible. Esta v2 es el plan B cuando no lo soporta.

---

## 1. Arquitectura: dos proyectos separados

```
mi-sitio-publico/          (Next.js, output: "export", 100% estático)
  └── se despliega en   → misitio.com  (Cloudflare Pages, cuenta X)

mi-sitio-admin/             (Astro, D1 + R2, auth)
  └── se despliega en   → admin.misitio.com  (Cloudflare Pages, MISMA cuenta X)
```

**Por qué la misma cuenta de Cloudflare para ambos:** si el dominio público y el proyecto admin están en cuentas distintas, agregar el subdominio `admin.misitio.com` como Custom Domain requiere mover el DNS entre cuentas (fricción real). En la misma cuenta, Cloudflare detecta la zona automáticamente y configura el CNAME solo.

**Cómo se comunican los dos proyectos:**

1. El admin expone endpoints públicos de solo lectura (`/api/public/*`, sin auth, con CORS).
2. El sitio público los consume de **dos formas posibles** (ver sección 6) — en build time (contenido con SEO) o desde el navegador (contenido sin SEO, tipo popups).
3. Cada guardado exitoso en el admin dispara un **Deploy Hook** de Cloudflare Pages que reconstruye el sitio público (solo necesario para el contenido consumido en build time).

---

## 2. Setup del proyecto Astro admin

Idéntico a la guía original: `astro.config.mjs` con `output: 'static'` + adapter Cloudflare, `wrangler.toml` con bindings D1/R2, `src/lib/auth.ts` (JWT HS256 + PBKDF2, copiar literal — ver guía original sección 3). Estructura de carpetas:

```
mi-sitio-admin/
├── wrangler.toml
├── astro.config.mjs
├── .dev.vars                      (gitignored)
├── .secrets/                      (gitignored — tokens de Cloudflare, nunca commitear)
├── migrations/
│   ├── 0001_initial.sql           (users + tu primer content type)
│   └── 000N_....sql               (una migración por feature nueva)
├── src/
│   ├── env.d.ts
│   ├── middleware.ts
│   ├── lib/
│   │   ├── auth.ts
│   │   ├── db.ts                  (todas las queries, tipadas)
│   │   ├── session.ts             (SESSION_COOKIE, DEV_SECRET_FALLBACK)
│   │   └── utils.ts               (slugify, triggerRepublish, resolvePreviewUrl)
│   ├── layouts/AdminLayout.astro
│   ├── components/
│   │   ├── BrandLogo.astro        (replicar el logo real del sitio público)
│   │   └── admin/
│   │       ├── FileUploader.astro
│   │       └── ReorderableList (patrón, no un componente reusable — ver sección 4)
│   └── pages/
│       ├── api/
│       │   ├── auth/{login,logout}.ts
│       │   ├── upload.ts
│       │   └── public/*.ts        (uno por content type — SIN auth, CON CORS)
│       └── admin/
│           ├── {login,setup,index}.astro
│           └── <seccion>/{index,nuevo,[id]}.astro   (una carpeta por content type)
```

### `wrangler.toml` — patrón completo
```toml
name = "mi-sitio-admin"
compatibility_date = "2024-09-23"
compatibility_flags = ["nodejs_compat"]
pages_build_output_dir = "dist"

[[d1_databases]]
binding = "DB"
database_name = "mi-sitio-admin-db"
database_id = "SE-LLENA-DESPUES-DE-WRANGLER-D1-CREATE"

[[r2_buckets]]
binding = "MEDIA"
bucket_name = "mi-sitio-media"

[vars]
R2_PUBLIC_URL = "https://SE-LLENA-DESPUES-pub-xxxx.r2.dev"

# Secretos (nunca en wrangler.toml, van con `wrangler pages secret put`):
#   JWT_SECRET
#   DEPLOY_HOOK_URL
```

**Importante — Cloudflare Pages lee `wrangler.toml` automáticamente (modo BETA).** Confirmado en producción: los bindings de D1/R2 y las `[vars]` se toman directo del archivo en cada build, **sin configurar nada a mano en el dashboard**. Solo los *secrets* (`JWT_SECRET`, `DEPLOY_HOOK_URL`) se configuran aparte porque no deben ir committeados.

---

## 3. Esquema D1 — dos patrones, según el tipo de contenido

### Patrón A — Configuración singleton (una fila fija, `id = 1`)
Para datos de los que solo existe "una versión": contacto, redes sociales, un modal de publicidad, textos del hero.

```sql
CREATE TABLE IF NOT EXISTS mi_config (
  id          INTEGER PRIMARY KEY CHECK (id = 1),
  campo_uno   TEXT,
  campo_dos   TEXT,
  updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
INSERT OR IGNORE INTO mi_config (id, campo_uno) VALUES (1, 'valor real de hoy');
```
Query: `SELECT * FROM mi_config WHERE id = 1`. Update: un solo `UPDATE ... WHERE id = 1`. Nunca hay que manejar creación/borrado.

### Patrón B — Lista con orden y estado (proyectos, equipo, servicios, testimonios)
Para cualquier cosa que necesite agregar/quitar/ocultar/reordenar.

```sql
CREATE TABLE IF NOT EXISTS mis_items (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  titulo         TEXT NOT NULL,
  foto_src       TEXT,               -- URL de R2, o ruta relativa si viene migrado
  descripcion    TEXT NOT NULL DEFAULT '',
  is_active      INTEGER NOT NULL DEFAULT 1,
  display_order  INTEGER NOT NULL DEFAULT 0,
  created_at     TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at     TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_mis_items_active ON mis_items(is_active);
CREATE INDEX IF NOT EXISTS idx_mis_items_order  ON mis_items(display_order);
```

Si el ítem necesita una galería propia (proyectos con múltiples fotos/videos), agregar una tabla hija:
```sql
CREATE TABLE IF NOT EXISTS mis_items_media (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  item_id     INTEGER NOT NULL REFERENCES mis_items(id) ON DELETE CASCADE,
  type        TEXT NOT NULL CHECK(type IN ('image', 'video')),
  src         TEXT NOT NULL,
  alt         TEXT NOT NULL DEFAULT '',
  sort_order  INTEGER NOT NULL DEFAULT 0
);
```

**Reordenar sin drag&drop** (más simple, funciona mejor en mobile): botones ▲/▼ por fila. El handler swap-ea el `sort_order`/`display_order` del ítem con su vecino y hace un solo `db.batch([...])`:
```ts
export function reorderItems(db: D1Database, orderedIds: number[]) {
  const statements = orderedIds.map((id, index) =>
    db.prepare("UPDATE mis_items SET display_order = ? WHERE id = ?").bind(index, id)
  );
  return db.batch(statements);
}
```
En la página: buscar el índice del ítem clickeado, swapear con el vecino en el array de ids, llamar `reorderItems` con el array completo reordenado.

**Migrar contenido que ya existe en el sitio público (hardcodeado):** el `INSERT` inicial usa las mismas rutas de imagen que ya están en el sitio (ej. `/fotos/casa1.png`), **sin re-subirlas a R2** — no hace falta, ya existen como archivos estáticos en el repo del sitio público. Solo las fotos *nuevas* que se suban desde el admin van a R2.

---

## 4. El uploader — versión con lección aprendida

Base: `FileUploader.astro` de la guía original (drag&drop, validación de tamaño ANTES de subir, sin `capture` forzado en el input para no romper la opción cámara-o-galería). Dos añadidos importantes de esta v2:

### 4.1 Progreso real con XHR, no un fake 40%→100%
```js
const xhr = new XMLHttpRequest();
xhr.open("POST", "/api/upload");
xhr.upload.onprogress = (e) => {
  if (!e.lengthComputable) return;
  const pct = Math.round((e.loaded / e.total) * 100);
  barEl.style.width = `${pct}%`;
};
xhr.onload = () => { /* parsear respuesta, mostrar preview */ };
xhr.send(fd);
```
Importa porque un video de 50-100MB en 4G puede tardar más de un minuto — una barra que no se mueve se lee como "esto no está funcionando".

### 4.2 `previewSrc` separado de `currentValue` — evita corromper datos
**Bug real que se detectó:** al migrar contenido con rutas relativas (`/fotos/casa1.png`) y luego querer *previsualizarlas* en el admin (que vive en otro dominio, `admin.misitio.com`, donde esa ruta no existe), la solución obvia es resolverlas contra el dominio público:
```ts
export function resolvePreviewUrl(src: string | null | undefined): string {
  if (!src) return "";
  return src.startsWith("/") ? `https://misitio.com${src}` : src;
}
```
**El error a evitar:** si le pasás esa URL resuelta directamente al mismo prop que alimenta el `<input type="hidden">` del formulario, al guardar (sin subir una foto nueva) se reescribe la base de datos con la URL absoluta en vez de la ruta relativa original — funciona por ahora, pero acopla el dato al dominio actual innecesariamente y ensucia el modelo de datos.

**Fix:** el uploader recibe dos props separadas:
```astro
<FileUploader
  currentValue={item.foto_src}                    ← el valor REAL, va al <input hidden>
  previewSrc={resolvePreviewUrl(item.foto_src)}    ← SOLO para el <img> de vista previa
/>
```
```astro
---
const { currentValue, previewSrc } = Astro.props;
const displaySrc = previewSrc ?? currentValue;
---
<input type="hidden" name={field} value={currentValue ?? ""} />
<img src={displaySrc ?? ""} ... />
```

---

## 5. Publicar cambios — dos estrategias según el tipo de contenido

Esta es la decisión de arquitectura más importante de esta guía, y la que más se malinterpreta.

| | **Build-time (estático)** | **Client-side fetch (como CEINT)** |
|---|---|---|
| Cuándo | Contenido con valor SEO: proyectos, equipo, textos principales | Contenido sin valor SEO: modales de publicidad, banners, avisos |
| Velocidad de publicación | ~1-2 min (espera un rebuild) | Instantáneo (próxima carga de página) |
| Cómo funciona | El build de Next.js hace `fetch()` al admin y hornea el resultado en el HTML estático | El navegador del visitante hace `fetch()` directo al admin, después de que la página ya cargó |
| Requiere | `ADMIN_API_URL` (server-only), Deploy Hook | `NEXT_PUBLIC_ADMIN_API_URL` (expuesta al navegador), CORS en el endpoint del admin |
| Beneficio | Carga inicial instantánea, sin JS, mejor SEO | Cambios sin esperar redeploy — ideal para contenido "urgente" |

### 5.1 Build-time — el flujo completo

**Admin** expone `GET /api/public/mi-contenido`:
```ts
export const prerender = false;
export const GET: APIRoute = async ({ locals }) => {
  const items = await getActiveItems(locals.runtime.env.DB);
  return new Response(JSON.stringify({ items, generatedAt: new Date().toISOString() }), {
    status: 200,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
};
```

**Sitio público**, `src/lib/content-api.ts`:
```ts
import fallbackItems from "@/data/fallback-items.json"; // snapshot del contenido real de hoy

export async function getPublicItems() {
  const adminApiUrl = process.env.ADMIN_API_URL;
  if (!adminApiUrl) return fallbackItems;
  try {
    // OJO: fetch simple, SIN { cache: "no-store" } — ver 5.3 (bug de Next 16)
    const res = await fetch(`${adminApiUrl}/api/public/mi-contenido`);
    if (!res.ok) throw new Error(`status ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data.items)) throw new Error("forma inesperada");
    return data.items;
  } catch (err) {
    console.warn("[content-api] fallback:", err);
    return fallbackItems;
  }
}
```

**`page.tsx`** se vuelve `async`, hace fetch arriba, pasa los datos como props a los componentes (que siguen siendo Client Components para sus animaciones — no hace falta convertirlos, solo dejan de importar un array hardcodeado y lo reciben por props).

**Deploy Hook**: cada mutación en el admin (crear, editar, ocultar, eliminar, reordenar) llama:
```ts
await triggerRepublish(Astro.locals.runtime.env.DEPLOY_HOOK_URL);
```
```ts
export async function triggerRepublish(deployHookUrl: string | undefined): Promise<void> {
  if (!deployHookUrl) return;
  try { await fetch(deployHookUrl, { method: "POST" }); }
  catch (err) { console.warn("no se pudo disparar el Deploy Hook:", err); }
}
```

### 5.2 Client-side fetch — el flujo completo (para contenido tipo "modal de publicidad")

**Admin**, mismo endpoint pero con CORS:
```ts
return new Response(JSON.stringify({ promo: payload }), {
  headers: {
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
    "Access-Control-Allow-Origin": "https://misitio.com", // el navegador SÍ necesita esto
  },
});
```

**Componente** (Client Component, sin recibir props del servidor):
```tsx
"use client";
export default function PromoModal() {
  const [promo, setPromo] = useState(null);
  useEffect(() => {
    const adminApiUrl = process.env.NEXT_PUBLIC_ADMIN_API_URL;
    if (!adminApiUrl) return;
    (async () => {
      const res = await fetch(`${adminApiUrl}/api/public/promo`, { cache: "no-store" });
      const data = await res.json();
      if (!data.promo?.enabled) return;
      // Precargar la imagen ANTES de mostrar el modal (evita el "flash"/colapso
      // mientras carga — bug real que se dio sin esto, ver sección 7).
      await new Promise((resolve) => {
        const img = new Image();
        img.onload = img.onerror = resolve;
        img.src = data.promo.mediaSrc;
      });
      setPromo(data.promo);
    })();
  }, []);
  if (!promo) return null;
  // ... renderizar modal
}
```
Este componente **no necesita Deploy Hook** — el cambio se ve apenas alguien carga la página, sin reconstruir nada.

### 5.3 Bug de Next.js 16 a evitar: `cache: "no-store"` en build time
Si usás `fetch(url, { cache: "no-store" })` **dentro del fetch que corre en build time** (estrategia 5.1), Next.js 16 lo marca como "ruta dinámica", lo cual es incompatible con `output: "export"` — el build falla (o, peor, cae silenciosamente al fallback sin avisar, porque el error queda atrapado en el `catch`). Con `output: "export"` no existe runtime que revalide nada de todas formas, así que un `fetch()` simple (sin opciones de cache) es lo correcto ahí. El `cache: "no-store"` **sí es correcto y necesario** en la estrategia 5.2 (fetch desde el navegador), donde si aplica revalidación real.

---

## 6. Aprovisionamiento de Cloudflare — orden y quién hace qué

1. **Tarjeta/billing**: R2 exige un método de pago cargado en la cuenta para habilitarse (aunque el uso se mantenga gratis) — D1 y Pages no lo requieren. Dashboard → Billing.
2. `wrangler d1 create mi-sitio-admin-db` → copiar el `database_id` a `wrangler.toml`.
3. `wrangler d1 migrations apply mi-sitio-admin-db --local` (probar) y `--remote` (aplicar de verdad).
4. `wrangler r2 bucket create mi-sitio-media`. Si falla con "Please enable R2 through the Cloudflare Dashboard" — andá al dashboard, R2 → habilitar, y reintentá.
5. **Dashboard-only**: bucket → **"URL pública de desarrollo"** → activar → copiar la URL `pub-xxxx.r2.dev` real (el nombre cambió respecto a la guía original, ya no dice "Public Access").
6. Crear proyecto Pages conectado al repo de GitHub del admin. Build command `npm run build`, output directory `dist`.
7. `wrangler pages secret put JWT_SECRET --project-name mi-sitio-admin` (generar un string random largo, no elegirlo a mano).
8. Primer deploy, visitar `/admin/setup`, crear el primer usuario real (esa página se autodeshabilita después).
9. Custom domain `admin.misitio.com` en el proyecto Pages del admin — automático si el dominio ya está en la misma cuenta.
10. En el proyecto Pages del **sitio público**: agregar variable de entorno `ADMIN_API_URL` (y `NEXT_PUBLIC_ADMIN_API_URL` si vas a usar la estrategia client-fetch) = `https://mi-sitio-admin.pages.dev` (usar el dominio `.pages.dev`, no el custom domain, mientras este último todavía esté propagando DNS).
11. En el mismo proyecto: Settings → Builds & deployments → **Deploy Hooks** → crear uno → guardar la URL.
12. `wrangler pages secret put DEPLOY_HOOK_URL --project-name mi-sitio-admin` con esa URL.
13. **Cualquier variable de entorno nueva requiere un redeploy para tomar efecto** — no es retroactivo al último deploy. Forzarlo con: `git commit --allow-empty -m "trigger redeploy" && git push`.

### Crear un segundo usuario admin (ej. para el dueño del negocio)
`/admin/setup` solo funciona una vez (se autodeshabilita si ya hay usuarios). Para el segundo usuario, generar el hash a mano y hacer INSERT directo:
```js
// hash-password.js — usa el Web Crypto API nativo de Node (v19+)
(async () => {
  const password = "la-contraseña-elegida";
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const keyMaterial = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const hash = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt, iterations: 100000 }, keyMaterial, 256);
  const saltHex = Array.from(salt).map(b => b.toString(16).padStart(2, "0")).join("");
  const hashHex = Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, "0")).join("");
  console.log(saltHex + ":" + hashHex);
})();
```
```
node hash-password.js
wrangler d1 execute mi-sitio-admin-db --remote --command "INSERT INTO users (name, email, password_hash, role) VALUES ('Nombre', 'email@ejemplo.com', 'EL_HASH_GENERADO', 'admin');"
```

---

## 7. Errores reales que se dieron en este proyecto (y cómo evitarlos desde el día 1)

1. **`wrangler.toml` con el `database_id` placeholder, olvidado sin commitear** → el primer deploy real falló con "Invalid database UUID". Actualizar el placeholder Y hacer commit+push en el mismo paso, no por separado.
2. **Token de API generado con permisos de "toda la cuenta"** (Workers Routes en todas las zonas, KV, Secrets Store, etc.) para una tarea que solo necesitaba D1+R2+Pages. Pedir siempre el mínimo permiso necesario y una expiración corta (7 días alcanza para el setup inicial).
3. **PowerShell `-Form` para multipart/form-data no arma el request igual que un navegador real** — usar `curl.exe` (viene con Windows 10/11) para probar endpoints de upload, no `Invoke-WebRequest -Form`.
4. **`Invoke-WebRequest`/`curl` sin sesión persistida entre llamadas de PowerShell** — cada invocación del tool es un shell nuevo, las variables no sobreviven. Encadenar login+acción+verificación en un solo bloque de comando.
5. **Cloudflare bloquea POSTs "cross-site"** si el request no trae `Origin`/`Referer` coincidiendo con el sitio — al probar login vía `curl` desde afuera, agregar esos headers manualmente o el request da 403 "Cross-site POST form submissions are forbidden" (no es un bug de la app).
6. **El modal/contenido client-fetched puede colapsar visualmente mientras la imagen carga** si no se reserva espacio o no se precarga antes de mostrar — ver el patrón de `preloadImage()` en 5.2.
7. **Migrar contenido real conservando las rutas relativas originales** (no re-subir a R2) funciona perfecto en el sitio público, pero rompe la vista previa dentro del admin (dominios distintos) — solucionado con `resolvePreviewUrl` + separación `currentValue`/`previewSrc` (sección 4.2).
8. **Cambiar una variable de entorno en el dashboard de Cloudflare Pages no aplica al último deploy** — siempre hace falta un redeploy nuevo (empty commit o esperar el próximo push real).

---

## 8. Checklist para replicar esto en un sitio nuevo

- [ ] ¿El sitio público es Next.js con `output: "export"`? → usar esta guía v2. ¿Es Astro? → usar la guía original (un solo proyecto).
- [ ] Confirmar que el dominio del sitio público ya está en la cuenta de Cloudflare donde vas a crear el proyecto admin (evita el problema de DNS cross-cuenta).
- [ ] Decidir, por cada tipo de contenido nuevo: ¿necesita SEO? → build-time + Deploy Hook. ¿Es efímero/promocional? → client-fetch + CORS.
- [ ] Por cada content type: migración D1 (patrón A o B), funciones en `db.ts`, página(s) admin, endpoint público, integración en el sitio (fallback JSON + refactor a props).
- [ ] Reusar literal: `auth.ts`, `FileUploader.astro` (con la versión `previewSrc`), `utils.ts` (`triggerRepublish`, `resolvePreviewUrl`), el patrón de reorder con botones ▲/▼.
