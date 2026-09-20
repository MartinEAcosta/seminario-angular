# SPEC 11 — Landing de comodidades en /about

> **Status:** Aprobado
> **Depends on:** Ninguna (reemplaza contenido ya existente en `/about`)
> **Date:** 2026-09-20
> **Objective:** Reemplazar el contenido genérico actual de `about-page` (título + párrafo + lista con emojis) por una landing multi-sección con identidad visual propia — inspirada en la estructura de secciones apiladas de `apple.com/la/business` pero con lenguaje visual propio (motivo "pase de acceso") — que explique las tres comodidades centrales de Udemix: crear y publicar cursos, explorar/comprar cursos, y convertirse en profesor.

## Por qué existe esta spec

`about-page` hoy es un placeholder: un `<h1>Sobre Nosotros</h1>`, un párrafo fijo y una lista de 3 bullets con emojis, sobre fondo blanco liso (`about-page.html`/`.scss`, sin lógica en `about-page.ts`). No comunica de forma concreta ni memorable qué puede hacer un usuario en la plataforma, y su diseño es genérico (título + párrafo + lista, sin jerarquía visual ni tratamiento tipográfico propio).

El usuario pidió una sección "about" completa en estructura y diseño, sin diseño genérico, tomando como referencia el estilo de `apple.com/la/business` (secciones apiladas full-bleed, tipografía display muy grande y pesada, alternancia de fondos claro/oscuro, cards con etiqueta + dato destacado, sección "spotlight" de producto con mockup). Como el proyecto no tiene fotografías reales de personas/oficinas (a diferencia de Apple), la referencia se traduce a ilustraciones SVG propias y a un motivo de diseño propio — un "pase de acceso" tipo ticket con perforación — en vez de copiar literalmente el estilo fotográfico de Apple.

## Scope

**In:**

- Reemplazo total de `src/app/shared/pages/about/about-page.html`, `.scss` y `.ts` (el `.ts` pasa de estar vacío a manejar el reveal por scroll, ver Data model).
- 4 secciones apiladas, en este orden:
  1. **Hero** (fondo oscuro): tira de 3 íconos "sello" (curso/carrito/profesor), `h1` display muy grande con la propuesta de valor, subtítulo corto.
  2. **Spotlight** "Crear y publicar cursos" (fondo claro): layout a 2 columnas — texto + bullets a la izquierda, ilustración SVG de un mockup de editor de curso a la derecha (ventana con lista de módulos simulada + barra de progreso).
  3. **Grid de comodidades** (fondo claro): 2 "ticket-cards" con motivo de perforación punteada — "Explorar y comprar cursos" y "Convertite en profesor".
  4. **CTA final** (fondo oscuro): línea de cierre + 2 botones (`/explore` primario, `/become-teacher` secundario), mismo patrón visual (`.btn-primary`/`.btn-secondary` como `<button [routerLink]>`) que ya usa el hero de home (SPEC 03).
- 4 SVG nuevos en `public/assets/`: `about-course-icon.svg`, `about-cart-icon.svg`, `about-teacher-icon.svg` (íconos de línea para la tira del hero y las ticket-cards) y `about-course-builder-mockup.svg` (ilustración del spotlight).
- Reveal por scroll: cada una de las 4 secciones aparece con fade + slide-up la primera vez que entra en viewport, vía `IntersectionObserver` en `about-page.ts` (una sola vez por sección, sin re-disparar al volver a scrollear). Respeta `prefers-reduced-motion: reduce` (sin animación, contenido visible directo).
- Tokens visuales locales (scoped a `about-page.scss`, sin tocar `variables.scss` global): variable local `$about-ink` (negro-verdoso oscuro derivado de `$brand-color`) para las secciones oscuras, en vez de negro puro — evita el look genérico "fondo negro + acento neón" y mantiene identidad de marca.
- Skill `frontend-design` aplica de punta a punta: tipografía display propia (Montserrat 800/900, ya cargada en `index.html`, sin fuentes nuevas), motivo de "ticket con perforación" como elemento de firma, movimiento acotado a un único reveal por sección + micro-interacción de hover en las ticket-cards.

**Sin cambios funcionales:**

- `about-page.spec.ts` (solo verifica `should create`, sigue pasando sin cambios).
- Ruta `/about` en `app.routes.ts` (mismo path, mismo lazy import).
- `home-page.html`/`.scss` (el botón "Sobre nosotros" del hero de home ya apunta a `/about` desde SPEC 03, sin cambios).
- Header/footer del layout compartido (esta spec solo toca el contenido de la página, no el shell).

**Out of scope (para futuras specs):**

- La comodidad "video lessons + progreso" y cualquier mención a video.js/enrollment — el usuario acotó el contenido a las 3 comodidades listadas arriba; agregar una cuarta comodidad es una revisión aparte.
- Dato dinámico real (ej. total de cursos publicados vía `CourseState`) — decisión explícita del usuario: toda la landing usa copy estático, sin inyectar servicios/estado en `about-page.ts` más allá de la lógica de reveal por scroll.
- Subcomponentes standalone (`about-hero`, `about-feature-card`, etc.) — decisión explícita del usuario de mantener todo inline en `about-page`, mismo criterio que el hero de home (SPEC 03).
- Extraer `.btn-primary`/`.btn-secondary` a un componente compartido — se duplica el estilo local igual que ya conviven `home-page.scss` y el `app-btn-primary` no usado acá, siguiendo el patrón ya existente en el proyecto de estilos de botón repetidos por página.
- Cambios a `variables.scss` global, a `app.routes.ts`, al header/footer, o a cualquier otra página.
- Tests automatizados nuevos (se corre la suite existente como parte de la verificación).

## Data model

Esta spec no introduce estructuras de datos de negocio ni llamadas a servicios/backend. `about-page.ts` pasa de una clase vacía a manejar únicamente el estado de UI del reveal por scroll:

```ts
// src/app/shared/pages/about/about-page.ts
type AboutSectionId = 'hero' | 'spotlight' | 'grid' | 'cta';

visibleSections = signal<Set<AboutSectionId>>(new Set());

// ViewChild/ElementRef por sección (o un solo ViewChildren con [attr.data-section]),
// un único IntersectionObserver creado en ngAfterViewInit, threshold bajo (ej. 0.15).
// Al entrar una sección en viewport: visibleSections.update(set => new Set(set).add(id))
// y observer.unobserve(el) — el reveal ocurre una sola vez, no se repite.
// ngOnDestroy: observer.disconnect().
```

En el template, cada `<section>` bindea `[class.is-visible]="visibleSections().has('hero')"` (etc.), y el CSS define el estado inicial (oculto/desplazado) y la transición a `.is-visible`. Dentro de un `@media (prefers-reduced-motion: reduce)`, todas las secciones se muestran directamente visibles sin transición (sin depender de que el observer dispare).

## Diseño (tokens y motivo de firma)

- **Color:** fondos oscuros usan `$about-ink` (variable local en `about-page.scss`, ej. `#0e1a1a`, un negro-verdoso derivado de `$brand-color` en vez de negro puro) en vez de negro genérico. Fondos claros reutilizan `v.$white-custom`. Acento único: `v.$brand-color` para eyebrows, la línea punteada de perforación y los stamps circulares. Texto sobre oscuro: blanco al 92% de opacidad para títulos, 60% para copy secundario. Texto sobre claro: `v.$black-custom`.
- **Tipografía:** display en `v.$font-primary` (Montserrat) peso 800/900, escala fluida con `clamp()` (hero `h1` entre ~2.5rem y ~5rem), `letter-spacing` negativo (-0.02em) para el peso visual tipo Apple. Eyebrows/labels en Montserrat 600 mayúsculas con `letter-spacing` positivo (0.08em). El flourish `$font-brand` (Playwrite, cursivo) se reserva para un único uso: la palabra "Udemix" como watermark detrás del mockup del spotlight — mismo recurso de marca que ya existía en la versión vieja de `about-page`, reubicado.
- **Motivo de firma — "pase de acceso":** las ticket-cards del grid (y opcionalmente los stamps del hero) tienen una línea de perforación punteada (`border` `dashed` o gradiente repetido) que separa un "sello" circular (ícono) del cuerpo con label + descripción, más un recorte semicircular en los bordes izquierdo/derecho simulando un ticket rasgado (`radial-gradient`/`mask` o pseudo-elementos `::before`/`::after` con `border-radius: 50%` y `background-color` igual al fondo de la sección). Referencia directa a "comodidades incluidas en tu acceso a la plataforma", motivo que no existe en ningún otro punto del proyecto.
- **Motion:** un único reveal por sección (fade + slide-up ~24px, ~500ms, easing `ease-out`) la primera vez que aparece en scroll; en hover, las ticket-cards levantan levemente (`translateY`) y la línea de perforación "seguir rasgándose" (`stroke-dashoffset` si se implementa con SVG, o un `background-position` animado si es CSS). Nada de animación continua/ambiental — movimiento acotado a esos dos momentos.

## Implementation plan

1. Crear los 4 SVG nuevos en `public/assets/` (`about-course-icon.svg`, `about-cart-icon.svg`, `about-teacher-icon.svg`, `about-course-builder-mockup.svg`) — íconos de línea fina blanca/teal y mockup de ventana con lista de módulos + barra de progreso, estilo consistente con los SVG ya creados en SPEC 03. Verificación: los archivos existen y abren correctamente como imagen.
2. Reescribir `about-page.ts`: agregar el tipo `AboutSectionId`, el signal `visibleSections`, las referencias a las 4 secciones (`ViewChild`/`ViewChildren` con `ElementRef`), el `IntersectionObserver` creado en `ngAfterViewInit` (threshold ~0.15, `unobserve` tras marcar visible) y la limpieza en `ngOnDestroy` (`observer.disconnect()`). Verificación: compila, sin uso en el template todavía (el signal existe pero no se consume).
3. Reescribir `about-page.html` con las 4 secciones descritas en el Scope, cada una con `[class.is-visible]` bindeado a `visibleSections().has(...)`, y los `<img>` a los 4 SVG nuevos. El CTA final usa `<button [routerLink]="'/explore'" class="btn-primary btn">` y `<button [routerLink]="'/become-teacher'" class="btn-secondary btn">`, mismo patrón que `home-page.html`. Verificación: compila, la página renderiza (sin animación todavía si el CSS no está).
4. Reescribir `about-page.scss` completo: variable local `$about-ink`, estilos base de cada sección (alternancia claro/oscuro), tipografía display con `clamp()`, estilos de las ticket-cards (perforación punteada + notch semicircular + hover), estilo del mockup del spotlight (ventana con "traffic lights", lista de módulos simulada, barra de progreso, watermark `$font-brand` de fondo), transición `.is-visible` (fade + slide-up) y su contraparte `@media (prefers-reduced-motion: reduce)` (todo visible sin transición), y `.btn-primary`/`.btn-secondary` locales (mismo aspecto que `home-page.scss`, duplicados a propósito). Verificación: compila y el reveal por scroll funciona visualmente.
5. `@media (max-width: 768px)`: tira de stamps del hero se envuelve a 2 líneas si hace falta; spotlight pasa a una columna (mockup debajo del texto); grid de ticket-cards a 1 columna; CTA final apila los 2 botones al 100% de ancho. Verificación: sin overflow horizontal en mobile.
6. QA manual: `ng build` sin errores. Visitar `/about` en desktop (>768px): las 4 secciones alternan fondo claro/oscuro, el reveal por scroll ocurre una sola vez por sección al bajar (no tiembla ni se repite al volver a subir y bajar), el hover de las ticket-cards se ve suave, el watermark "Udemix" se ve detrás del mockup sin tapar legibilidad. Repetir en mobile (<768px): layout apilado, sin overflow horizontal, botones del CTA al 100% de ancho. Activar "reducir movimiento" en el SO/navegador y confirmar que las 4 secciones se ven directamente sin animación. Confirmar que los botones del CTA navegan a `/explore` y `/become-teacher`. Sin errores de consola ni observers colgados al salir de la página (navegar a otra ruta y volver).

## Acceptance criteria

- [ ] `about-page` ya no muestra el contenido genérico anterior (título "Sobre Nosotros" + párrafo + lista con emojis sobre fondo blanco liso) — el archivo completo fue reemplazado.
- [ ] La página tiene 4 secciones en el orden: hero (oscuro) → spotlight "Crear y publicar cursos" (claro) → grid de 2 ticket-cards "Explorar y comprar cursos"/"Convertite en profesor" (claro) → CTA final (oscuro).
- [ ] Las secciones oscuras usan `$about-ink` (variable local, no negro puro) como fondo, no `#000000` ni `v.$black-custom`.
- [ ] Las ticket-cards del grid muestran el motivo de perforación punteada + sello circular con ícono, distinguible de una card genérica sin ese detalle.
- [ ] Cada sección aparece con un efecto fade + slide-up la primera vez que entra en el viewport al hacer scroll, y no se repite si se vuelve a scrollear sobre la misma sección.
- [ ] Con `prefers-reduced-motion: reduce` activado, las 4 secciones se muestran directamente visibles, sin transición.
- [ ] El `IntersectionObserver` se desconecta (`disconnect()`) al destruirse el componente — sin errores de consola ni listeners colgados al navegar fuera de `/about`.
- [ ] El botón primario del CTA final navega a `/explore` y el secundario a `/become-teacher`, ambos vía `[routerLink]`.
- [ ] En mobile (<768px): tira de stamps del hero legible, spotlight en una columna (mockup debajo del texto), grid de ticket-cards en 1 columna, botones del CTA al 100% de ancho, sin overflow horizontal.
- [ ] `about-page.spec.ts` sigue pasando sin modificaciones (`should create`).
- [ ] `ng build` compila sin errores y no hay errores de consola en desktop ni mobile.

## Decisions

- **Sí:** reemplazo total del contenido actual de `/about` (no se agrega como bloque adicional debajo del texto viejo) — decisión explícita del usuario.
- **Sí:** landing multi-sección (hero + spotlight + grid + CTA) en vez de una única sección hero+grid — decisión explícita del usuario, más fiel a la profundidad estructural de `apple.com/la/business`.
- **Sí:** contenido acotado a 3 comodidades (crear cursos, explorar/comprar, ser profesor) — decisión explícita del usuario; "video lessons + progreso" queda fuera de esta revisión.
- **Sí:** "Crear y publicar cursos" como spotlight destacado (sección propia con mockup), las otras 2 comodidades como ticket-cards más chicas en el grid — decisión explícita del usuario, prioriza la propuesta de valor para instructores.
- **Sí:** todo el copy y las descripciones son estáticos, sin inyectar `CourseState` ni ningún otro servicio de datos — decisión explícita del usuario; la única lógica nueva en `about-page.ts` es el `IntersectionObserver` del reveal por scroll (UI pura, no datos).
- **Sí:** ilustraciones SVG propias en vez de fotos de stock — decisión explícita del usuario, ya que el proyecto no tiene fotografía real de personas/oficinas como Apple; se mantiene el patrón ya usado en SPEC 03 (SVG a medida en `public/assets/`).
- **Sí:** todo inline en `about-page` sin subcomponentes standalone — decisión explícita del usuario, mismo criterio que el hero de home (SPEC 03).
- **Sí:** motivo de firma propio ("pase de acceso" con perforación punteada) en vez de copiar literalmente las cards de Apple (foto + overlay + botón "+") — se adapta la referencia visual (etiqueta + dato/label destacado + ícono) a un lenguaje propio del dominio (curso = acceso/membresía), evitando que la página se sienta como una copia genérica de la referencia.
- **Sí:** fondo oscuro con `$about-ink` (negro-verdoso derivado de `$brand-color`) en vez de negro puro — evita el patrón genérico "fondo negro + acento neón" señalado como default de IA; mantiene coherencia de marca con `$brand-color` ya existente.
- **No:** extraer `.btn-primary`/`.btn-secondary` a un componente compartido ni reusar `app-btn-primary` — se duplica el estilo local, igual que ya ocurre entre otras páginas del proyecto; extraerlo es una decisión de refactor aparte, no pedida acá.
- **No:** tocar `variables.scss` global — los tokens nuevos (`$about-ink`) quedan como variables locales de `about-page.scss`.
- **No:** agregar la comodidad de video lessons/progreso — fuera del alcance definido por el usuario para esta revisión.

## Identified risks

| Riesgo | Mitigación |
| --- | --- |
| El `IntersectionObserver` mal limpiado puede dejar listeners activos si el usuario navega fuera de `/about` antes de que las 4 secciones entren en viewport. | El plan de implementación exige `disconnect()` explícito en `ngOnDestroy` (paso 2) y el QA manual (paso 6) prueba explícitamente navegar fuera de la página antes de completar el scroll. |
| El motivo de perforación punteada + notch semicircular (`radial-gradient`/`mask`) puede no verse igual en todos los navegadores si se implementa con una técnica CSS poco soportada. | Se preferirá la técnica más simple que logre el efecto (pseudo-elementos circulares superpuestos al fondo de sección en vez de `mask`/`clip-path` avanzado) — se ajusta en implementación si hace falta, sin cambiar el resultado visual esperado. |
| Si el reveal por scroll no respeta `prefers-reduced-motion`, usuarios sensibles a movimiento ven las 4 secciones aparecer con animación sin poder desactivarla. | Acceptance criteria incluye explícitamente probar con `prefers-reduced-motion: reduce` activado antes de dar la spec por verificada. |

## Lo que **no** entra en esta spec

- Comodidad de video lessons/progreso (video.js, enrollment).
- Dato dinámico real de la plataforma (ej. total de cursos vía `CourseState`).
- Subcomponentes standalone para hero/spotlight/grid/CTA.
- Componente de botón compartido (`.btn-primary`/`.btn-secondary` extraído).
- Cambios a `variables.scss` global, `app.routes.ts`, header/footer, u otras páginas.
- Tests automatizados nuevos.

Cada uno de estos, si aterriza, va en su propia spec.
