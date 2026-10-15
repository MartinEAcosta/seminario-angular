# SPEC 05 — Wiring de Google en registro vía componente reutilizable + saneo de `loginWithGoogle`

> **Status:** Aprobado
> **Depends on:** SPEC 03 (login con Google frontend)
> **Date:** 2026-10-15
> **Objective:** Extraer un componente standalone `GoogleAuthButtonComponent` que encapsule el botón "Continuar con Google" y su wiring (preparar el script de Google, disparar el flujo), y usarlo tanto en login como en registro, en vez de duplicar esa lógica en cada formulario — renombrando además `AuthService.loginWithGoogle()` a `continueWithGoogle()` porque el backend hace find-or-create (inicia sesión si el email ya existe, crea la cuenta si no).

## Por qué existe esta spec

SPEC 03 wireó el botón "Continuar con Google" en login, pero el código real diverge de lo que esa spec describía:

- `AuthService.loginWithGoogle()` es hoy un fire-and-forget (`this.provider.signIn()`), no el pipeline con `.subscribe()`/navigate que la prosa de SPEC 03 prometía.
- El intercambio real de código (`exchangeCode`, POST a `${baseURL}/login/google`, navigate a `''` en éxito) está wireado **una sola vez** en el constructor de `AuthService` vía `this.provider.onCode(...)` — es un singleton, no distingue origen del click.
- No existe ningún `registerWithGoogle()` ni lógica de "alta vs login" en el frontend.
- El botón `.btn-oauth-google` de `form-register.component.html` sigue sin `(click)`, puramente visual, igual que lo encontró SPEC 02.

El backend ya hace find-or-create por email (si el email no existe, crea la cuenta; si existe, inicia sesión). Una primera versión de esta spec proponía duplicar en `form-register.component.ts` el mismo par `ngOnInit`-con-`prepareGoogle()` + método de click que ya existe en `form-login.component.ts`. Eso es repetir código ya escrito en vez de reusarlo: Angular ya resuelve este caso con un componente standalone. Esta spec reemplaza ese enfoque por extraer esa lógica (y el markup del botón) a un único componente, usado desde ambos formularios.

## Scope

**In:**

- `src/app/auth/services/auth.service.ts`: renombrar el método público `loginWithGoogle()` → `continueWithGoogle()`. Mismo cuerpo (`this.provider.signIn()`); no se toca `exchangeCode` ni el wiring de `onCode()` en el constructor — ambos siguen pegando a `${baseURL}/login/google` y navegando a `''` en éxito, sin importar si el click vino de login o registro.
- Componente nuevo `GoogleAuthButtonComponent`, standalone, en `src/app/auth/components/google-auth-button/` (`google-auth-button.component.ts` + `google-auth-button.component.html`), selector `app-google-auth-button`:
  - `ngOnInit()`: `this.authService.prepareGoogle().catch(err => console.error('Error preparando Google Auth', err));` (misma lógica que hoy vive en `form-login.component.ts`, movida acá).
  - `onClick = () => { this.authService.continueWithGoogle(); }`.
  - Template: el botón ya existente (`<button type="button" class="btn-oauth btn-oauth-google" (click)="onClick()"><img src="assets/google-icon.svg" alt="">Continuar con Google</button>`).
  - `styleUrls: ['../../form-global.scss']` para reusar las clases `.btn-oauth`/`.btn-oauth-google` ya definidas ahí, sin duplicar CSS.
- `src/app/auth/components/form-login/form-login.component.ts`: quitar `ngOnInit()` (y `implements OnInit`, ya sin otro uso) y el método `onLoginWithGoogle()` — esa lógica pasa a vivir en `GoogleAuthButtonComponent`. Importar `GoogleAuthButtonComponent` en el array `imports` del componente.
- `src/app/auth/components/form-login/form-login.component.html`: reemplazar el bloque actual del botón `.btn-oauth-google` por `<app-google-auth-button />`.
- `src/app/auth/components/form-register/form-register.component.ts`: importar `GoogleAuthButtonComponent` en el array `imports`. No necesita `OnInit` ni método propio — toda la lógica de Google vive en el componente reusado.
- `src/app/auth/components/form-register/form-register.component.html`: reemplazar el bloque actual del botón `.btn-oauth-google` (hoy sin `(click)`) por `<app-google-auth-button />`.
- Documentar en Decisions que la semántica find-or-create es responsabilidad del backend ya existente — un solo endpoint (`/login/google`) sirve para alta y login, sin necesidad de endpoint nuevo ni de que el frontend distinga el origen del click.

**Out of scope:**

- Cambiar la URL real del endpoint (`/login/google`) o reconciliar la discrepancia con lo que SPEC 03 documentó (`auth/google`) — es contrato de `udemix-backend`, repo separado; se deja nota pero no se toca.
- Refactor del patrón singleton `onCode()` wireado una sola vez en el constructor de `AuthService` — sigue sirviendo a ambos orígenes sin cambios porque el backend no distingue.
- Renombrar `GoogleAuthService.signIn()`/`requestCode()` — ya son genéricos, sin deuda ahí.
- Mover el `<span class="oauth-divider">` (texto "o continuá con Google") al componente nuevo — es markup estático sin lógica duplicada, se deja igual en cada template. Solo se extrae lo que tiene comportamiento (prepare + click).
- Cualquier cambio relacionado a GitHub — cubierto por SPEC 04, independiente.
- Agregar campo `provider`/`authMethod` a `User`/`UserDTO` — sigue fuera de scope, igual que en SPEC 03.
- Loading/disabled state en el botón — mismo criterio que SPEC 03 (ningún botón de auth lo tiene hoy).

## Data model

Sin cambios — reusa `AuthResponse`/`User` existentes.

## Implementation plan

1. En `AuthService`, renombrar `loginWithGoogle()` → `continueWithGoogle()`. Verificación: `ng build` no reporta referencias rotas.
2. Crear `GoogleAuthButtonComponent` (`google-auth-button.component.ts` + `.html`) en `src/app/auth/components/google-auth-button/`, con `ngOnInit` llamando `authService.prepareGoogle()` y `onClick()` llamando `authService.continueWithGoogle()`; template con el botón de Google.
3. En `form-login.component.ts`: quitar `ngOnInit`, `implements OnInit` y `onLoginWithGoogle()`; agregar `GoogleAuthButtonComponent` a `imports`.
4. En `form-login.component.html`: reemplazar el botón de Google existente por `<app-google-auth-button />`.
5. En `form-register.component.ts`: agregar `GoogleAuthButtonComponent` a `imports`.
6. En `form-register.component.html`: reemplazar el botón de Google existente por `<app-google-auth-button />`.
7. Verificación manual: `ng build` sin errores; abrir `/auth/login` y `/auth/register`, confirmar que el botón de Google se ve y comporta igual que antes en ambas páginas; completar el flujo con un email nuevo crea cuenta y navega a home; con un email ya registrado inicia sesión y navega a home; cerrar el popup sin completar no muestra error.

## Acceptance criteria

- [ ] `AuthService` ya no expone `loginWithGoogle()`; expone `continueWithGoogle()`.
- [ ] Existe `GoogleAuthButtonComponent` standalone en `src/app/auth/components/google-auth-button/`, con `ngOnInit` que prepara Google y un método de click que llama `continueWithGoogle()`.
- [ ] `form-login.component.ts` ya no tiene `ngOnInit`, `implements OnInit` ni `onLoginWithGoogle()` — solo importa `GoogleAuthButtonComponent`.
- [ ] `form-register.component.ts` no tiene lógica propia de Google — solo importa `GoogleAuthButtonComponent`.
- [ ] `form-login.component.html` y `form-register.component.html` usan `<app-google-auth-button />` en vez del botón inline.
- [ ] `ng build` compila sin errores de TypeScript.
- [ ] En `/auth/login` y en `/auth/register`, click en "Continuar con Google" abre el popup y, al completarlo, crea cuenta nueva (si el email no existía) o inicia sesión (si ya existía).
- [ ] `exchangeCode`, el endpoint `/login/google` y `GoogleAuthService` no cambian.

## Decisions

- **Sí:** extraer `GoogleAuthButtonComponent` standalone en vez de duplicar `ngOnInit`/`prepareGoogle()` + método de click en cada formulario. Razón (corrección del usuario sobre una versión previa de esta spec): duplicar esa lógica en `form-register.component.ts` era reescribir código que ya existía en `form-login.component.ts`; Angular ya resuelve esto con un componente reutilizable.
- **Sí:** renombrar `loginWithGoogle` → `continueWithGoogle` en vez de agregar un `registerWithGoogle` paralelo. Razón (confirmada por el usuario): el backend ya hace find-or-create por email: un solo flujo sirve para alta y login, mantener dos nombres distintos para la misma llamada sería deuda técnica autoimpuesta.
- **Sí:** reusar el mismo endpoint `/login/google` y el mismo wiring singleton de `onCode()` en el constructor, sin refactor. Razón: el backend no distingue origen del click; refactorizar el singleton sería trabajo sin beneficio funcional.
- **Sí:** el componente nuevo reusa las clases `.btn-oauth`/`.btn-oauth-google` de `form-global.scss` vía `styleUrls`, sin duplicar CSS ni crear clases nuevas.
- **No:** mover el divisor (`.oauth-divider`) al componente nuevo. Razón: es texto estático sin lógica, no es parte de la duplicación que se está saneando.
- **No:** tocar la URL del endpoint ni reconciliar la discrepancia de nombre con SPEC 03. Razón: es contrato de un repo de backend separado, fuera de este workspace.
- **No:** agregar campo `provider` a `User`. Razón: igual que SPEC 03, el backend resuelve duplicados por email sin que el frontend lo sepa.

## What is **not** in this spec

- Cambios de endpoint/backend.
- Refactor del singleton `onCode`.
- El divisor `.oauth-divider` como parte del componente nuevo.
- Cambios a GitHub (cubiertos por SPEC 04).
- Campo `provider`/`authMethod` en `User`.
- Loading/disabled state en el botón.

Cada uno de estos, si se necesita, va en su propia spec.
