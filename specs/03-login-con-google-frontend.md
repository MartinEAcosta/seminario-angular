# SPEC 03 — Login con Google: wiring del frontend (code flow)

> **Status:** Aprobado
> **Depends on:** SPEC 02
> **Date:** 2026-10-14
> **Objective:** Conectar el botón "Continuar con Google" (agregado visualmente en SPEC 02) al flujo real de OAuth2 authorization-code de Google, solo en el formulario de login y solo del lado del frontend.

## Por qué existe esta spec

SPEC 02 dejó los botones de Google/GitHub puramente visuales, sin wiring, porque el backend no exponía endpoints de OAuth. Desde entonces el working tree acumuló trabajo a medio terminar que ya excede esa spec:

- `src/app/auth/services/google-auth.service.ts` ya implementa correctamente el flujo authorization-code de Google (`google.accounts.oauth2.initCodeClient`, popup, `environment.GOOGLE_CLIENT_ID`) y resuelve con un `code`.
- `AuthService.loginWithGoogle` es un stub vacío, sin conectar a `GoogleAuthService`.
- `FormLoginComponent` tiene en su constructor un bloque obsoleto y en competencia: `google.accounts.id.initialize({ client_id: 'YOUR_GOOGLE_CLIENT_ID', ... })` + `google.accounts.id.prompt()` (flujo One-Tap/ID-token, con un client_id placeholder que nunca se completó).
- El método `onLoginWithGoogle()` ya existe en la clase y llama a `authService.loginWithGoogle()`, pero el botón en el template **no tiene `(click)` wireado todavía** (`form-login.component.html:31-34`) — nada lo invoca hoy.
- `environment.ts` y `environment.development.ts` ya tienen `GOOGLE_CLIENT_ID` con el mismo valor real en ambos — no son parte del trabajo pendiente.

Esta spec resuelve esa deuda: deja un solo flujo de Google (code flow vía botón), conectado end-to-end del lado Angular, reusando el mismo patrón de `AuthResponse`/`handleAuthSuccess`/`UserState` que ya usan `loginUser`/`registerUser`.

## Scope

**In:**

- `AuthService.loginWithGoogle()`: implementación real. Toma el `code` de `GoogleAuthService.requestCode()`, lo envía al backend (`POST {apiURL}auth/google`), y procesa la respuesta con el mismo `handleAuthSuccess`/`handleAuthError` que ya usan `loginUser`/`registerUser`.
- `FormLoginComponent`: eliminar el bloque `google.accounts.id.initialize(...)` + `google.accounts.id.prompt()` del constructor (y cualquier método `handleGoogleSignIn` huérfano que le servía de callback). `onLoginWithGoogle()` pasa a suscribirse al Observable de `loginWithGoogle()` y navega a `''` si el login fue exitoso, igual que `onLogin()`.
- `form-login.component.html`: agregar `(click)="onLoginWithGoogle()"` al botón `.btn-oauth-google` — es el paso que falta para que el método exista y realmente se dispare.
- Manejo de error: si el backend responde con error (incluido 404 mientras el endpoint no exista) o el script de Google no cargó, se muestra un toast vía `UIService.showToastMessage`. Si el usuario simplemente cierra el popup sin completar el login, no se muestra nada (ver Decisions).
- Documentar (en esta spec, no en código) el contrato esperado del endpoint backend `POST {apiURL}auth/google`, para que quien implemente `udemix-backend` sepa qué forma debe devolver.

**Out of scope (para specs futuras):**

- Cualquier cambio en `udemix-backend` (repo separado). Esta spec no crea el endpoint `POST auth/google`, solo documenta su contrato esperado.
- Wiring de Google en `form-register.component.ts`. Hoy ese componente no tiene ningún método ni botón conectado a Google — login y registro con Google son flujos distintos y quedan para otra spec si se necesitan.
- Login con GitHub (el otro botón de SPEC 02). Mismo motivo: sin backend, sin wiring, spec propia si se necesita.
- Estado de carga (disabled/spinner/texto "Conectando...") en el botón de Google mientras se resuelve el popup + el intercambio con el backend. Ver Decisions.
- Cualquier cambio en `AuthMapper`, `auth.interfaces.ts`, `user-state.ts`, `auth.routes.ts`, los guards existentes, o `environment.ts`/`environment.development.ts` (`GOOGLE_CLIENT_ID` ya está seteado en ambos). El flujo de Google reusa el `AuthResponse { ok, user, token }` ya existente sin modificarlo.
- Un campo `provider`/`authMethod` en `User` para distinguir cuentas Google de cuentas locales — no existe hoy y no se agrega en esta spec.

## Data model

Esta spec no introduce estructuras de datos nuevas en el frontend — reusa `AuthResponse`, `User` y `UserDTO` de `src/app/auth/models/auth.interfaces.ts` tal como están.

Contrato esperado del endpoint backend (a implementar en `udemix-backend`, fuera de este repo):

```
POST {apiURL}auth/google
Body:     { code: string }
Response: AuthResponse { ok: boolean, user: User, token: string }   // mismo shape que /auth/login y /auth/register
```

## Implementation plan

1. En `AuthService`, inyectar `GoogleAuthService`. Implementar `loginWithGoogle = (): Observable<User | false> =>`: `from(this.googleAuthService.requestCode())` → `switchMap` a `this.http.post<AuthResponse>('${this.baseURL}/google', { code })` → `map(this.handleAuthSuccess)` → `catchError`. Reusar `handleAuthError` para errores HTTP. Cuando el rechazo viene de la promesa del popup (no tiene forma de `ErrorResponse`): si el tipo de error indica que el usuario cerró el popup voluntariamente (`error_callback` de Google con `err.type === 'popup_closed'`), devolver `of(false)` sin mostrar toast; para cualquier otro rechazo del popup (script no cargado, error distinto), mostrar un toast genérico vía `uiService.showToastMessage`. Verificación manual: `ng build` compila sin errores de TS.
2. En `FormLoginComponent`, eliminar el bloque `google.accounts.id.initialize/prompt` del constructor (y el método `handleGoogleSignIn` si queda sin otros usos). Actualizar `onLoginWithGoogle()` para suscribirse a `authService.loginWithGoogle()` y navegar a `''` si `isAuthenticated` es true, igual que `onLogin()`. Sin signal de loading, sin disabled.
3. En `form-login.component.html`, agregar `(click)="onLoginWithGoogle()"` al botón `.btn-oauth-google`. Verificación manual: `ng serve`, abrir `/auth/login`, click en "Continuar con Google" abre el popup de consentimiento (sin backend desplegado, el POST final devuelve 404 y se ve un toast de error, no un crash; cerrar el popup sin completar no muestra nada).

## Acceptance criteria

- [ ] `ng build` compila sin errores de TypeScript.
- [ ] En `/auth/login`, click en "Continuar con Google" abre el popup de consentimiento de Google.
- [ ] Ya no existe ninguna referencia a `google.accounts.id` ni al client_id placeholder `'YOUR_GOOGLE_CLIENT_ID'` en el código del componente.
- [ ] Si el backend no responde (404) o el script de Google no cargó, se muestra un toast de error vía `UIService` y no hay excepciones no capturadas en consola.
- [ ] Si el usuario cierra el popup sin completar el login, no se muestra ningún toast ni error en consola.
- [ ] El botón de Google no muestra ningún estado de carga/disabled mientras se resuelve el flujo.
- [ ] `AuthMapper`, `auth.interfaces.ts`, `user-state.ts`, `auth.routes.ts`, los guards y los archivos `environment*.ts` no se modifican.
- [ ] `form-register.component.ts` no se modifica.

## Decisions

- **Sí:** code flow (popup, `initCodeClient`) sobre One-Tap/ID-token. Razón: ya había una implementación correcta de code flow en `GoogleAuthService`; el bloque One-Tap era un experimento abandonado con client_id placeholder.
- **Sí:** reusar `AuthResponse`/`handleAuthSuccess`/`handleAuthError` existentes en vez de crear un pipeline paralelo. Razón: mismo shape de respuesta que login/register, menos superficie para mantener.
- **Sí:** esta spec cubre solo el frontend; el contrato del backend queda documentado pero no implementado. Razón: `udemix-backend` es un repo separado fuera de este workspace.
- **No:** estado de carga (disabled/spinner) en el botón mientras se resuelve el popup + la llamada al backend. Razón: ningún otro botón de auth (`.btn-sumbit` del login normal) tiene hoy ese patrón — no se introduce uno nuevo solo para Google.
- **No:** toast cuando el usuario cierra el popup sin completar. Razón: es una cancelación voluntaria, no un error del sistema — mostrar un toast ahí sería ruido.
- **No:** wiring de Google en registro. Razón: el componente de registro no tiene hoy ningún código de Google — es una decisión nueva, no una deuda a resolver, y queda para su propia spec.
- **No:** agregar campo `provider` a `User`. Razón: no es necesario para que el login funcione; el backend puede resolver duplicados por email sin que el frontend lo sepa.

## What is **not** in this spec

- Implementación del endpoint `POST auth/google` en `udemix-backend`.
- Login con Google en `form-register.component.ts`.
- Login con GitHub (el otro botón de SPEC 02).
- Estado de carga/disabled en el botón de Google.
- Un campo `provider`/`authMethod` en `User`/`UserDTO`.

Cada uno de estos, si se necesita, va en su propia spec.
