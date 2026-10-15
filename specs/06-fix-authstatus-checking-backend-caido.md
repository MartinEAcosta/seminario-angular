# SPEC 06 — Fix: `authStatus` trabado en `'checking'` y token viejo cuando falla el renew por backend caído

> **Status:** Aprobado
> **Depends on:** —
> **Date:** 2026-10-15
> **Objective:** Corregir `AuthService.handleAuthError` para que un error de red (ej. backend caído) al hacer `/auth/renew` no crashee con una excepción no capturada ni deje `authStatus` trabado para siempre en `'checking'`, sin borrar el token viejo de `localStorage`.

## Por qué existe esta spec

`AuthService.checkStatus()` llama a `/auth/renew` al inyectar el servicio (vía `checkStatusResource`). Si el backend está caído, el `catchError` delega en `handleAuthError(error.error)`. Cuando no hay respuesta del backend, `error.error` es `null` o un objeto sin `.status` (no es el body `ErrorResponse {ok,status,error}` que el backend devuelve cuando sí responde). `handleAuthError` accede a `error.status` sin optional chaining, lo que puede lanzar una excepción no capturada, y en el mejor caso no matchea ni `401`/`403` ni `400`, así que no hace nada: no llama a `logoutUser()` ni actualiza `authStatus`.

Como `UserState._authStatus` arranca en `'checking'` y solo cambia en `handleAuthSuccess` o `logout()`, si ninguno de los dos se dispara el signal queda trabado en `'checking'` para siempre. Los guards `AuthenticatedGuard`/`NotAuthenticatedGuard` filtran explícitamente `authStatus !== 'checking'` antes de resolver, así que quedan colgados esperando una transición que nunca llega. El resultado reportado: token viejo que nunca se limpia, errores en consola, y la app sin poder decidir si hay sesión o no.

## Scope

**In:**

- `src/app/auth/services/auth.service.ts`, método `handleAuthError`:
  - Usar `error?.status` (optional chaining) en vez de `error.status`, para no lanzar una excepción no capturada cuando `error` es `null`/no tiene esa forma (caso de falla de red sin body).
  - Agregar una rama `else if` que, cuando `this.userState.authStatus() === 'checking'` (el chequeo inicial nunca pudo resolverse — típicamente backend inalcanzable, o cualquier otro status que no sea `401`/`403`/`400`), llama a `this.userState.setAuthStatus('not-authenticated')`. No se toca el token ni `localStorage`, y no se llama a `logoutUser()`.
  - El fix queda centralizado en `handleAuthError`, por lo que cubre automáticamente a todos los métodos que lo usan como `catchError` (`checkStatus`, `exchangeCode`, `loginUser`, `registerUser`, `updateUser`) sin tocar esos call sites.

**Out of scope:**

- Agregar retry/backoff automático del renew — el usuario recarga manualmente cuando el backend vuelva a estar arriba.
- Agregar toast o cualquier feedback visual nuevo cuando falla por backend inalcanzable — es un chequeo de fondo, silencioso.
- Agregar un valor nuevo a `AuthStatus` (ej. `'offline'`) para distinguir "sin sesión" de "no se pudo verificar por red" — se reusa `'not-authenticated'`.
- Tocar los `catchError` de `checkStatus`, `exchangeCode`, `loginUser`, `registerUser` o `updateUser` — siguen pasando el mismo valor a `handleAuthError` que hoy.
- El bug preexistente y separado en `registerUser`: en el caso `400` hace `this.uiService.showToastMessage(error.error)` pasando el `HttpErrorResponse` completo (no el body `{error: string}` como en los demás métodos), lo que probablemente muestra un objeto en vez del mensaje. No reportado por el usuario, no relacionado al problema de backend caído — queda para una spec futura si se decide atacarlo.
- Cambios en `UserState`, guards, componentes o `AuthStatus` (tipo).

## Data model

Sin cambios — no se agregan ni modifican estructuras. `AuthStatus` sigue siendo `'checking' | 'authenticated' | 'not-authenticated'`.

## Implementation plan

1. En `AuthService.handleAuthError`, cambiar `error.status` por `error?.status` en las dos comparaciones existentes (`401`/`403` y `400`), para que un `error` `null`/sin esa forma no lance excepción.
2. Agregar la rama `else if ( this.userState.authStatus() === 'checking' ) { this.userState.setAuthStatus('not-authenticated'); }` después de las ramas de `401`/`403` y `400` existentes, antes del `return of(false)`.
3. Verificación: `ng build` compila sin errores de TypeScript.
4. Verificación manual: con el backend apagado y un `x-token` viejo ya guardado en `localStorage`, abrir la app. Confirmar que no aparece ninguna excepción no capturada en consola al fallar `/auth/renew`, que `UserState.authStatus()` pasa de `'checking'` a `'not-authenticated'` (se puede loguear temporalmente o inspeccionar con Angular DevTools), y que el `x-token` sigue presente en `localStorage` (no se limpia). Levantar el backend de nuevo y recargar la página: si el token sigue siendo válido, la sesión se recupera sola (`authStatus` vuelve a `'authenticated'`) sin pedir login manual.

## Acceptance criteria

- [ ] Con el backend inalcanzable, la falla de `/auth/renew` no produce ninguna excepción no capturada en consola.
- [ ] En ese escenario, `UserState.authStatus()` deja de quedar trabado en `'checking'` y pasa a `'not-authenticated'`.
- [ ] El `x-token` en `localStorage` no se borra cuando la falla es por backend inalcanzable (solo se borra en `401`/`403`, comportamiento ya existente sin cambios).
- [ ] Si el backend vuelve a estar arriba y el token sigue siendo válido, recargar la app recupera la sesión sola (`authStatus` vuelve a `'authenticated'`) sin pedir login manual.
- [ ] El comportamiento existente para `401`/`403` (logout) y `400` (toast) no cambia.
- [ ] No se agrega retry automático ni toast nuevo.
- [ ] `ng build` compila sin errores.
- [ ] Ningún archivo fuera de `src/app/auth/services/auth.service.ts` se modifica.

## Decisions

- **Sí:** centralizar el fix en `handleAuthError` en vez de tocar cada `catchError` de los métodos que lo usan. Razón: un solo punto de entrada evita duplicar "qué hacer según el tipo de error" en cinco lugares distintos.
- **Sí:** no limpiar el token ni llamar `logoutUser()` cuando la falla es por backend inalcanzable. Razón (elegida por el usuario): si el backend vuelve, la sesión se recupera sola con el mismo token en el próximo chequeo, sin forzar un re-login innecesario por un problema transitorio de red.
- **Sí:** solo destrabar `authStatus` cuando está en `'checking'`, sin pisar un `authStatus` ya `'authenticated'` por una falla de red en, por ejemplo, `updateUser`. Razón: evita un deslogin visual de una sesión activa por un error transitorio en una petición que no es la del chequeo inicial.
- **No:** agregar retry automático. Razón (elegida por el usuario): alcanza con que la UI no quede trabada; el usuario recarga cuando el backend esté arriba.
- **No:** mostrar toast de error cuando falla por backend inalcanzable. Razón (elegida por el usuario): es un chequeo de fondo; un toast cada vez que no hay backend en desarrollo local es ruidoso.
- **No:** agregar un valor nuevo a `AuthStatus` (ej. `'offline'`). Razón (elegida por el usuario): se prefirió la opción más simple — mantener el token y reusar `'not-authenticated'` — sobre agregar un tercer estado.
- **No:** tocar el toast de `registerUser` en el caso `400` (bug preexistente separado de mostrar un objeto en vez del mensaje). Razón: no relacionado al problema de backend caído reportado; queda anotado para una spec futura.

## What is **not** in this spec

- Retry/backoff automático del renew.
- Toast o feedback visual nuevo para error de red.
- Nuevo valor de `AuthStatus`.
- Fix del toast de `registerUser` en el caso `400` (bug preexistente separado).
- Cambios a guards, `UserState` o componentes.

Cada uno de estos, si se necesita, va en su propia spec.
