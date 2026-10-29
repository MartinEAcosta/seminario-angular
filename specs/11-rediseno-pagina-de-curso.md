# SPEC 11 — Rediseño completo de `/course/:id` (página de detalle del curso)

> **Status:** Aprobado
> **Depends on:** 01 (breakpoints y escala fluida)
> **Date:** 2026-10-28
> **Implementación:** usar el skill `/impeccable` para la parte visual (componentes nuevos y restyle de los existentes).
> **Objective:** Reescribir por completo `CoursePage` (`/course/:id`) para que coincida con el mock "Curso · A · hero + panel de compra fijo" del artifact de diseño (`https://claude.ai/code/artifact/3bebb4c4-bd24-44f6-bac4-e25e69e2663d`), reemplazando el hero simple actual por un layout de hero + panel de compra sticky, un Temario enriquecido con ícono/duración/candado por lección, una card de profesor, chequeo de inscripción para el CTA, y una versión responsive mobile con el panel de compra fijo abajo.

## Por qué existe esta spec

El mock de referencia (artboard "Curso · A · hero + panel de compra fijo", con su contraparte "Curso · mobile (panel...)") muestra una página de detalle de curso mucho más completa que la actual: hero con breadcrumb/autor/badges, panel de compra sticky con precio, cupos y "Agregar al carrito", sección "Qué vas a aprender", Temario tipo acordeón con ícono por tipo de lección + duración + candado, "Sobre este curso", "Requisitos" y una card "Tu profesor". La implementación actual (`CourseDetailComponent`) es apenas un hero con título, descripción y dos botones ("Comenzar curso" / "Ver temario") que no navegan a nada real — el Temario real ya vive aparte, en `ListOfContentComponent` + `ModulesAccordionComponent`, con un acordeón sin estilos del mock.

El mock pide varios datos que el modelo `Course` actual no tiene (nombre/avatar/bio del profesor, cupos restantes, duración y tipo de contenido por lección, nivel del curso, listas de "qué vas a aprender" y "requisitos"). Igual que en la SPEC 10, esta spec resuelve esa brecha tomando decisiones explícitas por cada dato faltante en vez de improvisar — ver sección de Decisiones. Varias de esas decisiones implican un cambio de contrato con el backend (`udemix-backend`, repo separado).

## Scope

**In:**

- **Modelo de datos** (`Course`, `CourseUniqueResponse`, `CourseMapper`): se agregan `owner_name`, `owner_avatar_url`, `owner_bio` y `spots_remaining`, todos opcionales con fallback seguro cuando el backend todavía no los manda (ver Data model).
- **Modelo de datos de lecciones** (`ModulePopulated`, `ModulePopulatedListResponse`, `ModuleMapper`): cada entrada de `lessons` suma `content_type` y `duration_minutes`, opcionales con fallback `null`.
- Nuevo componente `course/components/course-instructor/` (`app-course-instructor`): avatar + nombre del profesor, con variante `inline` (usada en el hero) y `card` (usada en la sección "Tu profesor", agrega bio). Si no hay `owner_avatar_url`, el avatar cae a iniciales del nombre (mismo patrón visual "MA" del mock).
- Nuevo componente `course/components/course-purchase-panel/` (`app-course-purchase-panel`): precio (o "Gratis" si `price === 0`, mismo criterio que `course-catalog-card`), cupos (`spots_remaining`/`capacity`, ver Decisiones), botón "Agregar al carrito" (mismo patrón `CartService.onAddToCart` + `isInCart`/`justAdded` que `course-catalog-card`) que se reemplaza por "Continuar" cuando el usuario ya está inscripto, y los tres bullets informativos del mock (la cantidad de lecciones es dinámica, los otros dos son copy estático). Sticky en desktop, fijo abajo de la pantalla en mobile.
- Nuevo componente `course/components/course-hero/` (`app-course-hero`): breadcrumb ("Explorar · {category_name}"), título, descripción (subtítulo), `app-course-instructor` variante `inline`, badges de módulos/lecciones/duración total (calculados a partir de los módulos ya cargados), imagen del curso.
- `lesson/components/modules-accordion`: restyleado al look del mock — ícono según `content_type` (video / documento / genérico cuando es `null`), duración formateada (`Xh Ymin` / `Xmin`), candado cuando `!isClickable()`.
- `lesson/components/list-of-content`: restyleado — header "Temario" con los mismos badges de conteo que el hero (módulos · lecciones · duración total).
- `course/pages/course-detail/course-page.ts|html|scss`: reescritos por completo. Layout de dos columnas en desktop (`app-course-hero` + `app-list-of-content` + "Sobre este curso" + card de profesor a la izquierda, `app-course-purchase-panel` sticky a la derecha); una columna con el panel de compra fijo abajo en mobile (breakpoint `lg`, 1024px, igual que `$breakpoints` de `variables.scss`). Agrega chequeo de inscripción (`EnrollmentState.enrollmentList()`, mismo patrón `enrollmentIdFor` que `explore-page.ts`) para decidir el CTA del panel de compra.
- "Sobre este curso" reutiliza `course().description` — el mismo texto que el subtítulo del hero, sin agregar un segundo campo de descripción larga.
- `CourseDetailComponent` actual (hero simple con botones "Comenzar curso"/"Ver temario") se elimina; su lugar lo ocupan `course-hero` + `course-purchase-panel`.

**Out of scope (para otra spec):**

- Nivel del curso ("Nivel inicial" del mock) — no se agrega ningún campo de nivel al modelo ni se muestra ese badge.
- "Qué vas a aprender" y "Requisitos" — requieren campos de lista nueva (`learningOutcomes`, `requirements`) que no se evalúan en esta spec.
- Un endpoint o servicio separado para datos de usuario/profesor (`GET /users/:id`) — los datos del profesor viajan desnormalizados en el mismo `GET /courses/:id` (ver Decisiones).
- Cualquier cambio al header o footer globales — son el chrome de la app, el mock los muestra tal cual.
- Edición de `content_type`/`duration_minutes` desde el flujo de carga de lecciones (`form-lesson`, `create-course`, `update-course`) — esta spec sólo cubre la lectura/visualización en `/course/:id`; cómo se cargan esos datos en el backend queda fuera.

## Data model

`src/app/course/models/course.interfaces.ts` — `Course` suma:

```ts
export interface Course {
    // ...campos existentes sin cambios...
    owner_name        : string | null;
    owner_avatar_url  : string | null;
    owner_bio         : string | null;
    spots_remaining   : number | null;
}
```

`src/app/shared/models/api.interfaces.ts` — `CourseUniqueResponse` suma los mismos campos, todos opcionales (`?`) para no romper si el backend todavía no los manda. `CourseMapper.mapResponseToCourse` los traduce con fallback `null` cuando faltan.

`src/app/module/models/module.interfaces.ts` — `ModulePopulated['lessons']` pasa de `{ title: string; id: string }` a:

```ts
lessons: {
    id              : string;
    title           : string;
    content_type    : 'video' | 'document' | null;
    duration_minutes: number | null;
}[];
```

`ModuleMapper.mapResponseToModulePopulated` traduce `content_type`/`duration_minutes` con fallback `null`. `content_type` puede resolverse en el backend a partir del mismo `file.resource_type`/`extension` que ya expone `LessonPopulated` — no es un dato nuevo en el sentido estricto, sólo falta que el endpoint de módulos lo incluya. `duration_minutes` sí es un dato genuinamente nuevo (no existe en ningún lado hoy).

## Implementation plan

1. Extender `Course`, `CourseUniqueResponse` y `CourseMapper.mapResponseToCourse` con `owner_name`/`owner_avatar_url`/`owner_bio`/`spots_remaining` (fallback `null`). Verificación: el proyecto compila, `course-page` actual (todavía sin tocar) sigue funcionando igual.
2. Extender `ModulePopulated['lessons']`, `ModuleMapper.mapResponseToModulePopulated` con `content_type`/`duration_minutes` (fallback `null`). Verificación: compila, el Temario actual sigue renderizando sin cambios visuales todavía.
3. Crear `course-instructor` standalone: variante `inline` (avatar chico + nombre) y `card` (avatar + nombre + bio), iniciales como fallback de avatar. Verificación manual: renderiza aislado con datos mock, con y sin `avatarUrl`.
4. Crear `course-purchase-panel` standalone: precio/"Gratis", cupos (`spots_remaining`/`capacity`), botón "Agregar al carrito" (reusando el patrón de `course-catalog-card`) vs "Continuar" según `isEnrolled`/`enrollmentId` recibidos como input, bullets. Verificación manual: con un curso mockeado, clickear "Agregar al carrito" cambia el botón a estado "En el carrito", igual que en `/explore`.
5. Crear `course-hero`: breadcrumb, título, descripción, `course-instructor` inline, badges de módulos/lecciones/duración calculados desde los módulos recibidos. Verificación manual: renderiza aislado con un curso + módulos mock.
6. Restylear `modules-accordion` (ícono por `content_type`, duración formateada, candado cuando `!isClickable()`) y `list-of-content` (header "Temario" + badges de conteo). Verificación manual: expandir/contraer módulos sigue funcionando, lecciones bloqueadas muestran candado y no navegan.
7. Reescribir `course-page.ts|html|scss`: layout de dos columnas en desktop (`course-hero` + `list-of-content` + "Sobre este curso" (`course().description`) + `course-instructor` card a la izquierda, `course-purchase-panel` sticky a la derecha), una columna con panel de compra fijo abajo en mobile (`bp-down('lg')`). Inyecta `EnrollmentState`, agrega `enrollmentIdFor(courseId)` igual que `explore-page.ts`. Elimina `CourseDetailComponent` del árbol de imports de `course-page` (o borra el componente si queda sin otros usos). Verificación: con el backend corriendo, la página renderiza con datos reales (aunque los campos nuevos vengan `null`).
8. Verificación manual en navegador, en desktop y mobile, con el backend corriendo (`localhost:4201`):
   - Desktop (≥1024px): layout de dos columnas, el panel de compra queda sticky mientras se scrollea el contenido de la izquierda.
   - Mobile (<1024px): layout de una columna, panel de compra fijo abajo de la pantalla.
   - Curso con `price === 0`: el panel muestra "Gratis".
   - Usuario ya inscripto en el curso: el panel muestra "Continuar" (linkea a `/enrollment/:id`) en vez de precio + "Agregar al carrito".
   - Usuario no inscripto: "Agregar al carrito" agrega el curso al carrito con el mismo feedback visual que `course-catalog-card`.
   - Campos nuevos en `null` (backend viejo): la card de profesor no se muestra, los cupos muestran sólo `capacity` total, el Temario se ve sin ícono/duración por lección (sólo título + candado) — el layout no se rompe.

## Acceptance criteria

- [x] `Course`/`CourseUniqueResponse`/`CourseMapper` incluyen `owner_name`, `owner_avatar_url`, `owner_bio`, `spots_remaining`, todos con fallback `null`.
- [x] `ModulePopulated['lessons']`/`ModuleMapper` incluyen `content_type` y `duration_minutes`, con fallback `null`.
- [x] `/course/:id` en desktop (≥1024px) muestra el layout de dos columnas: hero + Temario + "Sobre este curso" + card de profesor a la izquierda, panel de compra sticky a la derecha.
- [x] `/course/:id` en mobile (<1024px) muestra una sola columna con el panel de compra fijo abajo de la pantalla.
- [x] El hero muestra breadcrumb, título, descripción, autor (avatar + nombre, iniciales si no hay `owner_avatar_url`) y badges de módulos/lecciones/duración total.
- [x] El panel de compra muestra "Gratis" cuando `price === 0`, o el precio formateado en caso contrario.
- [ ] El panel de compra muestra "Continuar" (→ `/enrollment/:id`) cuando el usuario ya está inscripto, o precio + "Agregar al carrito" si no. — implementado, pero **sin verificar en navegador**: necesita backend + sesión con una inscripción real (ver deuda técnica).
- [x] "Agregar al carrito" agrega el curso al carrito y el botón refleja el estado "En el carrito", igual que en `course-catalog-card`.
- [x] El Temario muestra ícono por `content_type` (o genérico si es `null`), duración formateada por lección (u oculta si `duration_minutes` es `null`), y candado en lecciones bloqueadas.
- [x] "Sobre este curso" muestra `course().description` (mismo texto que el subtítulo del hero).
- [x] Si `owner_name` es `null`, la card "Tu profesor" no se renderiza (sin romper el layout).
- [x] Ningún badge de "nivel" ni sección "Qué vas a aprender"/"Requisitos" aparece en la página.
- [x] `CourseDetailComponent` (hero simple con "Comenzar curso"/"Ver temario") ya no se usa en `course-page`.

## Decisiones tomadas y descartadas

- **Sí:** desnormalizar los datos del profesor (`owner_name`/`owner_avatar_url`/`owner_bio`) en el mismo `GET /courses/:id` en vez de un endpoint separado (`GET /users/:id`) — decisión explícita del usuario; el backend resuelve el join, el frontend hace una sola request, igual patrón que `category_name` ya desnormalizado junto a `id_category`.
- **Sí:** agregar `spots_remaining` como campo nuevo (no derivarlo del lado del cliente) — decisión explícita del usuario, necesario para el copy "Quedan X lugares de Y" del mock. `capacity` (total) se sigue mostrando además, sin reemplazarlo.
- **No:** mantener el copy neutro de `course-featured` ("60 cupos", sin insinuar escasez) para esta página — se descarta a favor de `spots_remaining` porque el mock pide explícitamente el copy de urgencia; `course-featured` no se toca ni se desalinea, son dos piezas distintas con criterios distintos documentados cada una en su archivo.
- **Sí:** agregar `content_type` + `duration_minutes` por lección — decisión explícita del usuario para calzar con los íconos/duración del Temario del mock. `content_type` se resuelve en el backend a partir de información que `LessonPopulated.file` ya expone (`resource_type`/`extension`); `duration_minutes` es el único dato realmente nuevo.
- **No:** nivel del curso ("Nivel inicial") — decisión explícita del usuario, no se agrega campo de nivel.
- **No:** "Qué vas a aprender" y "Requisitos" — decisión explícita del usuario, quedan fuera de esta spec.
- **Sí:** "Sobre este curso" reutiliza `course().description` en vez de agregar un segundo campo de descripción larga — evita otro cambio de contrato no pedido explícitamente; el subtítulo del hero y "Sobre este curso" muestran el mismo texto.
- **Sí:** chequeo de inscripción en `course-page` vía `EnrollmentState.enrollmentList()`, mismo patrón `enrollmentIdFor` que `explore-page.ts` — decisión explícita del usuario.
- **Sí:** layout mobile con panel de compra fijo abajo entra en esta spec, usando los breakpoints de SPEC 01 — decisión explícita del usuario.

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| El backend (`seminario-angular-backend`) no tiene todavía los campos nuevos (`owner_name`/`owner_avatar_url`/`owner_bio`, `spots_remaining`, `content_type`/`duration_minutes`). | Todos opcionales con fallback `null` documentado: sin profesor se oculta la card, sin `spots_remaining` se muestra sólo `capacity` total, sin `content_type`/`duration_minutes` el Temario se ve sin ícono/duración por lección. El layout no se rompe en ningún caso. |
| `content_type` derivado de `file.resource_type`/`extension` puede no alcanzar para distinguir todos los casos del mock (video / doc / pdf). | Se documenta como decisión de backend cómo resolver `content_type`; el frontend sólo consume el valor ya resuelto (`'video' | 'document' | null`), sin lógica de inferencia propia. |

## Qué **no** está en esta spec

- Nivel del curso ("Nivel inicial").
- Secciones "Qué vas a aprender" y "Requisitos".
- Un segundo campo de descripción larga separado del subtítulo del hero.
- Endpoint o servicio separado (`GET /users/:id`) para datos de profesor.
- Cambios al header o footer globales.
- Carga/edición de `content_type`/`duration_minutes` desde los formularios de curso o lección.

Cada uno de estos, si se necesita, va en su propia spec.
