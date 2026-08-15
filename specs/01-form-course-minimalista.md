# 01 - Formulario de curso minimalista y colapsable

**Estado:** Aprobado
**Depende de:** —
**Fecha:** 2026-08-13

**Objetivo:** Rediseñar `form-course` a un layout minimalista full-width (sin contenedor tipo "card" acotado), responsive, y hacer que colapse tras guardar con éxito (creación o edición) para dar paso a `app-slider-content-manager` sin abandonar la página.

## Alcance

**Incluye:**

- Reestructurar `form-course.component.html` a un layout full-width: en desktop, grid de 2 columnas (thumbnail a la izquierda, bloque de campos a la derecha); en mobile colapsa a 1 columna apilada (sin `position: absolute`, sin altura fija `50vh`). *(Enmendado durante implementación: el diseño original de una sola columna vertical se reemplazó por este de 2 columnas en desktop tras feedback del usuario — ver Decisiones.)*
- Reescribir `form-course.component.scss`: fondo claro/neutro (hoy `v.$black-custom`), contenedor ocupa el 100% del ancho de la página (sin `max-width` tipo card, contenido centrado horizontalmente vía padding/gap), responsive (funcional en mobile), grid de 2 columnas para precio/capacidad que colapsa a 1 columna en mobile.
- Agregar `app-page-title` (`@shared/components/page-title`) como encabezado clickeable de `form-course`, con texto dinámico `'Crear curso'` / `'Editar curso'` (misma condición que ya usa el botón submit: `course()?.id`) y un ícono chevron (`down-icon.svg`, ya usado como affordance de expandir/colapsar en `category-select` y `filter-select`) que rota según el estado.
- Eliminar del template los dos `<input type="file">` sueltos al final (`Agregar contenido` y `Agregar portada`): el primero no tiene handler `(change)`, está muerto; el segundo duplica `id="file"` con el input que ya vive dentro de `app-thumbnail-selector` (que ya cubre portada haciendo click sobre la miniatura). Ambos se borran, no se mueven.
- Agrupar precio y capacidad en una fila de 2 columnas (desktop), apiladas en mobile.
- Barra de acciones única al final del form: `Crear/Editar curso`, `Cancelar`, y `app-btn-remove` (solo si `course()` existe) — se saca del costado del input `title`.
- Nuevo signal `isFormCollapsed` en `CourseFormState` (+ `setFormCollapsed` / `toggleFormCollapsed`) que controla si el bloque de campos del form está visible o colapsado bajo el header.
- `form-course.component.ts`: quitar la llamada a `courseFormState.reset()` de `onSubmit()` (hoy se ejecuta antes de que termine el guardado async — bug). `onSubmit()` pasa a solo validar y emitir `submitForm`; el colapso y cualquier reset lo maneja la página padre tras confirmar éxito.
- `create-course-page.ts`/`.html`: quitar el `router.navigate` tras crear con éxito. En su lugar, guardar el curso creado en un signal local (`createdCourse`) y pasarlo como `[course]` a `form-course` (reemplaza el `[course]="null"` estático), y llamar `courseFormState.setFormCollapsed(true)`.
- `update-course-page.ts`: quitar el `router.navigate` tras editar con éxito. Llamar `courseFormState.setFormCollapsed(true)`.
- En ambos casos, **no** se llama a `courseFormState.reset()` tras el éxito: al reexpandir el bloque colapsado, el formulario debe mostrar los datos recién guardados, no vacíos.

**No incluye (explícitamente fuera de alcance):**

- `app-slider-content-manager` (gestor de lessons/contenido) — no se toca su componente interno, solo recibe ahora un `course()` válido tras crear.
- El flujo de creación de módulos/lecciones (rama `create-module` en curso) — no se mezcla con este spec.
- Cambios al componente compartido `app-page-title` — se usa tal cual existe hoy (`title` input), sin agregarle lógica de colapso propia; el click y el chevron se implementan en un contenedor propio dentro de `form-course` para no afectar sus otros usos (`explore-page`, `buy-page`, `enrollments-page`, `home-page`).
- Revalidar o refetchear el curso tras editar en `update-course-page` (se sigue usando `resolvedCourse()` del resolver, sin recargar).
- Cambios a `CourseFormState.patchValuesForm`, validaciones de campos, o a los componentes `category-select` / `thumbnail-selector`.

## Modelo de datos

No se introducen entidades nuevas. Cambios sobre estructuras existentes:

**`CourseFormState`** (`src/app/course/state/course-form/course-form-state.ts`):
- `+ isFormCollapsed = signal<boolean>(false)`
- `+ setFormCollapsed(collapsed: boolean): void`
- `+ toggleFormCollapsed(): void`
- Sin cambios en `courseForm`, `limitedCapacity`, `thumbnailFile`, `tempThumbnail`, ni en `reset()`/`patchValuesForm()` (siguen usándose igual desde `ngOnInit`/`ngOnDestroy`).

**`CreateCoursePageComponent`** (`src/app/course/pages/create-course/create-course-page.ts`):
- `+ createdCourse = signal<Course | null>(null)`

## Plan de implementación

1. `course-form-state.ts`: agregar `isFormCollapsed` + `setFormCollapsed` + `toggleFormCollapsed`.
2. `form-course.component.scss`: reescribir layout a una columna, flujo vertical, sin `position: absolute` ni `50vh` fijo, fondo claro, grid 2 columnas precio/capacidad con breakpoint mobile a 1 columna, estilos del nuevo header colapsable (chevron rotable).
3. `form-course.component.html`: reordenar a una columna — header colapsable (`app-page-title` + chevron) arriba, seguido del bloque de campos envuelto en `@if(!courseFormState.isFormCollapsed())`, thumbnail-selector integrado arriba (sin el input de portada duplicado), precio/capacidad en fila, barra de acciones al final (crear/editar + cancelar + eliminar). Eliminar los dos inputs de archivo sueltos.
4. `form-course.component.ts`: importar `PageTitleComponent`; quitar `this.courseFormState.reset()` de `onSubmit()`.
5. `create-course-page.ts`: agregar `createdCourse` signal, quitar `router.navigate`, en éxito hacer `this.createdCourse.set(course)` y `this.courseFormState.setFormCollapsed(true)`.
6. `create-course-page.html`: bindear `[course]="createdCourse()"` en vez de `[course]="null"`.
7. `update-course-page.ts`: quitar `router.navigate` del éxito, agregar `this.courseFormState.setFormCollapsed(true)`.
8. Verificación manual: `ng serve`, probar flujo completo de crear y editar curso (ver Criterios de aceptación).

Cada paso deja la app compilando y funcional.

## Criterios de aceptación

- [ ] `form-course` ocupa el ancho completo de la página (sin card acotado), se ve en 2 columnas (thumbnail + campos) en desktop sin elementos superpuestos, y colapsa a 1 columna apilada en una ventana angosta (~375px).
- [ ] No quedan `position: absolute` ni alturas fijas en `form-course.component.scss`.
- [ ] El header (`app-page-title` + chevron) muestra `'Crear curso'` en modo creación y `'Editar curso'` en modo edición, y es clickeable para expandir/colapsar el bloque de campos en cualquier momento.
- [ ] Los inputs de archivo `Agregar contenido` y `Agregar portada` ya no existen en `form-course.component.html`; subir portada sigue funcionando haciendo click sobre la miniatura (`app-thumbnail-selector`).
- [ ] Precio y capacidad se muestran lado a lado en desktop y apilados en mobile.
- [ ] Los tres botones de acción (crear/editar, cancelar, eliminar si aplica) están agrupados en una sola barra al final del form.
- [ ] Al crear un curso con éxito: la página **no navega**, el bloque de campos se colapsa automáticamente, y `app-slider-content-manager` recibe el curso recién creado (no `null`).
- [ ] Al editar un curso con éxito: la página **no navega**, el bloque de campos se colapsa automáticamente.
- [ ] Al reexpandir el header después de crear o editar con éxito, el formulario muestra los datos recién guardados (no aparece vacío).
- [ ] Si falla el guardado (crear o editar), el formulario conserva lo que el usuario tenía escrito (no se limpia antes de tiempo).
- [ ] `ng build` compila sin errores.

## Decisiones tomadas y descartadas

- **Enmienda post-aprobación (durante implementación): full-width + 2 columnas en desktop en vez de 1 columna vertical estricta**: el diseño original de esta spec pedía una sola columna vertical de punta a punta. El usuario pidió, ya empezada la implementación, que el contenedor no fuera un "card" acotado sino ancho completo de la página, y que no todo viajara en sentido vertical. Se optó por grid de 2 columnas en desktop (thumbnail izquierda, campos derecha) que colapsa a 1 columna en mobile — mantiene el espíritu minimalista/responsive de la spec original pero usa el ancho disponible en vez de forzar todo a una tira vertical angosta. El chevron colapsable sigue controlando el bloque completo (thumbnail + campos), no solo los campos.
- **Colapso vive en `CourseFormState`, no en `form-course.component.ts` local**: se comparte entre `create-course-page` y `update-course-page` sin duplicar lógica, siguiendo el patrón ya usado para `limitedCapacity`/`thumbnailFile`.
- **No se modifica el componente compartido `app-page-title`**: se envuelve en un contenedor propio con el chevron dentro de `form-course` para no introducir una API de colapso en un componente usado por 4 páginas ajenas a este flujo.
- **Se elimina, no se mueve, el input de "Agregar portada"**: ya era funcionalmente redundante (duplicaba `id="file"` con el input dentro de `app-thumbnail-selector`, que ya sube la portada al clickear la miniatura).
- **Se elimina el input de "Agregar contenido"**: no tenía handler `(change)`, estaba muerto en el código actual.
- **Se quita `courseFormState.reset()` de `onSubmit()`**: se ejecutaba antes de confirmar el guardado async, lo cual vaciaba el form incluso si el guardado fallaba. Ahora el padre decide qué hacer tras el resultado real.
- **Tras éxito (crear o editar) no se llama a `reset()`**: si se reexpande el bloque colapsado, el usuario debe ver los datos que acaba de guardar, no un formulario vacío. `reset()` se sigue disparando solo en `ngOnDestroy` (al abandonar la página).
- **Se quita el `router.navigate` post-guardado en ambas páginas**: es lo que hace posible que el colapso y `app-slider-content-manager` sean visibles; sin esto la feature no tiene efecto observable.
- **`update-course-page` no refetchea el curso tras guardar**: sigue usando `resolvedCourse()` del resolver; fuera de alcance revalidar contra el backend.
- **Ícono de colapso: `down-icon.svg` rotado por CSS**: ya es el patrón usado en `category-select` y `filter-select` para affordance de expandir/colapsar, mantiene consistencia visual sin agregar un asset nuevo.

## Riesgos identificados

- Al quitar el `router.navigate` en `create-course-page`, cualquier lógica externa que dependiera de la redirección automática tras crear un curso (por ejemplo, analítica, tests e2e, o el propio flujo de `create-module` en curso en otra rama) puede romperse y necesitar ajuste aparte.
- `app-btn-remove` deja de estar pegado al título y pasa a la barra de acciones final — si depende de estilos posicionales específicos del contexto anterior, revisar que siga viéndose bien ahí.
- El fondo pasa de oscuro a claro; `category-select` y `thumbnail-selector` (no tocados en este spec) asumen texto blanco sobre fondo oscuro en algunos elementos — verificar contraste visual una vez integrado.
