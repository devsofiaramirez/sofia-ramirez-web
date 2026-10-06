# Fotos del sitio — guía para generarlas con IA (provisionales) y para las reales de Sofía

Desde el rediseño de octubre de 2026 el sitio pasa de **ilustraciones tipo caricatura** a **fotografía
realista**: para un público B2B (importadores que arriesgan capital), la foto real transmite más
seriedad y confianza. Las fotos de IA son provisionales: Sofía las cambia desde el panel cuando tenga
las suyas. No hay que tocar código; al subirlas, el panel las reduce solo (WebP, máx. 1800 px).

## Regla de honestidad

- **La foto de la portada debe ser Sofía de verdad**, o generada a partir de una foto suya (IA que
  acepte foto de referencia). Una persona inventada presentada como "Sofía Ramírez" engaña al cliente.
- En las demás fotos **no debe aparecer alguien que parezca Sofía**: escenas, manos, espaldas, mercancía.
- Nada de logos de empresas reales, marcas de navieras ni texto dentro de la imagen.

## Bloque de estilo (pegar al final de cada instrucción)

```text
Editorial commercial photography, photorealistic, natural soft daylight, warm neutral tones with subtle
deep navy blue (#1A365D) and amber (#F59E0B) accents in the environment, shot on 35mm lens, shallow depth
of field, clean and uncluttered composition, Latin American (Colombian) context, high detail, no text,
no letters, no logos, no watermark, no brand names
```

## Paleta del sitio ("Confianza Logística")

| Uso | Color |
| --- | --- |
| Fondo claro | `#FAFAFA` / `#F1F5F9` |
| Marca (azul marino) | `#1A365D`, secciones oscuras `#0B1A30` |
| Acción (ámbar) | `#F59E0B` (siempre con texto azul marino encima, nunca blanco) |

## Las fotos, una por una

### 1. Portada — foto de Sofía

- **Dónde:** Panel → Configuración → Hero → "Tu foto o avatar".
- **Formato:** vertical 4:5, ideal 1600 × 2000 px. Se muestra en un marco redondeado; la cara debe quedar
  en el tercio superior (el marco recorta desde arriba).
- **Contenido:** medio cuerpo, mirada a cámara o levemente de lado, ropa de negocios (blazer), fondo
  desenfocado de bodega u oficina luminosa. Que se vea cercana y segura.
- **Instrucción (con foto de referencia de Sofía):**

```text
Professional half-body portrait of the woman in the reference photo, confident warm smile, wearing a
tailored camel or navy blazer over a white blouse, standing in a bright modern logistics warehouse
office, softly blurred shelves with cardboard boxes in the background, vertical 4:5 framing, face in the
upper third + [bloque de estilo]
```

### 2. Servicio "Asesoría y Consultoría a Empresas"

- **Dónde:** Panel → Servicios y cursos → editar el servicio → imagen.
- **Formato:** vertical 4:5, 1600 × 2000 px (como un retrato; el recorte cuida la parte de arriba).
- **Contenido:** reunión de trabajo: manos sobre una mesa con documentos de importación, laptop con
  tablas, muestras de producto. Sin caras en primer plano.

```text
Over-the-shoulder view of a business consultation at a wooden meeting table, hands pointing at printed
shipping documents and a laptop showing spreadsheets, small product samples and a calculator on the table,
bright modern office with large window, vertical 4:5 framing + [bloque de estilo]
```

### 3. Servicio "Cursos y Capacitaciones en Importaciones"

- **Formato:** vertical 4:5, 1600 × 2000 px (como un retrato; el recorte cuida la parte de arriba).
- **Contenido:** taller práctico: personas de espalda o perfil tomando notas, pantalla con un mapa de
  rutas China–Colombia (sin texto legible).

```text
Small hands-on business workshop in a modern training room, five adult students seen from behind and in
profile taking notes, presenter's large screen showing an abstract world map with a curved route line
from Asia to South America (no readable text), warm engaged atmosphere, vertical 4:5 framing + [bloque de estilo]
```

### 4. Servicio "Gestión de Bodegas y Logística China–Cúcuta"

- **Formato:** vertical 4:5, 1600 × 2000 px (como un retrato; el recorte cuida la parte de arriba).
- **Contenido:** bodega real: estibas, cajas apiladas y envueltas, montacargas, operario con chaleco de
  espaldas escaneando. Es la foto que más confianza da: idealmente reemplazarla pronto por la bodega real.

```text
Clean organized warehouse interior in Colombia, tall metal racks with stacked cardboard boxes on wooden
pallets, a worker in a navy safety vest seen from behind scanning a box with a handheld scanner, a forklift
partially visible, shipping containers visible through an open loading dock door, vertical 4:5 framing + [bloque de estilo]
```

### 5. Modal promocional (cuando haya una promoción)

- **Dónde:** Panel → Configuración → Modal publicitario.
- **Formato:** vertical 1080 × 1350 px (o cuadrado 1080 × 1080).
- **Contenido:** **hacerla en Canva, no con IA**, porque lleva texto (la oferta, la fecha). Fondo azul
  marino `#0B1A30`, título en blanco, botón o resaltado en ámbar `#F59E0B`, foto real de Sofía o de la
  bodega. Texto grande: en el celular se ve pequeña.

### 6. Imagen para compartir (la que sale al pegar el enlace en WhatsApp)

- **Archivo:** `public/og-default.jpg` (1200 × 630, JPEG). Esta va en el código: pásamela y la cambio.
- **Contenido:** también en Canva: fondo azul marino, "Sofía Ramírez · Importaciones China–Colombia" en
  blanco con "Importaciones" en ámbar, foto de Sofía a la derecha. La actual es la versión caricatura.

### 7. Testimonios

- **Formato:** cuadrado, 400 × 400 px. El logo de la empresa cliente (como LKP y Proyecty hoy) o la foto
  real del cliente con su permiso. **Nunca generar con IA una cara de cliente.**
- Si no hay foto, el sitio muestra las iniciales en un círculo ámbar.

## Video (opcional)

- **Video de presentación del Hero:** solo el enlace de YouTube o Vimeo, en Panel → Configuración. El botón
  "Ver video" aparece solo. Recomendado: horizontal, 60–120 segundos, Sofía presentándose y contando qué
  resuelve cada servicio.

## Ya no se usan

- El globo animado con aviones: se reemplazó por el recorrido "De China a tu bodega" (`ImportJourney.astro`).
- Los 5 íconos ilustrados de `public/images/icons/`: el sitio usa íconos de línea en código. Quedan
  guardados por si se necesitan.
