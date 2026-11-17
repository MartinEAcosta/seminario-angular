# SPEC 16 — El toast lo decide el componente: sacar `UIService` de los servicios

> **Status:** Borrador
> **Depends on:** SPEC 15 (separar los DTOs por feature — toca tres de los mismos archivos)
> **Date:** 2026-11-17
> **Objective:** Quitar `UIService` de `auth.service.ts`, `file.service.ts` y `teacher-request.service.ts`, propagando el error con `throwError` para que el mensaje llegue al componente y sea él quien decida qué mostrar.

## Por qué existe esta spec

Tres servicios inyectan `UIService` y emiten toasts desde adentro de un `catchError`: `auth.service.ts`
(siete llamadas), `file.service.ts` (dos) y `teacher-request.service.ts` (una). Un servicio que decide qué
texto ve el usuario deja de ser reusable: el mismo método no puede comportarse distinto en dos pantallas, y
el componente pierde el control sobre su propia UI.

El problema de fondo no es estético. El patrón es siempre el mismo — el `catchError` consume el mensaje del
backend, lo toastea y devuelve `of(false)` — así que **la información se destruye en el camino**. El
componente recibe un booleano pelado y ya no tiene con qué decidir nada. Eso produjo cuatro fallas que hoy
están en el repo:

- **Login y registro mudos.** `handleAuthError` (`auth.service.ts:252`) solo toastea si
  `error?.status === 400`, y `form-login.component.ts:51-57` / `form-register.component.ts:77-84` se
  suscriben con una sola rama (`if( isAuthenticated ) navegar`), sin `else`. Un 401 de credenciales
  inválidas o un 500 no muestran absolutamente nada: el usuario aprieta "Ingresar" y la pantalla no reacciona.
- **`[object Object]` en registro.** De los cinco llamadores de `handleAuthError`, cuatro le pasan el body
  del error (`ErrorResponse`, que trae `error` como string) y `registerUser` (L68) le pasa el
  `HttpErrorResponse` completo. En ese caso `error.error` es un objeto, y el toast de la línea 260 lo
  imprime como `[object Object]`.
- **Toast de foto descartado.** `updateUser` guarda los datos de texto y, si falla solo la subida del avatar,
  toastea "Perfil actualizado, pero no pudimos subir la foto." (L106). Pero `user-profile-page.component.ts:109`
  ya toasteó "Perfil actualizado." un instante antes, y `ui.service.ts:16` descarta cualquier mensaje nuevo
  mientras haya uno visible. El usuario nunca se entera de que la foto no se subió.
- **Éxito que no ocurrió.** `user-profile-page.component.ts:132-134` toastea "Contraseña actualizada." en un
  `subscribe` que no mira el resultado, así que festeja también cuando la contraseña actual estaba mal.

Los otros seis servicios del repo (`course`, `enrollment`, `payment`, `category`, `lesson`, `module`) ya
hacen lo correcto: `catchError` que re-lanza con `throwError`, y el consumidor maneja el error. Esta spec no
inventa una convención nueva — alinea a los tres que se salieron de ella.

## Scope

**In:**

- **`auth.service.ts`** — se le quitan `inject(UIService)` (L28) y `inject(FileService)` (L30, que queda sin
  uso), y se borran sus siete toasts.

  - `handleAuthError` pasa a `( error : HttpErrorResponse ) : Observable<never>` y re-lanza con
    `throwError(() => new Error( error.error?.error ?? '<fallback del método>' ))`. **Conserva intactas sus
    dos responsabilidades estructurales**: `logoutUser()` en 401/403, y el destrabe de `authStatus` de
    `'checking'` a `'not-authenticated'` en cualquier otro error — de eso dependen los guards (ver spec 06).
  - Los cinco llamadores pasan a entregarle el `HttpErrorResponse` **completo**, no el body: el status HTTP
    real es confiable aunque el backend no mande cuerpo (un 401 con body vacío hoy no deslogearía), y el
    mensaje se lee de `error.error?.error`. Son `exchangeCode` (L52), `registerUser` (L68), `loginUser` (L79),
    `updateUser` (L111) y `checkStatus` (L240).
  - `updateUser` pierde el parámetro `file` y el `switchMap` que subía el avatar: queda
    `updateUser( userRequest : Partial<UserDTO> ) : Observable<User>`. La orquestación de las dos llamadas
    pasa al componente (ver abajo).
  - `updatePassword`, `sendVerificationEmail`, `confirmEmailVerification`, `sendForgotPasswordEmail` y
    `resetPassword` pasan de `Observable<boolean>` a `Observable<void>`: con el error propagándose, un
    booleano que nunca puede ser `false` es ruido. Un `ok === false` con HTTP 200 también se convierte en
    error. `confirmEmailVerification` conserva su efecto `userState.setEmailVerified(true)` en el éxito.
  - **`checkStatus` es la única excepción y queda documentada como tal**: atrapa el error de
    `handleAuthError` y sigue devolviendo `Observable<boolean>` resolviendo a `false`. Es la revalidación
    automática al arrancar la app, la consume un `rxResource` y no hay ningún componente suscrito — no hay
    a quién mostrarle un mensaje. Lo que importa ahí es que `authStatus` quede resuelto.
  - Se borran los `console.log` de depuración de los métodos que se reescriben (L52, L76, L187, L191, L201,
    L205 y L229).

- **`file.service.ts`** — se le quita `inject(UIService)` (L18) y sus dos toasts.

  - `deleteFile`: se borra el toast de L65. El `throwError` que ya tenía se conserva tal cual.
  - `onFileChanged` (L101) **deja de validar**: solo lee el `<input>` y arma el `SelectedFile`. La
    validación se va a un helper nuevo `src/app/file/utils/allowed-media-type.ts`, que exporta
    `isAllowedMediaType( file : File ) : boolean` (misma regla de hoy: `image` o `video`) y la constante con
    el texto del mensaje, para que la copia no quede repetida cinco veces. El componente decide **si** y
    **cuándo** mostrarlo.
  - Los cinco llamadores (`user-profile-page.component.ts:70`, `course-step-data.component.ts`,
    `thumbnail-selector.component.ts:16`, `form-lesson.component.ts:27`,
    `slider-content-manager.component.ts:37`) llaman al helper después de `onFileChanged` y, cuando rechazan
    el archivo, liberan el preview con `URL.revokeObjectURL( selected.previewURL )` antes de salir —
    `onFileChanged` ahora crea el object URL antes de que nadie valide nada.

- **`teacher-request.service.ts`** — se le quita `inject(UIService)` (L17) y su toast de L37.
  `createTeacherRequest` propaga con `throwError`. El eslabón que hoy se come el error está un nivel más
  arriba: `teacher-request-state.ts:26-33` tiene `submitRequest( dto ) : void` que se suscribe y descarta el
  resultado. Pasa a **devolver el observable**, conservando en un `tap` lo que ya hacía — bajar
  `isSubmitting` y `myRequestResource.reload()` en el éxito, bajar `isSubmitting` también en el error — y
  `become-teacher-page.component.ts:57-59` se suscribe con `next`/`error` y decide los dos mensajes.

- **Componentes que suman el manejo de error** (patrón uniforme: `subscribe({ next, error })`, con
  `uiService.showToastMessage( e.message )` en la rama de error):

  - `form-login.component.ts:51-57` y `form-register.component.ts:77-84`: hoy sin rama de error. Este es el
    arreglo de fondo — un login fallido pasa a mostrar siempre el mensaje del backend, con cualquier status.
  - `user-profile-page.component.ts`, tres flujos:
    - `onSaveProfile` (83-111) orquesta las dos llamadas: `authService.updateUser(dto)` y, en el `next`, si
      hay archivo, `fileService.uploadFile('user', user.id, file)`. El `userState.setUser(...)` con
      `avatar_url`/`id_file` actualizados — que hoy vive en `auth.service.ts:95-101` — se hace acá. Tres
      mensajes distintos según el caso: perfil guardado, perfil guardado sin foto, y fallo del perfil. Se
      borra el comentario "AuthService ya mostró el error vía handleAuthError" de L105.
    - `onChangePassword` (127-137) deja de toastear éxito incondicional.
    - El `subscribe` de `deleteFile` (94-97) suma rama de error: hoy no maneja el `throw`, así que sin el
      toast del servicio el borrado del avatar quedaría sin ningún feedback y con un error sin capturar.
  - `email-verification-banner.component.ts:36-45` y `forgot-password-page.component.ts:43-51`: suman rama
    de error; el `startCooldown()` sigue solo en el éxito.
  - `verify-email-page.component.ts:27-30`: `confirmState` se setea `'success'` en `next` y `'error'` en
    `error`, y ahora puede mostrar el motivo real.
  - `reset-password-page.component.ts:63-72`: su `panelState.set('invalid')` se mueve a la rama de error.
    Su comportamiento visible no cambia — ya era el único caso que manejaba el error en el componente.
  - `course-step-data.component.ts:67-73`: el `subscribe` de `saveCourse` suma rama de error.
  - Los cinco llamadores de `onFileChanged` listados arriba.

**Out of scope (para otra spec):**

- **Tocar `ui.service.ts`.** Ni severidad `success`/`error`, ni que el mensaje nuevo reemplace al visible en
  vez de descartarse (`if( this.errorMessage() ) return;`, L16), ni la `private timer` declarada y nunca
  usada (L12), ni el `_errorMessage` público por falta de modificador (L8). Esta spec mueve **quién llama**
  al toast, no cómo funciona el toast.
- Migrar los otros seis servicios. Ya propagan con `throwError` y sus consumidores lo manejan; no inyectan
  `UIService`. No hay nada que corregir ahí.
- `singleUseTokenIsValid` (`auth.service.ts:197`). No toastea, lo consume un guard y su `of(true)` en error
  es un fail-open deliberado. Se deja exactamente como está.
- El fallo silencioso de `cart.service.ts:58-72` (`console.error` y nada más) y su `throwError` creado y
  nunca suscrito de L30.
- `course.service.ts:128-137`, donde `deleteCourse` construye el `throwError` y no lo retorna.
- Tests. El target `ng test` no compila por un problema previo (ver CLAUDE.md) y esta spec no lo arregla.

## Data model

Esta spec no introduce estructuras de datos nuevas. Lo único que cambia son firmas de métodos existentes:

| Método | Hoy | Después |
| --- | --- | --- |
| `AuthService.exchangeCode` / `registerUser` / `loginUser` | `Observable<User \| false>` | `Observable<User>` |
| `AuthService.updateUser` | `( userRequest, file ) : Observable<User \| false>` | `( userRequest ) : Observable<User>` |
| `AuthService.updatePassword` / `sendVerificationEmail` / `confirmEmailVerification` / `sendForgotPasswordEmail` / `resetPassword` | `Observable<boolean>` | `Observable<void>` |
| `AuthService.handleAuthError` | `( error : any \| ErrorResponse ) : Observable<false>` | `( error : HttpErrorResponse ) : Observable<never>` |
| `AuthService.checkStatus` / `singleUseTokenIsValid` | `Observable<boolean>` | sin cambios |
| `FileService.onFileChanged` | `( event ) : SelectedFile \| null` | sin cambios de firma; deja de validar |
| `TeacherRequestState.submitRequest` | `( dto ) : void` | `( dto ) : Observable<TeacherRequest>` |

Único símbolo nuevo: `isAllowedMediaType` y su constante de mensaje, en
`src/app/file/utils/allowed-media-type.ts`.

## Implementation plan

1. **File.** Crear `src/app/file/utils/allowed-media-type.ts` con el predicado y la constante del mensaje.
   Sacar la validación de `onFileChanged`, borrar el toast de `deleteFile` y quitar `inject(UIService)` de
   `file.service.ts`. Actualizar los cinco llamadores: llaman al helper, toastean el rechazo y liberan el
   object URL. `npm run build` compila y elegir un archivo inválido sigue mostrando el mismo mensaje.

2. **Teacher request.** `createTeacherRequest` propaga con `throwError` y pierde el `UIService`;
   `submitRequest` devuelve el observable con el `tap` que conserva `isSubmitting` y el `reload()`;
   `become-teacher-page` se suscribe con `next`/`error`. Probar: enviar una solicitud con el backend caído
   muestra un mensaje y el botón vuelve a habilitarse.

3. **Auth, núcleo del error.** Reescribir `handleAuthError` (lanza, mantiene el logout y el destrabe de
   `authStatus`) y unificar los cinco llamadores para que le pasen el `HttpErrorResponse` completo. Envolver
   `checkStatus` con su `catchError` propio que lo devuelve a `false`. Agregar la rama de error a
   `form-login` y `form-register`. Probar: login con contraseña equivocada muestra el mensaje del backend;
   registro con email duplicado muestra texto real y no `[object Object]`.

4. **Auth, perfil.** Sacar el `switchMap` de subida de avatar de `updateUser` y el `inject(FileService)` que
   queda huérfano. Reescribir `onSaveProfile` en `user-profile-page` para orquestar las dos llamadas y
   manejar los tres desenlaces, y sumarle la rama de error al `subscribe` de `deleteFile`. Probar: guardar
   perfil con y sin foto, y con una foto que el backend rechaza.

5. **Auth, resto de métodos.** Migrar `updatePassword`, `sendVerificationEmail`,
   `confirmEmailVerification`, `sendForgotPasswordEmail` y `resetPassword` a `Observable<void>` que propaga,
   y actualizar sus componentes: `user-profile-page.onChangePassword`, `email-verification-banner`,
   `forgot-password-page`, `verify-email-page` y `reset-password-page`. Borrar los `console.log` de esos
   métodos.

6. **Cierre.** Quitar `inject(UIService)` de `auth.service.ts`, verificar con `grep` que ningún
   `*.service.ts` lo referencia, actualizar el comentario de `resetPassword` (L179-181, que hoy explica por
   qué ese método es el único sin toast — después de esta spec todos lo son) y correr el pase manual
   completo con el backend prendido y apagado.

## Acceptance criteria

- [ ] `grep -rn "UIService" src/app --include=*.service.ts` solo devuelve el propio
      `shared/services/ui/ui.service.ts`.
- [ ] `grep -rn "UIService" src/app --include=*-state.ts` no devuelve nada (hoy ya es así; la spec no debe
      introducirlo).
- [ ] Un login con contraseña incorrecta (401) muestra un toast con el mensaje del backend.
- [ ] Un registro con un email ya existente muestra el mensaje del backend, no `[object Object]`.
- [ ] Con el backend apagado, un intento de login muestra un mensaje de error.
- [ ] Guardar el perfil con una foto que falla muestra "Perfil actualizado, pero no pudimos subir la foto."
      y un solo toast; los datos de texto quedan guardados.
- [ ] Cambiar la contraseña con la actual equivocada **no** muestra "Contraseña actualizada.".
- [ ] Borrar el avatar con el backend caído muestra un mensaje y no deja un error sin capturar en consola.
- [ ] Elegir un `.pdf` en cualquiera de los cinco selectores de archivo sigue mostrando el mensaje de tipo
      inválido, ahora emitido por el componente.
- [ ] Enviar una solicitud de profesor que falla muestra el mensaje y vuelve a habilitar el botón
      (`isSubmitting` baja).
- [ ] Con el backend apagado al arrancar la app, `authStatus` resuelve a `'not-authenticated'`, ninguna ruta
      guardada queda colgada y no aparece ningún toast de error en la carga inicial.
- [ ] `npm run build` compila sin errores ni warnings nuevos.

## Decisiones

- **Sí:** propagar con `throwError` y manejar el error en el componente con `subscribe({ next, error })`.
  Es la convención que ya siguen los otros seis servicios del repo; alinear a los tres desviados no agrega
  un patrón nuevo que haya que aprender ni un tipo que haya que mantener.
- **No:** un tipo envoltorio de resultado (`Result<T>`, `Either`, o similar) para transportar el error como
  valor. Sería una tercera convención conviviendo con las dos que ya existen, y nada en el repo la pide.
- **Sí:** que el componente orqueste las dos llamadas de guardar perfil (`updateUser` y después
  `uploadFile`). Es el único lugar donde se sabe que son dos operaciones con tres desenlaces posibles, y es
  lo que permite distinguir "falló todo" de "se guardó el texto pero no la foto" sin inventar un canal
  especial. De paso, `AuthService` deja de depender de `FileService`.
- **Sí:** `checkStatus` como excepción explícita que sigue atrapando el error. No hay componente suscrito a
  esa llamada, así que no hay a quién mostrarle nada, y su contrato real con el resto de la app es la señal
  `authStatus`, no el valor que emite. Dejarlo propagar no mejoraría nada y tocaría el camino que la spec 06
  tuvo que arreglar.
- **Sí:** pasarle a `handleAuthError` el `HttpErrorResponse` completo en los cinco llamadores, en vez del
  body. El status HTTP real existe siempre; el `status` del body depende de que el backend lo mande. Con el
  body, un 401 sin cuerpo no desloguearía.
- **Sí:** mover la validación de tipo de archivo fuera de `FileService`, a un helper que llama el componente.
  Si el servicio se queda con la regla de qué extensión se acepta, sigue teniendo criterio sobre la UI —
  solo que mudo. El helper es una función pura, testeable y sin dependencia de Angular.
- **Sí:** arreglar en esta spec los cuatro bugs de feedback (login mudo, `[object Object]` en registro, toast
  de contraseña incondicional, `deleteFile` sin handler). Los cuatro son consecuencia directa de la
  inversión de responsabilidad que la spec corrige, y los cuatro viven en `subscribe` que hay que reescribir
  igual. Dejarlos sería elegir mantenerlos a propósito.
- **No:** tocar `ui.service.ts`. Su guard que descarta mensajes y su falta de severidad son problemas reales,
  pero son del toast, no de quién lo llama. Mezclarlos acá convertiría una spec de responsabilidades en una
  de componentes visuales. Van al companion de deuda técnica.
- **No:** migrar `singleUseTokenIsValid`. Lo consume un guard, no toastea, y su fail-open es deliberado.

## Risks

| Riesgo | Mitigación |
| --- | --- |
| Reescribir `handleAuthError` rompe el destrabe de `authStatus` y la app queda colgada en `'checking'` con el backend caído — exactamente el bug que arregló la spec 06 | Las dos ramas estructurales (`logoutUser()` en 401/403 y el `else if (authStatus() === 'checking')`) se conservan textualmente antes del `throwError`. Hay un criterio de aceptación dedicado que se prueba con el backend apagado. |
| Un `subscribe` sin rama `error` queda sin migrar y el throw aparece como error no capturado en consola, sin feedback | La lista de componentes del Scope sale del inventario completo de llamadores, no de una búsqueda parcial. El pase manual recorre los once flujos de los criterios de aceptación. |
| Cambiar la firma de `updateUser` (pierde el parámetro `file`) rompe otro llamador que no está en la lista | TypeScript en `strict` marca cualquier llamador con la aridad vieja. Hoy el único es `user-profile-page.component.ts:103`. |
| `onFileChanged` crea el object URL antes de que nadie valide, así que un archivo rechazado deja un blob colgado | Los cinco llamadores llaman `URL.revokeObjectURL( selected.previewURL )` en el camino de rechazo; está en el Scope y no es opcional. |
| `checkStatus` queda como excepción y con el tiempo alguien la "arregla" por uniformidad, rompiendo los guards | La excepción se escribe como comentario en el código, no solo en esta spec, citando la spec 06. |

## What is **not** in this spec

- El comportamiento interno de `ui.service.ts` (descarte de mensajes, severidad, `timer` muerto, señal pública).
- Los otros seis servicios, que ya propagan correctamente.
- `singleUseTokenIsValid` y su fail-open.
- El fallo silencioso del cálculo de total en `cart.service.ts`.
- El `throwError` sin retornar de `course.service.ts:137`.
- Tests.

Cada uno de esos, si se necesita, va en su propia spec.
