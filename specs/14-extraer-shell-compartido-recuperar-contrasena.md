# SPEC 14 — Shell compartido para el layout de login/register y el de recuperar contraseña

> **Status:** Draft
> **Depends on:** SPEC 13 (forgot-password)
> **Date:** 2026-11-13
> **Objective:** Agrupar `forgot-password`/`reset-password/:token` bajo un layout propio (mismo patrón de ruta que `AuthLayoutComponent`) y extraer a un partial SCSS compartido el shell visual (contenedor, panel oscuro, separador, panel blanco, roadmap) que hoy está triplicado byte a byte entre `auth-layout.component.scss`, `forgot-password-page.component.scss` y `reset-password-page.component.scss`.

## Por qué existe esta spec

La spec 13 construyó `forgot-password-page` y `reset-password-page` como páginas standalone, cada una con su propia copia completa del shell de dos columnas (`.container-auth`, `.panel-commercial`, `.headline`, `.accent`, `.subtitle`, `.steps`/`.step*`, `.divider-ticket`, `.panel-auth`, el mixin `header-overlay-patch` y los dos breakpoints) — una decisión deliberada en ese momento para no acoplar una feature nueva a `AuthLayoutComponent`, cuyo panel oscuro y tabs son específicos de login/register. El resultado funciona, pero dejó ese bloque de CSS duplicado tres veces (una por archivo), y las dos rutas nuevas viven sueltas como hermanas en `auth.routes.ts` en vez de agrupadas bajo un layout propio como login/register lo están bajo `AuthLayoutComponent`.

Esta spec no cambia ningún pixel visible: es una extracción estructural. El contenido (roadmap, headlines, textos) sigue siendo responsabilidad de cada página — lo único que se comparte es el CSS del shell y el agrupamiento de rutas.

## Scope

**In:**

- Nuevo partial `src/app/auth/auth-shell.scss`: extrae, textual y sin cambios de valores, el bloque hoy triplicado — mixin `header-overlay-patch`, `$auth-ink`, `.container-auth`, `.panel-commercial`, `.headline`, `.accent`, `.subtitle`, `.steps`, `.steps::before`, `.step`, `.step-marker`, `.step-current .step-marker`, `.step-done .step-marker` (la variante con check que `reset-password-page` ya usa y `auth-layout`/`forgot-password-page` no necesitan pero no rompe nada que esté ahí sin uso), `.step-body h3`, `.step-body p`, `.divider-ticket`, `.panel-auth`, y los dos bloques `bp-down('laptop')`/`bp-down('md')` que tocan esos selectores. `.panel-auth` se extrae con `justify-content: flex-start`, que es el valor que las tres páginas comparten hoy. Ver Decisiones.
- `auth-layout.component.scss`: pasa a `@use '../../auth-shell' as shell;` (o el nombre de uso que corresponda) y elimina las reglas ahora compartidas. Lo que queda local: `.auth-tabs`, `.auth-tab`, `.auth-tab.active`, el bloque de `prefers-reduced-motion` de los tabs.
- `forgot-password-page.component.scss` y `reset-password-page.component.scss`: mismo `@use` del partial, eliminan las reglas compartidas. Lo que queda local en cada uno: `.link-back`, `.link-back:hover`, y una regla propia de una línea `.panel-auth{ justify-content: center; }` (la página sigue centrando verticalmente su formulario corto; ver Decisiones). `reset-password-page.component.scss` además conserva `.field-error`, `.invalid-link`, `.invalid-link .title-form`, `.invalid-link .btn-sumbit` — nada de eso es shell, no se toca.
- Nuevo `PasswordRecoveryLayoutComponent` (`src/app/auth/layout/password-recovery-layout/password-recovery-layout.component.ts|html|scss`): wrapper delgado, **sin shell visual propio** — su template es `<router-outlet /><app-modal-error-message />`, nada más. Existe únicamente para agrupar las dos rutas bajo un mismo padre y declarar `canMatch: [NotAuthenticatedGuard]` una sola vez en vez de en cada hija.
- `auth.routes.ts`: se agrega un nuevo bloque `{ path: '', component: PasswordRecoveryLayoutComponent, canMatch: [NotAuthenticatedGuard], children: [ 'forgot-password', 'reset-password/:token' ] }`, mismo patrón de `path:''` sin segmento propio que usa `AuthLayoutComponent` — las URLs finales no cambian (`/auth/forgot-password`, `/auth/reset-password/:token`). Este bloque nuevo se ubica **antes** del bloque de `AuthLayoutComponent` en el array, por la misma razón ya documentada en el código hoy: el `'**' -> redirectTo: 'login'` de los children de `AuthLayoutComponent` intercepta cualquier segmento no listado ahí, así que cualquier bloque `path:''` hermano tiene que probarse primero. Las dos rutas hijas (`forgot-password`, `reset-password/:token`) dejan de declarar su propio `canMatch` — ya lo heredan del padre.

**Out of scope (para otra spec):**

- Tocar el contenido de login/register o los tabs de `AuthLayoutComponent`.
- Compartir algo entre este `auth-shell.scss` y el shell de dos columnas de `become-teacher-page` — es un patrón arquitectónico distinto y adrede independiente (ver CLAUDE.md).
- Resolver los hallazgos pendientes del finish-review de la spec 13 (capturas mobile, textura del panel oscuro) — se trackean aparte, no son parte de este refactor.
- Mover el roadmap (markup ni texto) a un componente o servicio compartido. Hoy el texto de los 3 pasos es idéntico en ambas páginas por casualidad; esta spec no lo explota ni lo fija como contrato — cada página sigue con su propio `<ol class="steps">`.

## Data model

Esta spec no introduce datos nuevos. Es una reorganización de CSS y de árbol de rutas sobre el modelo ya definido en la spec 13.

## Implementation plan

1. Crear `src/app/auth/auth-shell.scss` copiando el bloque de shell tal cual existe hoy en `auth-layout.component.scss` (fuente de verdad: es el que ya está aprobado/shippeado), agregando `.step-done .step-marker` (hoy solo en `reset-password-page.component.scss`). Nada lo consume todavía — `ng build` debe seguir pasando igual que antes.
2. Actualizar `auth-layout.component.scss` para usar el partial y borrar las reglas duplicadas. Test manual: `/auth/login` y `/auth/register` se ven pixel-igual que antes del cambio.
3. Crear `PasswordRecoveryLayoutComponent` (ts/html/scss) como wrapper delgado (`<router-outlet /><app-modal-error-message />`).
4. Actualizar `auth.routes.ts`: nidar `forgot-password` y `reset-password/:token` bajo el nuevo layout, moverlo antes del bloque de `AuthLayoutComponent`, quitar el `canMatch` de las dos rutas hijas.
5. Actualizar `forgot-password-page.component.scss` y `reset-password-page.component.scss` para usar el partial y borrar las reglas duplicadas, dejando solo lo propio de cada una (`.link-back`, el override de `justify-content`, y en el caso de reset también `.field-error`/`.invalid-link*`).
6. Pase de regresión manual: `/auth/login`, `/auth/register`, `/auth/forgot-password`, `/auth/reset-password/:token` — las cuatro rutas se ven pixel-igual que antes de esta spec, y `ng build` no agrega errores ni warnings nuevos.

## Acceptance criteria

- [ ] `/auth/login` y `/auth/register` se ven idénticos a como se veían antes de esta spec.
- [ ] `/auth/forgot-password` y `/auth/reset-password/:token` se ven idénticos a como se veían antes de esta spec.
- [ ] `auth-layout.component.scss` ya no declara `.container-auth`, `.panel-commercial`, `.headline`, `.accent`, `.subtitle`, `.steps*`, `.divider-ticket` ni `.panel-auth` — solo le quedan `.auth-tabs`/`.auth-tab*`.
- [ ] `forgot-password-page.component.scss` y `reset-password-page.component.scss` ya no duplican esas mismas reglas entre sí ni contra `auth-layout.component.scss`.
- [ ] `auth.routes.ts` tiene un único `canMatch: [NotAuthenticatedGuard]` cubriendo `forgot-password` y `reset-password/:token` (en el padre nuevo), no uno por ruta hija.
- [ ] `ng build` compila sin errores ni warnings nuevos atribuibles a este cambio.
- [ ] Navegar directo a `/auth/forgot-password` o `/auth/reset-password/algun-token` (sin pasar por un link interno) sigue resolviendo a la página correcta después del reordenamiento de rutas.

## Decisiones

- **Sí:** extraer el bloque completo (shell + reglas de roadmap: headline/accent/subtitle/steps), no solo contenedor+colores. Es lo que de verdad está triplicado hoy — una extracción más chica dejaría la mayor parte de la duplicación real sin resolver.
- **No:** mover el *contenido* del roadmap (texto de los 3 pasos, qué paso está activo) a un componente o servicio compartido. Sigue siendo decisión de cada página — es lo único que las tres (`auth-layout`, `forgot-password-page`, `reset-password-page`) necesitan poder variar independientemente.
- **Sí, con una excepción:** `.panel-auth` se extrae con el valor original de `auth-layout.component.scss` (sin `justify-content`). Si se extrajera con `justify-content: center` (el valor que las páginas de recuperación le agregaron), `/auth/login` y `/auth/register` empezarían a centrar verticalmente su formulario sin que nadie lo haya pedido — una regresión visual silenciosa en código ya aprobado. Cada página de recuperación agrega esa única línea localmente, igual que hoy.
- **Sí:** `PasswordRecoveryLayoutComponent` sin shell propio (solo `router-outlet` + `modal-error-message`). No hay contenido visual que de verdad sea compartido entre sus dos hijas para que este componente lo posea — ver el punto anterior sobre el roadmap. Su único trabajo es agrupar rutas y centralizar el guard.
- **No:** agregarle a este componente un segmento de URL propio (ej. `/auth/recover/...`). Mismo patrón que `AuthLayoutComponent`: `path:''` sin consumir segmento, para no romper las URLs ya shippeadas en la spec 13.

## Risks

| Riesgo | Mitigación |
| --- | --- |
| Reordenar `auth.routes.ts` vuelve a introducir el bug de wildcard que la spec 13 ya pisó una vez (el `'**' -> login` de `AuthLayoutComponent` interceptando rutas hermanas) | El nuevo bloque de `PasswordRecoveryLayoutComponent` se ubica explícitamente antes del bloque de `AuthLayoutComponent` en el array, documentado con el mismo comentario que ya existe en el código de la spec 13. |
| El partial compartido termina fijando sin querer un valor que una de las tres páginas necesitaba distinto (como pasaría con `justify-content` en `.panel-auth` si no se lo excluye) | Ver Decisiones: `.panel-auth` se extrae con el valor original, cada consumidor que necesite algo distinto lo agrega en una línea local después de importar el partial. |

## What is **not** in this spec

- Contenido o tabs de login/register.
- Shell compartido con `become-teacher-page` u otras features de dos columnas.
- Hallazgos de finish-review de la spec 13 (mobile, textura).
- Componente o servicio compartido para el roadmap.

Cada uno de esos, si se necesita, va en su propia spec.
