# 02 - Rediseño visual de form-lesson y su panel en slider-content-manager

**Estado:** aprobado
**Depende de:** SPEC 01
**Fecha:** 2026-08-15

**Objetivo:** Rediseñar `form-lesson` (y el panel que lo envuelve dentro de `slider-content-manager`) al mismo lenguaje visual minimalista y claro de `form-course` (SPEC 01), eliminando el layout basado en `%`/`position:absolute` estructural y unificando la barra de acciones.

## Alcance

**Incluye:**

- Repintar `slider-content-manager.component.scss` completo (no solo el panel del form) a paleta clara: `.bg-slider-content`, `.container-options`, el degradé de `.container-add-lesson` (hoy funde a `v.$black-custom`), `.text-simple`, `.loading-lessons`, `.container-popup` (+ su flecha `::before`), e `.icon-expand`. El mecanismo de expand/collapse del slider completo (alturas fijas `14rem` / `36rem`, toggle por click en `.icon-expand`) **no se toca** — solo su paleta de color.
- Las "cards" self-contenidas (`.figure`/`.thumbnail-lesson` del carrusel de lecciones en `slider-content-manager`, y `app-card-action` para "Crear nuevo módulo"/"Añade una nueva lección") **mantienen su fondo oscuro propio** (`rgb(53,53,53)`) — ya son cajas con contraste resuelto internamente, sirven de acento visual sobre el nuevo fondo claro. No se recolorean.
- Convertir `.container-lesson` (y su variante `.expand`) en `slider-content-manager.component.scss` a un grid de 2 columnas en desktop (`.container-media-preview` a la izquierda / `.container-form-lesson` a la derecha, mismo espíritu que `.form-body-grid` de `form-course`), que colapsa a 1 columna apilada en un breakpoint `@media (max-width: 48rem)` (mismo breakpoint que usa `form-course`). Se elimina el `width: 42%` / `height: 45vh` fijo que hoy tiene `.container-media-preview` en el estado `.expand`.
- Reescribir `form-lesson.component.scss` desde cero: paleta clara (`v.$white-custom` fondo, `v.$black-custom` texto, `v.$brand-color` acentos), sin `%` de layout (`height: 20%/35%/25%`, `width: 60%/65%`) ni `position: absolute` estructural (`.container-lesson-bottom`, `.save`, `.module-selector` tal como existen hoy). El `position: absolute` del flyout de opciones del dropdown de módulo (equivalente a `.options` en `item-select.component.scss`) y el del overlay del `<input type="file">` en `slider-content-manager` **sí se mantienen** — son overlays intencionales, no el tipo de posicionamiento que rompe el layout.
- Reordenar `form-lesson.component.html`: columna de campos (título, descripción, selector de módulo) apilados verticalmente dentro de la mitad derecha del grid de `.container-lesson`, y una única barra de acciones al final del form con 3 elementos: "Anterior lección" (solo si `lesson_number != 0`, alineado a la izquierda), y "Guardar" + "Siguiente lección" agrupados a la derecha. `app-btn-remove` se reubica dentro de esa misma barra (visible solo si hay lección seleccionada), en vez de ir pegado al input de título.
- Selector de módulo: se rediseña con clases propias, forkeadas dentro de `form-lesson.component.scss` (nombres a definir en implementación, ej. `.module-select`, `.module-options`), replicando el comportamiento actual (dropdown que se despliega por `:hover`, ítem activo, opción "Quitar módulo") pero con la paleta clara del resto del form. **No se edita `item-select.component.scss`** (archivo compartido con `category-select`, usado en `form-course`, que sigue oscuro sin tocar según SPEC 01) — se quita esa entrada de `styleUrls` en `form-lesson.component.ts`.
- `form-lesson.component.ts`: quitar `console.log(idModule)` dentro del `linkedSignal` de `moduleSelected`, y quitar el bloque comentado (`formChanges` / `onFormChanged`, líneas ~50-62) que no está en uso.
- `lesson-form-state.ts`: quitar el `console.log(this.lessonSelected())` suelto dentro de `setLessonSelected`.
- `save-module.component.scss`: cambiar el `color` del `input` de `v.$white-custom` a `v.$black-custom`. Hoy ese texto es legible porque `background-color: inherit` termina revelando el fondo oscuro (`rgb(51,51,51)`) de `.container-popup` en `slider-content-manager`; al convertir ese popup a fondo claro (parte de este mismo spec), el texto blanco quedaría invisible. El `label` (chip con su propio `background-color: rgb(51,51,51)` hardcodeado) no se toca — sigue siendo legible por sí mismo.

**No incluye (explícitamente fuera de alcance):**

- `app-card-action` (`src/app/shared/components/card-action`) — no se modifica. Verificado: su `.figure` tiene fondo propio `rgb(53,53,53)`, el texto blanco sigue siendo legible sin cambios.
- `app-thumbnail-selector` (usado arriba, en `.container-thumbnail-selector`, para la portada del curso) — no se toca. Su `.figure` también tiene fondo oscuro propio (`rgb(53,53,53)`), sin riesgo de legibilidad; permanece como está (mismo riesgo de contraste ya documentado en SPEC 01, no resuelto ahí tampoco).
- `item-select.component.scss` y `category-select.component` — no se editan (ver Decisiones).
- `app-save-module`: solo se cambia el `color` del `input` mencionado arriba. No se rediseña el resto del popup (tamaño, `label`, `btn-submit`, animación de apertura `.container-popup.hidden`).
- `app-btn-navigation` / `btn-rounded.scss` — ya son agnósticos de tema (texto `v.$black-custom` sobre fondos de color propios `v.$yellow-caution`/`v.$green-success`), no requieren cambios.
- Lógica de guardado/eliminación/selección de lección (`onSaveLesson`, `onDeleteLesson`, `onSelectModule`) — sin cambios funcionales, solo el cleanup de `console.log`/comentario ya descrito.
- El mecanismo de expand/collapse de todo `slider-content-manager` (`isLessonFormVisible`, alturas `14rem`/`36rem`, ícono `.icon-expand`) — se mantiene igual, solo cambia su color.
- Cualquier cambio a `create-course-page`/`update-course-page` (SPEC 01) — este spec es independiente de esas páginas, solo toca componentes dentro de `slider-content-manager`.

## Modelo de datos

No se introducen entidades ni signals nuevos. Es un spec puramente visual + limpieza de código muerto (`console.log`, bloque comentado, entrada de `styleUrls` compartida). `LessonFormState`, `lessonForm`, y el resto de signals existentes (`lessons`, `lessonSelected`, `mediaFile`, `tempMedia`, `typeMedia`, `isLessonFormVisible`, `isModulePopUpVisible`) no cambian de forma ni de comportamiento.

## Plan de implementación

1. `lesson-form-state.ts`: quitar el `console.log(this.lessonSelected())` de `setLessonSelected`.
2. `form-lesson.component.ts`: quitar `console.log(idModule)`, quitar el bloque comentado `formChanges`/`onFormChanged`, quitar `'../../../category/components/category-select/item-select.component.scss'` de `styleUrls`.
3. `form-lesson.component.scss`: reescribir completo — paleta clara, sin `%`/`position:absolute` estructural, columna única de campos, barra de acciones final, y las clases propias forkeadas para el dropdown de módulo.
4. `form-lesson.component.html`: reordenar con las clases nuevas; unificar la barra de acciones (Anterior lección condicional — Guardar — Siguiente lección) y mover `app-btn-remove` a esa barra.
5. `slider-content-manager.component.scss`: repintar a paleta clara todo lo enumerado en Alcance (`.bg-slider-content`, `.container-options`, degradé de `.container-add-lesson`, `.text-simple`, `.loading-lessons`, `.container-popup` + flecha, `.icon-expand`), sin tocar `.figure`/`.thumbnail-lesson` ni el mecanismo de alturas `14rem`/`36rem`.
6. `slider-content-manager.component.scss`: convertir `.container-lesson`/`.container-lesson.expand` a grid de 2 columnas (media-preview / form) en desktop, con `@media (max-width: 48rem)` a 1 columna; quitar el `width: 42%`/`height: 45vh` fijo de `.container-media-preview` en `.expand`.
7. `save-module.component.scss`: cambiar `color` del `input` a `v.$black-custom`.
8. Verificación manual (`ng serve`): crear lección nueva, editar una existente, seleccionar y quitar módulo, guardar, navegar Anterior/Siguiente lección, eliminar lección, probar el panel expandido a ~375px de ancho, y `ng build`.

Cada paso deja la app compilando y funcional.

## Criterios de aceptación

- [ ] `form-lesson` y el panel que lo envuelve en `slider-content-manager` (incluido `.container-popup`, `.bg-slider-content`, `.container-options`) usan fondo claro (`v.$white-custom`) y texto oscuro (`v.$black-custom`), consistente con `form-course`.
- [ ] `.figure`/`.thumbnail-lesson` (carrusel de lecciones) y `app-card-action` conservan su caja oscura propia (`rgb(53,53,53)`) sin cambios.
- [ ] No quedan `%` de layout ni `position: absolute` estructural en `form-lesson.component.scss`, ni el `width: 42%`/`height: 45vh` fijo en `.container-media-preview` de `slider-content-manager.component.scss`. (El `position:absolute` del flyout del dropdown de módulo y del overlay del `<input type="file">` se mantienen intencionalmente.)
- [ ] En desktop, el panel expandido (`.container-lesson.expand`) muestra 2 columnas (media-preview / campos del form); en ventana angosta (~375px) colapsa a 1 columna apilada sin elementos superpuestos.
- [ ] El selector de módulo funciona igual que antes (desplegar, seleccionar, "Quitar módulo") con estilos propios definidos en `form-lesson.component.scss`; `item-select.component.scss` no cambió y `category-select` en `form-course` se ve exactamente igual que antes de este spec.
- [ ] Guardar, Anterior lección (si aplica) y Siguiente lección están agrupados en una sola barra al final del form, sin `position:absolute`.
- [ ] `app-btn-remove` está dentro de esa misma barra de acciones, visible solo si `lessonFormState.lessonSelected()` no es `null`.
- [ ] El texto del `input` en el popup de "Crear nuevo módulo" (`app-save-module`) es legible sobre el nuevo fondo claro de `.container-popup`.
- [ ] Ya no existen los `console.log` sueltos (`idModule` en `form-lesson.component.ts`, `this.lessonSelected()` en `lesson-form-state.ts`) ni el bloque comentado `formChanges`/`onFormChanged`.
- [ ] Crear, editar, seleccionar módulo, guardar, eliminar y navegar entre lecciones sigue funcionando igual que antes (sin regresiones funcionales).
- [ ] `ng build` compila sin errores.

## Decisiones tomadas y descartadas

- **`app-card-action` no se toca (corrección durante la definición del spec)**: en un primer momento se asumió que su texto blanco quedaría invisible sobre el nuevo fondo claro, igual que en `save-module`. Al revisar el código se confirmó que `.figure` tiene su propio `background-color: rgb(53,53,53)`, autocontenido — el texto sigue siendo legible sin cambios. Se descarta editarlo.
- **`.figure`/`.thumbnail-lesson` y `app-card-action` mantienen su caja oscura propia**: en vez de aclarar también estas cards, se dejan como acento oscuro autocontenido sobre el nuevo fondo claro — da contraste a los elementos clickeables del carrusel sin heredar el riesgo de legibilidad que sí tiene `save-module`.
- **Selector de módulo: forkear estilos en `form-lesson.component.scss`, no editar `item-select.component.scss`**: ese archivo es compartido con `category-select` (usado en `form-course`, que SPEC 01 dejó explícitamente oscuro sin tocar). Editarlo cambiaría `category-select` como efecto colateral no solicitado. Se prefiere duplicar/adaptar las clases necesarias, mismo principio que SPEC 01 aplicó con `app-page-title`.
- **`save-module.component.scss`: fix mínimo y dirigido (solo `color` del `input`)**: es el único componente hijo con un riesgo real de legibilidad (su `input` depende de `background-color: inherit`, que hoy resuelve al fondo oscuro de `.container-popup`). Se corrige puntualmente en vez de rediseñar el popup completo, que queda fuera de alcance.
- **El mecanismo de expand/collapse de `slider-content-manager` (alturas `14rem`/`36rem`, `.icon-expand`) no se toca**: es una animación/toggle deliberado, distinto de los `%`/`position:absolute` que rompen el layout dentro del form. Se repinta su color pero no su comportamiento.
- **`position:absolute` de overlays (flyout del dropdown, overlay del `<input type="file">`) se mantiene**: es el patrón estándar para estos dos casos (dropdown flotante, click-to-upload invisible sobre un preview), distinto del `position:absolute` estructural que sí se elimina (`.container-lesson-bottom`, `.save`, `.module-selector` originales).
- **Breakpoint de responsive: `48rem`, igual que `form-course`**: consistencia entre ambos forms rediseñados; a los ~375px pedidos como criterio de verificación ya cae claramente dentro del rango de 1 columna.
- **Limpieza de `console.log` y bloque comentado**: bajo riesgo, se hace porque de todas formas se editan esos archivos; no se extiende la limpieza a otros archivos no tocados por este spec.

## Riesgos identificados

- `app-thumbnail-selector` (portada del curso, arriba del todo en `slider-content-manager`) queda con el mismo riesgo de contraste que ya documentó SPEC 01 (no se toca en ninguno de los dos specs) — su caja también es oscura autocontenida, así que no hay texto invisible, pero visualmente sigue siendo una isla oscura sobre fondo ahora claro.
- Si en el futuro se decide aclarar también `.figure`/`.thumbnail-lesson`/`app-card-action` (para consistencia total), habrá que revisar contraste de sus íconos SVG (`down-icon.svg`, `attach-icon.svg`, etc.), que hoy están pensados para fondo oscuro.
- El degradé de `.container-add-lesson` (hoy `linear-gradient(to right, v.$black-custom 60%, transparent 30%)`) necesita su color base actualizado a `v.$white-custom`; si se olvida, queda una franja oscura detrás de las cards de "Crear nuevo módulo"/"Añade una nueva lección".
