# SPEC 04 — Fondo animado del hero (Noise + Spotlight)

> **Status:** Aprobado
> **Depends on:** SPEC 03
> **Date:** 2026-09-03
> **Objective:** Reemplazar el fondo estático (negro liso + grid pattern) del hero de `home-page` por un fondo animado en Canvas ("Noise + Spotlight": grano sutil + halo radial teal en movimiento lento), sobre una base más oscura (`#161616`, igual al carousel de abajo), evaluado contra 3 alternativas mediante un artifact de preview en vivo.
>
> **Actualización post-aprobación (2026-09-04):** tras la primera implementación (lógica del canvas inline en `home-page.ts`), el usuario pidió una forma más limpia. Se extrajo toda la lógica de la animación a una directiva standalone nueva, `HeroCanvasBackgroundDirective`. Ver `## Decisions` para el detalle.

## Scope

**In:**

- `src/app/shared/pages/home/hero-canvas-background.directive.ts` (nuevo): directiva de atributo standalone `HeroCanvasBackgroundDirective` (`selector: 'canvas[appHeroCanvasBackground]'`), aplicada directamente sobre el `<canvas>` del hero. Encapsula toda la lógica de animación — imperativa, no signals: obtiene el `ElementRef` del canvas vía `inject()`, inicializa en `ngAfterViewInit`, loop de dibujo con `requestAnimationFrame`, y limpieza en `ngOnDestroy`.
- `src/app/shared/pages/home/home-page.ts`: sin lógica de canvas — sólo agrega `HeroCanvasBackgroundDirective` a `imports` del `@Component`. No se agrega `ViewChild` ni ningún campo/método nuevo a `HomeComponent`; el typewriter y el resto de la clase quedan intactos.
- `src/app/shared/pages/home/home-page.html`: dentro de `.container`, se reemplaza `<div class="overlay"></div>` por `<canvas class="hero-canvas" appHeroCanvasBackground></canvas>` como primer hijo (detrás de `<section>`). El resto del hero (badge, `h1`, typewriter, `stats-grid`, `container-actions`) no cambia.
- `src/app/shared/pages/home/home-page.scss`: `.container` cambia su `background-color` de `v.$black-custom` a `#161616` (mismo tono que `.carousel-shelf` en `course-carousel.component.scss`); se elimina el pseudo-elemento `.container::before` (grid pattern) y la regla `.overlay` (ambos quedan reemplazados por el canvas); se agrega `.hero-canvas` (posicionamiento absoluto, `pointer-events: none`, detrás del contenido).
- Comportamiento responsive/accesibilidad: en mobile (`<768px`) y cuando `prefers-reduced-motion: reduce` está activo, la animación se simplifica a un frame estático (sin loop de `requestAnimationFrame`), en vez de la animación completa de desktop.

**Out of scope (para futuras specs):**

- Cambiar el diseño del contenido del hero (badge/h1/typewriter/stats-grid/CTAs) — eso ya quedó cerrado en SPEC 03, esta spec sólo toca el fondo.
- Las otras 3 direcciones evaluadas en el preview (Grid Pulse/Scanline, Constellation Network, Circuit Traces) — quedan descartadas, no se implementan.
- Tocar `variables.scss` global — el color `#161616` se hardcodea igual que ya lo hace `course-carousel.component.scss` (no existe como token hoy).
- Cambios a `course-carousel`, `course-list`, `page-title` o cualquier contenido debajo del hero.
- Tests automatizados nuevos.
- Componente standalone reutilizable para el hero (sigue inline, decisión ya tomada en SPEC 03).

## Data model

Esta spec no introduce estructuras de datos persistentes ni de backend, ni signals nuevos. Todo el estado de la animación vive encapsulado en `HeroCanvasBackgroundDirective` (imperativo, plain fields — mismo estilo que ya usa el typewriter de `home-page.ts` con `phraseIndex`/`charIndex`/`isDeleting`), no en `HomeComponent`:

- `ElementRef<HTMLCanvasElement>` del canvas, obtenido vía `inject()` dentro de la directiva (no hace falta `ViewChild` en `HomeComponent`).
- Estado interno de la animación (no expuesto a la plantilla): tiles de ruido pre-generados (`ImageData`/`HTMLCanvasElement` offscreen), posición del spotlight (calculada por frame a partir de `Math.sin`/`Math.cos` del timestamp), id de `requestAnimationFrame` pendiente (para poder cancelarlo), y un flag derivado de `window.matchMedia('(prefers-reduced-motion: reduce)')` + `window.matchMedia('(max-width: 768px)')` que decide si se corre el loop completo o un único frame estático.
- `HomeComponent` no gana ningún campo ni signal nuevo: no se toca `typewriterText`, `coursesToShow`, `carouselCourses` ni `coursesResource`.

## Implementation plan

1. En `home-page.html`: dentro de `.container`, reemplazar `<div class="overlay"></div>` por `<canvas class="hero-canvas" appHeroCanvasBackground></canvas>`, manteniendo su posición como primer hijo (antes de `<section>`). No se toca nada dentro de `<section>`.
2. Crear `hero-canvas-background.directive.ts` con `HeroCanvasBackgroundDirective` (`selector: 'canvas[appHeroCanvasBackground]'`, `standalone: true`):
   - Obtener el `ElementRef<HTMLCanvasElement>` vía `inject()` (no `@Input`, la directiva se aplica directo sobre el canvas).
   - En `ngAfterViewInit`, inicializar el canvas: ajustar tamaño con `devicePixelRatio` (clamp a 2x) contra el tamaño real del contenedor padre (via `ResizeObserver`, con fallback a `window.addEventListener('resize', ...)`), generar 2-3 tiles de ruido offscreen (`createImageData`, alpha bajo, color `$white-custom`), y arrancar el loop de dibujo.
   - Loop de dibujo por frame: fondo sólido `#161616` → gradiente radial (`createRadialGradient`) centrado en una posición que se mueve lento con `Math.sin`/`Math.cos` del timestamp, color `$brand-color` con alpha bajo (halo) → overlay de ruido (pattern del tile activo, rotando de tile cada ~140ms para dar sensación de grano vivo sin recalcular pixel a pixel cada frame).
   - Si `prefers-reduced-motion: reduce` o el viewport es `<768px`: dibujar un único frame estático (spotlight centrado, un solo tile de ruido, sin `requestAnimationFrame` en loop) en vez de animar.
   - En `ngOnDestroy`: cancelar el `requestAnimationFrame` pendiente y desconectar el `ResizeObserver`.
3. En `home-page.ts`: importar `HeroCanvasBackgroundDirective` y agregarla a `imports` del `@Component`. No se agrega ningún campo, método ni interfaz de lifecycle nueva a `HomeComponent` — el typewriter y `ngOnDestroy` quedan exactamente como en la implementación original.
4. En `home-page.scss`:
   - `.container`: `background-color` pasa de `v.$black-custom` a `#161616` (hardcodeado, igual que `.carousel-shelf` en `course-carousel.component.scss`).
   - Se elimina `.container::before` (grid pattern) y la regla `.overlay` — ambos quedan reemplazados por el canvas.
   - Se agrega `.hero-canvas`: `position: absolute; inset: 0; width: 100%; height: 100%; display: block; pointer-events: none; z-index: 0;` (detrás de `.container section`, que ya tiene `z-index: 1`).
5. QA visual manual en `/` (home): confirmar que el fondo del hero se ve notablemente más oscuro y en el mismo tono que el carousel de abajo (`#161616`), que el spotlight teal se mueve lento y de forma continua en desktop, que el grano es sutil (no compite con la legibilidad del texto ni de las stat cards), que en mobile (`<768px`) el fondo se ve como un frame estático (sin animación corriendo) y con contenido activando `prefers-reduced-motion` en DevTools también queda estático, y que no hay errores de consola ni el `requestAnimationFrame`/`ResizeObserver` siguen corriendo después de navegar fuera de home.

## Acceptance criteria

- [ ] El fondo del hero ya no es negro liso con grid pattern (`.container::before` eliminado) — ahora es un `<canvas>` animado con textura de ruido sutil + halo radial teal en movimiento lento.
- [ ] El color base del fondo del hero es `#161616` (mismo tono que `.carousel-shelf` del carousel debajo), reemplazando `v.$black-custom`.
- [ ] `.overlay` ya no existe en el HTML ni en el SCSS del hero (reemplazado funcionalmente por el canvas).
- [ ] En desktop, la animación corre en loop continuo (`requestAnimationFrame`) sin saltos ni parpadeos bruscos, y el spotlight se mueve de forma suave y lenta.
- [ ] En mobile (`<768px`), la animación se muestra como un frame estático (sin loop de `requestAnimationFrame` corriendo).
- [ ] Con `prefers-reduced-motion: reduce` activo (cualquier viewport), la animación se muestra como un frame estático.
- [ ] El canvas se redimensiona correctamente si cambia el tamaño de `.container` (resize de ventana), sin quedar pixelado ni cortado.
- [ ] El typewriter del subtítulo sigue funcionando exactamente igual que antes (sin cambios de lógica ni de timing).
- [ ] Al salir de `/` (destruir `home-page`), no quedan `requestAnimationFrame` corriendo en background, el `ResizeObserver` se desconecta, y no hay errores en consola.
- [ ] El badge, `h1`, subtítulo, `stats-grid` y `container-actions` se ven exactamente igual que en SPEC 03 (sólo cambió el fondo detrás de ellos).
- [ ] La ruta `/` renderiza sin errores en consola, tanto en desktop como en mobile.
- [ ] `home-page.ts` no tiene ningún campo, método ni import relacionado a canvas/animación — toda esa lógica vive únicamente en `HeroCanvasBackgroundDirective`.

## Decisions

- **Sí:** técnica de animación = Canvas + JS ligero (no CSS puro, no SVG inline) — decisión explícita del usuario tras comparar las 3 opciones, para tener control fino sobre ruido + spotlight moviéndose de forma orgánica.
- **Sí:** el grid pattern de SPEC 03 (`.container::before`) se reemplaza totalmente, no queda como capa base bajo la nueva animación — decisión explícita del usuario.
- **Sí:** la animación se simplifica a un frame estático en mobile (`<768px`) y con `prefers-reduced-motion: reduce` — decisión explícita del usuario, prioriza performance en gama baja y accesibilidad por sobre el efecto visual completo.
- **Sí:** dirección de diseño = "Noise + Spotlight" (grano sutil + halo radial teal en movimiento lento) — elegida por el usuario tras ver un artifact de preview en vivo con 4 alternativas (Grid Pulse/Scanline, Constellation Network, Circuit Traces, Noise + Spotlight) corriendo animadas con Canvas sobre la paleta real del proyecto.
- **Sí:** el fondo base pasa de `v.$black-custom` (`rgb(40,40,40)`) a `#161616` — decisión explícita del usuario ("que sea más negro, como el carousel de abajo"), igualando el tono ya usado en `.carousel-shelf` de `course-carousel.component.scss`.
- **No:** tocar `variables.scss` global — `#161616` se hardcodea en `home-page.scss`, siguiendo el mismo patrón que ya usa `course-carousel.component.scss` (no se promueve a token compartido en esta spec).
- **No:** las otras 3 direcciones de diseño evaluadas (Grid Pulse/Scanline, Constellation Network, Circuit Traces) — quedaron descartadas tras la elección del usuario; el código del artifact de preview no se lleva al proyecto real, sólo sirvió para decidir.
- **No:** cambios al contenido/copy/layout del hero — esta spec es exclusivamente sobre el fondo; el resto de SPEC 03 permanece intacto.
- **Revisado (2026-09-04):** la primera implementación dejó toda la lógica de canvas (ViewChild, constantes, ~5 métodos, ~8 campos de estado) inline en `HomeComponent`. El usuario pidió una forma más limpia. Se extrajo a `HeroCanvasBackgroundDirective`, una directiva de atributo standalone aplicada directo sobre el `<canvas>`: Angular resuelve el `ElementRef` sin `ViewChild`, el ciclo de vida completo (init/resize/rAF/cleanup) queda encapsulado en la directiva, y `HomeComponent` no gana ningún campo/método nuevo — sólo agrega la directiva a `imports`. Se prefirió una directiva por sobre una clase plana en un archivo aparte porque aprovecha el manejo de `ElementRef` y lifecycle hooks nativo de Angular para este caso (comportamiento atado 1:1 a un elemento del DOM), sin violar la decisión de SPEC 03 de no convertir el hero en un componente (una directiva no es un componente, no cambia el árbol de renderizado).

## Identified risks

- **Performance con múltiples pestañas/instancias:** un loop de `requestAnimationFrame` corriendo indefinidamente en `/` puede consumir CPU/batería si el usuario deja la pestaña en foreground por mucho tiempo. Mitigación: considerar pausar el loop cuando `document.visibilityState !== 'visible'` (no listado como criterio de aceptación obligatorio, pero recomendado si surge en QA).
- **Layout shift / flash sin canvas:** si el canvas tarda en inicializarse (carga lenta de JS) puede verse un flash del `background-color: #161616` sin animación por un instante. Se considera aceptable ya que `#161616` es igualmente el color de fondo final deseado (no hay contraste brusco).
