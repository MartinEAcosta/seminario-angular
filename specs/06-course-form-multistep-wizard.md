# SPEC 06 — Formulario multipaso de curso (create/update)

> **Status:** Aprobado
> **Depends on:** ninguna
> **Date:** 2026-09-09
> **Objective:** Partir el formulario de create/update de curso en un wizard de 2 pasos con rutas hijas propias — "Datos" (título, descripción, categoría, portada, precio, cupo) y "Contenido" (módulos y lecciones del curso, con un acordeón editable nuevo) — para que crear un curso deje de ser una sola pantalla larga.

## Por qué existe esta spec

Hoy `FormCourseComponent` es una sola pantalla en grid de 2 columnas con 5 campos de datos del curso; el bloque de contenido (módulos/lecciones) existe como `SliderContentManagerComponent` pero está **comentado** en el HTML y nunca se usó en producción. El usuario pidió explícitamente un formato multipaso "menos tedioso" y, durante la definición, **rechazó explícitamente reflotar el slider** ("quiero adoptar la otra forma para crear los módulos y las lecciones"). La exploración confirmó que **no existe ninguna UI alternativa de autoría ya construida**: lo único que hay en solo-lectura es `ListOfContentComponent` + `ModulesAccordionComponent` (usados en `course-page` y `lesson-viewer-page`, pensados para alumnos inscriptos). Esta spec construye esa UI alternativa desde cero, como acordeón editable, reutilizando las piezas de formulario que sí existen (`SaveModuleComponent`, `FormLessonComponent`) pero extendiéndolas para que emitan eventos y soporten edición — hoy ninguna de las dos lo hace.

## Scope

**In:**

- Convertir `FormCourseComponent` en un **wrapper**: título colapsable (se mantiene `CollapsiblePageTitleComponent` + `.collapse-wrapper`) + stepper de 2 pestañas ("1. Datos" / "2. Contenido") + `<router-outlet>`. Deja de tener `courseForm`, `onSubmit`, `onRemoveCourse` y los `@Output()` — pasa a ser puramente de layout y de seed del estado compartido (`ngOnInit`/`ngOnDestroy`).
- Rutas hijas nuevas en `course.routes.ts`, en inglés kebab-case (alineadas con `create`/`update`/`verify-email`/`become-teacher`/`buy` del resto del repo): `/course/create/data`, `/course/create/content`, `/course/update/:id/data`, `/course/update/:id/content`. Cada padre (`create`, `update/:id`) redirige su ruta vacía a `data`.
- `CourseStepDataComponent` (nuevo) — todo el formulario de datos que hoy vive en `form-course.component.html`, con el submit y el remove movidos acá (antes vivían en las páginas). Agrega un control real ("Cupo limitado" checkbox) para el signal `limitedCapacity`, que hoy existe en `CourseFormState` pero no tiene UI.
- `CourseStepContentComponent` (nuevo) — acordeón editable de módulos/lecciones del curso, con `rxResource` propio y reactivo a `courseId` (a diferencia del `rxResource` de `ListOfContent`, que no reacciona a cambios de input).
- `CourseModuleItemComponent` (nuevo) — la fila de acordeón por módulo: expandir/colapsar, editar módulo inline, listar lecciones con editar/eliminar, agregar lección inline. Es un componente nuevo, **no** una modificación de `ModulesAccordionComponent` (ese sigue siendo de solo-lectura para alumnos, sin tocar).
- `course-content.guard.ts` (nuevo) — bloquea `/course/create/content` si todavía no existe un curso creado en la sesión, redirigiendo a `/course/create/data`.
- Persistencia: en create, "Siguiente" en el paso Datos dispara `POST /courses/new`, guarda el curso resultante en el estado compartido y navega a `content`. En update, "Guardar cambios" en Datos dispara `PUT` inmediato y **no** navega — con el curso ya existente, ambas pestañas del stepper son clickeables libremente desde el arranque.
- Extender `SaveModuleComponent` (crear/editar módulo) y `FormLessonComponent` (crear/editar/eliminar lección) para que emitan eventos (`saved`/`cancelled`) y soporten edición — hoy ninguno de los dos lo hace. Extender `ModuleService.saveModule` para branchear `POST`/`PUT` según `id`, igual que ya hacen `LessonService.saveLesson` y `CourseService.saveCourse`.
- Corregir 2 bugs preexistentes tocados de paso: `capacity` inicializado como `{ value: 5 }` en vez de `5` en `CourseFormState`, y la opción "Limpiar categoria" de `CategorySelectComponent` que hoy no emite ni limpia el `FormControl`.
- Botón "Cancelar" en el paso Datos pide confirmación (`window.confirm`) si el formulario está `dirty` antes de navegar a `/`.
- Botón final en el paso Contenido ("Ir al curso creado") que navega a `/course/:id`.
- La skill `frontend-design` aplica a las decisiones visuales del stepper y del acordeón — **no se busca un diseño genérico**.

**Out of scope (para futuras specs):**

- Eliminar o reordenar módulos: `ModuleService` no tiene esos endpoints hoy; agregarlos es trabajo de API + DTO aparte. Los módulos de esta spec solo se crean y editan.
- Reordenar lecciones dentro de un módulo (drag & drop o similar). El campo `lesson_number` sigue siendo lo único que determina el orden, tal cual hoy.
- Borrar el archivo de media de una lección al eliminarla: el código actual de `onDeleteLesson` intenta borrar el thumbnail del **curso** en vez del archivo de la lección (bug preexistente, ver Decisions) — no se corrige la limpieza de archivos huérfanos, solo se deja de llamar al método equivocado.
- `SliderContentManagerComponent`: no se borra ni se toca. Queda comentado/sin uso en el código, tal cual está hoy.
- Mover `SaveModuleComponent`/`FormLessonComponent` de carpeta — se editan in-place en `module/components/save-module/` y `lesson/components/form-lesson/`.
- Cualquier endpoint de reorder, delete de módulo, o versionado de contenido.
- Tests automatizados nuevos.
- Cambios a `variables.scss`, al header, al footer o a `app.routes.ts`.
- Guardado automático (autosave) de las lecciones mientras se escribe — el bloque comentado de `formChanges`/`onFormChanged` en `FormLessonComponent` sigue comentado.

## Data model

No se agregan interfaces nuevas de backend (`Course`, `CourseDTO`, `Module`, `ModuleDTO`, `ModulePopulated`, `LessonPopulated`, `SaveLessonDto` quedan igual — `ModuleDTO` ya tenía `id?: string`, no hace falta tocarlo). Los cambios son de **estado de formulario** y de **API de componentes existentes**:

```ts
// src/app/course/state/course-form/course-form-state.ts

// Reemplaza el bug `capacity : [ { value : 5 } , [...] ]` por un valor plano:
capacity : [ 5 , [ Validators.min(5) ] ],

// Nuevo: última versión persistida del curso en esta sesión de wizard.
// null hasta que create hace su primer POST, o hasta que update carga el resolver.
savedCourse = signal<Course | null>(null);

// Derivado: id del curso ya persistido, o null si todavía no existe.
// Lo usa el guard de 'content' y el stepper para habilitar/deshabilitar la pestaña.
courseId = computed(() => this.savedCourse()?.id ?? null);

setSavedCourse(course: Course | null): void { this.savedCourse.set(course); }

// toggleLimitedCapacity ahora también habilita/deshabilita el FormControl 'capacity'
// (puramente visual — CourseMapper.mapToCourseDto ya ignora el valor cuando limitedCapacity es false).
```

`patchValuesForm(course)` pasa a llamar también `this.setSavedCourse(course)` (y a sincronizar el enable/disable de `capacity` según `limitedCapacity`). `reset()` pasa a llamar también `this.setSavedCourse(null)`.

```ts
// src/app/module/components/save-module/save-module.component.ts — API nueva
idCourse = input.required<string>();               // reemplaza el input `course: Course|null`
moduleToEdit = input<ModulePopulated | null>(null); // nuevo, opcional
saved = output<Module>();                            // nuevo
cancelled = output<void>();                           // nuevo
```

```ts
// src/app/lesson/components/form-lesson/form-lesson.component.ts — API nueva
idCourse = input.required<string>();  // reemplaza el input `course: Course|null`
// `modules` se mantiene igual (ModulePopulated[] — sigue permitiendo reasignar de módulo)
saved = output<void>();                // nuevo
cancelled = output<void>();            // nuevo
```

```ts
// src/app/course/components/form-course/steps/course-step-content/course-module-item/course-module-item.component.ts
module = input.required<ModulePopulated>();
idCourse = input.required<string>();
allModules = input.required<ModulePopulated[]>(); // para el dropdown de reasignar módulo en form-lesson
contentChanged = output<void>();  // el padre hace modulesResource.reload()

isExpanded = signal(false);
isEditingModule = signal(false);
isAddingLesson = signal(false);
editingLessonId = signal<string | null>(null);
```

## Implementation plan

1. **Fix de `CourseFormState`**: corregir `capacity` a `[5, [Validators.min(5)]]`, agregar `savedCourse`/`courseId`/`setSavedCourse`, hacer que `patchValuesForm` y `reset` los mantengan sincronizados, y que `toggleLimitedCapacity` habilite/deshabilite el control `capacity`. Verificación: `ng serve` compila sin errores; nada visible cambia todavía.
2. **Fix de `CategorySelectComponent`**: agregar método `onClearCategory()` que hace `categorySelected.set(undefined)` **y** `clickCategory.emit('')`; cablear `(click)="onClearCategory()"` en vez del `set(undefined)` inline en `category-select.component.html`. Verificación: elegir una categoría y luego "Limpiar categoria" deja el select vacío y el control `id_category` vuelve a marcarse inválido (`required`).
3. **Extender `ModuleService.saveModule`** para branchear `POST /modules/new` / `PUT {baseURL}/update/{id}` según si el DTO trae `id`, mismo patrón que `LessonService.saveLesson`. Verificación: sin UI nueva todavía, solo compila.
4. **Extender `SaveModuleComponent`**: cambiar el input `course` por `idCourse: input.required<string>()`, agregar `moduleToEdit` input y outputs `saved`/`cancelled`; en `onSaveModule` incluir `id: this.moduleToEdit()?.id` en el DTO y, al éxito, `this.saved.emit(module)` + reset del form; agregar botón "Cancelar" que emite `cancelled`. Ajustar el SCSS (`save-module.component.scss`) para que deje de estar pensado como popup flotante (`width:20rem`) y encaje inline dentro de una fila de acordeón. Verificación: aislado, no se ve todavía (no tiene consumidor hasta el paso 8).
5. **Extender `FormLessonComponent`**: cambiar el input `course` por `idCourse: input.required<string>()` (ajustar las 2 referencias a `course()?.id`), agregar outputs `saved`/`cancelled`, agregar el `<input type="file" accept="image/*,video/*">` + figura de preview portados tal cual del HTML de `SliderContentManagerComponent` (usa `fileService.onFileChanged($event,'lessons')` y `lessonFormState.tempMedia()`/`typeMedia()`, que ya existen). En `onDeleteLesson`, sacar el chequeo `course()?.id_owner === authService.id()` y la llamada a `fileService.deleteCourseThumbnail(...)` (bug preexistente: borraba el thumbnail del curso, no el archivo de la lección; la propiedad ya está garantizada aguas arriba por los guards del wizard). Agregar botón "Cancelar" que emite `cancelled`. Verificación: aislado, sin consumidor todavía.
6. **Crear `CourseStepDataComponent`** (`course/components/form-course/steps/course-step-data/`) moviendo el HTML/SCSS del formulario de datos tal cual está hoy en `form-course.component.html` (título, descripción, categoría+portada, capacidad+precio, acciones). Agregar el checkbox "Cupo limitado" junto al input de `capacity`, ligado a `courseFormState.limitedCapacity()`/`toggleLimitedCapacity()`. `onSubmit()`: si `courseFormState.savedCourse()` es `null` → build DTO, `POST` vía `courseService.saveCourse`, al éxito `setSavedCourse(created)` + `router.navigate(['../content'], { relativeTo: activatedRoute })`; si no es `null` → build DTO con `id`/preservación de `id_file`/`thumbnail_url` cuando no hay `thumbnailFile()` nuevo (misma lógica que hoy tiene `update-course-page.ts`), `PUT`, al éxito `setSavedCourse(updated)` + `uiService.showToastMessage('Cambios guardados.')`. Botón dice "Siguiente" cuando `!courseFormState.courseId()`, "Guardar cambios" cuando sí. `onRemoveCourse()` y `onCancel()` (con `window.confirm` si `courseForm.dirty`) se mueven acá tal cual estaban en las páginas. Verificación: sin rutear todavía, compila.
7. **Convertir `FormCourseComponent` en wrapper**: sacar el `<form>` completo del HTML, dejar `<app-collapsible-page-title>` con `[title]="courseFormState.savedCourse()?.id ? 'Editar curso' : 'Crear curso'"`, agregar `<nav class="stepper">` con 2 `routerLink` ("data" / "content", el segundo con `[routerLink]="courseFormState.courseId() ? 'content' : null"` y clase `.disabled` cuando no hay id) y `<router-outlet>` dentro de `.collapse-inner`. Sacar del `.ts` los `@Output()`, `onSubmit`, `onRemoveCourse`, y los imports que ya no usa (`ReactiveFormsModule`, `FormErrorLabelComponent`, `ThumbnailSelectorComponent`, `CategorySelectComponent`, `BtnRemoveComponent`, `SliderContentManagerComponent`) — mantiene `course` input y la lógica de `ngOnInit`/`ngOnDestroy` (patch/reset). Verificación: `ng serve` compila; la página todavía no rutea a ningún hijo (paso siguiente).
8. **Crear `CourseModuleItemComponent`** (`.../course-step-content/course-module-item/`): fila con header (título + unidad + botón "Editar"), cuerpo expandible con `@for` de `module().lessons` (fila por lección con "Editar"/"Eliminar"), botón "+ Agregar lección". "Editar módulo" reemplaza el header por `<app-save-module [idCourse] [moduleToEdit]="module()" (saved)="onModuleSaved()" (cancelled)="isEditingModule.set(false)" />`. "Editar lección" llama `lessonService.getLessonPopulatedById(lesson.id)`, al responder hace `lessonFormState.setLessonSelected(full)` y abre el panel inline con `<app-form-lesson [idCourse] [modules]="allModules()" (saved)="onLessonSaved()" (cancelled)="closeLessonPanel()" />`. "Eliminar lección" llama `lessonService.deleteLesson(lesson.id)` y al éxito emite `contentChanged`. "+ Agregar lección" resetea `lessonFormState.lessonForm`, parchea `id_module` con `module().id`, abre el mismo panel inline en modo creación. Verificación: aislado.
9. **Crear `CourseStepContentComponent`**: `modulesResource = rxResource({ params: () => ({ courseId: courseFormState.courseId() }), stream: ({params}) => params.courseId ? moduleService.getModulesByCourseId(params.courseId) : of([]) })`. Botón "+ Agregar módulo" abre `<app-save-module [idCourse]="courseFormState.courseId()!" (saved)="onModuleSaved()" (cancelled)="isAddingModule.set(false)" />` inline; `@for` de `modulesResource.value()` renderiza `<app-course-module-item [module] [idCourse]="courseFormState.courseId()!" [allModules]="modulesResource.value()!" (contentChanged)="modulesResource.reload()" />`; botón final "Ir al curso creado" con `[routerLink]="['/course', courseFormState.courseId()]"`. Verificación: aislado.
10. **Crear `course-content.guard.ts`**: `CanActivateFn` que hace `inject(CourseFormState).courseId() ? true : (inject(Router).navigate(['/course/create/data']), false)`.
11. **Reestructurar `course.routes.ts`**: agregar `children` a los bloques `create` y `update/:id` — `{ path:'', redirectTo:'data', pathMatch:'full' }`, `{ path:'data', component: CourseStepDataComponent }`, `{ path:'content', component: CourseStepContentComponent }` (con `canActivate:[courseContentGuard]` **solo** en el hijo de `create`, no en el de `update/:id`). Verificación: logueado, entrar a `/course/create` redirige a `/course/create/data` y se ve el formulario de datos; entrar directo a `/course/create/content` redirige a `/course/create/data`.
12. **Simplificar `create-course-page.ts`/`.html`**: sacar `createdCourse`, `onCreateCourse` y los imports/injects que ya no usa (`CourseService`, `CourseMapper`, `AuthService`, `CourseFormState`); el HTML queda `<app-form-course [course]="null" />`. Verificación: crear un curso completo — paso Datos, "Siguiente" persiste y navega a `/course/create/content`; el paso Contenido carga vacío ("sin módulos todavía").
13. **Simplificar `update-course-page.ts`/`.html`**: sacar `onUpdateCourse`, `onRemoveCourse` y los imports que ya no usa (`CourseService`, `CourseMapper`, `AuthService`); mantiene solo `resolvedCourse` input y el `@if` alrededor de `<app-form-course [course]="resolvedCourse()!" />`. Verificación: editar un curso existente — ambas pestañas del stepper son clickeables desde el arranque, "Guardar cambios" en Datos persiste sin navegar, el paso Contenido muestra los módulos/lecciones reales del curso.
14. **QA manual end-to-end**: crear curso nuevo completo (datos + al menos 1 módulo + 2 lecciones, una con imagen y otra con video), editarlo (cambiar título, editar el módulo, editar y eliminar una lección, agregar una lección nueva), probar "Cancelar" con cambios sin guardar (debe confirmar), probar "Eliminar curso" desde Datos, y confirmar que no quedan errores de consola en ninguno de los 2 pasos ni en desktop ni en mobile.

## Acceptance criteria

- [ ] `/course/create` redirige a `/course/create/data`; `/course/update/:id` redirige a `/course/update/:id/data`.
- [ ] En create, entrar directo a `/course/create/content` sin haber guardado antes redirige a `/course/create/data`.
- [ ] En create, completar el paso Datos y tocar "Siguiente" crea el curso (`POST /courses/new` visible en Network), navega a `/course/create/content`, y a partir de ahí la pestaña "Contenido" queda habilitada.
- [ ] En update, ambas pestañas del stepper son clickeables desde que se entra a la página (el curso ya existe).
- [ ] En update, "Guardar cambios" en Datos dispara `PUT /courses/update/{id}` y **no** navega de pestaña.
- [ ] El checkbox "Cupo limitado" alterna el input de capacidad entre habilitado/deshabilitado; con el checkbox apagado, `capacity` se manda como `null`.
- [ ] "Limpiar categoria" deja el select sin categoría elegida y vuelve a marcar el campo como inválido si se intenta enviar.
- [ ] En el paso Contenido, "+ Agregar módulo" muestra un formulario inline con título y unidad; guardarlo lo agrega a la lista sin recargar la página.
- [ ] Click en "Editar" de un módulo permite cambiar título/unidad y persistirlo (`PUT /modules/update/{id}`).
- [ ] Dentro de un módulo expandido, "+ Agregar lección" muestra un formulario inline (título, descripción, módulo, archivo); guardarlo agrega la lección a la lista del módulo.
- [ ] "Editar" en una lección existente precarga sus datos reales (incluida la media) en el mismo panel inline.
- [ ] "Eliminar" en una lección la borra (`DELETE /lessons/delete/{id}`) y desaparece de la lista sin recargar la página.
- [ ] No hay botón de eliminar ni de reordenar para módulos.
- [ ] "Cancelar" en el paso Datos con el formulario `dirty` pide confirmación antes de salir; sin cambios, sale directo.
- [ ] El botón final del paso Contenido navega a `/course/{id}` (la página de detalle del curso).
- [ ] "Eliminar curso" desde el paso Datos sigue funcionando igual que hoy (borra y navega a `/`).
- [ ] La página renderiza sin errores de consola en ambos pasos, en desktop y en mobile (`<48rem`, breakpoint ya usado en `form-course.component.scss`).

## Decisions

- **Sí:** 2 pasos ("Datos" y "Contenido"), no 3 ni 4 — decisión explícita del usuario. Con solo 5 campos hoy, más pasos habría sido más tedioso, no menos.
- **Sí:** rutas hijas (`/course/create/data`, `/course/create/content`, etc.) en vez de un signal local o query param — decisión explícita del usuario, y necesario para que "Contenido" sea linkeable/recargable una vez que el curso existe.
- **Sí:** slugs de ruta en inglés kebab-case (`data`/`content`) — decisión explícita del usuario tras notar que el resto de `course.routes.ts` y del repo (`create`, `update`, `verify-email`, `become-teacher`, `buy`) usa inglés; la propuesta inicial en español (`datos`/`contenido`) quedó descartada.
- **Sí:** en create, el curso se persiste (`POST`) al cerrar el paso Datos, no al final del wizard — decisión explícita del usuario, necesaria porque el paso Contenido opera sobre módulos/lecciones que requieren un `id_course` real.
- **Sí:** en update, navegación libre entre pestañas desde el arranque — decisión explícita del usuario, porque el curso ya existe.
- **Sí:** guard solo en `create/content`, no en `update/:id/content` — el curso en update siempre existe (lo garantiza `ValidateParamIdGuard` + `CourseResolver` en la ruta padre), agregar el guard ahí sería redundante y además introduce un riesgo de timing con el resolver.
- **Sí:** acordeón editable nuevo (`CourseModuleItemComponent`) en vez de reflotar `SliderContentManagerComponent` o de modificar `ModulesAccordionComponent` in-place — decisión explícita del usuario ("quiero adoptar la otra forma"), rechazando el slider tras verlo en el plan inicial. `ModulesAccordionComponent` no se toca porque es de alumno inscripto (navega a `/enrollment/.../lesson/...`), mezclar ambos casos de uso en un mismo componente lo haría más frágil.
- **Sí:** formularios de módulo/lección **inline** (no modal) — decisión explícita del usuario durante las preguntas de diseño.
- **Sí:** módulo solo crear/editar, sin eliminar ni reordenar — decisión explícita del usuario; el backend no tiene esos endpoints y agregarlos es trabajo aparte.
- **Sí:** lección con eliminar real, además de crear/editar — decisión explícita del usuario; `lessonService.deleteLesson` ya existe.
- **Sí:** `SaveModuleComponent` y `FormLessonComponent` cambian su input `course: Course|null` por `idCourse: string` — ambos solo usaban `course()?.id` (o `course()?.id_owner`, que se elimina junto con el chequeo de ownership redundante en `onDeleteLesson`); pasar el id directo evita tener que reconstruir un objeto `Course` completo en el wizard, que ya no lo mantiene como tal.
- **Sí:** `CourseFormState.savedCourse` como signal único (con `courseId` derivado) en vez de dos signals separados — un solo lugar que trackear para "el curso tal como quedó la última vez que se guardó", usado tanto por create (tras el POST) como por update (desde el resolver).
- **Sí:** botón "Eliminar curso" y "Cancelar" se quedan en el paso Datos, condicionados a `courseFormState.courseId()` en vez del input `course()` — así "Eliminar" también aparece en create una vez persistido el curso, no solo en update.
- **Sí:** "Cancelar" pide confirmación vía `window.confirm` si el form está `dirty` — decisión explícita del usuario. No existe un servicio de modal genérico en el repo (el modal de SPEC 05 es ad-hoc de esa página), así que no se construye uno nuevo solo para esto.
- **Sí:** botón final "Ir al curso creado" en el paso Contenido — cierra el flujo de create de forma explícita; sin él, el wizard no tendría un final claro.
- **No:** tocar `ListOfContentComponent` ni `ModulesAccordionComponent` (las vistas de alumno) — quedan exactamente como están, incluido su bug de `rxResource` sin `params` reactivo, que es un problema aparte de esta spec.
- **No:** corregir la limpieza del archivo de media de una lección al eliminarla — el código actual ya llama al endpoint equivocado (`deleteCourseThumbnail` en vez de borrar el archivo de la lección); esta spec deja de llamarlo (porque dependía del chequeo de ownership que se elimina) pero no agrega la limpieza correcta, que requeriría rastrear el `id_file` de la lección hasta acá.
- **No:** endpoints de delete/reorder de módulo — fuera de scope, ver arriba.
- **No:** mover `SaveModuleComponent`/`FormLessonComponent` de carpeta — se editan donde están.

## Identified risks

| Riesgo | Mitigación |
| --- | --- |
| El backend puede no tener `PUT {apiURL}modules/update/{id}` — se asume por convención con `lessons`/`courses`, pero no está verificado (backend no está en este workspace). | Si el endpoint no existe, "Editar módulo" fallará con 404/405 pero "Crear módulo" seguirá funcionando (usa `POST /modules/new`, ya probado). Verificar contra el backend real antes de dar el paso 4 por cerrado. |
| `getModulesByCourseId` devuelve lecciones livianas (`{id, title}` nada más); cada "Editar lección" dispara un `GET` extra (`getLessonPopulatedById`) para traer los datos completos. | Es una llamada liviana y ya existe en `LessonService`; se documenta como comportamiento esperado, no como bug. |
| Mover el submit de las páginas a `CourseStepDataComponent` puede pisar algún caso borde no cubierto hoy por tests (no hay tests automatizados en esta spec). | El paso 14 (QA manual) recorre explícitamente crear, editar, eliminar módulo/lección y cancelar antes de dar la spec por terminada. |
| El signal singleton `CourseFormState`/`LessonFormState` no se resetea si el usuario navega fuera del wizard sin pasar por `ngOnDestroy` del wrapper (por ejemplo, cerrando la pestaña). | Mismo riesgo que ya existe hoy con el form de una sola pantalla; no lo introduce esta spec. |

## Lo que **no** entra en esta spec

- Eliminar o reordenar módulos.
- Reordenar lecciones.
- Limpieza correcta del archivo de media al eliminar una lección.
- Cambios a `SliderContentManagerComponent`, `ListOfContentComponent` o `ModulesAccordionComponent`.
- Tests automatizados nuevos.
- Cambios a `variables.scss`, header, footer o `app.routes.ts`.

Cada uno de esos, si aterriza, va en su propia spec.
