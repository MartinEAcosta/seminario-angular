# 12 - Adaptar form-register a first_name/last_name

**Estado:** Implementado
**Depende de:** -
**Fecha:** 2026-11-12
**Objetivo:** Reemplazar el campo `username` del formulario de registro por `first_name` y `last_name`, alineándolo con el modelo `User`/`UserDTO` real del backend.

## Alcance

**Incluye:**
- Eliminar el campo `username` (control de form, input HTML, validación) de `form-register.component.ts`/`.html`.
- Agregar dos `FormControl` nuevos: `first_name` y `last_name`.
- Validaciones de ambos: `Validators.required`, `Validators.minLength(2)`, `Validators.pattern(FormUtils.notOnlySpacesPattern)`.
- Labels "Nombre" / "Apellido", placeholders "Charles" / "Darwin".
- Layout: ambos inputs en la misma fila (grid de 2 columnas), wrapper nuevo en `form-register.component.html` + reglas de grid en `form-register.component.scss`.
- `AuthMapper.mapFormToUserDTO` pasa a incluir `password: formValue.password` (ya es opcional en `UserDTO`); `onRegister()` llama directo a `AuthMapper.mapFormToUserDTO(this.registerForm)` sin agregar nada a mano.

**No incluye:**
- Cambios en `UserDTO`, `User` (los tipos ya tienen la forma correcta).
- Cambios en `user-profile-page.component.ts` ni en su `profileForm` (el ajuste al mapper es retrocompatible, no requiere tocar este consumidor).
- Cambios en `form-login` ni en otros formularios de auth.
- Cambios de backend o contrato de API.
- Cambios en `form-register.component.spec.ts` (el spec actual no referencia `username`, no necesita tocarse).

## Modelo de datos

No se introduce ningún tipo nuevo. `UserDTO` ya tiene `password` como opcional; se modifica `AuthMapper.mapFormToUserDTO` (en `src/app/mappers/auth.mapper.ts`) para incluir `password: formValue.password` en el objeto devuelto. Como `password` es opcional en `UserDTO` y `profileForm` (el otro consumidor del mapper, en `user-profile-page.component.ts`) no tiene ese control, `formValue.password` será `undefined` ahí sin romper nada.

## Plan de implementación

1. **`src/app/mappers/auth.mapper.ts`**: agregar `password: formValue.password` al objeto devuelto por `mapFormToUserDTO`.
2. **`form-register.component.html`**: quitar el `<div class="field">` de `username` completo (líneas 12-30 actuales). Agregar un wrapper `<div class="field-row">` con dos `<div class="field">` dentro: uno para `first_name` (label "Nombre", placeholder "Charles", id `register-first-name`) y otro para `last_name` (label "Apellido", placeholder "Darwin", id `register-last-name`), cada uno con su `form-error-label` apuntando al control correspondiente.
3. **`form-register.component.ts`**: en `registerForm`, quitar el control `username` y agregar `first_name` y `last_name` con `[Validators.required, Validators.minLength(2), Validators.pattern(FormUtils.notOnlySpacesPattern)]`. Importar `AuthMapper` desde `@mappers/auth.mapper`.
4. **`onRegister()`**: reemplazar `const registerUserDTO = this.registerForm.value;` por `const registerUserDTO = AuthMapper.mapFormToUserDTO(this.registerForm);` y mantener el resto del flujo (`authService.registerUser(registerUserDTO)`) sin cambios.
5. **`form-register.component.scss`**: agregar regla `.field-row` con `display: grid; grid-template-columns: 1fr 1fr; gap: ...` (usar el espaciado fluido ya definido en `@variables`, ej. `v.$space-xs` o el que ya use `.field` para gap vertical) para que los dos campos queden lado a lado.
6. Verificación manual en navegador (`ng serve`): abrir `/auth/register`, confirmar que aparecen "Nombre" y "Apellido" lado a lado, que las validaciones disparan (vacío, 1 char, solo espacios) y que el submit exitoso llega al backend con el shape `{ first_name, last_name, email, password }`.

## Criterios de aceptación

- [ ] El campo `username` no existe más en `form-register.component.ts` ni en el HTML.
- [ ] `registerForm` tiene controles `first_name` y `last_name` con las validaciones especificadas.
- [ ] El HTML muestra "Nombre" y "Apellido" en la misma fila, cada uno con su `form-error-label`.
- [ ] Enviar el formulario con datos válidos llama a `authService.registerUser` con un objeto que tiene `first_name`, `last_name`, `email`, `password` (sin `username`).
- [ ] Enviar con `first_name` o `last_name` vacío, de 1 carácter, o solo espacios, marca el campo con error y no dispara la llamada HTTP (mismo comportamiento que tenía `username`).
- [ ] `npx ng test --watch=false --browsers=ChromeHeadless` no agrega fallas nuevas sobre las preexistentes documentadas en `CLAUDE.md`.

## Decisiones tomadas y descartadas

- **Dos inputs separados (first_name/last_name) en vez de un único "Nombre completo" a partir del cual splitear.** Evita lógica frágil de split (apellidos compuestos, nombres con múltiples palabras) y es el shape que el backend espera directamente.
- **minLength(2) en vez de minLength(3)** (que tenía `username`). Nombres propios cortos son válidos (ej. "Lu", "Ana"); 3 era un criterio pensado para username, no para nombre de persona.
- **Agregar `password` directo en `AuthMapper.mapFormToUserDTO` en vez de armarlo a mano en el componente.** Sigue el patrón mapper que el proyecto ya usa en el resto de la app (`CLAUDE.md`, sección "API/DTO boundary") y evita spread/mezcla manual en `onRegister()`. Es seguro porque `password` ya es opcional en `UserDTO` y el otro consumidor del mapper (`profileForm` en `user-profile-page.component.ts`) no tiene control `password`, por lo que ahí simplemente queda `undefined`.
- **Layout en fila (grid 2 columnas) en vez de apilado.** Decisión explícita del usuario; ahorra espacio vertical en el formulario.
