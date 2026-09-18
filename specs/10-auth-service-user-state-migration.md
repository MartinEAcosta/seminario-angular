# SPEC 10 — Migración del estado de sesión de AuthService a UserState

> **Status:** Aprobado
> **Depends on:** Ninguna (refactor transversal sobre código ya existente)
> **Date:** 2026-09-18
> **Objective:** Mover la propiedad de las señales de sesión (`user`, `id`, `token`, `authStatus`) de `AuthService` a `UserState`, dejando `AuthService` dedicado exclusivamente a peticiones HTTP y a orquestar escrituras sobre `UserState`, para eliminar el riesgo de dependencia circular entre `AuthService` y los servicios/estados que ya dependen de `UserState` (como `FileService`).

## Por qué existe esta spec

`AuthService` hoy es dueño de las señales `_user`, `_id`, `_token` y `_authStatus`, y las expone vía `user()`, `id()`, `token()` y `authStatus()` a ~15 consumidores (guards, interceptor, header, dropdown de perfil, course-card, course-resolver, form-lesson, course-step-data, enrollment-state, email-verification-banner, form-register, user-profile-page, list-of-content). Al mismo tiempo, `AuthService` inyecta `FileService` (para subir el avatar en `updateUser`), y `FileService` ya inyecta `UserState` (para `setTempAvatar`/`setAvatarFile`). Si en el futuro `UserState` necesitara leer algo de `AuthService` — como ya intenta hacer la clase base no usada `State<T>` (`src/app/shared/state/state.ts`), que inyecta `AuthService` para resetear estado al deslogueo — se cerraría el ciclo `AuthService → FileService → UserState → AuthService`, un error de DI (`NG0200`) en tiempo de arranque.

Mudar la propiedad de las 4 señales de sesión a `UserState` deja una sola dirección de dependencia posible (`AuthService → UserState`, nunca al revés) y un solo dueño del estado de sesión, en línea con el patrón ya establecido para avatar/formulario de perfil en `UserState`.

## Scope

**In:**

- `UserState` (`src/app/user/state/user-state.ts`) pasa a ser dueño de las señales de sesión: `user`, `id` (derivada de `user()?.id`), `token` y `authStatus`, con el mismo comportamiento que tienen hoy en `AuthService`.
- `UserState` gana los métodos `setUser(user: User | null)`, `setToken(token: string | null)`, `setAuthStatus(status: AuthStatus)`, `setEmailVerified(verified: boolean)` y `logout()` (reset completo de sesión + reutiliza el `reset()` existente de avatar/formulario).
- `UserState.setToken` sincroniza `localStorage['x-token']` (`setItem` si hay token, `removeItem` si es `null`) — mismo criterio explícito que ya usan `setTempAvatar`/`setAvatarFile`, sin `effect()`.
- Nuevo tipo exportado `AuthStatus` en `src/app/auth/models/auth.interfaces.ts` (hoy es un `type` privado dentro de `auth.service.ts`), consumido por `UserState` vía `@interfaces/auth.interfaces`.
- `AuthService` deja de declarar `_user`/`_id`/`_token`/`_authStatus` y los computed `user`/`id`/`token`/`authStatus`. Inyecta `UserState` y delega en sus setters desde `handleAuthSuccess`, `handleAuthError`, `logoutUser`, `confirmEmailVerification` y `checkStatus`.
- `AuthService.checkStatusResource` (el `rxResource` que dispara `checkStatus()` al inyectarse por primera vez) y el `effect()` del constructor que navega a `/` cuando `authStatus` pasa de `authenticated` a `not-authenticated` se quedan en `AuthService`, pero el segundo lee `this.userState.authStatus()`.
- Los ~15 archivos consumidores migran sus lecturas de `authService.user()/.id()/.token()/.authStatus()` a `userState.*`. Donde el archivo solo leía estado (sin llamar acciones HTTP de `AuthService`), se elimina el import de `AuthService` por completo:
  - `src/app/auth/interceptors/auth.interceptor.ts` — `inject(AuthService).token()` → `inject(UserState).token()`.
  - `src/app/auth/guards/authenticated.guard.ts`, `src/app/auth/guards/not-authenticated.guard.ts` — `toObservable(authService.authStatus)` → `toObservable(userState.authStatus)`.
  - `src/app/auth/guards/validate.permission.guard.ts` — `authService.user()` → `userState.user()`.
  - `src/app/shared/components/layout/header/header.component.ts`/`.html` — `authService` → `userState` (sin otros usos de `AuthService` en el componente).
  - `src/app/course/components/course-card/course-card.component.ts`/`.html` — `authService.user()?.id` → `userState.user()?.id` (sin otros usos).
  - `src/app/course/resolver/course-resolver.ts` — `authService.id()` → `userState.id()` (sin otros usos).
  - `src/app/lesson/components/form-lesson/form-lesson.component.ts` — `authService.id()` → `userState.id()` (sin otros usos).
  - `src/app/course/components/form-course/steps/course-step-data/course-step-data.component.ts` — 2 usos de `authService.id()` → `userState.id()` (sin otros usos).
  - `src/app/enrollment/state/enrollment-state.ts` — `authService.authStatus()`/`authService.user()!.id` → `userState.*` (sin otros usos).
  - `src/app/lesson/components/list-of-content/list-of-content.component.ts` — `authService.user()` → `userState.user()` (sin otros usos).
  - `src/app/shared/state/state.ts` — clase base no usada actualmente por ningún feature state (confirmado: ningún archivo hace `extends State`), pero sigue compilando como parte del proyecto. Se actualiza su import de `AuthService` a `UserState` y `this.authService.user()` a `this.userState.user()` únicamente para no romper `ng build`; no se agrega ningún nuevo consumidor de esta clase.
  - `src/app/user/components/user-profile-dropdown/user-profile-dropdown.component.ts`/`.html` — lecturas (`user()`, `isEmailVerified`, `role`) migran a `userState`; se mantiene `authService` inyectado solo para `logoutUser()`.
  - `src/app/auth/components/email-verification-banner/email-verification-banner.component.ts`/`.html` — lectura `authService.user()?.isEmailVerified` → `userState.user()?.isEmailVerified`; se mantiene `authService` para `sendVerificationEmail()`.
  - `src/app/auth/components/form-register/form-register.component.ts` — lectura `authService.authStatus()` → `userState.authStatus()`; se mantiene `authService` para `registerUser()`.
  - `src/app/auth/pages/user-profile-page/user-profile-page.component.ts`/`.html` — lecturas `authService.user()` → `userState.user()` (`userState` ya está inyectado en este componente); se mantiene `authService` para `updateUser()` y `sendVerificationEmail()`.

**Sin cambios funcionales:** `AuthMapper.mapResponseToUser`/`mapFormToUserDTO`, `CartService.clearCart()` (se sigue llamando desde `AuthService.logoutUser()`), el comportamiento de `localStorage.clear()` completo dentro de `logoutUser()`, `FileService` (ya inyecta `UserState`, no se toca), cualquier endpoint HTTP o payload, `LessonFormState`/`CourseFormState`.

**Out of scope (para futuras specs):**

- Corregir que `logoutUser()` haga `localStorage.clear()` completo (borra también el carrito, documentado como bug conocido en el comentario de `cart.service.ts`) en vez de limpiar solo `x-token` — decisión explícita del usuario: se documenta como riesgo conocido, no se toca en esta spec.
- Eliminar la redundancia de `AuthMapper.mapResponseToUser` (hace un mapeo 1:1 porque `AuthResponse.user` ya es de tipo `User`) — preexistente, fuera de alcance.
- Tests automatizados nuevos (se corre la suite existente como parte de la verificación, no se agregan casos).
- Cambios a `variables.scss`, rutas (`app.routes.ts`) o al backend.

## Data model

```ts
// src/app/auth/models/auth.interfaces.ts (nuevo export)
export type AuthStatus = 'checking' | 'authenticated' | 'not-authenticated';
```

```ts
// src/app/user/state/user-state.ts (señales y métodos nuevos, junto a los ya existentes avatarFile/tempAvatar/profileForm)
private _user = signal<User | null>(null);
private _token = signal<string | null>(localStorage.getItem('x-token'));
private _authStatus = signal<AuthStatus>('checking');

user = computed(this._user);
token = computed(this._token);
id = computed(() => this._user()?.id ?? null);
authStatus = computed<AuthStatus>(() => {
  if (this._authStatus() === 'checking') return 'checking';
  return this._user() ? 'authenticated' : 'not-authenticated';
});

setUser(user: User | null): void { this._user.set(user); }

setToken(token: string | null): void {
  this._token.set(token);
  if (token) localStorage.setItem('x-token', token);
  else localStorage.removeItem('x-token');
}

setAuthStatus(status: AuthStatus): void { this._authStatus.set(status); }

setEmailVerified(verified: boolean): void {
  this._user.update(user => user ? { ...user, isEmailVerified: verified } : user);
}

logout(): void {
  this.reset(); // ya existente: limpia profileForm, avatarFile, tempAvatar
  this.setUser(null);
  this.setToken(null);
  this.setAuthStatus('not-authenticated');
}
```

`id` deja de ser una señal independiente (`_id`) — se deriva de `user()?.id`, eliminando una fuente de estado duplicada que hoy se setea a mano en `handleAuthSuccess`.

## Implementation plan

1. **`auth.interfaces.ts`**: agregar `export type AuthStatus = 'checking' | 'authenticated' | 'not-authenticated';`. Verificación: compila, sin consumidores todavía.
2. **`user-state.ts`**: agregar las señales `_user`/`_token`/`_authStatus`, los computed `user`/`token`/`id`/`authStatus`, y los métodos `setUser`/`setToken`/`setAuthStatus`/`setEmailVerified`/`logout` del data model. Verificación: compila, `UserState` no depende de `AuthService`.
3. **`auth.service.ts`**: inyectar `UserState`; eliminar `_user`/`_id`/`_token`/`_authStatus` y los computed `user`/`id`/`token`/`authStatus`; reescribir `handleAuthSuccess` (llama `userState.setUser(authResponse.user)`, `userState.setToken(authResponse.token)`, `userState.setAuthStatus('authenticated')`, ya no toca `localStorage` directo), `handleAuthError` (sigue llamando `logoutUser()`), `logoutUser` (llama `userState.logout()`, mantiene `cartService.clearCart()` y `localStorage.clear()`), `confirmEmailVerification` (llama `userState.setEmailVerified(true)` en vez de tocar la señal), `updateUser` (usa `this.userState.user()?.id` en vez de `this.user()?.id`), y el `effect()` del constructor (lee `this.userState.authStatus()`). Verificación: compila con errores esperados en los ~15 consumidores (se resuelven en los pasos siguientes).
4. **`auth.interceptor.ts`**: `inject(AuthService).token()` → `inject(UserState).token()`, ajustar import. Verificación: compila.
5. **Guards** (`authenticated.guard.ts`, `not-authenticated.guard.ts`, `validate.permission.guard.ts`): reemplazar `inject(AuthService)` por `inject(UserState)` y ajustar `authService.authStatus`/`authService.user()` a `userState.*`. Verificación: compila.
6. **Componentes solo-lectura** (`header.component.ts`, `course-card.component.ts`, `course-resolver.ts`, `form-lesson.component.ts`, `course-step-data.component.ts`, `enrollment-state.ts`, `list-of-content.component.ts`): reemplazar el import y la inyección de `AuthService` por `UserState`, ajustar cada `authService.xxx()` a `userState.xxx()` en `.ts` y sus `.html` correspondientes (`header.component.html`, `course-card.component.html`). Verificación: compila cada uno.
7. **Componentes mixtos** (`user-profile-dropdown.component.ts`/`.html`, `email-verification-banner.component.ts`/`.html`, `form-register.component.ts`): mantener `authService` inyectado para sus acciones (`logoutUser`, `sendVerificationEmail`, `registerUser`), agregar/usar `inject(UserState)` para las lecturas, ajustar templates. Verificación: compila cada uno.
8. **`user-profile-page.component.ts`/`.html`**: `userState` ya está inyectado; reemplazar los 2 usos de `authService.user()` (constructor y `isEmailVerified`) y el uso en el `.html` (`authService.user()?.email`) por `userState.*`. `authService` se mantiene para `updateUser`/`sendVerificationEmail`. Verificación: compila.
9. **`shared/state/state.ts`**: reemplazar `Inject(AuthService)` por `inject(UserState)` (nota: hoy usa `Inject` con mayúscula, que no es el patrón de inyección correcto en un campo de clase — se corrige a `inject()` minúscula de paso, ya que de otra forma ni siquiera compila contra el nuevo `UserState`) y `this.authService.user()` por `this.userState.user()`. Verificación: compila; sigue sin tener ningún `extends State` en el proyecto.
10. **QA manual**: `ng build` sin errores. Login/registro siguen funcionando y navegan igual que antes. Refrescar la página con sesión iniciada mantiene la sesión (`checkStatus` sigue funcionando vía `x-token` en `localStorage`). Cerrar sesión limpia el dropdown, redirige a `/`, y el guard de rutas autenticadas expulsa correctamente. Header, dropdown de perfil, `course-card`, `/profile`, verificación de email, crear/editar curso (permiso por `id_owner`), crear/editar lección, y el listado de inscripciones (`enrollment-state`) muestran el usuario/estado correctos. Sin errores de consola en desktop ni mobile (`<48rem`).

## Acceptance criteria

- [ ] `AuthService` ya no declara señales propias de sesión (`_user`, `_id`, `_token`, `_authStatus`) ni los computed `user`/`id`/`token`/`authStatus`.
- [ ] `UserState` expone `user`, `id`, `token` y `authStatus` con el mismo comportamiento observable que tenían en `AuthService` antes de la spec.
- [ ] Ningún archivo del proyecto (fuera de `auth.service.ts` mismo) importa `AuthService` únicamente para leer `user()`/`id()`/`token()`/`authStatus()` — esos casos usan `UserState`.
- [ ] Los componentes que además disparan acciones HTTP (`logoutUser`, `registerUser`, `updateUser`, `sendVerificationEmail`) siguen inyectando `AuthService` para esas llamadas.
- [ ] Login, registro, refresco de sesión (`checkStatus`/`x-token` en `localStorage`), logout, actualización de perfil (incluye subida de avatar) y verificación de email funcionan igual que antes de la spec.
- [ ] Los guards (`AuthenticatedGuard`, `NotAuthenticatedGuard`, `ValidatePermissionGuard`) y el `authInterceptor` siguen funcionando igual (rutas protegidas, header `Authorization`).
- [ ] `shared/state/state.ts` compila contra `UserState` sin romper `ng build`, aunque siga sin tener ningún consumidor real.
- [ ] `ng build` compila sin errores.
- [ ] No hay errores de consola en desktop ni en mobile (`<48rem`).

## Decisions

- **Sí:** mover las 4 señales de sesión juntas (`user`, `id`, `token`, `authStatus`) en vez de solo algunas — decisión explícita del usuario tras aclarar el riesgo de fan-out (dos fuentes de verdad para el mismo concepto de sesión si se dividen).
- **Sí:** migrar los ~15 call-sites a leer directo de `UserState` en vez de mantener getters de paso en `AuthService` — decisión explícita del usuario; deja a `UserState` como única fuente de verdad real, sin capa de indirección.
- **Sí:** `id` pasa a ser una señal derivada (`computed(() => user()?.id ?? null)`) en vez de una señal independiente — elimina una duplicación de estado que hoy se setea a mano en paralelo a `_user` sin necesidad.
- **Sí:** la persistencia de `x-token` en `localStorage` vive en `UserState.setToken`, con `setItem`/`removeItem` explícitos dentro del setter (mismo patrón imperativo que ya usan `setTempAvatar`/`setAvatarFile`) — decisión explícita del usuario; se descarta un `effect()` de persistencia (estilo `CartService`) para no introducir un mecanismo nuevo cuando el existente ya alcanza.
- **No:** tocar el `localStorage.clear()` completo de `logoutUser()` (que hoy también borra el carrito) — decisión explícita del usuario; queda documentado como riesgo conocido, no como bug a resolver en esta spec.
- **Sí:** actualizar `shared/state/state.ts` para que compile contra `UserState` aunque hoy no lo extienda ningún feature state — es la única forma de no romper `ng build` al quitar los computed de `AuthService`; no se le agrega ningún consumidor nuevo.
- **No:** eliminar `shared/state/state.ts` por ser código sin uso — no fue pedido explícitamente; su limpieza (o adopción real) es una decisión aparte.
- **No:** corregir la redundancia de `AuthMapper.mapResponseToUser` — preexistente y fuera del objetivo de esta spec.

## Identified risks

| Riesgo | Mitigación |
| --- | --- |
| El fan-out de este refactor toca ~17 archivos (`AuthService`, `UserState`, 15 consumidores); un import mal ajustado en cualquiera de ellos rompe `ng build` completo. | El plan de implementación agrupa los cambios en pasos chicos y verificables (guards, solo-lectura, mixtos, `state.ts`), cada uno compilable antes de pasar al siguiente. |
| `shared/state/state.ts` usa `Inject(AuthService)` (con mayúscula) en vez de `inject()` — no es el patrón de inyección correcto para un campo de clase fuera de un contexto de inyección; hoy "funciona" solo porque la clase nunca se instancia (`extends State` no existe en el proyecto). Al tocar ese archivo para que compile contra `UserState`, este bug preexistente queda expuesto. | Paso 9 corrige `Inject` → `inject` de paso, ya que de otra forma ni compila; no se cambia ningún otro comportamiento de esa clase no usada. |
| `logoutUser()` sigue haciendo `localStorage.clear()` completo — si algo nuevo empieza a guardar datos propios en `localStorage` fuera del carrito, se pierde también en cada logout. | Riesgo preexistente, no introducido por esta spec; queda documentado, no se mitiga acá por decisión explícita del usuario. |

## Lo que **no** entra en esta spec

- Corregir `localStorage.clear()` completo en `logoutUser()` para que solo borre `x-token`.
- Adoptar `shared/state/state.ts` como clase base real de algún feature state.
- Eliminar la redundancia de `AuthMapper.mapResponseToUser`.
- Tests automatizados nuevos.
- Cambios a `variables.scss`, `app.routes.ts` o al backend.

Cada uno de esos, si aterriza, va en su propia spec.
