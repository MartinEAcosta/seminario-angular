# SPEC 13 — Recuperar contraseña: `/auth/forgot-password` y `/auth/reset-password/:token`

> **Status:** Implementado — pendiente de confirmación del usuario antes de implementar.
> **Depends on:** ninguna formalmente; reutiliza patrones ya existentes de `user-profile-page` (formulario de cambio de contraseña) y `become-teacher-page` (shell de dos columnas propio, fuera de `AuthLayoutComponent`).
> **Date:** 2026-11-12
> **Objective:** Construir el flujo completo de "olvidé mi contraseña" — una página para pedir el enlace por mail y una página para elegir la contraseña nueva a partir del token recibido — matching el mock "Acceso" del artifact de diseño, completando el wiring de `AuthService` que hoy quedó a medias.

## Por qué existe esta spec

El mock de referencia (artifact `https://claude.ai/artifact/8QA8kX4B4G3DvtAf2k2Srg`, página "Acceso") tiene dos artboards de este flujo que hoy no existen en el código:

- `#artboard-404f690794f5` — "Acceso · /auth/forgot": pedir el enlace con el correo de la cuenta.
- `#artboard-894bd71d6de7` — "Acceso · /auth/reset?token=...": elegir la contraseña nueva, con el token ya "canjeado".

Ahora mismo el repo tiene groundwork arrancado pero incompleto (cambios sin commitear):

- `form-login.component.html` ya tiene el link "¿La olvidaste?" (`class="text-forgot-pass underline"`) pero con `href=""` — no va a ningún lado.
- `auth.service.ts` ya tiene `sendForgotPasswordEmail(email)` pegándole a `POST auth/forgot-password`, pero su `catchError` muestra un toast copiado del flujo de validación de email ("El enlace de validación no es válido o expiró."), que es el mensaje equivocado para este endpoint.
- No existe ningún método ni ruta para el segundo paso (aplicar la contraseña nueva con el token) — ni DTO, ni endpoint, ni página.

Esta spec termina el wiring de `sendForgotPasswordEmail`, agrega el método que falta (`resetPassword`), y construye ambas páginas.

## Scope

**In:**

- Dos páginas nuevas en `auth/pages/`, siguiendo la convención ya usada ahí (`*-page.component.ts|html|scss`, clase `*PageComponent` — `verify-email-page` y `user-profile-page` ya usan esta convención en esta misma carpeta):
  - `forgot-password-page/forgot-password-page.component.ts|html|scss` — `ForgotPasswordPageComponent`.
  - `reset-password-page/reset-password-page.component.ts|html|scss` — `ResetPasswordPageComponent`.
- **Ninguna de las dos reutiliza `AuthLayoutComponent`**: su panel izquierdo fijo ("Tu próximo curso empieza hoy" + roadmap de uso de la plataforma + tabs Ingresar/Crear cuenta) es específico de login/register. El mock muestra un panel izquierdo distinto (headline "Recuperá el **acceso**" + roadmap de 3 pasos del propio flujo de recuperación, sin tabs). Cada página construye su propio shell de dos columnas, mismo precedente arquitectónico que `become-teacher-page` (ver CLAUDE.md, sección Architecture). El header/footer globales (`app-header`/`app-footer`) ya envuelven toda la app vía `app.html` — no hay que agregarlos, son los que aparecen arriba/abajo en el mock.
- Rutas nuevas en `auth.routes.ts`, **como hermanas** del bloque `AuthLayoutComponent` (no como `children` suyos, por la misma razón de layout):

  ```ts
  {
      path: 'forgot-password',
      component: ForgotPasswordPageComponent,
      canMatch: [ NotAuthenticatedGuard ],
  },
  {
      path: 'reset-password/:token',
      component: ResetPasswordPageComponent,
      canMatch: [ NotAuthenticatedGuard ],
  },
  ```

  Nota de naming: el mock anota los artboards como `/auth/forgot` y `/auth/reset?token=...`; se usa `forgot-password` (nombre completo, consistente con `login`/`register`) y `reset-password/:token` como path param (consistente con el precedente ya existente `verify-email/:token`, no query string). Es una decisión de naming reversible, no un cambio de diseño visual.

- `form-login.component.html`: el link `¿La olvidaste?` pasa a `[routerLink]="['/auth/forgot-password']"` en vez de `href=""`.

- `auth.service.ts`:
  - `sendForgotPasswordEmail` (ya existe): se corrige únicamente el mensaje de error del `catchError` — deja de reusar el texto de validación de email, pasa a algo propio del flujo (ej. `'No pudimos enviar el enlace. Probá de nuevo.'` como fallback cuando el backend no manda `error.error`).
  - Nuevo método `resetPassword`:
    ```ts
    public resetPassword = ( token : string, newPassword : string ) : Observable<boolean> => {
      return this.http
                  .post<ApiResponse<boolean>>( `${this.baseURL}/reset-password/${token}`, { newPassword } )
                  .pipe(
                    map( ( response ) => response.ok ),
                    catchError( ( ) => of(false) )
                  );
    }
    ```
    Sin toast propio en el `catchError` (a diferencia de `sendForgotPasswordEmail`): `ResetPasswordPageComponent` es el único consumidor de este método y ya cubre el error con la tarjeta inline `'invalid'` descrita abajo — un toast simultáneo sería un segundo mensaje pisando al primero.
    No llama `handleAuthSuccess` — el usuario no queda logueado automáticamente (el mock, con "Guardar contraseña" como último paso del roadmap y el link "Volver a ingresar" arriba, no sugiere auto-login; después de guardar, el flujo manda a `/auth/login`).
  - **Contrato de backend asumido, no verificado** (mismo caso que `TeacherRequestDTO` en spec 10): `seminario-angular-backend` puede no tener `POST auth/reset-password/:token` todavía. Esta spec documenta el contrato que el frontend espera; si el backend usa otra forma (body distinto, método PUT, etc.) hay que ajustar `resetPassword` en consecuencia al integrar.

- `user-form-factory.ts`: nuevo `buildResetPasswordForm`, mismos validators que `buildPasswordForm` menos `currentPassword` (acá no hay contraseña actual — la prueba de identidad es el token):
  ```ts
  export function buildResetPasswordForm ( fb : FormBuilder ) : FormGroup {
      return fb.group({
          newPassword     : [ '', [ Validators.required, Validators.pattern( FormUtils.strongPasswordPattern ) ] ],
          confirmPassword : [ '', [ Validators.required ] ],
      }, { validators : passwordsMatchValidator });
  }
  ```

- `ForgotPasswordPageComponent`:
  - Form con un solo control `email` (reusa `userFieldsValidators.email`).
  - Panel izquierdo: headline "Recuperá el **acceso**" + "En tres pasos volvés a tus cursos." + roadmap de 3 pasos ("Pedí el enlace" / "Abrilo desde tu correo" / "Elegí una nueva contraseña"), paso 1 resaltado como actual, 2 y 3 sin marcar — igual al mock.
  - Panel derecho: título "Recuperá tu contraseña", subtítulo "Ingresá tu correo y te mandamos un enlace para crear una nueva.", input de email (placeholder `ana.perez@correo.com` del mock es solo ejemplo visual, no un default real), hint "Lo completamos con el correo que escribiste al ingresar." (mock-only decorativo — no hay prefill real porque esta página es anónima y no tiene de dónde leer un email previo; se deja como copy estático, sin lógica de autocompletado), botón "Enviar enlace".
  - Submit → `authService.sendForgotPasswordEmail(email)`; en éxito, toast (mismo patrón que `email-verification-banner.component.ts`): `"Te enviamos un enlace para recuperar tu contraseña. Revisá tu bandeja de entrada."`. El mock no tiene un frame de "éxito" dentro del formulario — se sigue la convención ya establecida (toast) en vez de inventar un estado inline nuevo.
  - Cooldown de 60s en "Enviar enlace" tras cada envío exitoso — mismo patrón que `email-verification-banner.component.ts` (`isSending`/`cooldown` signals, `RESEND_COOLDOWN_SECONDS = 60`, botón deshabilitado mientras corre). El mock no lo muestra, pero es el único precedente de "enviar un email" en la app y ya resuelve ahí el mismo problema de spam — se adopta por consistencia en vez de dejar el botón reenviable sin límite.
  - Link superior "Volver a ingresar" → `routerLink="/auth/login"`.

- `ResetPasswordPageComponent`:
  - Lee `token` de la ruta con `ActivatedRoute.snapshot.paramMap.get('token')` en el constructor, mismo patrón que `verify-email-page.component.ts` (no usa `input()` aunque el router tenga `withComponentInputBinding()` global — se mantiene consistencia con el único precedente de página con `:token` que ya existe).
  - Form: `buildResetPasswordForm`.
  - Panel derecho reutiliza el markup ya existente de `user-profile-page.component.html` (`.password-field`, `.password-grid`, `.password-strength` + `.password-strength-segment` × 4, `getPasswordStrength()`, hint "Mínimo 8 caracteres, con al menos un número.") — es exactamente el mismo bloque visual que el mock muestra para "Nueva contraseña"/"Repetí la contraseña", sin el campo "Contraseña actual" (no aplica: la identidad la prueba el token, no una contraseña vigente).
  - Botón "Guardar contraseña" → `authService.resetPassword(token, newPassword)`; en éxito, toast `"Contraseña actualizada. Ingresá con tu nueva contraseña."` + `router.navigateByUrl('/auth/login')`.
  - En error, el panel derecho reemplaza el formulario por una tarjeta de estado inline — `linkState = signal<'form' | 'invalid'>('form')`, pasa a `'invalid'` en el `catchError` de `resetPassword` — con copy "Este enlace no es válido o ya expiró." y un botón "Pedir un enlace nuevo" (`routerLink="/auth/forgot-password"`). No se distingue por tipo de error contra el backend: los errores de validación (contraseñas que no coinciden, longitud/patrón) ya los bloquea el form en el cliente (`buildResetPasswordForm` deshabilita el submit mientras sea inválido), así que cualquier rechazo que llegue del backend en este punto es, en la práctica, un problema de token. No se muestra el toast genérico de `resetPassword` en este caso — la tarjeta reemplaza esa comunicación por algo más visible, sin pisarla con un segundo mensaje.
  - Panel izquierdo: mismo roadmap de 3 pasos que `forgot-password-page`, pero con los pasos 1 y 2 marcados como completados (check) y el paso 3 ("Elegí una nueva contraseña") resaltado como actual — igual al mock. Se mantiene igual en el estado `'invalid'` (el roadmap no necesita retroceder).
  - Sin llamada previa de validación del token al cargar la página (no se agrega un endpoint nuevo tipo `GET reset-password/:token` solo para precheck) — se entera recién al hacer submit, vía el estado `'invalid'` descrito arriba.

## Decisiones (el mock no las resuelve — se definieron acá)

### `forgot-password-page`

- **Cooldown de 60s en "Enviar enlace".** El mock no lo muestra, pero `email-verification-banner.component.ts` ya resuelve este mismo problema (evitar reenvíos en cadena) para el otro flujo de "mandate un email" que existe en la app. Se adopta el mismo patrón en vez de dejar el botón reenviable sin límite — ver detalle en Scope.

### `reset-password-page`

- **Token inválido/expirado: tarjeta de estado inline, no toast.** El mock no muestra este frame. En vez de un toast (que se pierde solo, como cualquier otro error del form), el panel derecho cambia a un estado `'invalid'` con copy explícito y un camino de salida ("Pedir un enlace nuevo" → `/auth/forgot-password`) — el usuario llegó acá desde un link de mail que puede tardar días en abrirse, así que el toast corre más riesgo de perderse que en un error de formulario normal. Ver detalle en Scope.
- **La línea "Para la cuenta ana.perez@correo.com." del mock se omite.** El backend no tiene hoy forma de resolver qué email corresponde a un token sin agregar un endpoint nuevo (`GET reset-password/:token` o que `resetPassword` devuelva el email). Mostrar esa línea requeriría ese endpoint extra, fuera del contrato ya asumido para esta spec. Si se quiere mantener, es un ajuste de contrato a decidir antes de implementar.

## Out of scope (para otra spec)

- Implementación real en `seminario-angular-backend` de `POST auth/forgot-password` (ya parcialmente asumida) y `POST auth/reset-password/:token` (nueva) — generación/expiración de tokens, envío de emails. Repo separado.
- Agregar el email de la cuenta al mensaje de "Guardá tu contraseña" (ver Decisiones).
- Distinguir tipos de error de token (inválido vs expirado vs ya usado) con copys distintos — la tarjeta `'invalid'` usa un único mensaje genérico para los tres casos.
- Cambios a `AuthLayoutComponent`, sus tabs, o las páginas de login/register.
- Auto-login después de `resetPassword` exitoso.

## Mock de referencia

- Artifact: `https://claude.ai/artifact/8QA8kX4B4G3DvtAf2k2Srg`
- Página "Acceso" → artboards `#artboard-404f690794f5` (`/auth/forgot`) y `#artboard-894bd71d6de7` (`/auth/reset?token=...`).

## Implementación

A implementar con la skill `impeccable`, usando los dos artboards de arriba como referencia visual directa — el objetivo es que el resultado quede lo más parecido posible al mock (layout, tipografía, colores, spacing), no solo funcionalmente equivalente.
