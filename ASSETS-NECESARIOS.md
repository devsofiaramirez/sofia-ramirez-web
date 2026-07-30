# Assets pendientes — sofia-ramirez-web

Checklist de imágenes, iconos y video que faltan. Estilo de referencia: el mismo de `public/images/hero/sofia-hero.jpg`
para que todo el sitio se sienta como un único set de ilustraciones, no piezas sueltas.

**Estilo visual base (usar este bloque como prefijo en cualquier IA generadora de imágenes):**

```text
Semi-realistic vector illustration, clean bold outlines, soft cel-shading, warm natural skin tones,
professional business attire, modern corporate digital-illustration style (like a premium infographic
character), no photorealism, no photo texture, no film grain, no watermark, no text baked into the image
```

**Paleta actual del sitio ("Logística Transparente")** — usar esto, no dorado/teal/fondo oscuro:

- Fondo: gris hielo claro `#F8F9FA` (o blanco `#FFFFFF` para tarjetas)
- Texto/títulos: navy `#0A2540`
- Texto secundario: gris `#4A5568`
- Acento principal: rojo `#E63946`
- Acento secundario: azul `#007BFF`
- Excepción: el footer del sitio es navy oscuro sólido — si una imagen va a aparecer sobre el footer, sí puede usar tonos oscuros/dorados de contraste, pero todo el resto del sitio es claro.

## ✅ Ya resuelto (no se necesita nada)

- [x] Avatar principal de Sofía (Hero) — `public/images/hero/sofia-hero.jpg`.
- [x] Animación de aviones + globo — hecha 100% en código (SVG), no requiere imagen ni video.
- [x] `public/og-default.jpg` — recibida, procesada (convertida a JPEG 1200×630) y en su lugar. Se ve muy bien: fondo navy, avatar a la derecha, texto legible.
- [x] Favicon — recibida, recortada a cuadrado y puesta en `public/favicon.png` (reemplaza el monograma dorado provisional).
- [x] Servicio 1 — Asesoría B2B — recibida, redimensionada a 1200×900 y subida a R2 + enlazada en la base de datos (`asesoria-empresas-importaciones`). Muy en línea con el estilo del avatar (misma protagonista, oficina clara).
- [x] Servicio 2 — Cursos — recibida, procesada y enlazada (`curso-importaciones-china-colombia`). Buen mood de aprendizaje, banderas China/Colombia como toque perfecto.
- [x] Servicio 3 — Bodega y logística — recibida, procesada y enlazada (`bodega-logistica-china-cucuta`). Escena completa (montacargas, escáner, ruta punteada de fondo) — de las tres, la más lograda.
- [x] Handshake, Graduation cap, Warehouse, Avión, Paquete — recibidos como badges circulares (mismo lenguaje visual que las insignias del Hero), redimensionados y guardados en `public/images/icons/`. **Aún no están conectados en el código** — ver nota abajo.

**Nota sobre los 5 íconos:** hoy no hay un lugar en el sitio donde encajen bien tal cual. El badge de categoría en las tarjetas (`ServicesGrid.astro` / `/servicios/[slug].astro`) es un emoji diminuto (~12px) dentro de una píldora de texto — poner ahí un PNG ilustrado de detalle se vería borroso/pesado en vez de mejor. Y los chips del Hero ya no usan íconos (se simplificaron a solo texto con check ✓ en el rediseño "Logística Transparente"). Estos 5 quedan guardados y listos para cuando definamos un lugar donde sí luzcan (por ejemplo, una franja de "por qué elegirnos" con íconos más grandes) — dime si quieres que diseñemos esa sección.

## Imágenes pendientes

### Imagen del modal publicitario

- **Dónde se usa:** `/admin/configuracion` — el modal que aparece una vez por sesión al visitante.
- **Formato:** 1080×1350px (vertical, recomendado para que se vea bien en móvil) o 1080×1080px (cuadrado). No es una imagen fija: cambia cada vez que Sofía lance una promoción distinta.
- **Contenido:** título/oferta grande y muy legible (ej. "Cupos abiertos — Curso de Importaciones, Agosto 2026"), fecha o urgencia si aplica, mismo estilo ilustrado y paleta del sitio, opcionalmente el avatar de Sofía como elemento de marca reconocible.
- **Nota técnica:** el modal ya soporta imagen O video (si cargas ambos, el video tiene prioridad).

### Fotos de testimonios

- **Dónde se usa:** `/admin/testimonios`, junto a cada caso de éxito.
- **Formato:** 200×200px, cuadrado, JPEG/PNG/WebP.
- **Contenido:** idealmente la foto real del cliente (si autoriza el uso de su imagen) o, para mantener consistencia visual, un avatar ilustrado simplificado en el mismo estilo (busto, fondo neutro claro).
- **No bloqueante:** si no hay foto, el sitio ya muestra un placeholder con las iniciales del cliente.

## Iconos — recibidos, pendiente de definir dónde se usan

Los 5 (Handshake, Graduation cap, Warehouse, Avión, Paquete) ya están en `public/images/icons/` a 256×256px. Ver la
nota en "Ya resuelto" arriba — no hay un lugar en el diseño actual donde encajen bien todavía (el badge de categoría
en las tarjetas es un emoji diminuto, y los chips del Hero son solo texto). Quedan disponibles para cuando se defina
una sección donde se vean a buen tamaño.

## Video (opcional)

- [ ] **Video de presentación del Hero** — no hace falta el archivo, solo el **link de YouTube o Vimeo** una vez lo subas. El botón "Ver video" en el Hero ya está listo y solo aparece cuando hay una URL cargada en `/admin/configuracion`. Formato recomendado: horizontal 16:9, 60–120 segundos, presentación personal + qué resuelve cada servicio.

---

Cuando tengas cada imagen, súbela desde el panel admin correspondiente (`/admin/servicios`, `/admin/testimonios`,
`/admin/configuracion`) — el uploader ya sube a R2 y guarda la URL. Las dos excepciones son `og-default.jpg` y el
favicon, que van directo en `public/` (avísame y las coloco yo).
