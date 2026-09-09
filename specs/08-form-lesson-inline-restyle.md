# SPEC 08 — Módulo inducido por contexto y restyle de FormLessonComponent

> **Status:** Aprobado (revisado)
> **Depends on:** SPEC 06, SPEC 07
> **Date:** 2026-09-09
> **Objective:** Quitar el selector manual de módulo de `FormLessonComponent` (crear y editar lección) para que `id_module` se induzca siempre del módulo del acordeón desde donde se abrió el formulario, y restylear el componente para que hable el mismo lenguaje visual claro de `_module-item.scss` (paleta, radios, tipografía), en vez del popup oscuro con layout `position:absolute` que tenía originalmente.

## Revisión post-implementación (2026-09-09)

La primera implementación de esta spec dejó `FormLessonComponent` como una fila más **inline** dentro del flujo del acordeón (`.lesson-panel` plano, mismo fondo gris que `.lesson-row`, botones pill outline genéricos — idéntico lenguaje a `save-module`). El usuario pidió explícitamente revertir esa parte: el formulario **no debe quedar inline** entre las filas, y el diseño debe alejarse de lo genérico dando el mejor esfuerzo visual, en vez de reusar 1:1 el estilo de fila plana. Se mantiene todo lo demás de la spec original (sin selector de módulo, sin navegación prev/next, misma lógica funcional) — lo que cambia es **cómo se presenta** el formulario:

- **Presentación:** `FormLessonComponent` se abre como **tarjeta flotante anclada al módulo** (elevación con `box-shadow`, radio mayor, notch/pico apuntando hacia la fila que la abrió) en vez de una fila plana más del acordeón. No es modal (no hay overlay de página completa) ni drawer lateral — sigue viviendo dentro de `.module-body`, en el flujo normal (sin `position:absolute` real, para no arriesgar solapamiento con otras filas), pero con tratamiento visual claramente "elevado" y no confundible con `.lesson-row`.
- **Dirección visual:** distintiva pero contenida — mantiene la paleta clara y `$brand-color` del resto del acordeón, pero con jerarquía tipográfica marcada (título grande y bold tipo headline, eyebrow de contexto "Nueva lección"/"Editando lección" en mayúsculas), acento teal en el dropzone de medio (borde punteado en vez de sólido), botón "Guardar lección" como pill **sólida** (acción primaria) en vez de outline, y "Cancelar" como texto quieto en vez de pill.
- El botón "Eliminar" se movió del renglón de título a la cabecera de la tarjeta (`.lesson-panel-head`), junto a un botón de cerrar (`×`) redondo que dispara el mismo `onCancel()`.
- No cambia nada de `course-module-item.component.ts`/`.html` a nivel de lógica (mismos signals `isAddingLesson`/`editingLessonId`, mismos `@if`/`@else`) — el único ajuste es el estilo de `.lesson-panel` en `course-module-item.component.scss` (de fila plana a tarjeta elevada con notch y animación de entrada, respetando `prefers-reduced-motion`).

El resto de esta spec (secciones "Scope", "Implementation plan", etc.) describe la primera pasada, ya superada en la parte de presentación visual por esta revisión — se conserva como referencia histórica de qué se tocó (inputs eliminados, call-sites ajustados, lógica intacta).

## Por qué existe esta spec

SPEC 06 dejó `FormLessonComponent` con un dropdown (`.module-selector`) que permite elegir o reasignar manualmente el módulo de una lección, aunque `CourseModuleItemComponent.onAddLesson()` ya fija `id_module` al módulo del acordeón desde donde se clickeó "+ Agregar lección" antes de abrir el panel — el dropdown es redundante para crear, y además permite reasignar módulo al editar, algo que ya no se quiere. Por otro lado, SPEC 07 migró `CourseModuleItemComponent`/`SaveModuleComponent` al lenguaje visual claro del partial compartido `_module-item.scss` (fila con borde sutil, botones pill outline), pero `FormLessonComponent` quedó afuera de ese restyle, con fondo oscuro, texto blanco y layout armado a fuerza de `position:absolute` (dropdown, botones de navegación prev/next, botones Guardar/Cancelar). El usuario pidió explícitamente que el formulario de lección se vea como una fila más del acordeón, con únicamente título, descripción e input de archivo — sin selector de módulo.

## Scope

**In:**

- `FormLessonComponent` deja de tener el input `modules: ModulePopulated[]` y todo lo que dependía de él: el dropdown `.module-selector`, el signal `moduleSelected` (`linkedSignal`) y el método `onSelectModule`. `id_module` queda siempre fijado por quien abre el panel (`CourseModuleItemComponent`), tanto al crear como al editar — sin excepción, sin forma de reasignar módulo desde el formulario.
- Se eliminan los botones de navegación "Anterior lección"/"Siguiente lección" (`app-btn-navigation`) y su contenedor `.container-lesson-bottom`.
- Reescritura de `form-lesson.component.html` a flujo de documento normal (sin wrappers por `position:absolute`): miniatura de medio + input de archivo (misma lógica `fileService.onFileChanged('lessons')`, mismas condiciones `tempMedia()`/`typeMedia()`/`lessonSelected()`) junto a una columna con título y descripción; botón eliminar lección (`app-btn-remove`) pasa a su variante `[asButton]="true"` (pill outline rojo) en vez del ícono flotante oscuro; botones Guardar/Cancelar migran a `.btn-outline`/`.btn-outline-neutral` del partial compartido.
- `form-lesson.component.scss` reescrito para `@use` el partial `_module-item.scss` (mismo patrón que ya usa `save-module.component.scss`), quedándose solo con el estilo propio de la miniatura de medio, el input de título, el textarea de descripción y el layout de fila/columna — deja de depender de `btn-rounded.scss` e `item-select.component.scss`.
- `form-lesson.component.ts` colapsa `styleUrls` a un solo `styleUrl`, quita imports que quedan sin uso (`linkedSignal`, `NgClass`, `ModulePopulated`, `BtnNavigationComponent`) y el `console.log` suelto que había en `moduleSelected`.
- Se ajustan los 2 call-sites que pasaban `[modules]="allModules()"` a `<app-form-lesson>`: ambos usos en `course-module-item.component.html` (rama editar, rama agregar) pierden ese binding. `allModules` como input de `CourseModuleItemComponent` no se toca porque lo sigue usando `<app-save-module [existingModules]="allModules()">`.
- Se ajusta el único call-site restante que rompería la compilación: `slider-content-manager.component.html` pierde su binding `[modules]="this.modulesResource.value()!"` a `<app-form-lesson>` (queda solo `[idCourse]`). No se toca nada más de ese componente.
- La skill `frontend-design` aplica a la forma final de la miniatura de medio, el input de título y los botones outline.

**Sin cambios funcionales:** `LessonFormState` (form, signals, `setLessonSelected`, `patchValuesForm`, `createEmptyLesson`), `LessonService.saveLesson`/`deleteLesson`, `LessonMapper.mapToCreateLessonDto`, los modelos `Lesson`/`LessonPopulated`/`SaveLessonDto` (`id_module` ya es requerido y ya llega bien por las dos vías reales: `onAddLesson` para crear, `setLessonSelected` para editar), `CourseModuleItemComponent.onAddLesson`/`onEditLesson` (ya fijan `id_module` correctamente, no se tocan), `CourseStepContentComponent`.

**Out of scope (para futuras specs):**

- Cualquier campo nuevo en el modelo de lección (tipo, duración, estado, etc.) — la imagen de referencia que motivó esta spec es solo un ejemplo de layout de otra plataforma; no introduce campos nuevos.
- Reasignar una lección a otro módulo por cualquier otro medio (drag & drop, menú contextual, etc.) — queda completamente fuera; el módulo de una lección ya creada es fijo.
- Borrar `SliderContentManagerComponent` o `BtnNavigationComponent` — quedan como código huérfano/sin uso tras esta spec (ya lo estaban parcialmente), su limpieza es una spec de mantenimiento aparte.
- Corregir el gap preexistente de `id_module: ''` en `LessonFormState.createEmptyLesson()` (solo alcanzable hoy desde el `SliderContentManagerComponent` huérfano) — no se toca, es un problema preexistente fuera de este alcance.
- Tests automatizados nuevos.
- Cambios a `variables.scss`, header, footer o `app.routes.ts`.

## Data model

Esta spec no introduce ni modifica estructuras de datos ni DTOs. `SaveLessonDto.id_module` sigue siendo requerido tal cual; solo cambia **quién** lo completa (el contexto del acordeón, nunca un selector manual dentro del formulario). Es puramente de presentación (HTML + SCSS) más una limpieza de la API de inputs de `FormLessonComponent` (se elimina `modules`).

## Implementation plan

1. **`form-lesson.component.ts`**: quitar `modules = input.required<ModulePopulated[]>()`, `moduleSelected` (`linkedSignal`, incluye el `console.log` suelto) y `onSelectModule`. Quitar imports sin uso resultantes: `linkedSignal`, `NgClass`, `ModulePopulated`, `BtnNavigationComponent`. Actualizar `imports:` del decorador (`ReactiveFormsModule`, `FormErrorLabelComponent`, `BtnRemoveComponent`) y colapsar `styleUrls` a `styleUrl: './form-lesson.component.scss'`. Resto (`idCourse`, `saved`, `cancelled`, `onSaveLesson`, `onDeleteLesson`, `onCancel`) intacto. Verificación: compila con errores esperados en los 2 templates que aún pasan `[modules]` (se resuelven en los pasos 4-5).
2. **`form-lesson.component.html`**: eliminar el bloque `.module-selector` completo y el bloque `.container-lesson-bottom` con los dos `<app-btn-navigation>`. Reestructurar en flujo normal: fila con miniatura de medio (input file + preview, misma lógica) y columna de título+descripción; `<app-btn-remove [asButton]="true">` para el botón eliminar; botones Guardar/Cancelar con `.btn-outline`/`.btn-outline-neutral`. Ningún cambio en `formControlName`, `[formGroup]` ni `(ngSubmit)`. Verificación: aislado, sin CSS nuevo todavía (se ve descuadrado, se corrige en el paso siguiente).
3. **`form-lesson.component.scss`**: reescritura completa con `@use '@variables' as v;` + `@use '.../course-step-content/_module-item.scss';` (mismo patrón que `save-module.component.scss`). Layout en flujo normal: `.lesson-fields` (miniatura + columna), miniatura con borde sutil `rgba(0,0,0,0.12)` y radio, input de título estilo `.module-title-input` (borde inferior, foco `$brand-color`), textarea con borde claro, acciones alineadas a la derecha con los botones outline del partial. Se eliminan todas las reglas de layout por `position:absolute` y las clases `.btn-save`/`.btn-cancel` viejas. Verificación manual: el formulario dentro del `.lesson-panel` del acordeón tiene el mismo borde/radio/paleta que una fila de módulo o lección ya guardada.
4. **`course-module-item.component.html`**: quitar `[modules]="allModules()"` de los dos usos de `<app-form-lesson>` (rama editar dentro del `@for`, rama agregar en `isAddingLesson()`). Verificación: compila; `allModules` sigue viva vía `<app-save-module [existingModules]="allModules()">`.
5. **`slider-content-manager.component.html`**: quitar `[modules]="this.modulesResource.value()!"` del único `<app-form-lesson>` (queda solo `[idCourse]`). Verificación: `ng serve`/`ng build` compila completo sin errores, aunque este componente no está enrutado.
6. **QA manual**: crear lección desde un módulo puntual (guarda con `id_module` correcto, sin selector visible); editar lección existente (conserva su módulo, sin forma de cambiarlo); eliminar lección (botón outline rojo, sigue funcionando); subir/reemplazar imagen o video (preview sigue funcionando); confirmar que no quedan botones "Anterior/Siguiente lección"; revisar que el formulario combina visualmente con `CourseModuleItemComponent`/`SaveModuleComponent`; sin errores de consola ni de compilación en desktop y mobile (`<48rem`).

## Acceptance criteria

- [ ] `FormLessonComponent` ya no tiene el input `modules`, ni el dropdown `.module-selector`, ni `onSelectModule`, ni el signal `moduleSelected`.
- [ ] Crear una lección desde "+ Agregar lección" de un módulo puntual la guarda con el `id_module` de ese módulo, sin mostrar ningún selector de módulo.
- [ ] Editar una lección existente conserva su módulo original — no hay ninguna forma de reasignarla a otro módulo desde el formulario.
- [ ] No quedan botones "Anterior lección"/"Siguiente lección" en ningún estado del formulario.
- [ ] El botón "Eliminar" de una lección sigue funcionando (`DELETE /lessons/delete/{id}`) y ahora es un pill outline rojo, no el ícono flotante oscuro anterior.
- [ ] Los botones "Guardar"/"Cancelar" son pill outline (mismo criterio visual que `.btn-outline`/`.btn-outline-neutral` de `_module-item.scss`), no los pill sólidos anteriores.
- [ ] El formulario de lección tiene el mismo borde sutil, radio y paleta clara que `CourseModuleItemComponent`/`SaveModuleComponent` — sin fondo oscuro ni texto blanco remanente.
- [ ] Subir o reemplazar el archivo multimedia (imagen o video) de una lección sigue funcionando igual que antes, con su previsualización.
- [ ] `course-module-item.component.html` y `slider-content-manager.component.html` ya no pasan `[modules]` a `<app-form-lesson>`.
- [ ] `ng build` compila sin errores (incluye `slider-content-manager`, aunque no tenga ruta).
- [ ] No hay errores de consola en desktop ni en mobile (`<48rem`).

## Decisions

- **Sí:** módulo fijo también al editar, sin ninguna forma de reasignación — decisión explícita del usuario; simplifica `id_module` a "siempre viene del contexto del acordeón", nunca de un selector.
- **Sí:** restyle completo adoptando `_module-item.scss` (misma familia que SPEC 07 le dio a `save-module`) — decisión explícita del usuario, para que los 3 formularios inline del acordeón (`save-module`, `form-lesson`) hablen el mismo idioma visual.
- **Sí:** quitar navegación prev/next lección (`app-btn-navigation`) — decisión explícita del usuario; no tiene sentido dentro de una fila de acordeón por módulo.
- **Sí:** input de archivo y preview mantienen exactamente el mismo comportamiento funcional, solo se restylean para encajar en una miniatura dentro del layout de fila — decisión explícita del usuario.
- **Sí:** la imagen de referencia (tabla con Título/Tipo/Duración/Estado) se usa solo como referencia de layout tipo fila con Guardar/Cancelar, no como campos nuevos a agregar — decisión explícita del usuario tras aclarar; esta spec no toca el modelo de lección.
- **Sí:** ajustar `slider-content-manager.component.html` (quitar el binding `[modules]`) aunque el componente esté huérfano — es necesario solo para no romper la compilación al quitar el input de `FormLessonComponent`; no se revive ni se arregla ningún otro comportamiento de ese componente.
- **No:** borrar `SliderContentManagerComponent` ni `BtnNavigationComponent` en esta spec — quedan como código sin uso, su limpieza es tarea de mantenimiento aparte.
- **No:** corregir el gap preexistente de `id_module: ''` en `createEmptyLesson()` — solo alcanzable desde el componente huérfano, fuera de alcance.
- **No:** cambios en `LessonFormState`, `LessonService`, `LessonMapper` ni en los modelos de lección — `id_module` ya llega bien por las dos vías reales que sí se usan en producción.

## Identified risks

| Riesgo | Mitigación |
| --- | --- |
| `SliderContentManagerComponent` es código huérfano (sin ruta, sin consumidor real) pero sigue compilando como parte del proyecto; quitar el input `modules` de `FormLessonComponent` rompe su build si no se ajusta también su template. | Paso 5 ajusta explícitamente ese binding, aunque el componente no se use, solo para mantener `ng build` verde. |
| El botón eliminar cambia de ícono flotante oscuro a pill outline rojo (`asButton=true`); es un cambio visual no pedido explícitamente pero necesario para encajar en la nueva familia de botones. | Se documenta como parte del restyle en el paso 2; si no calza bien, es un ajuste de una sola línea (revertir `asButton`) sin más ripple. |

## Lo que **no** entra en esta spec

- Campos nuevos en el modelo de lección (tipo, duración, estado).
- Reasignar el módulo de una lección por cualquier medio.
- Borrar `SliderContentManagerComponent` o `BtnNavigationComponent`.
- Corregir el gap de `id_module` en `createEmptyLesson()`.
- Tests automatizados nuevos.
- Cambios a `variables.scss`, header, footer o `app.routes.ts`.

Cada uno de esos, si aterriza, va en su propia spec.
