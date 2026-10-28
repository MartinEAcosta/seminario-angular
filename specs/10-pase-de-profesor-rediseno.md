# SPEC 10 — Pase de profesor: rediseño completo de `/become-teacher`

> **Status:** Aprobado
> **Depends on:** 01 (breakpoints y escala fluida)
> **Date:** 2026-10-22
> **Objective:** Reescribir por completo `/become-teacher` (layout, formulario y estado de la solicitud) para que coincida con el mock "Pase de profesor · /become-teacher", reemplazando el flujo actual de card-intro + formulario de 5 preguntas por un layout de dos columnas con roadmap de 4 pasos, un formulario de campos nuevos, y el wiring real de `TeacherRequestState` (hoy un stub vacío) para reflejar pending/approved/rejected.

## Por qué existe esta spec

El mock de referencia (`https://claude.ai/artifact/8QA8kX4B4G3DvtAf2k2Srg#artboard-ab548564e2f4`, página "Pase de profesor · /become-teacher") muestra un layout de dos columnas — panel izquierdo oscuro con título, badge de email verificado y un roadmap de 4 pasos; panel derecho blanco con el formulario real — que no se parece en nada al flujo actual: una card centrada con botón "Comenzar solicitud" que, al click, revela un formulario de 5 preguntas (categorías multi-checkbox, experiencia, motivación, idea de curso, portfolio). Además, `TeacherRequestState` hoy sólo inyecta el servicio sin exponer nada, y todo el bloque de `become-teacher-page.component.html` que mostraría pending/approved/rejected está comentado — la feature de "ver el estado de mi solicitud" nunca se terminó de cablear. Esta spec hace ambas cosas a la vez: redibuja la UI al mock y termina el wiring de estado que quedó a medio hacer.

El mock no cubre todos los estados que la página necesita (role ya profesor, email no verificado, pending, approved, rejected) — las decisiones de qué hacer en esos casos se tomaron en conversación y se documentan en la sección de Decisiones.

## Scope

**In:**

- `become-teacher-page.component.ts|html|scss`: reescritos por completo. La página pasa a tener dos familias de layout:
  - **Hero de bloqueo** (SVG ilustrativo a un lado + copy/CTA al otro, fondo claro con wash teal) para los dos estados que impiden siquiera entrar al "viaje" de la solicitud: `role !== 'student'` ("ya sos profesor") y `!user.isEmailVerified` ("email no verificado"). No reutiliza el panel oscuro con roadmap — son estados fuera del flujo de la solicitud, no un paso de él.
  - **Shell de dos columnas** (panel izquierdo oscuro fijo: título "Enseñá lo que **sabés**", subtítulo, badge "✓ Tu correo `{email}` está verificado", roadmap de 4 pasos con el paso actual resaltado; panel derecho blanco cuyo contenido cambia según el estado de la solicitud) para todo lo que sí es parte del viaje: sin solicitud todavía / `rejected` con reintento → formulario; `pending` → mensaje "tu solicitud está en revisión"; `approved` → mensaje de aprobación + botón "Actualizar mi sesión"; `rejected` sin reintento → motivo del rechazo + botón "Volver a solicitar".
  - Mientras `teacherRequestState` todavía está resolviendo "mi solicitud" (`isLoading()`), se muestra `<app-loader />` sola, sin ninguno de los dos layouts (igual al `@else if (isLoading())` que ya estaba comentado en el código actual).
  - El paso resaltado del roadmap es un `computed` simple: `pending` → 2, `approved` → 3, cualquier otro caso (sin solicitud, o `rejected`) → 1.
- `teacher-request-form.component.ts|html|scss`: reescritos por completo con los campos nuevos (ver Data model) agrupados en "1. Sobre vos" y "2. Tu primer curso", matching el mock. Se elimina el set de preguntas actual (categorías multi-checkbox inline, experience, motivation, courseIdea, portfolioUrl, agreesToGuidelines) y se reemplaza íntegramente.
- `teacher-request-status.component.ts|html|scss`: reescritos para renderizar sólo el **contenido del panel derecho** (pending / approved / rejected), ya no una card standalone — el panel izquierdo (título, badge, roadmap) lo maneja `become-teacher-page`. Sigue recibiendo `request: TeacherRequest` como input; agrega un output `retry` (para "Volver a solicitar") y usa `inject(AuthService)` para el botón "Actualizar mi sesión" de `approved`.
- Nuevo componente `category-multiselect-dropdown` (`teacher-request/components/category-multiselect-dropdown/`), selector `app-category-multiselect-dropdown`: botón tipo `<select>` que al abrirse muestra un checklist de categorías (reemplaza las pills inline de categoría que había antes). Input `categories: Category[]`, input `selectedIds: string[]`, output `toggleCategory: { category: Category; checked: boolean }`. Se cierra con click afuera o Escape. Vive en `teacher-request/components/` porque hoy es el único lugar de la app con selección múltiple de categorías — no se expone como reusable.
- `teacher-request-state.ts`: se cablea por completo:
  - `myRequestResource = rxResource({ stream: () => this.teacherRequestService.getMyTeacherRequest() })` — reemplaza el stub vacío.
  - `myRequest = computed(() => this.myRequestResource.value() ?? null)`, `isLoading = computed(() => this.myRequestResource.isLoading())`.
  - `submitRequest(dto)`: llama a `teacherRequestService.createTeacherRequest(dto)`; en éxito llama a `this.myRequestResource.reload()` para que el panel derecho pase a mostrar `pending` sin recargar la página.
- `teacher-request.interfaces.ts`: `TeacherRequest`/`TeacherRequestDTO` reescritos con los campos nuevos (ver Data model). Se eliminan `experience`, `motivation`, `courseIdea`.
- `teacher-request.mapper.ts` (en `src/app/mappers/`): actualizado para mapear el nuevo shape de `TeacherRequestResponse` ↔ `TeacherRequest`.
- `shared/models/api.interfaces.ts`: el tipo `TeacherRequestResponse` se actualiza con los campos nuevos.
- Botón "Actualizar mi sesión" del estado `approved`: llama a `authService.checkStatusResource.reload()` (ya es un `rxResource` público en `AuthService`) para refrescar `UserState.user()` sin recargar la página completa — si el backend ya marcó el rol como profesor, el siguiente render de `become-teacher-page` cae directo en el estado "ya sos profesor".
- Ilustraciones de los dos heroes de bloqueo: SVG inline en el template (mismo patrón que `cart.component.html` usa para sus íconos), no se agregan archivos de asset nuevos.
- Checkbox final "Leí y acepto los **términos para profesores**": el link se renderiza pero no navega a ninguna ruta real (no existe página de términos en el repo hoy, para ningún flujo — tampoco la tiene el registro). Queda como texto con estilo de link, sin `routerLink` ni `href`.

**Out of scope (para otra spec):**

- Construir una página real de "términos para profesores" o "política de privacidad" — no existe hoy para ningún flujo de la app.
- Cambios en el header compartido (`shared/components/layout/header`) — el mock lo muestra tal cual porque es el chrome global de la app; no requiere cambios para esta spec.
- Actualizar el backend (`seminario-angular-backend`, repo separado) para que acepte/devuelva el nuevo shape de `TeacherRequestDTO`/`TeacherRequestResponse`. Esta spec asume que el backend se actualiza en paralelo — es un cambio de contrato documentado acá, no implementado acá.
- Cualquier mecanismo en tiempo real (websocket, polling) para enterarse de que la solicitud cambió de estado sin que el usuario recargue/reabra la página — por ahora el único refresh es manual, vía el botón de `approved` o al volver a entrar a `/become-teacher`.
- Precargar las respuestas de una solicitud rechazada al reabrir el formulario — "Volver a solicitar" abre el formulario vacío, el usuario completa todo de nuevo.
- Convertir `category-multiselect-dropdown` en un componente reusable fuera de `teacher-request/` o en un `ControlValueAccessor` genérico — por ahora expone inputs/outputs simples, atado al `FormArray` de `teacher-request-form` igual que el código viejo lo estaba a las pills.
- Tocar `CategoryService` o el modelo `Category` — se siguen consumiendo tal cual.

## Data model

`src/app/teacher-request/models/teacher-request.interfaces.ts` queda así:

```ts
export type TeacherRequestStatus = 'pending' | 'approved' | 'rejected';
export type TeacherExperienceLevel = 'none' | 'informal' | 'teacher';

export interface TeacherRequest {
    id              : string;
    status          : TeacherRequestStatus;
    categoryIds     : string[];
    aboutYou        : string;
    experienceLevel : TeacherExperienceLevel;
    courseTitle     : string;
    courseSummary   : string;
    portfolioUrl    : string | null;
    rejectionReason : string | null;
    createdAt       : Date;
    reviewedAt      : Date | null;
}

export interface TeacherRequestDTO {
    categoryIds     : string[];
    aboutYou        : string;
    experienceLevel : TeacherExperienceLevel;
    courseTitle     : string;
    courseSummary   : string;
    portfolioUrl   ?: string;
}
```

Validadores del formulario (en `teacher-request-form.component.ts`):

| Campo | Validación |
| --- | --- |
| `categoryIds` (`FormArray`) | `required`, `minLength(1)` — igual que hoy |
| `aboutYou` | `required`, `minLength(50)`, `maxLength(500)` — el contador en el template muestra `{{ length }}/500` |
| `experienceLevel` | `required` — tres opciones fijas: Ninguna / Informal / Profesor |
| `courseTitle` | `required`, `minLength(5)` |
| `courseSummary` | `required`, `minLength(10)` |
| `portfolioUrl` | `Validators.pattern(FormUtils.urlPattern)` — opcional, igual que el `portfolioUrl` actual |
| `agreesToGuidelines` | `requiredTrue` — igual que hoy |

`TeacherRequestResponse` (en `shared/models/api.interfaces.ts`) y `TeacherRequestMapper` (en `src/app/mappers/`) se actualizan 1:1 con estos nombres de campo.

## Implementation plan

1. Reescribir `teacher-request.interfaces.ts` con el shape nuevo (ver Data model). Actualizar `TeacherRequestResponse` en `shared/models/api.interfaces.ts` y `TeacherRequestMapper` para mapear los campos nuevos. Verificación: el proyecto sigue compilando (los consumidores se actualizan en los pasos siguientes).
2. Crear `category-multiselect-dropdown` standalone: botón que abre/cierra un panel con checkboxes de `categories`, marca los que están en `selectedIds`, emite `toggleCategory` por cada click, cierra con click afuera/Escape. Verificación manual: renderiza aislado con categorías de prueba, togglea visualmente.
3. Reescribir `teacher-request-form.component.ts|html|scss`: `FormGroup` con los campos nuevos y validadores de la tabla de arriba, secciones "1. Sobre vos" / "2. Tu primer curso" matching el mock, usando `app-category-multiselect-dropdown` para `categoryIds`, selector de 3 opciones para `experienceLevel`, contador de caracteres para `aboutYou`. `onSubmit` arma el `TeacherRequestDTO` nuevo. Verificación manual: completar y enviar el formulario emite el DTO correcto por consola/breakpoint.
4. Cablear `teacher-request-state.ts`: `myRequestResource`, `myRequest`, `isLoading`, `submitRequest()` con `reload()` en éxito. Verificación: con el backend corriendo, `myRequest()` refleja la última solicitud del usuario logueado.
5. Reescribir `teacher-request-status.component.ts|html|scss` para renderizar sólo el contenido del panel derecho según `request().status` (pending / approved con botón "Actualizar mi sesión" vía `authService.checkStatusResource.reload()` / rejected con `rejectionReason` y output `retry`).
6. Reescribir `become-teacher-page.component.ts|html|scss`: estructura de estados `isLoading → app-loader` / `role !== 'student' → hero bloqueo A` / `!isEmailVerified → hero bloqueo B` / resto → shell de dos columnas, con el panel derecho conmutando entre `app-teacher-request-form` (sin solicitud, o rejected+retry) y `app-teacher-request-status` (pending/approved/rejected sin retry). `currentStep` computed (pending→2, approved→3, default→1) pasado al roadmap del panel izquierdo.
7. Verificación manual en navegador, con el backend corriendo (`seminario-angular-backend` en `localhost:4201`) una vez que tenga los campos nuevos, o mínimamente verificando los 2 estados que no dependen del backend (ya profesor, email no verificado) contra datos mockeados de `UserState`:
   - Usuario `role !== 'student'`: ve el hero de bloqueo A, sin roadmap.
   - Usuario con email sin verificar: ve el hero de bloqueo B, sin roadmap.
   - Usuario elegible sin solicitud previa: ve el shell de dos columnas con el formulario nuevo en el panel derecho, roadmap en paso 1.
   - Completar y enviar el formulario: pasa a mostrar "tu solicitud está en revisión", roadmap en paso 2, sin recargar la página.
   - (Si el backend ya soporta aprobar/rechazar manualmente) aprobar la solicitud y clickear "Actualizar mi sesión": el usuario pasa a ver el hero de "ya sos profesor" sin recargar la página.
   - (Si el backend lo soporta) rechazar la solicitud: el panel derecho muestra el motivo y "Volver a solicitar" reabre el formulario vacío.

## Acceptance criteria

- [ ] `role !== 'student'` muestra el hero de bloqueo A (SVG + copy), sin el panel oscuro de roadmap.
- [ ] `!user.isEmailVerified` muestra el hero de bloqueo B (SVG + copy + `app-email-verification-banner`), sin el panel oscuro de roadmap.
- [ ] Mientras `teacherRequestState.isLoading()` es `true`, se muestra sólo `<app-loader />`.
- [ ] Usuario elegible sin solicitud previa ve el shell de dos columnas: panel izquierdo con título, badge de email verificado y roadmap de 4 pasos (paso 1 resaltado); panel derecho con el formulario nuevo.
- [ ] El formulario tiene exactamente los campos de la tabla de Data model, agrupados en "1. Sobre vos" / "2. Tu primer curso", y ya no existen `experience`, `motivation` ni `courseIdea` en ningún lado del código.
- [ ] `categoryIds` se selecciona desde `app-category-multiselect-dropdown` (dropdown + checklist), no desde pills inline.
- [ ] `aboutYou` muestra contador `{{ length }}/500` en vivo y no deja enviar con menos de 50 caracteres.
- [ ] Al enviar el formulario con éxito, sin recargar la página, el panel derecho pasa a "tu solicitud está en revisión" y el roadmap resalta el paso 2.
- [ ] Estado `approved`: panel derecho muestra mensaje de aprobación + botón "Actualizar mi sesión" que llama a `authService.checkStatusResource.reload()`.
- [ ] Estado `rejected`: panel derecho muestra `rejectionReason` y un botón "Volver a solicitar" que reabre el formulario vacío (sin precargar respuestas anteriores).
- [ ] El checkbox de términos no navega a ninguna ruta (no hay página de términos en el repo).
- [ ] `TeacherRequestState` ya no es un stub — expone `myRequest`, `isLoading` y `submitRequest` realmente conectados al servicio.

## Decisiones tomadas y descartadas

- **Sí:** separar los estados en dos familias de layout (hero de bloqueo vs. shell de dos columnas) en vez de forzar los 6 estados dentro del mismo panel oscuro con roadmap — decisión explícita del usuario tras comparar alternativas (toast, hero, card actual) en un artifact de comparación: un toast para "ya profesor"/"email no verificado" se sentía como un mensaje de error, no como información neutra.
- **Sí:** mantener `categoryIds` como selección múltiple (no colapsar a `categoryId` único) aunque el mock muestre un `<select>` de apariencia singular — decisión explícita del usuario; se resuelve visualmente con un dropdown-checklist nuevo en vez de reinterpretar el mock literal.
- **Sí:** fusionar `experience` + `motivation` en un único campo `aboutYou` con mínimo de 50 caracteres — mantiene el piso de calidad que ya existía en `experience`, aunque el mock sólo muestre el máximo (500) en el contador visible.
- **Sí:** asumir que el backend se actualiza para aceptar el DTO nuevo, en vez de mapear los campos nuevos de vuelta a la forma vieja (`categoryIds`, `experience`+`motivation`, `courseIdea`) — decisión explícita del usuario; evita cargar la UI nueva con lógica de traducción hacia un contrato que de todos modos hay que cambiar en algún momento.
- **Sí:** wirear `TeacherRequestState` por completo (pending/approved/rejected) en la misma spec, no sólo redibujar el formulario — decisión explícita del usuario ("refactor completo").
- **Sí:** el botón de `approved` dispara `authService.checkStatusResource.reload()` en vez de abrir una infraestructura de tiempo real — decisión explícita del usuario para no sobre-construir ahora; queda documentado como posible mejora futura (ver Riesgos), no como deuda a resolver ya.
- **No:** precargar las respuestas de una solicitud rechazada al reabrir el formulario — decisión explícita del usuario, "Volver a solicitar" arranca en blanco.
- **No:** construir una página de términos para profesores — no existe ese tipo de página en ningún flujo del repo hoy; el link queda sin destino.

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| El backend (`seminario-angular-backend`) no tiene todavía los campos nuevos (`aboutYou`, `experienceLevel`, `courseTitle`, `courseSummary`) — sin ese cambio, crear/leer una solicitud real va a fallar o devolver `undefined` en esos campos. | Documentado como cambio de contrato pendiente en el backend (fuera de este workspace). Los estados que no dependen del backend (ya profesor, email no verificado, formulario vacío) se pueden verificar igual sin él. |
| Sin mecanismo en tiempo real, un usuario aprobado que no clickea "Actualizar mi sesión" sigue viendo el estado `approved` indefinidamente aunque ya sea profesor. | Aceptado como límite conocido de esta spec (ver Decisiones) — mejora futura si se vuelve un problema real en uso. |
| `teacher-request-status.component` cambia de forma (de card standalone a sólo-contenido-del-panel-derecho) — si algún otro lugar de la app lo usa standalone hoy, se rompe. | Se verificó que `become-teacher-page.component` es el único consumidor actual (estaba comentado, sin otros usos en el repo). |

## Qué **no** está en esta spec

- Página de términos para profesores / política de privacidad.
- Cambios al header compartido.
- Actualización real del backend (`seminario-angular-backend`) al nuevo contrato — sólo se documenta acá.
- Tiempo real (websocket/polling) para enterarse de cambios de estado sin acción manual del usuario.
- Precarga de respuestas previas al reintentar tras un rechazo.
- `category-multiselect-dropdown` como componente reusable fuera de `teacher-request/`.

Cada uno de estos, si se necesita, va en su propia spec.
