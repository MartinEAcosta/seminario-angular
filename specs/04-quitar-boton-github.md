# SPEC 04 — Quitar botón "Continuar con GitHub" de login y registro

> **Status:** Aprobado
> **Depends on:** SPEC 02 (botones Google/GitHub), SPEC 03 (login con Google frontend)
> **Date:** 2026-10-15
> **Objective:** Eliminar el botón "Continuar con GitHub" (puramente visual, sin wiring OAuth) de los formularios de login y registro, dejando a Google como único método de autenticación social.

## Por qué existe esta spec

Se tomó la decisión de quitar GitHub como opción de registro/login. El botón de GitHub, agregado en SPEC 02, nunca tuvo integración real (sin endpoints de backend, sin wiring en `AuthService`, confirmado explícitamente fuera de scope en SPEC 02 y SPEC 03) — es puramente un `<button type="button">` sin `(click)` ni lógica. Quitarlo es una remoción de UI sin impacto en `AuthService`, `environment.ts`, guards ni mappers.

## Scope

**In:**

- `form-login.component.html`: eliminar el `<button type="button" class="btn-oauth btn-oauth-github">` (líneas 37-40) y su icono.
- `form-register.component.html`: eliminar el mismo bloque de botón GitHub (líneas 52-55).
- `public/assets/github-icon.svg`: eliminar el archivo, ya que queda sin referencias tras los dos cambios anteriores.
- `span.oauth-divider` en ambos formularios: cambiar el texto de "o continuá con" a "o continuá con Google" en ambos (`form-login.component.html:29`, `form-register.component.html:46`).

**Out of scope:**

- Cualquier cambio en `AuthService`, `GoogleAuthService`, `environment.ts`/`environment.development.ts`, guards o `auth.routes.ts` — GitHub nunca tuvo wiring ahí, no hay nada que desconectar.
- Estilos `.oauth-divider`, `.btns-oauth`, `.btn-oauth` en `form-global.scss` — se reutilizan tal cual para el único botón de Google restante (mismo ancho del 50% que ya tenían como contenedor de dos botones). No existe una clase `.btn-oauth-github` separada en el SCSS, así que no hay CSS que eliminar.
- Reescribir o marcar como "superseded" las SPEC 02 / SPEC 03 — quedan como registro histórico de lo que se implementó en su momento.
- Cualquier reordenamiento del layout en `bp-down('sm')` (columna) — con un solo botón el comportamiento existente no se rompe, no se toca esa regla.

## Data model

Esta spec no introduce ni modifica datos de aplicación ni modelos — es puramente remoción de markup y un asset.

## Implementation plan

1. En `form-login.component.html`: cambiar el texto de `.oauth-divider` a "o continuá con Google" y eliminar el `<button class="btn-oauth btn-oauth-github">` completo, dejando solo el botón de Google dentro de `.btns-oauth`.
2. En `form-register.component.html`: mismo cambio — texto del divisor a "o continuá con Google" y eliminación del botón GitHub.
3. Eliminar `public/assets/github-icon.svg`.
4. Verificación manual: `ng build` compila sin errores. Abrir `/auth/login` y `/auth/register`, confirmar que solo aparece el botón "Continuar con Google" centrado (mismo ancho/alto que antes), el texto del divisor dice "o continuá con Google", y no hay errores 404 en consola por el SVG faltante.

## Acceptance criteria

- [ ] `form-login.component.html` ya no contiene ningún botón ni referencia a GitHub.
- [ ] `form-register.component.html` ya no contiene ningún botón ni referencia a GitHub.
- [ ] `public/assets/github-icon.svg` no existe.
- [ ] El texto de `.oauth-divider` en ambos formularios es "o continuá con Google".
- [ ] El botón de Google restante se muestra centrado, conservando el ancho previo de `.btns-oauth` (50%, 90% en `bp-down('sm')`).
- [ ] `ng build` compila sin errores.
- [ ] No hay referencias a `github` (código, assets o CSS) en `src/app/auth` ni `public/assets` tras el cambio.
- [ ] `AuthService`, `environment.ts`, `environment.development.ts`, guards y `auth.routes.ts` no se modifican.

## Decisions

- **Sí:** eliminar el botón en vez de deshabilitarlo u ocultarlo con CSS. Razón: no hay plan de reactivarlo a corto plazo y no tiene wiring; dejar markup muerto no aporta valor.
- **Sí:** cambiar el texto del divisor a "o continuá con Google". Razón: con un solo proveedor, "o continuá con" a secas queda incompleto/ambiguo.
- **Sí:** mantener el ancho actual de `.btns-oauth`/`.btn-oauth` (50%, sin pasar a 100%). Razón: cambio mínimo, evita relayout innecesario del botón de Google que ya funciona.
- **No:** tocar `form-global.scss`. Razón: no existe una clase específica `.btn-oauth-github` que limpiar — las clases base (`.oauth-divider`, `.btns-oauth`, `.btn-oauth`) siguen usándose para Google.
- **No:** marcar SPEC 02/SPEC 03 como superseded. Razón: son registro histórico de lo implementado en su momento; la spec nueva documenta la remoción sin necesidad de reescribirlas.

## What is **not** in this spec

- Cambios en `AuthService`, `GoogleAuthService`, guards, `auth.routes.ts` o archivos `environment*.ts`.
- Cambios en `form-global.scss`.
- Modificación de SPEC 02 o SPEC 03.
- Reordenamiento de layout en breakpoints además del texto del divisor.

Cada uno de estos, si se necesita, va en su propia spec.
