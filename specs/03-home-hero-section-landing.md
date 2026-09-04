# SPEC 03 — Hero Section tipo landing page en home-page

> **Status:** Aprobado
> **Depends on:** ninguna
> **Date:** 2026-09-03
> **Objective:** Reemplazar el bloque de hero comentado en `home-page.html` por un Hero Section funcional tipo landing page, con copy que invite a probar la plataforma.
>
> **Actualización post-aprobación (2026-09-03, primera revisión):** tras la implementación y el primer QA, el usuario pidió cambiar el copy del hero y reemplazar la animación de fondo (gradiente animado) por blobs orgánicos. Esta spec quedó editada para reflejar ese resultado; ver `## Decisions` para el detalle.
>
> **Actualización post-aprobación (2026-09-03, segunda revisión):** el usuario mostró una imagen de referencia (sección "Numbers That Just Make Sense": badge pill + título + subtítulo + 3 cards oscuras con número en gradiente plateado, label, descripción e ícono circular) y pidió que **el hero mismo** adopte ese diseño. Se mantienen el typewriter y los CTAs; se sacan los blobs y el párrafo fijo descriptivo; se agrega una grilla de 3 stat cards (cursos/estudiantes/profesores). Ver `## Decisions` para el detalle completo de qué cambió respecto a la versión anterior.

## Scope

**In:**

- `src/app/shared/pages/home/home-page.html`: bloque `.container` (hero) reestructurado en este orden dentro de `<section>`: `<span class="badge">`, `<h1>` fijo (estilo gradiente/bevel), `<p class="typewriter-text">` con subtítulo dinámico (typewriter) + cursor, `<div class="stats-grid">` con 3 `<div class="stat-card">` (cursos/estudiantes/profesores), y `.container-actions` con dos botones (`routerLink` a `/explore` y `/about`) debajo del grid.
- `src/app/shared/pages/home/home-page.scss`: `.container` pasa a layout centrado (`flex-direction: column; align-items: center; text-align: center;`), `height: auto` (ya no `60vh` fijo); fondo con grid pattern sutil (pseudo-elemento `::before` con `linear-gradient` de líneas finas) en vez de blobs; se agregan `.badge`, `.stats-grid`, `.stat-card`, `.stat-value`, `.stat-label`, `.stat-description`, `.stat-icon`, y un estilo gradiente/bevel compartido para `h1` y `.stat-value`; se mantienen `.typewriter-text` y `.cursor` (re-estilados, centrados); se mantienen `.btn-primary`/`.btn-secondary`; se agrega `@media (max-width: 768px)` para el hero (incluye `.stats-grid` a 1 columna).
- `src/app/shared/pages/home/home-page.ts`: sin cambios de lógica — el array de frases, el signal `typewriterText` y el ciclo typewriter (con limpieza en `ngOnDestroy`) ya existen; el template consume directamente `coursesToShow().total` (ya calculado) para la card de cursos.
- `public/assets/`: 3 SVG nuevos a medida para los íconos de las stat cards (`stat-courses-icon.svg`, `stat-students-icon.svg`, `stat-teachers-icon.svg`), consumidos vía `<img>` siguiendo el patrón ya usado en el proyecto (no se agrega librería de íconos).
- Skill `frontend-design` aplica para las decisiones visuales del hero (tipografía, espaciado, jerarquía, grid pattern, cards).

**Out of scope (para futuras specs):**

- Crear un componente standalone reutilizable para el hero (queda inline en `home-page`, decisión explícita).
- Backend/endpoint real para las métricas de "estudiantes" y "profesores" — quedan como copy estático hasta que exista esa data.
- Cambios a `course-carousel`, `course-list`, `page-title` o cualquier contenido debajo del hero.
- Cambios a `variables.scss` global.
- Tests automatizados nuevos ni fix de `home-page.spec.ts` si estuviera roto.
- Ruta `/pricing` — no existe en `app.routes.ts`; el CTA secundario usa `/about` en su lugar.

## Data model

Esta spec no introduce estructuras de datos persistentes ni de backend. Estado local de UI en `home-page.ts` (sin cambios respecto a la revisión anterior):

- `heroPhrases: string[]` — constante con las 3 frases rotativas: `"a tu ritmo, sin excusas"`, `"con profesores reales"`, `"y una comunidad que suma"`.
- `typewriterText = signal<string>('')` — texto actualmente mostrado por el efecto typewriter.
- Lógica interna (no signal) para índice de frase actual y posición del cursor de escritura, manejada vía `setTimeout` recursivo encadenado.

Métricas de las stat cards (nuevo, sólo en el template, sin signals nuevos):

- **Cursos** (dinámico): `coursesToShow().total` — ya calculado por el `computed` existente, sin llamadas nuevas a la API.
- **Estudiantes** (estático): `+200`.
- **Profesores** (estático): `+20`.

## Implementation plan

1. En `home-page.ts`: sin cambios. El array `heroPhrases`, el signal `typewriterText`, el ciclo typewriter (constructor + `setTimeout` recursivo, ~70ms escritura / 2s pausa / ~35ms borrado) y `OnDestroy` (limpieza de `setTimeout`) ya están implementados y se reutilizan tal cual. `coursesToShow` (con su fallback a `emptyCoursesValue`) también se reutiliza sin cambios para la card de cursos.
2. En `home-page.html`, reescribir el bloque `<div class="container">`:
   - Quitar los 3 `<div class="blob blob-1/2/3">`.
   - Mantener `<div class="overlay">` sólo si aporta contraste extra sobre el grid pattern; evaluar en implementación si se simplifica/elimina.
   - Dentro de `<section>`, en este orden: `<span class="badge">Nuestro impacto en números</span>`, `<h1>Tu próximo curso empieza hoy</h1>`, `<p class="typewriter-text">{{ typewriterText() }}<span class="cursor"></span></p>`, `<div class="stats-grid">` con 3 `<div class="stat-card">` (cursos con `{{ coursesToShow().total }}`, estudiantes `+200`, profesores `+20`, cada una con `.stat-value`, `.stat-label`, `.stat-description` y un `<span class="stat-icon"><img src="/assets/stat-*-icon.svg"></span>`), y `.container-actions` con los dos botones (`/explore`, `/about`) al final.
3. En `home-page.scss`:
   - `.container`: cambia de layout dos-columnas (`justify-content: space-between`, `.container section` al 65%) a layout centrado en una columna (`flex-direction: column; align-items: center; text-align: center;`), `height: auto` con padding vertical generoso (reemplaza el `60vh` fijo).
   - Se elimina `.blob`, `.blob-1/2/3` y `@keyframes blobFloat`/`blobMorph`.
   - Se agrega `.container::before` con grid pattern sutil: dos `linear-gradient` (líneas horizontales y verticales, `rgba(255,255,255,0.04)`, grosor 1px) con `background-size: 40px 40px`, posicionado detrás del contenido (`z-index` menor que `section`).
   - Se agrega `.badge`: pill con borde sutil (`rgba(255,255,255,0.15)`), texto muted, sin ícono.
   - Se agrega un estilo gradiente/bevel compartido (mixin o clase reusada por `h1` y `.stat-value`): `background: linear-gradient(...)` blanco a gris, `background-clip: text; color: transparent;`, `filter: drop-shadow(...)` para el efecto metálico de la imagen.
   - `.typewriter-text` y `.cursor` se mantienen (misma lógica de `min-height`/`blink`), re-centrados y con color muted gris (no blanco puro).
   - Se agrega `.stats-grid` (`display: grid; grid-template-columns: repeat(3, 1fr); gap`), `.stat-card` (fondo `rgba(255,255,255,0.02)`, borde 1px sutil, `border-radius` ~24px, padding generoso, mismo grid pattern sutil de fondo), `.stat-label` (bold, blanco), `.stat-description` (texto muted, 1-2 líneas), `.stat-icon` (círculo, fondo `rgba(0,0,0,0.5)`, ícono blanco centrado, esquina inferior izquierda de la card).
   - `.btn-primary`/`.btn-secondary` se mantienen igual; `.container-actions` pasa a centrado (`justify-content: center; margin: auto;`) debajo del grid.
   - Se elimina el párrafo fijo descriptivo y su estilo dedicado (la info se reparte en `.stat-description` de cada card).
4. En `@media (max-width: 768px)`: `.stats-grid` pasa a `grid-template-columns: 1fr` (cards apiladas); se ajustan paddings/tamaños de fuente de `.stat-value` para no desbordar; badge/h1/subtítulo se mantienen centrados; `.container-actions` sigue en columna con botones al 100% de ancho (ya definido en la revisión anterior).
5. Crear 3 SVG nuevos en `public/assets/` (`stat-courses-icon.svg`, `stat-students-icon.svg`, `stat-teachers-icon.svg`) — íconos de línea fina blanca, estilo simple, consistentes con el resto de `/assets/*.svg` del proyecto.
6. QA visual manual en `/` (home): desktop (>768px) con hero centrado (badge, h1 gradiente, subtítulo typewriter, grid de 3 cards, CTAs), mobile (<768px) con cards apiladas; verificar que el grid pattern de fondo se ve sutil sin tapar legibilidad, el typewriter cicla las 3 frases sin saltos de layout, el cursor parpadea, la card de cursos muestra el total real de `coursesToShow()`, los botones navegan a `/explore` y `/about`, y no hay errores de consola ni timers colgados al salir de home.

## Acceptance criteria

- [ ] El hero muestra el diseño tipo KPI de la imagen de referencia: badge, `h1` con gradiente/bevel, subtítulo con typewriter, grid de 3 stat cards (número + label + descripción + ícono), y los dos CTAs debajo del grid.
- [ ] Ya no hay blobs animados ni `@keyframes blobFloat`/`blobMorph` en el CSS; el fondo del hero es negro liso con un grid pattern sutil, sin tapar la legibilidad del texto.
- [ ] El párrafo fijo descriptivo anterior ("Udemix es la plataforma…") ya no existe como bloque separado; su contenido está repartido en las `.stat-description` de las 3 cards.
- [ ] El subtítulo sigue ciclando en efecto typewriter (escribe y borra) entre las 3 frases definidas, en loop infinito, sin saltar el layout de la página — sin cambios en la lógica de `home-page.ts`.
- [ ] El typewriter limpia su `setTimeout` pendiente al destruirse `home-page` (sin timers corriendo en background ni errores de consola al navegar fuera de home).
- [ ] La stat card de "cursos" muestra `coursesToShow().total` (dato real, ya cargado por `coursesResource`); las cards de "estudiantes" y "profesores" muestran copy estático (`+200`, `+20`).
- [ ] El botón primario navega a `/explore` y el secundario a `/about`, ambos vía `routerLink`.
- [ ] En mobile (<768px), el hero se apila correctamente: `.stats-grid` a 1 columna, texto centrado a ancho completo, botones en columna al 100% de ancho, sin overflow horizontal.
- [ ] `coursesResource`, `coursesToShow`, `carouselCourses` y el resto de `home-page.ts` no cambian su comportamiento ni se agregan llamadas nuevas a la API — el hero sigue sin depender de datos de cursos más allá del total ya calculado.
- [ ] La ruta `/` renderiza sin errores en consola, tanto en desktop como en mobile.

## Decisions

- **Sí:** hero inline en `home-page` (no componente standalone) — decisión explícita del usuario, reutiliza el bloque ya comentado en el archivo.
- **Sí:** CTAs a `/explore` (primario) y `/about` (secundario) — rutas reales existentes; se descarta `/pricing` por no existir en `app.routes.ts`.
- **Sí:** animación principal = efecto typewriter en el subtítulo — decisión explícita del usuario, se mantiene en ambas revisiones posteriores.
- **Sí:** renombrar `.btn-about-us`/`.btn-become-a-teacher` a `.btn-primary`/`.btn-secondary` — los nombres viejos ya no describen la función real de los botones en este nuevo contexto.
- **No:** tocar `variables.scss` global — se reutilizan los tokens existentes (`$brand-color`, `$white-custom`, `$black-custom`, `$font-primary`, `$font-brand`).
- **No:** crear componente standalone para el hero — decisión explícita del usuario de mantenerlo inline.
- **Revisado (2026-09-03, primera revisión):** la decisión original era mantener el gradiente animado (`@keyframes gradientAnimation`) sin tocarlo. El usuario pidió después reemplazarlo por blobs orgánicos animados (`.blob-1/2/3` + `@keyframes blobFloat`/`blobMorph`). Se implementó el cambio; el gradiente y su `@keyframes` se eliminaron del código. El copy original (título "Aprende sin límites", frases y párrafo) se reemplazó por el copy documentado en esa revisión.
- **Revisado (2026-09-03, segunda revisión):** el usuario mostró una imagen de referencia tipo KPI ("Numbers That Just Make Sense": badge + título + subtítulo + 3 cards con número/label/descripción/ícono) y pidió que el hero adopte ese diseño. Cambios respecto a la primera revisión:
  - Se eliminan los blobs orgánicos (`.blob-1/2/3` + `@keyframes blobFloat`/`blobMorph`) y se reemplazan por un fondo negro liso con grid pattern sutil (dos `linear-gradient` de líneas finas), calcando el look de la imagen.
  - Se elimina el párrafo fijo descriptivo; su contenido se reparte en las descripciones de las 3 stat cards.
  - Se agrega una grilla de 3 stat cards (cursos, estudiantes, profesores) con número en estilo gradiente/bevel, label, descripción e ícono circular (3 SVG nuevos a medida en `public/assets/`).
  - **Se mantienen** el typewriter (subtítulo) y los dos CTAs (ahora ubicados debajo del grid de cards) — decisión explícita del usuario de no perder esas piezas.
  - La métrica de "cursos" es la única excepción a "hero 100% estático": usa `coursesToShow().total`, un dato que `home-page.ts` ya carga para el resto de la página (carousel, listado) — no se agrega ninguna llamada nueva a la API. "Estudiantes" y "profesores" quedan estáticos (`+200`, `+20`) por decisión explícita del usuario, ya que no existe backend para esas métricas.
  - Copy (badge/título/subtítulo/descripciones) traducido y adaptado al español/tono Udemix por decisión explícita del usuario — no se usa el texto literal de la imagen de referencia (en inglés, genérico de marketing).

## What is **not** in this spec

- Componente reusable de Hero Section (otra spec si se decide extraerlo).
- Backend/endpoint real para las métricas de "estudiantes" y "profesores" (quedan estáticas hasta que exista esa data).
- Tests automatizados nuevos ni fix de `home-page.spec.ts`.
- Cambios a `variables.scss` global.
- Cambios a `course-carousel`, `course-list`, `page-title` u otro contenido debajo del hero.

Cada uno de estos, si se decide encarar, va en su propia spec.
