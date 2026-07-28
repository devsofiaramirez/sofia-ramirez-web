# Lineamientos Responsive (detalle)

## Reglas de diseño responsive obligatorias

Estas reglas aplican a TODO el código CSS/HTML/componentes que generes para este proyecto. El objetivo es que el sitio se vea correctamente desde un iPhone SE (375px) hasta un monitor 4K (2560px+), sin depender de ajustes manuales por dispositivo.

### 1. Fluidez sobre valores fijos

- Nunca uses `px` fijos para font-size, padding o margin en elementos que cambien de tamaño entre breakpoints.
- Usa `clamp(mínimo, preferido, máximo)` para tipografía y espaciados grandes.

```css
font-size: clamp(1.75rem, 4vw + 1rem, 3rem);
padding: clamp(2rem, 5vw, 5rem);
```

- El valor "preferido" del clamp debe incluir una unidad relativa al viewport (`vw`) combinada con `rem` para que escale suave.

### 2. Flexbox/Grid en todo, cero `position: absolute` salvo excepciones

- Cualquier contenedor con más de un hijo debe usar `display: flex` o `display: grid`.
- `position: absolute` solo se permite para: badges, overlays, tooltips, o elementos decorativos. Nunca para layout estructural.

### 3. Mobile-first real

- Escribe el CSS base pensando en 375px de ancho, y usa `min-width` en media queries para escalar hacia arriba. Nunca `max-width` como base del diseño.
- No "aprietes" un diseño de desktop para que quepa en mobile: diseña la versión mobile primero, luego expande.

### 4. Breakpoints estándar

Usa estos puntos de quiebre (no inventes otros salvo necesidad justificada):

```css
/* Base: mobile 375px+ */
@media (min-width: 768px) { /* tablet */ }
@media (min-width: 1024px) { /* laptop pequeño / tablet landscape */ }
@media (min-width: 1280px) { /* desktop */ }
@media (min-width: 1920px) { /* monitores grandes, solo si hace falta ajustar max-width */ }
```

### 5. Alturas: siempre `min-height`, nunca `height` fijo

- Cards, secciones, heroes: usa `min-height`, deja que el contenido defina el alto real.
- Excepción: elementos con `aspect-ratio` definido (imágenes, videos, thumbnails).

### 6. Contenedores con `max-width`, nunca `width` fijo en px

```css
.container {
  width: 100%;
  max-width: 1440px;
  margin-inline: auto;
  padding-inline: clamp(1rem, 4vw, 3rem);
}
```

### 7. Escala de espaciado y tipografía consistente

- Usa una escala fija (ej: 4, 8, 12, 16, 24, 32, 48, 64, 96px) como variables/tokens, no números sueltos como "37px" o "43px".
- Define estas escalas como variables CSS (`--space-sm`, `--space-md`, etc.) o como tokens de Tailwind, y reutilízalas en todos los componentes.

### 8. Imágenes y media

```css
img, video {
  max-width: 100%;
  height: auto;
  display: block;
}

.card-image {
  aspect-ratio: 16 / 9;
  object-fit: cover;
}
```

- Nunca fuerces un `width` y `height` fijo en px sobre una imagen responsive.

### 9. Evitar overflow horizontal

- Nunca uses `width: 100vw` para elementos internos (incluye el ancho del scrollbar y causa overflow). Usa `100%`.
- Agrega como red de seguridad (no como solución principal):

```css
html, body { overflow-x: hidden; }
```

Si esto es necesario seguido, es señal de que algo tiene un ancho fijo mal calculado — corrige la causa, no el síntoma.

### 10. Safe areas en iOS

- Para elementos fixed/sticky en la parte superior o inferior (headers, bottom nav, CTAs flotantes), respeta el notch/home indicator:

```css
padding-bottom: env(safe-area-inset-bottom);
padding-top: env(safe-area-inset-top);
```

### 11. Testing checklist antes de dar por terminado un componente

Verifica visualmente (o vía responsive mode) en estos anchos mínimos:

- 375px (iPhone SE / mini)
- 390–430px (iPhone estándar/Pro Max)
- 768px (iPad portrait)
- 1024px (iPad landscape / laptop chico)
- 1440px (laptop estándar)
- 1920px+ (monitor grande, verificar que el `max-width` del container no deje espacios vacíos raros ni contenido gigante)

### 12. Componentes específicos a revisar siempre

- **Navbar/mega menu**: en mobile debe colapsar a un menú hamburguesa funcional con scroll interno si el contenido es largo; nunca debe generar overflow horizontal.
- **Tablas**: deben tener scroll horizontal contenido (`overflow-x: auto` en un wrapper), nunca desbordar la página completa.
- **Formularios**: inputs deben tener `width: 100%` dentro de su contenedor, con `box-sizing: border-box` global.
- **Grids de cards**: usar `grid-template-columns: repeat(auto-fit, minmax(Xpx, 1fr))` en vez de columnas fijas por breakpoint cuando sea posible.

### Regla general (`box-sizing`)

Incluir siempre al inicio del proyecto:

```css
*, *::before, *::after {
  box-sizing: border-box;
}
```

---

**Resumen de las 3 reglas no negociables:**

1. `clamp()` para todo tamaño de fuente y espaciado grande.
2. Flexbox/Grid en absolutamente todos los contenedores con hijos.
3. Diseño y construcción mobile-first, verificado en 375px antes de tocar desktop.

Lineamientos SEO

Stack Tecnológico