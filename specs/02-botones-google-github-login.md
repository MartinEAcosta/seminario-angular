# SPEC 02 — Botones de "Continuar con Google/GitHub" en login y registro

> **Status:** Implementado
> **Depends on:** SPEC 01 (breakpoints y escala fluida)
> **Date:** 2026-10-02
> **Objective:** Agregar, debajo del botón de submit en los formularios de login y registro, un separador y dos botones "Continuar con Google" / "Continuar con GitHub" con estilo limpio tipo Apple (blanco, borde fino, icono + texto), puramente visuales y sin integración real de OAuth todavía.

## Scope

**In:**

- Dos SVG nuevos en `public/assets`: `google-icon.svg` (logo "G" multicolor estándar) y `github-icon.svg` (marca monocromática oscura, pensada para fondo blanco), siguiendo el mismo patrón que `x-white.svg` / `facebook-white.svg` / `instagram-white.svg`.
- Markup nuevo en `src/app/auth/components/form-login/form-login.component.html`: después del botón `.btn-sumbit` y antes de `.text-forgot-pass`, un separador y los dos botones OAuth.
- Markup nuevo en `src/app/auth/components/form-register/form-register.component.html`: después del botón `.btn-sumbit` y antes de `.text-login`, mismo separador y mismos dos botones.
- Estilos nuevos en `src/app/auth/form-global.scss` (compartido por ambos formularios, siguiendo el patrón ya existente de `.btn-sumbit`/`.text-register`/etc.): `.oauth-divider`, `.btns-oauth`, `.btn-oauth` (base) y variantes `.btn-oauth-google` / `.btn-oauth-github`.
- Breakpoint: a `bp-down('sm')` los dos botones pasan de fila a columna, ancho completo cada uno (mismo criterio que ya usa `form-global.scss` para `.input-email`/`.btn-sumbit` en `bp-down('md')`/`bp-down('sm')`).
- Los botones son `<button type="button">`, sin `(click)` ni lógica — puramente visuales.

**Out of scope (para una spec futura):**

- Integración real de OAuth: no hay endpoints de Google/GitHub en el backend todavía, así que no se cablea ningún redirect, callback ni llamada a `AuthService`/`auth.service.ts`.
- Cualquier cambio en `auth.routes.ts`, `environment.ts`/`environment.development.ts`, o nuevos guards/interceptors relacionados a OAuth.
- Feedback de click (toast, loading state, deshabilitar botón): al no haber lógica, no aplica.
- La sección de redes sociales de `auth-layout.component.html` (Twitter/Facebook/Instagram) — es la promo de "dónde encontrarnos", feature distinta, no se toca.
- Flujo popup-based de OAuth — no hay wiring, así que no hay mecanismo que decidir todavía.

## Data model

Esta spec no introduce datos de aplicación ni modelos nuevos — es puramente visual (markup + estilos + dos assets SVG).

## Implementation plan

1. Agregar `public/assets/google-icon.svg` y `public/assets/github-icon.svg`.
2. Agregar en `form-global.scss` las clases compartidas: `.oauth-divider` (línea + texto "o continuá con", centrado, usando `v.$text-sm`/color apagado), `.btns-oauth` (contenedor flex, `gap`, `justify-content: center`, ancho acorde a `.btn-sumbit`), `.btn-oauth` (base: fondo blanco, borde 1-2px sutil, `border-radius` consistente con `.btn-sumbit` (20px), texto oscuro, `display:flex` con icono + texto, `transition` y hover con leve `translateY`/sombra — sin el gradiente verde), `.btn-oauth-google`/`.btn-oauth-github` solo si hace falta diferenciar color de borde/icono.
3. Agregar `@include v.bp-down('sm')` en `form-global.scss`: `.btns-oauth` pasa a `flex-direction: column`, cada `.btn-oauth` a `width: 100%`.
4. Agregar el markup en `form-login.component.html`: tras `.btn-sumbit`, insertar `.oauth-divider` + `.btns-oauth` con los dos `<button type="button" class="btn-oauth btn-oauth-google">`/`btn-oauth-github` (icono `<img>` + texto "Continuar con Google"/"Continuar con GitHub").
5. Replicar el mismo bloque de markup en `form-register.component.html`, tras su `.btn-sumbit` y antes de `.text-login`.
6. Verificación manual: abrir `/auth/login` y `/auth/register` en devtools a 320/640/768/1024/1366/1920px de ancho. Confirmar que los botones se ven blancos/bordeados con icono, lado a lado en desktop, apilados en columna a `bp-down('sm')`, y que el hover da una leve elevación. Confirmar que `ng build` compila sin errores de Sass/TS.

## Acceptance criteria

- [ ] `public/assets/google-icon.svg` y `public/assets/github-icon.svg` existen.
- [ ] `form-login` y `form-register` muestran, debajo del botón submit y antes del link secundario (`text-forgot-pass`/`text-login`), un separador y dos botones "Continuar con Google" / "Continuar con GitHub".
- [ ] Los botones son blancos con borde fino, texto oscuro, icono a la izquierda; no usan el gradiente verde de `.btn-sumbit`; tienen hover con leve elevación/sombra.
- [ ] A `bp-down('sm')` los dos botones se apilan en columna a ancho completo.
- [ ] Los botones son `<button type="button">` sin `(click)` ni lógica de OAuth.
- [ ] `ng build` compila sin errores.
- [ ] No se modifican `auth.service.ts`, `auth.routes.ts`, `environment.ts`, ni la sección de redes sociales de `auth-layout`.

## Decisions

- **Sí:** estilos nuevos centralizados en `form-global.scss` en vez de duplicarlos en `form-login.component.scss`/`form-register.component.scss`. Razón: es el patrón ya establecido en el repo para todo lo compartido entre ambos formularios (`.btn-sumbit`, `.text-register`, `.input-email`, etc.).
- **Sí:** sin wiring real de OAuth en esta spec. Razón: el backend no expone esos endpoints todavía; cablear un redirect ahora apuntaría a una URL inexistente. Queda para una spec futura cuando el backend lo soporte.
- **Sí:** iconos nuevos como archivos SVG en `public/assets`, mismo patrón que los iconos sociales existentes (`x-white.svg`, etc.).
- **Sí:** layout lado a lado en desktop, columna en `bp-down('sm')` — consistente con cómo `form-global.scss` ya resuelve el resto de sus elementos (`.input-email`, `.btn-sumbit`) en los mismos breakpoints.
- **No:** flujo OAuth vía popup. Razón: no hay wiring en esta spec, no hay mecanismo que decidir.
- **No:** toast o feedback al hacer click. Razón: el botón es puramente visual por ahora.

## What is **not** in this spec

- Integración real de OAuth (backend, redirects, callbacks, `AuthService`).
- Cambios en `auth.routes.ts`, `environment.ts`, guards/interceptors.
- Feedback de click (toast, loading, disabled state).
- La sección de redes sociales de `auth-layout` (Twitter/Facebook/Instagram).

Cada uno de estos, si se necesita, va en su propia spec.
