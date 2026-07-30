# Assets pendientes — sofia-ramirez-web

Checklist de imágenes, iconos y video que faltan. Estilo de referencia: el mismo de `public/images/hero/sofia-hero.jpg`
(ilustración vectorial/cartoon de negocios, paleta navy oscuro + dorado + teal, nada de fotografía realista) para que
todo el sitio se sienta como un único set de ilustraciones, no piezas sueltas.

## ✅ Ya resuelto (no se necesita nada)

- [x] Avatar principal de Sofía (Hero) — `public/images/hero/sofia-hero.jpg`.
- [x] Animación de aviones + globo — hecha 100% en código (SVG), no requiere imagen ni video.

## Imágenes pendientes

- [ ] **`public/og-default.jpg`** — 1200×630px, **JPEG sólido** (nunca PNG transparente, WhatsApp no lo muestra). Fondo navy/negro con acento dorado, incluir el avatar de Sofía o un recorte de él + el texto "Sofía Ramírez — Importaciones & Consultoría" legible en miniatura. Es lo que se ve al compartir el link.
- [ ] **Servicio 1 — Asesoría B2B** (`/admin/servicios`, categoría "Asesoría B2B") — 1200×900px (4:3). Escena ilustrada de consultoría/reunión de negocios, mismo estilo y paleta que el avatar.
- [ ] **Servicio 2 — Cursos** (categoría "Formación") — 1200×900px (4:3). Ilustración de formación/curso online: persona con laptop o tablet, elementos de aprendizaje.
- [ ] **Servicio 3 — Bodega y logística** (categoría "Logística") — 1200×900px (4:3). Ilustración de bodega/almacén: cajas, estantería, contenedor, montacargas.
- [ ] **Imagen del modal publicitario** (`/admin/configuracion`) — 1080×1350px (vertical) o 1080×1080px (cuadrada). Varía según la promo del momento; no es fija.
- [ ] **Fotos de testimonios** (`/admin/testimonios`) — 200×200px cada una, foto o ilustración/avatar del cliente real. Opcional: sin foto se muestra un placeholder con iniciales.

## Iconos (opcional, para pulir el detalle)

Hoy los "iconos" de categorías y chips flotantes del Hero son emoji (🤝 🎓 📦 ✈️) como placeholder rápido. Si quieres
reemplazarlos por iconos ilustrados a medida (mismo estilo que el avatar), necesito 5 piezas:

- [ ] **Handshake / Asesoría B2B** — 256×256px, PNG fondo transparente.
- [ ] **Graduation cap / Cursos** — 256×256px, PNG fondo transparente.
- [ ] **Warehouse / caja de logística** — 256×256px, PNG fondo transparente.
- [ ] **Avión** — 256×256px, PNG fondo transparente (para el chip "Rutas activas" del Hero).
- [ ] **Paquete/caja** — 256×256px, PNG fondo transparente (para el chip "Importación real" del Hero).
- [ ] **Favicon** — 512×512px, PNG fondo transparente, versión súper simplificada (avión + globo, o "SR"). Hoy hay un monograma dorado provisional en `public/favicon.svg`.

## Video (opcional)

- [ ] **Video de presentación del Hero** — no hace falta el archivo, solo el **link de YouTube o Vimeo** una vez lo subas. El botón "Ver video" en el Hero ya está listo y solo aparece cuando hay una URL cargada en `/admin/configuracion`. Formato recomendado: horizontal 16:9, 60–120 segundos, presentación personal + qué resuelve cada servicio.

---

Cuando tengas cada imagen, súbela desde el panel admin correspondiente (`/admin/servicios`, `/admin/testimonios`,
`/admin/configuracion`) — el uploader ya sube a R2 y guarda la URL. Las dos excepciones son `og-default.jpg` y el
favicon, que van directo en `public/` (avísame y las coloco yo).
