# SPEC 05 — Página de configuración de perfil (Settings)

> **Status:** Aprobado
> **Depends on:** ninguna
> **Date:** 2026-09-06
> **Objective:** Construir la página de configuración de cuenta en `/auth/me`, con layout tipo GitHub Settings (sidebar de secciones + panel de contenido), donde el usuario logueado edita su foto, username, email y contraseña, y puede eliminar su cuenta desde una zona de peligro.

## Por qué existe esta spec

Hoy existe el esqueleto (`user-profile.component.ts` sin lógica, `.html` y `.scss` vacíos) y la ruta `me` ya fue agregada, pero la página es **inalcanzable**: la ruta cuelga del bloque protegido por `NotAuthenticatedGuard` (el mismo que usan `login` y `register`), por lo que un usuario autenticado es expulsado antes de verla. Además el ítem "Tu perfil" del dropdown del header es un `<a>` sin `routerLink`. Esta spec cierra los tres cabos: acceso, navegación y la UI completa.

El backend de esta feature no está resuelto (`User` no tiene campo de avatar, no hay endpoint de cambio de contraseña ni de baja de cuenta). Por eso la spec entrega la UI completa y funcional con **lectura real** del usuario logueado y **escritura mockeada**, lista para que se conecten los endpoints uno por uno más adelante.

## Scope

**In:**

- **Mover** `src/app/auth/components/user-profile/` → `src/app/auth/pages/user-profile-page/`, renombrando los 4 archivos a `user-profile-page.component.{ts,html,scss,spec.ts}`, la clase a `UserProfilePageComponent` y el selector a `app-user-profile-page`. Alinea con `login-page` / `register-page` / `verify-email-page`, que ya viven en `auth/pages/`.
- `src/app/auth/auth.routes.ts`: sacar `me` de los `children` del bloque con `canMatch: [NotAuthenticatedGuard]` y declararla como ruta hermana `{ path: 'me', component: UserProfilePageComponent, canMatch: [AuthenticatedGuard] }`, siguiendo el patrón que ya usa `verify-email`. La página queda fuera de `AuthLayoutComponent` (que es el split comercial de login/register) y se renderiza dentro del shell de `app.component.html`, con header y footer.
- `src/app/user/components/user-profile-dropdown/user-profile-dropdown.component.html`: el ítem "Tu perfil" pasa a `<a [routerLink]="['/auth/me']">Tu perfil</a>`. `RouterLink` ya está en los `imports` del componente.
- `user-profile-page.component.ts`: lógica completa del componente — signal de sección activa, dos `FormGroup` reactivos (perfil y contraseña), preview de avatar, y estado del modal de confirmación de baja. Toda la escritura es mockeada (ver `## Data model`).
- `user-profile-page.component.html`: layout de dos columnas — `<aside class="settings-nav">` con los botones "Perfil" y "Cuenta", y `<div class="settings-panel">` con el contenido de la sección activa mediante `@if`. Incluye el modal de confirmación de eliminación de cuenta.
- `user-profile-page.component.scss`: estilos del layout de dos columnas, sidebar, cards de sección, bloque de zona de peligro y modal. Se declara con `styleUrls: ['../../form-global.scss', './user-profile-page.component.scss']` para reutilizar el patrón de inputs con floating label, `.hasError` y `.btn-sumbit` que ya usan `form-login` y `form-register`. Como la página es de tema **claro** (ver Decisions), la hoja propia sobrescribe los colores de esos inputs (que en `form-global.scss` son oscuros porque viven dentro de `AuthLayoutComponent`); la mecánica del floating label, `.hasError` y `.btn-sumbit` se reutiliza sin cambios.
- Reutilización explícita de piezas existentes: `FormErrorLabelComponent` (`@shared/components/form-error-label`) para errores por campo, `FormUtils` (`@utils/form-utils`) para patrones de validación, `UIService.showToastMessage` para feedback, `assets/user-profile.svg` como avatar por defecto, y los tokens de `@variables` (`$brand-color`, `$white-custom`, `$red-warning`, `$green-success`, `$font-primary`).
- Botón "Reenviar email de validación" en la sección Cuenta, cableado de verdad a `AuthService.sendVerificationEmail()` (método ya implementado y ya usado por `verify-email-page`).
- Responsive: por debajo de `48rem` el sidebar deja de ser columna izquierda y pasa a una fila horizontal de chips arriba del panel. Se reutilizan los breakpoints ya presentes en `form-global.scss` (`48rem` y `37.5rem`).
- La skill `frontend-design` aplica a las decisiones visuales de esta página.

**Out of scope (para futuras specs):**

- Cualquier endpoint nuevo de backend: subida de avatar, cambio de contraseña y baja de cuenta **no existen** y no se crean acá. Los submits quedan mockeados.
- Conectar el formulario de perfil a `AuthService.updateUser` (el método ya existe, pero el usuario lo conecta manualmente después).
- Agregar campos nuevos a la interfaz `User` (`avatar`, `bio`, `createdAt`, etc.) ni tocar `auth.interfaces.ts` / `AuthMapper`.
- Rutas hijas por sección (`/auth/me/perfil`, `/auth/me/cuenta`) — la sección activa vive en un signal local y no se refleja en la URL.
- Secciones de Notificaciones / Preferencias / Facturación — no hay modelo ni backend.
- Historial de cursos, cursos comprados o cursos dictados dentro del perfil.
- Corregir el bug preexistente de `handleAuthError` en `auth.service.ts` (el `catchError` destructura `{ error }` y después chequea `error.status`, que ya viene `undefined`). Afecta también a `loginUser`; va en su propia spec.
- Tests automatizados nuevos. El `.spec.ts` se mueve y se le actualizan el import y el nombre de clase, nada más.
- Cambios a `variables.scss`, al header, al footer o a `app.routes.ts`.

## Data model

Esta spec no introduce estructuras persistentes ni de backend, ni modifica la interfaz `User` (`id`, `username`, `email`, `isEmailVerified`, `role`). Todo el estado vive local en `UserProfilePageComponent`:

```ts
type SettingsSection = 'perfil' | 'cuenta';

// Sección activa del sidebar. No se persiste ni se refleja en la URL.
activeSection = signal<SettingsSection>('perfil');

// Data URL de la imagen elegida por el usuario. null = mostrar avatar por defecto.
avatarPreview = signal<string | null>(null);

// Visibilidad del modal de confirmación de baja de cuenta.
isDeleteModalOpen = signal<boolean>(false);

// Perfil: se precarga desde authService.user() al construir el componente.
profileForm: FormGroup = fb.group({
  username: ['', [Validators.required, Validators.minLength(3), Validators.pattern(FormUtils.notOnlySpacesPattern)]],
  email:    ['', [Validators.required, Validators.pattern(FormUtils.emailPattern)]],
});

// Contraseña: siempre arranca vacío, nunca se precarga.
passwordForm: FormGroup = fb.group({
  currentPassword: ['', [Validators.required]],
  newPassword:     ['', [Validators.required, Validators.minLength(6)]],
  confirmPassword: ['', [Validators.required]],
}, { validators: passwordsMatchValidator });

// Baja de cuenta: exige tipear el username exacto, patrón GitHub.
deleteConfirmationControl = fb.control('', [Validators.required]);
```

Convenciones:

- Los datos de **lectura** son reales: `authService.user()` alimenta la precarga del formulario, el username mostrado y el estado de `isEmailVerified`.
- Los datos de **escritura** son mock: cada submit hace `console.log` del payload y muestra un toast de éxito vía `UIService.showToastMessage`. No hay llamada HTTP, no se muta el signal `_user` de `AuthService`.
- `passwordsMatchValidator` es un validador a nivel `FormGroup`, definido en el propio componente (no se toca `FormUtils`), que marca error si `newPassword !== confirmPassword`.
- El avatar no se sube ni se persiste: el `File` se lee con `FileReader.readAsDataURL` y el resultado se guarda en `avatarPreview`. Se pierde al recargar.

## Implementation plan

1. Mover la carpeta `src/app/auth/components/user-profile/` a `src/app/auth/pages/user-profile-page/`, renombrando los 4 archivos a `user-profile-page.component.{ts,html,scss,spec.ts}`. En el `.ts`: clase `UserProfilePageComponent`, `selector: 'app-user-profile-page'`, `templateUrl` y `styleUrls` apuntando a los archivos nuevos. En el `.spec.ts`: actualizar import y nombre de clase. Actualizar el import en `auth.routes.ts`. Verificación: `ng serve` compila sin errores.
2. En `auth.routes.ts`, sacar el objeto `{ path: 'me', ... }` de los `children` del bloque con `NotAuthenticatedGuard` y declararlo como ruta hermana, después del bloque de `AuthLayoutComponent` y antes de `verify-email`: `{ path: 'me', component: UserProfilePageComponent, canMatch: [AuthenticatedGuard] }`. Verificación manual: logueado, entrar a `/auth/me` muestra la página (vacía todavía) con header y footer; deslogueado, redirige.
3. En `user-profile-dropdown.component.html`, cambiar `<a>Tu perfil</a>` por `<a [routerLink]="['/auth/me']">Tu perfil</a>`. Verificación: click en el ítem del dropdown navega a `/auth/me` y cierra el dropdown (el `NavigationEnd` que ya escucha el componente lo cierra solo).
4. Escribir el esqueleto del layout en `user-profile-page.component.ts` y `.html`: `activeSection = signal<SettingsSection>('perfil')`, `<aside class="settings-nav">` con dos `<button>` ("Perfil" y "Cuenta") que hacen `activeSection.set(...)` y llevan `[class.active]`, más `<div class="settings-panel">` con dos bloques `@if (activeSection() === '...')` de contenido placeholder. Verificación: clickear en el sidebar cambia el bloque visible.
5. Estilar el layout en el `.scss`: grid de dos columnas (`grid-template-columns: 16rem 1fr` con `gap`), sidebar con ítems que tienen barra/pill de sección activa en `$brand-color`, panel con cards **claras** sobre fondo `$white-custom` (mismo lenguaje visual que `verify-email-page`, la otra página de `auth` que se renderiza dentro del shell de la app) y títulos con `border-bottom` sutil (mismo lenguaje que `.title-form` de `form-global.scss`). Agregar el `@media (max-width: 48rem)` que colapsa el sidebar a fila horizontal de chips arriba del panel. Verificación: la página se ve correcta en desktop y en mobile. NO se busca un diseño generico.
6. Sección **Perfil** — bloque de avatar: `<img>` que muestra `avatarPreview()` o `assets/user-profile.svg` como fallback, botón "Cambiar foto" que dispara un `<input type="file" accept="image/*">` oculto, handler `onAvatarSelected(event)` que lee el archivo con `FileReader.readAsDataURL` y setea `avatarPreview`, y botón "Quitar foto" que lo vuelve a `null`. Verificación: elegir una imagen del disco la muestra en el círculo del avatar.
7. Sección **Perfil** — formulario username/email: construir `profileForm` con `FormBuilder`, precargarlo desde `authService.user()` en el `constructor`, y renderizar los dos campos con el patrón exacto de `form-register` (`input` + `label.label-text`, `[ngClass]="{'hasError': ...}"` y `<form-error-label [control]="...">` debajo). Botón "Guardar cambios" con clase `.btn-sumbit`, deshabilitado si el form es inválido. `onSaveProfile()` hace `markAllAsTouched()`, y si es válido: `console.log` del payload + `uiService.showToastMessage('Perfil actualizado.')`. Verificación: dejar el email inválido muestra el error inline; guardar con datos válidos muestra el toast y loguea el payload.
8. Sección **Cuenta** — estado de verificación de email: mostrar un badge verde ("Email verificado") o amarillo ("Email sin verificar") según `authService.user()?.isEmailVerified`. Si no está verificado, botón "Reenviar email de validación" que llama a `authService.sendVerificationEmail()` y muestra un toast según el booleano recibido. Verificación: con una cuenta sin verificar aparece el badge amarillo y el botón dispara la petición.
9. Sección **Cuenta** — formulario de contraseña: `passwordForm` con los tres campos (`currentPassword`, `newPassword`, `confirmPassword`), todos `type="password"`, más el validador de grupo `passwordsMatchValidator` que setea el error `passwordsMismatch` en el `FormGroup`. Mostrar el mensaje "Las contraseñas no coinciden." debajo de `confirmPassword` cuando el grupo tiene ese error y el campo fue tocado. `onChangePassword()`: `markAllAsTouched()`, y si es válido, `console.log` del payload + toast + `passwordForm.reset()`. Verificación: contraseñas distintas bloquean el submit y muestran el mensaje.
10. Sección **Cuenta** — zona de peligro: bloque al final de la sección, separado, con `border: 1px solid $red-warning`, título "Zona de peligro", texto explicando que la acción es irreversible, y botón rojo "Eliminar mi cuenta" que hace `isDeleteModalOpen.set(true)`. Verificación: el bloque se ve visualmente separado del resto y el botón abre el modal.
11. Modal de confirmación de baja: overlay + card centrada renderizados con `@if (isDeleteModalOpen())`. Pide tipear el username exacto (`authService.user()?.username`) en un input ligado a `deleteConfirmationControl`; el botón "Eliminar cuenta" queda deshabilitado hasta que el valor coincida exacto. Confirmar hace `console.log` + `uiService.showToastMessage('Cuenta eliminada (mock).')` y cierra el modal — **no** desloguea, no navega ni llama a ningún endpoint. Click en el overlay o en "Cancelar" cierra el modal y limpia el control. Verificación: con el username mal tipeado el botón sigue deshabilitado; con el username exacto se habilita y al confirmar aparece el toast.
12. QA visual manual en `/auth/me` logueado: recorrer las dos secciones, validar los tres formularios en estado válido/inválido, probar el avatar, abrir y cerrar el modal, y revisar el layout en desktop y en `<48rem`. Confirmar que no quedan errores en consola.

## Acceptance criteria

- [ ] Un usuario **logueado** que entra a `/auth/me` ve la página de configuración, con el header y el footer de la app (no el layout comercial de login/register).
- [ ] Un usuario **no logueado** que entra a `/auth/me` no ve la página (lo bloquea `AuthenticatedGuard`).
- [ ] El ítem "Tu perfil" del dropdown del header navega a `/auth/me` y el dropdown se cierra solo.
- [ ] El componente vive en `src/app/auth/pages/user-profile-page/` con la clase `UserProfilePageComponent`; ya no existe `src/app/auth/components/user-profile/`.
- [ ] El sidebar muestra exactamente dos secciones: "Perfil" y "Cuenta". Clickear una cambia el panel visible y marca visualmente la sección activa.
- [ ] La URL **no** cambia al alternar entre secciones.
- [ ] Al cargar la página, los campos username y email vienen precargados con los valores reales de `authService.user()`.
- [ ] Elegir una imagen desde el botón "Cambiar foto" la muestra en el círculo del avatar sin recargar la página. Sin imagen elegida, se muestra `assets/user-profile.svg`.
- [ ] "Quitar foto" devuelve el avatar al valor por defecto.
- [ ] Los tres formularios muestran errores inline por campo usando `<form-error-label>` y marcan el input con la clase `.hasError`, igual que `form-login` y `form-register`.
- [ ] Escribir contraseñas distintas en "nueva" y "confirmar" muestra "Las contraseñas no coinciden." y no permite enviar.
- [ ] Cada submit (perfil y contraseña) muestra un toast de éxito y loguea su payload por consola. **No se dispara ninguna petición HTTP** — verificable en la pestaña Network.
- [ ] Con una cuenta sin verificar, la sección Cuenta muestra el badge de "Email sin verificar" y el botón de reenvío dispara `POST /auth/send-validation-email`.
- [ ] La zona de peligro aparece al final de la sección Cuenta, visualmente separada y con borde rojo.
- [ ] El botón de confirmación del modal de baja permanece deshabilitado hasta que se tipea el username exacto del usuario.
- [ ] Confirmar la baja muestra un toast y cierra el modal, pero **no** desloguea, **no** navega y **no** hace ninguna petición.
- [ ] Por debajo de `48rem` el sidebar se muestra como fila horizontal arriba del panel y ningún contenido desborda horizontalmente.
- [ ] La página renderiza sin errores en consola en desktop y en mobile.

## Decisions

- **Sí:** layout tipo GitHub Settings (sidebar vertical + panel) — elegido por el usuario sobre tabs horizontales tipo Notion y sobre una sola columna sin tabs. Escala mejor cuando se agreguen secciones.
- **Sí:** sección activa en un `signal` local, sin rutas hijas — elección explícita del usuario. Menos archivos y cero ruteo nuevo. Contra asumida: la sección no es linkeable ni sobrevive a un refresh.
- **Sí:** dos secciones ("Perfil" y "Cuenta") con la zona de peligro embebida al final de "Cuenta" — elección del usuario sobre una tercera sección "Peligro" dedicada. Replica el patrón real de GitHub.
- **Sí:** lectura real / escritura mockeada — decisión explícita del usuario ("que los datos sean de mockeo, yo manualmente después lo conecto con el backend"). Cada submit deja el payload armado y logueado, así conectar el endpoint después es reemplazar el `console.log` por la llamada.
- **Sí:** avatar como preview local con `FileReader`, sin subida — decisión del usuario. `User` no tiene campo de avatar y no existe endpoint, así que persistirlo requeriría cambios de backend + modelo que están fuera de alcance.
- **Sí:** arreglar la ruta `me` (pasarla a hermana con `AuthenticatedGuard`) y cablear el `routerLink` del dropdown — decisión del usuario. Sin esto la página es inalcanzable y la spec no sería verificable.
- **Sí:** mover el componente a `auth/pages/user-profile-page/` — decisión del usuario. Es una página ruteada, y las otras tres páginas de `auth` (`login-page`, `register-page`, `verify-email-page`) ya viven en `pages/`.
- **Sí:** el botón de reenvío de email de validación se cablea de verdad a `AuthService.sendVerificationEmail()`. Es la única excepción a la regla de "escritura mockeada": el método ya está implementado, ya se usa en `verify-email-page` y no requiere backend nuevo. Se documenta acá para que la excepción sea deliberada y no una inconsistencia.
- **Sí:** página de **tema claro** (fondo `$white-custom` con lavados radiales, cards blancas) — decisión del usuario durante la implementación del paso 5, que revierte el "cards oscuras" con el que se redactó la spec. Razón: la página se renderiza dentro del shell de la app, cuyo header es claro (`$white-custom`), y `verify-email-page` — la otra página de `auth` fuera del layout comercial — ya es clara. Un panel oscuro dejaba una costura dura contra el header. Consecuencia asumida: los inputs heredados de `form-global.scss` necesitan override de color en la hoja propia.
- **Sí:** inputs de **línea** (regla inferior que se enciende en `$brand-color` al foco) en vez de las cápsulas con borde teal de `form-global.scss` — decisión del usuario durante el paso 7 ("se ven genéricos"). Los campos pasan a rimar con el riel del sidebar: la página entera queda gobernada por una sola idea, una línea fina que se ilumina donde está tu atención. Se conservan de `form-global` la mecánica del floating label, `.hasError` y `.btn-sumbit`; se sobrescriben caja, borde, radio y fondo.
- **Sí:** reutilizar `form-global.scss` vía `styleUrls` en vez de escribir inputs nuevos — mismo patrón que `form-login` y `form-register`, así el formulario de perfil se ve idéntico al resto de la feature `auth`.
- **No:** conectar el form de perfil a `AuthService.updateUser`, aunque el método ya existe. Su implementación llama a `handleAuthSuccess`, que **reemplaza el usuario, el token y el `localStorage`** como si fuera un login. Eso merece revisarse aparte antes de cablearlo desde acá.
- **No:** rutas hijas por sección — descartado por el usuario a favor del signal local.
- **No:** secciones de Notificaciones / Preferencias — serían mockups puros sin modelo ni backend detrás.
- **No:** agregar campos a `User` (avatar, bio, etc.). Cualquier campo nuevo requiere backend, DTO y mapper; va en otra spec.
- **No:** usar el feature `file/` existente para subir el avatar. Requiere backend corriendo y un campo `avatar` que hoy no existe en el modelo.
- **No:** componentes separados por sección. Las dos secciones viven en el mismo template con `@if`; partirlas sólo tiene sentido si crece la cantidad de secciones.

## Identified risks

| Riesgo | Mitigación |
| --- | --- |
| Un lector futuro asume que la página guarda de verdad y reporta un bug falso | Cada submit loguea su payload con un prefijo explícito de mock, y esta spec lo declara en Scope, Data model y Acceptance criteria. |
| Toast mudo: `UIService.showToastMessage` hace early-return si ya hay un mensaje activo | Los toasts de esta página duran 3.5s por defecto; en QA, esperar a que se limpie el anterior antes de disparar el siguiente. No se cambia `UIService`. |
| Imagen de avatar muy grande convertida a data URL | El preview es sólo en memoria y no se sube. Si en QA aparece lentitud con imágenes de varios MB, limitar por tamaño queda como mejora, no como criterio obligatorio. |
| El mover la carpeta rompe algún import no detectado | El componente es nuevo y su único consumidor es `auth.routes.ts`. Una compilación de `ng serve` después del paso 1 lo confirma. |

## Lo que **no** entra en esta spec

- Endpoints de backend para avatar, contraseña y baja de cuenta.
- Conectar el formulario de perfil a `AuthService.updateUser`.
- Campos nuevos en la interfaz `User`.
- Rutas hijas por sección y URLs linkeables por pestaña.
- Secciones de Notificaciones, Preferencias o Facturación.
- Cursos comprados / dictados dentro del perfil.
- El fix del bug de `handleAuthError` en `auth.service.ts`.
- Tests automatizados nuevos.

Cada uno de esos, si aterriza, va en su propia spec.
