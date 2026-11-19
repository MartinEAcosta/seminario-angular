# SPEC 16 — El error lo decide el componente: sacar `UIService` de los servicios

> **Status:** Aprobado
> **Depends on:** SPEC 15 (separar los DTOs por feature — toca tres de los mismos archivos)
> **Date:** 2026-11-17 · **Enmendada:** 2026-11-18
> **Objective:** Quitar `UIService` de `auth.service.ts`, `file.service.ts` y `teacher-request.service.ts`,
> propagando el error con `throwError` para que llegue al componente y sea él quien decida **qué** mostrar y
> **por qué canal**: una banda inline dentro del formulario, un toast, o la navegación a una página de error
> según el status HTTP.

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
  El arreglo **no es un toast**: unas credenciales mal son un error del formulario que el usuario está
  mirando, así que se marcan adentro del formulario (ver el punto de la banda inline más abajo).
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

## El contrato de error del backend (verificado)

`seminario-angular-backend` tira todos sus errores con `CustomError` (`domain/errors/custom-error.ts`:
`badRequest` 400, `unauthorized` 401, `forbidden` 403, `notFound` 404, `internalServer` 500) y los serializa en
`HandlerResponses.handleError`, que tiene **dos ramas con dos formas distintas**:

```ts
// error instanceof CustomError
res.status( error.statusCode ).json({ ok : false, status : error.statusCode, error : error.message });

// cualquier otra cosa (excepción no prevista)
console.log( error );
res.status(500).json({ error : 'Internal Server Error' });
```

Tres consecuencias que fijan decisiones de esta spec:

1. **El status se lee del `HttpErrorResponse`, nunca del body.** La rama de fallback no manda `status` ni `ok`,
   solo `error`. El código de hoy hace `error?.status === 401` sobre el body (`auth.service.ts:255`), así que en
   todo 500 inesperado lee `undefined` y no entra en ninguna rama. Deja de ser un argumento de diseño y pasa a
   ser un hecho comprobable.
2. **El copy de `/error` es fijo.** El único texto que produce esa rama es el literal `'Internal Server Error'`.
3. **`ErrorResponse` (`shared/models/api.interfaces.ts:20`) describe solo la primera forma**, con `ok` y
   `status` requeridos. Son dos formas tipadas como una, y esta spec lo corrige (ver Scope).

Un cuarto dato, verificado con el usuario: **el login con un email inexistente contesta
`notFound('usuario no encontrado')`**, no `unauthorized`. Por eso el 404 entra al mismo bucket que el 401 en los
formularios de auth — mostrar ese texto permite enumerar cuentas con un solo intento.

## La regla de ruteo del error

Una sola regla para todos los flujos de `AuthService`, aplicada en el componente:

```
status >= 500          -> router.navigateByUrl('/error')
status === 0           -> mensaje de conexión (banda inline en login/register; toast en el resto)
status 401 / 403 / 404 -> copy fijo del front (y handleAuthError ya hizo logoutUser() en 401/403)
status 4xx restantes   -> error.error.error del backend, si es un string no vacío
```

El status es lo que elige el canal, así que **`handleAuthError` re-lanza el `HttpErrorResponse` crudo**, no un
`Error` con el mensaje: envolverlo tiraría justamente el dato que decide.

`file.service.ts` y `teacher-request.service.ts` no entran en esta regla. No son auth, no tienen un status que
ramifique un flujo distinto, y su error sigue yendo al toast.

### Tres excepciones, documentadas en el código y no solo acá

- **`checkStatus`** sigue atrapando su error, devolviendo `Observable<boolean>` resuelto a `false` y
  resolviendo `authStatus`. Es la revalidación automática al arrancar la app, la consume un `rxResource` y no
  hay ningún componente suscrito — no hay a quién mostrarle un mensaje. **Nunca navega a `/error`**: hacerlo
  dejaría la app inusable en `/` con el backend apagado. El comentario en el código cita la SPEC 06.
- **`singleUseTokenIsValid`** (`auth.service.ts:197`) queda exactamente como está. No toastea, lo consume un
  guard y su `of(true)` en error es un fail-open deliberado.
- **`exchangeCode`** (login con Google) es un hueco que esta spec **no resuelve**. Su único suscriptor está en
  el constructor de `AuthService` (L40, `.subscribe()` sin rama de error), porque el callback del popup de
  Google es global y no hay componente al que colgarlo. Con el error propagándose, eso pasaría a ser un error
  no capturado, así que el cambio es el mínimo: `subscribe({ error : err => console.warn(...) })`, que
  conserva **exactamente** el comportamiento visible de hoy (silencio en pantalla + warn en consola). Quién es
  dueño de la UI de error de Google es otra decisión y va al companion de deuda técnica.

## Scope

**In:**

- **`auth.service.ts`** — se le quitan `inject(UIService)` (L28) y `inject(FileService)` (L30, que queda sin
  uso), y se borran sus siete toasts.

  - `handleAuthError` pasa a `( error : HttpErrorResponse ) : Observable<never>` y re-lanza **el error crudo**
    con `throwError( () => error )`. **Conserva intactas sus dos responsabilidades estructurales**:
    `logoutUser()` en 401/403, y el destrabe de `authStatus` de `'checking'` a `'not-authenticated'` — de eso
    dependen los guards (ver spec 06). Las dos van **antes** del `throwError`. El 404 **no** desloguea: un
    recurso que no existe no invalida la sesión.

    Al borrar el toast del 400 desaparece el `if( status === 400 ) ... else if( authStatus() === 'checking' )`
    de L259-267 y el destrabe queda en un `if` suelto, así que pasa a correr **también** en un 400. Es
    deliberado, no un descuido del colapso: dejar el `else` muerto haría que un 400 durante el chequeo inicial
    deje `authStatus` en `'checking'` para siempre, que es el bug de la spec 06 con otro status.
  - Los cinco llamadores pasan a entregarle el `HttpErrorResponse` **completo**, no el body: el status HTTP
    real es confiable aunque el backend no mande cuerpo (un 401 con body vacío hoy no deslogearía), y el
    mensaje queda en manos del helper, que es el único que parsea el body. Son `exchangeCode` (L52),
    `registerUser` (L68), `loginUser` (L79), `updateUser` (L111) y `checkStatus` (L240).
  - `updateUser` pierde el parámetro `file` y el `switchMap` que subía el avatar: queda
    `updateUser( userRequest : Partial<UserDTO> ) : Observable<User>`. La orquestación de las dos llamadas
    pasa al componente (ver abajo).
  - `updatePassword`, `sendVerificationEmail`, `confirmEmailVerification`, `sendForgotPasswordEmail` y
    `resetPassword` pasan de `Observable<boolean>` a `Observable<void>`: con el error propagándose, un
    booleano que nunca puede ser `false` es ruido. Un `ok === false` con HTTP 200 también se convierte en
    error. `confirmEmailVerification` conserva su efecto `userState.setEmailVerified(true)` en el éxito.
  - `checkStatus` queda envuelto en su propio `catchError` que lo devuelve a `false`, como excepción explícita
    y comentada (ver la sección de excepciones).
  - `exchangeCode` suma `subscribe({ error : ... })` en el constructor, conservando el `console.warn` de hoy.
  - Se borran los `console.log` de depuración de los métodos que se reescriben (L52, L76, L187, L191, L201,
    L205 y L229).

- **Helper nuevo `src/app/auth/utils/auth-error-message.ts`** — función pura, sin dependencia de Angular,
  mismo criterio que el helper de `file` que esta spec también crea. Concentra la regla de ruteo para que no
  quede copiada en ocho `subscribe`:

  ```ts
  export const CONNECTION_ERROR_MESSAGE = 'No pudimos conectar con el servidor. Revisá tu conexión e intentá de nuevo.';
  export const INVALID_CREDENTIALS_MESSAGE = 'Revisá las credenciales e intentá de nuevo.';

  export const isServerError = ( error : HttpErrorResponse ) : boolean => error.status >= 500;

  export const getAuthErrorMessage = ( error : HttpErrorResponse , fallback : string ) : string => {
    if( error.status === 0 ) return CONNECTION_ERROR_MESSAGE;

    // 401/403/404 nunca muestran el texto del backend: un login con un email
    // inexistente contesta notFound('usuario no encontrado'), así que mostrarlo
    // permitiría enumerar cuentas con un solo intento.
    if( error.status === 401 || error.status === 403 || error.status === 404 ) return fallback;

    // Dos formas posibles: el body de CustomError (`ErrorResponse`) o, cuando la
    // respuesta no es JSON (404 de ruta de Express, error de proxy), un string.
    const body : ErrorResponse | string | null = error.error;
    const message = typeof body === 'object' ? body?.error : undefined;

    return typeof message === 'string' && message.length > 0 ? message : fallback;
  };
  ```

  El `typeof` doble es lo que **realmente** mata el `[object Object]` del registro: leer `error.error?.error`
  a ciegas lo arrastra igual cuando el body no es el `ErrorResponse` esperado. Y es el único lugar del repo que
  parsea un body de error, así que es el único que debe nombrar su forma.

- **`ErrorResponse` pasa a declarar las dos formas** (`shared/models/api.interfaces.ts:20`). La rama de
  fallback del backend manda solo `error`, así que `ok` y `status` son opcionales:

  ```ts
  export interface ErrorResponse {
    ok?     : boolean;  // ausentes cuando el backend no serializa un CustomError
    status? : number;   // (HandlerResponses.handleError, rama de excepción no prevista)
    error   : string;   // el único campo que mandan las dos ramas
  }
  ```

  Es el único consumidor que le queda después de esta spec: las cuatro anotaciones
  `catchError( ( { error } : { error : ErrorResponse } ) => ... )` de hoy (`auth.service.ts:139,158,172` y
  `teacher-request.service.ts:37`) desaparecen con los `catchError` que las contienen. Sin el tipo, la lectura
  del body volvería a ser `any`, que es de donde salió el `[object Object]`.

- **Banda inline en los formularios de auth.** Bloque nuevo `.form-error-banner` en
  `src/app/auth/form-global.scss` — el único partial compartido que queda, y donde ya viven `.hasError`
  (L102) y los tokens que usan los dos formularios. Lleva `role="alert"`, borde e icono en `v.$red-warning`
  y texto en un tono legible sobre papel claro. Es el mismo lenguaje visual que el `.field-error` de
  `reset-password-page.component.html:122` y `user-profile-page.component.html:188`, un nivel más arriba: el
  error es del formulario entero, no de un campo.

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

- **`not-found-page` se renombra a una `error-page` parametrizada**, porque el 5xx necesita una página y el
  repo solo tiene la del 404, con su copy hardcodeado y sin inputs. (`src/app/shared/pages/error/` ya existe
  como carpeta vacía sin commitear; la ocupa este cambio.)

  - `src/app/shared/pages/not-found/not-found-page.{ts,html,scss}` →
    `src/app/shared/pages/error/error-page.{ts,html,scss}`, `export default class ErrorPage` — el nombre
    sigue la convención de `@shared/pages` (`-page.ts` sin sufijo `Component`), que la clase actual
    `NotFoundComponent` no seguía.
  - Inputs llenados por el `data` de la ruta, vía el `withComponentInputBinding()` que ya está configurado:
    `code` (number), `eyebrow`, `title`, `message` y `badge`. El split de dígitos del número grande
    (`not-found-page.html:5-7`, hoy el literal `40` + `4` acentuado) pasa a dos `computed` derivados de
    `code()`. Los bloques de recuperación (ir al inicio, explorar cursos, nav alternativa) sirven igual para
    un 500 y no se tocan.
  - Clases SCSS `.shell-404` / `.code-404` → `.shell-error` / `.code-error`.
  - `app.routes.ts`: el `**` pasa a apuntar a `error-page` con `data: { code: 404, ... }` — copy idéntico a
    los literales de hoy — y nace `{ path: 'error', data: { code: 500, title: 'Algo falló de nuestro lado',
    message: 'Ya estamos viéndolo. Probá de nuevo en unos minutos.' } }` **antes** del `**`.
    `shared/pages/index.ts:4` se reapunta.
  - El copy sale siempre de la ruta. El motivo real del error **no** se pasa a la página: un 5xx no trae texto
    útil para el usuario y puede filtrar detalle interno (stack, nombre de tabla).

- **Componentes que suman el manejo de error.** Patrón uniforme `subscribe({ next, error })`, y en la rama de
  error la regla de ruteo:

  - **`form-login.component.ts:51-57` y `form-register.component.ts:77-84`** — hoy sin rama de error. Este es
    el arreglo de fondo, y es inline:

    ```ts
    public formError = signal<string | null>(null);

    // En el constructor: cualquier edición limpia la banda, para no dejar un
    // mensaje viejo contradiciendo lo que el usuario está escribiendo.
    this.loginForm.valueChanges
      .pipe( takeUntilDestroyed() )
      .subscribe( () => this.formError.set(null) );

    onLogin = () => {
      this.loginForm.markAllAsTouched();
      if( !this.loginForm.valid ) return;

      this.authService.loginUser( AuthMapper.mapFormToUserDTO( this.loginForm ) )
        .subscribe({
          next  : () => this.router.navigateByUrl(''),
          error : ( e : HttpErrorResponse ) => {
            if( isServerError(e) ){ this.router.navigateByUrl('/error'); return; }
            this.formError.set( getAuthErrorMessage( e , INVALID_CREDENTIALS_MESSAGE ) );
          },
        });
    }
    ```

    En el HTML la banda va **justo antes** del `<button class="btn-sumbit">`, y la expresión `hasError` de los
    inputs (`form-login.component.html:26` y `:45`; los cuatro campos de register) suma
    `|| formError() !== null` para que los bordes acompañen al mensaje. Ninguno de los dos componentes inyecta
    `UIService`.
  - `user-profile-page.component.ts`, tres flujos:
    - `onSaveProfile` (83-111) orquesta las dos llamadas: `authService.updateUser(dto)` y, en el `next`, si
      hay archivo, `fileService.uploadFile('user', user.id, file)`. El `userState.setUser(...)` con
      `avatar_url`/`id_file` actualizados — que hoy vive en `auth.service.ts:95-101` — se hace acá. Tres
      mensajes distintos según el caso: perfil guardado, perfil guardado sin foto, y fallo del perfil. Se
      borra el comentario "AuthService ya mostró el error vía handleAuthError" de L105.
    - `onChangePassword` (127-137) deja de toastear éxito incondicional.
    - El `subscribe` de `deleteFile` (94-97) suma rama de error: hoy no maneja el `throw`, así que sin el
      toast del servicio el borrado del avatar quedaría sin ningún feedback y con un error sin capturar.
      `FileService` no es auth: este flujo se queda con toast y no ramifica por status.
  - `email-verification-banner.component.ts:36-45` y `forgot-password-page.component.ts:43-51`: suman rama
    de error; el `startCooldown()` sigue solo en el éxito.
  - `verify-email-page.component.ts:27-30`: `confirmState` se setea `'success'` en `next` y `'error'` en
    `error`, y ahora puede mostrar el motivo real.
  - `reset-password-page.component.ts:63-72`: su `panelState.set('invalid')` se mueve a la rama de error,
    salvo en un 5xx, que navega a `/error` — "este enlace no es válido" sería mentira si el que falló fue el
    servidor.
  - `course-step-data.component.ts:67-73`: el `subscribe` de `saveCourse` suma rama de error.
  - Los cinco llamadores de `onFileChanged` listados arriba.

**Out of scope (para otra spec):**

- **Tocar `ui.service.ts`.** Ni severidad `success`/`error`, ni que el mensaje nuevo reemplace al visible en
  vez de descartarse (`if( this.errorMessage() ) return;`, L16), ni la `private timer` declarada y nunca
  usada (L12), ni el `_errorMessage` público por falta de modificador (L8). Esta spec mueve **quién llama**
  al toast, no cómo funciona el toast.
- **Quién es dueño de la UI de error del login con Google** (`exchangeCode`). Se conserva el comportamiento
  de hoy y queda en el companion de deuda.
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
| `AuthService.handleAuthError` | `( error : any \| ErrorResponse ) : Observable<false>` | `( error : HttpErrorResponse ) : Observable<never>`, re-lanzando el error crudo |
| `AuthService.checkStatus` / `singleUseTokenIsValid` | `Observable<boolean>` | sin cambios |
| `FileService.onFileChanged` | `( event ) : SelectedFile \| null` | sin cambios de firma; deja de validar |
| `TeacherRequestState.submitRequest` | `( dto ) : void` | `( dto ) : Observable<TeacherRequest>` |

Un tipo existente cambia de forma: **`ErrorResponse`** (`shared/models/api.interfaces.ts:20`) pasa `ok` y
`status` a opcionales, porque la rama de excepción no prevista del backend manda solo `error`.

Símbolos nuevos:

- `isAllowedMediaType` y su constante de mensaje, en `src/app/file/utils/allowed-media-type.ts`.
- `isServerError`, `getAuthErrorMessage`, `CONNECTION_ERROR_MESSAGE` e `INVALID_CREDENTIALS_MESSAGE`, en
  `src/app/auth/utils/auth-error-message.ts`.
- `ErrorPage` (`shared/pages/error/error-page.ts`), renombrada desde `NotFoundComponent`.

## Implementation plan

1. **File.** Crear `src/app/file/utils/allowed-media-type.ts` con el predicado y la constante del mensaje.
   Sacar la validación de `onFileChanged`, borrar el toast de `deleteFile` y quitar `inject(UIService)` de
   `file.service.ts`. Actualizar los cinco llamadores: llaman al helper, toastean el rechazo y liberan el
   object URL. `npm run build` compila y elegir un archivo inválido sigue mostrando el mismo mensaje.

2. **Teacher request.** `createTeacherRequest` propaga con `throwError` y pierde el `UIService`;
   `submitRequest` devuelve el observable con el `tap` que conserva `isSubmitting` y el `reload()`;
   `become-teacher-page` se suscribe con `next`/`error`. Probar: enviar una solicitud con el backend caído
   muestra un mensaje y el botón vuelve a habilitarse.

3. **La página de error.** Renombrar `not-found-page` a `shared/pages/error/error-page.*`, parametrizarla con
   los cinco inputs, reapuntar `shared/pages/index.ts` y declarar las dos rutas en `app.routes.ts` (`/error`
   con el `data` del 500, `**` con el del 404). Commit propio y aislado: es el único paso que puede romper el
   404. Probar `/una-ruta-que-no-existe` (idéntico a hoy) y `/error` a mano.

4. **Auth, núcleo del error.** Pasar `ok` y `status` de `ErrorResponse` a opcionales, crear
   `auth/utils/auth-error-message.ts` y el bloque `.form-error-banner` en
   `form-global.scss`. Reescribir `handleAuthError` (re-lanza crudo, mantiene el logout y el destrabe de
   `authStatus`) y unificar los cinco llamadores para que le pasen el `HttpErrorResponse` completo. Envolver
   `checkStatus` con su `catchError` propio comentado citando la SPEC 06, y sumarle la rama de error al
   `subscribe` de `exchangeCode`. Agregar la banda y la rama de error a `form-login` y `form-register`.
   Probar: login con contraseña equivocada muestra la banda y nada más; registro con email duplicado muestra
   texto real y no `[object Object]`; login con el backend apagado muestra el copy de conexión.

5. **Auth, perfil.** Sacar el `switchMap` de subida de avatar de `updateUser` y el `inject(FileService)` que
   queda huérfano. Reescribir `onSaveProfile` en `user-profile-page` para orquestar las dos llamadas y
   manejar los tres desenlaces, y sumarle la rama de error al `subscribe` de `deleteFile`. Probar: guardar
   perfil con y sin foto, y con una foto que el backend rechaza.

6. **Auth, resto de métodos.** Migrar `updatePassword`, `sendVerificationEmail`,
   `confirmEmailVerification`, `sendForgotPasswordEmail` y `resetPassword` a `Observable<void>` que propaga,
   y actualizar sus componentes: `user-profile-page.onChangePassword`, `email-verification-banner`,
   `forgot-password-page`, `verify-email-page` y `reset-password-page`. Borrar los `console.log` de esos
   métodos.

7. **Cierre.** Quitar `inject(UIService)` de `auth.service.ts`, verificar con `grep` que ningún
   `*.service.ts` lo referencia, actualizar el comentario de `resetPassword` (L179-181, que hoy explica por
   qué ese método es el único sin toast — después de esta spec todos lo son) y correr el pase manual
   completo con el backend prendido y apagado.

## Acceptance criteria

- [ ] `grep -rn "UIService" src/app --include=*.service.ts` solo devuelve el propio
      `shared/services/ui/ui.service.ts`.
- [ ] `grep -rn "UIService" src/app --include=*-state.ts` no devuelve nada (hoy ya es así; la spec no debe
      introducirlo).
- [ ] `grep -rn "UIService" src/app/auth/components/form-login src/app/auth/components/form-register` no
      devuelve nada: los dos formularios no tocan el toast.
- [ ] Un login con contraseña incorrecta (401) muestra la banda inline con el copy fijo del front, marca los
      dos inputs, **no** emite ningún toast y **no** navega a ninguna parte.
- [ ] Editar cualquier campo después de un intento fallido borra la banda.
- [ ] Un login con un email que no existe (404, `notFound('usuario no encontrado')`) muestra **el mismo** copy
      fijo que el 401. Desde la pantalla no se puede distinguir un email inexistente de una contraseña mal.
- [ ] Un registro con un email ya existente (400) muestra el mensaje del backend en la banda, no
      `[object Object]`.
- [ ] `ErrorResponse` declara `ok` y `status` opcionales, y `getAuthErrorMessage` es el único lugar del repo
      que lee un body de error.
- [ ] Con el backend apagado, un intento de login muestra la banda con el copy de conexión y sigue en
      `/auth/login`.
- [ ] Un 5xx en cualquier flujo de `AuthService` (salvo `checkStatus`) deja al usuario en `/error` con el copy
      del código 500.
- [ ] `/una-ruta-que-no-existe` sigue mostrando el 404 con el mismo layout y el mismo copy que hoy.
- [ ] Guardar el perfil con una foto que falla muestra "Perfil actualizado, pero no pudimos subir la foto."
      y un solo toast; los datos de texto quedan guardados.
- [ ] Cambiar la contraseña con la actual equivocada **no** muestra "Contraseña actualizada.".
- [ ] Borrar el avatar con el backend caído muestra un mensaje y no deja un error sin capturar en consola.
- [ ] Elegir un `.pdf` en cualquiera de los cinco selectores de archivo sigue mostrando el mensaje de tipo
      inválido, ahora emitido por el componente.
- [ ] Enviar una solicitud de profesor que falla muestra el mensaje y vuelve a habilitar el botón
      (`isSubmitting` baja).
- [ ] Con el backend apagado al arrancar la app, `authStatus` resuelve a `'not-authenticated'`, ninguna ruta
      guardada queda colgada, no aparece ningún toast de error en la carga inicial y **tampoco** se redirige a
      `/error`.
- [ ] El login con Google que falla se comporta como hoy: nada en pantalla y un `console.warn`, sin error no
      capturado.
- [ ] `npm run build` compila sin errores ni warnings nuevos.

## Decisiones

- **Sí:** propagar con `throwError` y manejar el error en el componente con `subscribe({ next, error })`.
  Es la convención que ya siguen los otros seis servicios del repo; alinear a los tres desviados no agrega
  un patrón nuevo que haya que aprender ni un tipo que haya que mantener.
- **No:** un tipo envoltorio de resultado (`Result<T>`, `Either`, o similar) para transportar el error como
  valor. Sería una tercera convención conviviendo con las dos que ya existen, y nada en el repo la pide.
- **Sí:** banda inline dentro del formulario para las credenciales inválidas, no un toast. El error pertenece
  al formulario que el usuario está mirando y al botón que acaba de apretar; un toast lo saca de contexto, se
  va solo a los 3,5 segundos y además hereda el defecto de `ui.service.ts:16`, que descarta cualquier mensaje
  nuevo mientras haya uno visible. Marcar los dos inputs además dice **dónde** corregir.
- **No:** una página de error para las credenciales inválidas. Sería sacar al usuario de la pantalla por el
  error más común y más recuperable del flujo, obligándolo a volver y reescribir todo.
- **Sí:** re-lanzar el `HttpErrorResponse` crudo en vez de un `Error` con el mensaje. El status es lo que
  decide el canal (banda, toast o navegación), así que envolverlo tira el único dato que la rama de error
  necesita para ramificar. El costo es que cada componente lee dos campos en vez de `e.message`, y el helper
  `getAuthErrorMessage` se come esa repetición.
- **Sí:** copy fijo del front en 401, 403 **y 404**, y mensaje del backend en el resto de los 4xx. No es una
  precaución teórica: el backend contesta un login con email inexistente con
  `CustomError.notFound('usuario no encontrado')`, así que mostrar ese texto deja enumerar cuentas con un solo
  intento — y dejaría el 401 con copy fijo y el 404 delatando lo mismo que el 401 oculta. Un 400 en cambio es
  validación escrita para el usuario, y mostrarla es lo que arregla el `[object Object]`.
- **Sí:** `ok` y `status` opcionales en `ErrorResponse`. La rama de fallback de `HandlerResponses.handleError`
  manda solo `{ error : 'Internal Server Error' }`, así que el tipo de hoy describe una sola de las dos formas
  reales. Se arregla en esta spec y no en la 17 porque es esta la que vuelve el body del error load-bearing:
  si el componente va a leerlo, el tipo tiene que decir qué puede faltar.
- **Sí:** status 0 (backend inalcanzable) va a la banda inline con copy de conexión, **no** a `/error`. No es
  que el servidor falló: es que no contestó, y decirle al usuario "algo falló de nuestro lado" cuando puede
  ser su conexión es impreciso. Además sacaría de la pantalla de login en cada intento con el backend apagado,
  que es el estado normal de desarrollo en este repo.
- **Sí:** un 5xx navega a `/error` en **todos** los flujos de `AuthService`. Es el único caso en que el
  servidor contesta que algo se rompió de su lado y no hay nada que el usuario pueda corregir en el formulario.
- **Sí:** renombrar `not-found-page` a una `error-page` parametrizada en vez de escribir una página hermana.
  El layout de dos paneles, el SCSS y los bloques de recuperación son los mismos; duplicarlos dejaría dos
  archivos que hay que mantener en paralelo. El copy sale del `data` de la ruta, que es el canal que el
  `withComponentInputBinding()` ya configurado vuelve gratis.
- **Sí:** copy fijo en `/error`, sin pasar el motivo real. Un 5xx no trae texto pensado para el usuario y
  puede filtrar detalle interno. Pasarlo por `router.navigate(..., { state })` además se pierde en un refresh,
  así que la página necesitaría el copy fijo como fallback de todos modos.
- **Sí:** que el componente orqueste las dos llamadas de guardar perfil (`updateUser` y después
  `uploadFile`). Es el único lugar donde se sabe que son dos operaciones con tres desenlaces posibles, y es
  lo que permite distinguir "falló todo" de "se guardó el texto pero no la foto" sin inventar un canal
  especial. De paso, `AuthService` deja de depender de `FileService`.
- **Sí:** `checkStatus` como excepción explícita que sigue atrapando el error. No hay componente suscrito a
  esa llamada, así que no hay a quién mostrarle nada, y su contrato real con el resto de la app es la señal
  `authStatus`, no el valor que emite. Dejarlo propagar no mejoraría nada y tocaría el camino que la spec 06
  tuvo que arreglar. Tampoco navega: un `/error` en el arranque dejaría la app inusable con el backend caído.
- **Sí:** pasarle a `handleAuthError` el `HttpErrorResponse` completo en los cinco llamadores, en vez del
  body. El status HTTP real existe siempre; el `status` del body **no**: la rama de excepción no prevista de
  `HandlerResponses.handleError` lo omite, así que hoy `error?.status === 401` lee `undefined` en todo 500
  inesperado y el `else if` del destrabe de `authStatus` es lo único que se ejecuta. Con el body, además, un
  401 sin cuerpo no desloguearía.
- **Sí:** mover la validación de tipo de archivo fuera de `FileService`, a un helper que llama el componente.
  Si el servicio se queda con la regla de qué extensión se acepta, sigue teniendo criterio sobre la UI —
  solo que mudo. El helper es una función pura, testeable y sin dependencia de Angular.
- **Sí:** arreglar en esta spec los cuatro bugs de feedback (login mudo, `[object Object]` en registro, toast
  de contraseña incondicional, `deleteFile` sin handler). Los cuatro son consecuencia directa de la
  inversión de responsabilidad que la spec corrige, y los cuatro viven en `subscribe` que hay que reescribir
  igual. Dejarlos sería elegir mantenerlos a propósito.
- **No:** resolver quién muestra el error del login con Google. `exchangeCode` se suscribe en el constructor
  del servicio porque el callback del popup es global, y elegir dueño (un signal de estado en `AuthService`
  que renderice `GoogleAuthButtonComponent`, o mover el wiring del provider) es una decisión de diseño que no
  tiene nada que ver con sacar el toast de los servicios. Se conserva el comportamiento de hoy.
- **No:** tocar `ui.service.ts`. Su guard que descarta mensajes y su falta de severidad son problemas reales,
  pero son del toast, no de quién lo llama. Mezclarlos acá convertiría una spec de responsabilidades en una
  de componentes visuales. Van al companion de deuda técnica.
- **No:** migrar `singleUseTokenIsValid`. Lo consume un guard, no toastea, y su fail-open es deliberado.

## Risks

| Riesgo | Mitigación |
| --- | --- |
| Reescribir `handleAuthError` rompe el destrabe de `authStatus` y la app queda colgada en `'checking'` con el backend caído — exactamente el bug que arregló la spec 06 | Las dos ramas estructurales (`logoutUser()` en 401/403 y el `else if (authStatus() === 'checking')`) se conservan textualmente antes del `throwError`. Hay un criterio de aceptación dedicado que se prueba con el backend apagado. |
| Un `subscribe` sin rama `error` queda sin migrar y el throw aparece como error no capturado en consola, sin feedback | La lista de componentes del Scope sale del inventario completo de llamadores, no de una búsqueda parcial — incluido el `.subscribe()` de `exchangeCode`, que no está en ningún componente. El pase manual recorre los flujos de los criterios de aceptación. |
| Un 5xx mientras el usuario edita el perfil en `/auth/me` lo saca de la pantalla y pierde lo que escribió | Trade-off aceptado al elegir que la regla valga para todos los flujos de auth. Queda anotado en el companion de deuda; si molesta en el pase manual, la vuelta atrás está acotada a `user-profile-page`. |
| El rename de `not-found-page` rompe el 404 | Va en su propio commit (paso 3), el `**` se reapunta en el mismo paso, y el layout y el copy del 404 salen de `data` con los literales idénticos a los de hoy. Hay un criterio de aceptación dedicado. |
| `getAuthErrorMessage` devuelve el copy fijo donde el backend sí mandaba algo útil | Solo pasa en 401/403/404, y es deliberado: el backend contesta `notFound('usuario no encontrado')` a un login con email inexistente, y mostrarlo deja enumerar cuentas. |
| Meter el 404 en el bucket del copy fijo se come el texto de un `notFound('token inválido o expirado')` en `verify-email-page` y `reset-password-page` | Esas dos páginas ya son dueñas de su propio estado inline para ese caso (`confirmState: 'error'` y `panelState: 'invalid'`, con copy propio), así que el texto del backend no agregaba nada que la pantalla no diga ya. |
| Cambiar la firma de `updateUser` (pierde el parámetro `file`) rompe otro llamador que no está en la lista | TypeScript en `strict` marca cualquier llamador con la aridad vieja. Hoy el único es `user-profile-page.component.ts:103`. |
| `onFileChanged` crea el object URL antes de que nadie valide, así que un archivo rechazado deja un blob colgado | Los cinco llamadores llaman `URL.revokeObjectURL( selected.previewURL )` en el camino de rechazo; está en el Scope y no es opcional. |
| `checkStatus` queda como excepción y con el tiempo alguien la "arregla" por uniformidad, rompiendo los guards | La excepción se escribe como comentario en el código, no solo en esta spec, citando la spec 06. |

## What is **not** in this spec

- El comportamiento interno de `ui.service.ts` (descarte de mensajes, severidad, `timer` muerto, señal pública).
- Quién es dueño de la UI de error del login con Google (`exchangeCode`).
- Los otros seis servicios, que ya propagan correctamente.
- `singleUseTokenIsValid` y su fail-open.
- El fallo silencioso del cálculo de total en `cart.service.ts`.
- El `throwError` sin retornar de `course.service.ts:137`.
- Tests.

Cada uno de esos, si se necesita, va en su propia spec.
