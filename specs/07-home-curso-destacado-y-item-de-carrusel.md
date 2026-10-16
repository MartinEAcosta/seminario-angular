# SPEC 07 — Home: sección de curso destacado + item de carrusel propio

> **Status:** Implementado
> **Depends on:** 01 (breakpoints y escala fluida)
> **Date:** 2026-10-16
> **Objective:** Abrir la banda clara del home con un curso destacado tratado como tarjeta-ticket, y desacoplar la estantería de `/explore` creando un componente de item de carrusel propio en vez de encoger la mini-card compartida con custom properties.

## Por qué existe esta spec

Dos problemas distintos en la misma banda del home.

**Jerarquía.** La banda clara abría con el título "El catálogo" y pasaba directo a una estantería de tarjetas iguales. Nada en la puerta de entrada del producto señalaba un curso concreto. La crítica de diseño guardada en `.impeccable/critique/2026-10-16T15-02-46Z__src-app-shared-pages-home-home-page-html.md` lo registra como pregunta abierta: la tarjeta-ticket es "el componente de firma del sistema" (DESIGN.md:299), existe sólo en `/about`, y un curso en un marketplace es por definición el "acceso adquirido" que ese patrón está reservado a representar.

**Acoplamiento.** `course-carousel.component.scss` encogía `CourseMiniCardComponent` — la tarjeta de `/explore` — inyectándole `--mini-card-width: 16rem`, `--mini-card-height: 20rem` y `--mini-card-title-font-size: 1.15rem`. El carrusel no podía cambiar sin arrastrar a `/explore`, ni al revés.

## Scope

**In:**

- Nuevo `CourseFeaturedComponent` (`src/app/course/components/course-featured/`), selector `app-course-featured`. Inputs `course: Course` (requerido) y `categoryName: string | null`. Presentacional: inyecta sólo `CartService`.
  - Tarjeta-ticket **rotada 90°**: el talón es el thumbnail del curso (columna izquierda) y el festón de semicírculos corta en vertical; abajo de `md` vuelve a columna única con el festón horizontal, que es la orientación original de `/about`.
  - Se descarta la banda de perforación teal de `5.5rem`: en esta pieza el área de color es la imagen del curso, y dos áreas de color compitiendo contradice "Don't repartir el teal" (DESIGN.md:331).
  - Contenido: sello circular teal de 56px, eyebrow "Curso destacado", pills de categoría y cupos, `h3` con el título, descripción recortada a 3 líneas, precio, y dos acciones — `Ver el curso` (link a `/course/:id`) y `Al carrito` (con el acuse `Agregado` de 2200ms y región `aria-live`).
- Nuevo `CourseCarouselItemComponent` (`src/app/course/components/course-carousel-item/`), selector `app-course-carousel-item`. Copia funcional de `CourseMiniCardComponent` con hoja de estilos propia y las medidas resueltas adentro (`16rem` × `20rem`, título `1.15rem`), sin el partial `shared/styles/mini-card-component.scss`.
- `course-carousel.component.ts|html`: pasa a renderizar `app-course-carousel-item`.
- `course-carousel.component.scss`: se borran los tres custom properties de `.track-item`; se agrega `.shelf-empty`.
- `course-carousel.component.html`: rama `@else` con estado vacío, necesaria porque el destacado se lleva el primer curso y un catálogo chico puede dejar la estantería sin nada que mostrar.
- `home-page.ts`: nuevos `featuredCourse` y `featuredCategoryName`; `carouselCourses` pasa de `slice(0, 10)` a `slice(1, 11)`.
- `home-page.html`: el bloque `app-course-featured` entre `.catalog-head` y el carrusel.

**Out of scope:**

- Rediseñar el item de carrusel. Se extrae **tal cual**: el objetivo de este paso es el desacople, no el cambio visual. El rediseño es una pasada aparte, ahora posible sin tocar `/explore`.
- Tocar `CourseMiniCardComponent`, `explore-page.html`, o el partial `shared/styles/mini-card-component.scss` — este último tiene un segundo consumidor, `enrollment-mini-card.component.ts`.
- Agregar un flag `is_featured` al modelo `Course` o un endpoint `/courses/featured` en el backend.
- Arreglar `defaultCourses.ts`, que guarda el nombre de la categoría en el campo `id_category`.
- Extraer el vocabulario de ticket a un partial compartido con `/about`.
- Resolver los `nested-cards` que la crítica marca: el item de carrusel sigue siendo oscuro dentro de la sala clara.
- Los 7 avisos de presupuesto de hoja de estilos preexistentes, y el hecho de que `ng test` no compile.

## Data model

Sin cambios. El destacado se deriva en cliente de los datos que ya hay:

```ts
featuredCourse = computed(() => {
  if (this.coursesResource.isLoading()) return null;
  return this.coursesToShow().items[0] ?? null;
});

carouselCourses = computed(() => this.coursesToShow().items.slice(1, 11));

featuredCategoryName = computed<string | null>(() => {
  const key = this.featuredCourse()?.id_category;
  if (!key) return null;

  const categories = this.categoriesToShow();
  return categories.find((category) => category.id === key)?.name
      ?? categories.find((category) => category.name === key)?.name
      ?? null;
});
```

`capacity` es la capacidad **total** del curso, no los lugares restantes: la etiqueta dice "N cupos" y no insinúa escasez.

## Implementation plan

1. `CourseCarouselItemComponent` — los tres archivos. Las medidas que antes llegaban por custom property quedan resueltas en la hoja propia; de paso `rgb(40,40,40)` pasa a `$black-custom` y el borde sube a `$veil-border` (0.14), la banda que pide DESIGN.md:250.
2. Rewire del carrusel: swap de import y selector, borrado de los tres custom properties, rama `@else` con `.shelf-empty`.
3. `CourseFeaturedComponent` — `.ts` y `.html` primero, para validar el flujo de datos antes de maquetar.
4. SCSS del destacado: grid y superficie, sello, festón vertical, tipografía y acciones, rama `bp-down('md')`, guardas de `pointer: coarse` y `prefers-reduced-motion`.
5. Wiring del home: los tres `computed`, el import y el bloque de template.
6. Verificación.

## Decisions

- **Sí:** sala clara. El destacado abre la banda `.catalog` y el carrusel queda debajo en la misma sala, sin introducir una tercera superficie.
- **Sí:** adoptar la tarjeta-ticket, rotada. Razón: es exactamente el caso que DESIGN.md:301 le reserva ("una pieza que representa un acceso adquirido"), y era la firma del sistema sin usar en la puerta de entrada. La rotación responde al formato: un destacado es ancho y el ticket de `/about` es vertical.
- **Sí:** el destacado es `items[0]`. Razón (elegida por el usuario): no hay flag en el backend, y cualquier otro criterio — "más vendido", "mejor valorado" — sería una promesa que el dato no sostiene. El copy dice "Curso destacado" y nada más.
- **Sí:** sacar el destacado de la estantería (`slice(1, 11)`). Razón: la crítica P1 del home es que la página dice lo mismo dos veces; mostrar el mismo curso en las dos piezas hace que las dos parezcan relleno.
- **Sí:** la resolución del nombre de categoría vive en `HomeComponent`. Razón: el home ya es dueño de `categoriesResource`; inyectar `CategoryService` en una tarjeta presentacional abriría una segunda fuente de verdad para el mismo dato.
- **Sí:** el precio va en tinta plena con peso 800, no en verde. Razón: DESIGN.md:196 reserva el trío semántico para estado, y el detector midió los verdes de precio en 3.80:1 y 4.23:1. Un precio no es un estado.
- **No:** la tarjeta no se levanta en hover. Razón: el levante señala "esto navega", y acá la tarjeta no es un link — tiene dos controles explícitos. Sólo los botones se mueven, `-3px`.
- **No:** `max-width: 1100px` en la sección. Razón: la banda `.catalog` ya define el ancho de contenido con su padding de 5%; con el max-width propio el ticket quedaba 57px adentro del título de sección y se leía como error de maquetado.
- **No:** extraer el item de carrusel y rediseñarlo en la misma pasada. Razón (elegida por el usuario): el desacople se verifica comparando contra el estado anterior, y eso sólo funciona si no cambia nada visual al mismo tiempo.
- **No:** factorizar el feedback de "agregado al carrito" ahora que vive en tres componentes. Razón: son ocho líneas y el repo no tiene un patrón establecido para compartir comportamiento de componente; abstraer sobre tres copias idénticas sin un cuarto caso es prematuro. Registrado como deuda.

## Acceptance criteria

- [x] La banda clara del home abre con el curso destacado y el carrusel queda debajo, en la misma sala.
- [x] El ticket arranca en la misma vertical que el título "El catálogo" y que la estantería (los tres en `left: 67.5px` a 1440px).
- [x] El carrusel renderiza `app-course-carousel-item` y cero `app-course-mini-card`.
- [x] `/explore` sigue renderizando `app-course-mini-card` con sus medidas por defecto (352×416 px, título 22.4px) — sin ningún cambio visual.
- [x] El outline de headings del home es `H1 → H2 → H3…` sin saltos; el eyebrow es un `span`, no un heading.
- [x] El destacado aporta exactamente dos paradas de foco, las dos con anillo `2px solid rgb(0,92,108)` y `outline-offset: 3px`.
- [x] Abajo de `md` el ticket pasa a columna única, el festón gira a horizontal y los dos botones van a ancho completo.
- [x] `npm run build` compila sin errores y ninguna de las dos hojas nuevas cruza el presupuesto de 4kB.
- [x] No se modificó `CourseMiniCardComponent`, `explore-page.html` ni `shared/styles/mini-card-component.scss`.
- [ ] Verificación del camino sin backend (pill de categoría resuelta por nombre contra `defaultCourses`) — pendiente, ver companion de deuda.
