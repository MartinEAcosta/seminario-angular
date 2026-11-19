# SPEC 16 — Deuda técnica

> **Companion de:** `16-toast-decidido-por-el-componente.md`
> **Date:** 2026-11-18
> **Objective:** Registrar lo que la SPEC 16 deja deliberadamente abierto, y las correcciones que la
> implementación tuvo que hacerle al propio documento cuando el repo o el backend no coincidían con lo
> que la spec daba por verificado.

## 1. Correcciones a la spec (el documento estaba equivocado)

### 1.1 El inventario de llamadores de `onFileChanged` era falso

La spec listaba cinco llamadores TS. En el repo solo **uno** lo es:

| Spec | Realidad medida |
| --- | --- |
| `user-profile-page.component.ts:70` | ✅ correcto, único que usa el `SelectedFile` |
| `thumbnail-selector.component.ts:16` | la llamada estaba en el **HTML** (`:8`) y el resultado se descartaba |
| `form-lesson.component.ts:27` | ídem (`form-lesson.component.html:28`) |
| `slider-content-manager.component.ts:37` | ídem (`:75`), y además pasaba un 2º argumento `'lesson'` que la firma no tiene |
| `course-step-data.component.ts` | **no llama** `onFileChanged`; solo renderiza `<app-thumbnail-selector>` |

Verificado además que `setThumbnailFile`/`setTempThumbnail` nunca se llamaban desde el selector de portada,
y que `setTempMedia` solo se setea desde la URL de una lección ya guardada
(`slider-content-manager.component.ts:74,116`). O sea: **en esos tres selectores, elegir un archivo válido
no hacía nada**, y el único feedback que producían era el toast del tipo inválido que emitía el servicio.

**Qué se hizo:** se borró el `(change)` muerto de los tres templates, más su `inject(FileService)` e import.
Los `<input type="file">` quedan inertes y explícitos. El criterio de aceptación de "los cinco selectores"
baja a uno (`user-profile-page`).

**Qué queda pendiente:** la portada del curso y el medio de la lección **siguen sin funcionar**.
`courseFormState.thumbnailFile()` es siempre `null`, así que `course-step-data.component.ts:50` y `:67`
llaman `saveCourse( dto , null )` y la portada nunca se sube. Conectar el handler a
`setThumbnailFile`/`setTempThumbnail`/`setTempMedia` es ~10 líneas por componente y **no está en esta spec**.

### 1.2 El contrato de error del backend no era el que la spec decía

La spec afirmaba, bajo el título "El contrato de error del backend (**verificado**)", que un login con email
inexistente contesta `notFound('usuario no encontrado')`. Medido contra el backend corriendo, contestaba:

```
HTTP/1.1 400 Bad Request
{"ok":false,"status":400,"error":"El email ingresado no se encuentra vinculado a una cuenta."}
```

Como la regla de ruteo manda el 400 al mensaje del backend, el front mostraba ese texto y la enumeración de
cuentas quedaba trivial — exactamente lo que la decisión de "copy fijo en 401/403/404" quería evitar.

**Qué se hizo:** el backend se corrigió durante la implementación (fuera de este repo). Verificado después:
la pantalla muestra el copy fijo y un email inexistente es indistinguible de una contraseña equivocada.

**Qué queda pendiente:** la sección "verificado" de la spec sigue describiendo un contrato que no se había
comprobado. Si se vuelve a tocar esa regla, medir primero.

### 1.3 `ok === false` con HTTP 200 **no** es un error

La spec dice: *"Un `ok === false` con HTTP 200 también se convierte en error."* Eso contradice el diseño del
backend. Medido:

```
POST /auth/forgot-password  {"email":"<inexistente>"}
HTTP/1.1 200 OK
{"ok":true,"data":"En caso de que el usuario exista, enviamos un email."}

POST /auth/reset-password   {"token":"<inválido>"}
HTTP/1.1 401 Unauthorized
{"ok":false,"status":401,"error":"El token no es valido o ya fue utilizado."}
```

La respuesta neutra **es** la defensa: impide deducir si la cuenta o el token existen. Convertirla en error
en el cliente reintroduce la fuga. Los fallos reales llegan siempre como status HTTP, que además es la regla
que la propia spec fija para todo lo demás ("el status se lee del `HttpErrorResponse`, nunca del body").

**Qué se hizo:** los cinco métodos `Observable<void>` no miran el `ok` del body, con un comentario en bloque
que explica por qué, para que nadie lo "uniforme" después. `confirmEmailVerification` conserva su
`if( authResponse.ok )` alrededor de `setEmailVerified(true)`, sin convertirlo en error.

## 2. Lo que la spec dejó fuera a propósito

- **`ui.service.ts` sin tocar.** Sigue descartando cualquier mensaje nuevo mientras haya uno visible
  (`:16`), sin severidad `success`/`error`, con una `private timer` declarada y nunca usada (`:12`) y
  `_errorMessage` público por falta de modificador (`:8`). Esta spec movió **quién llama** al toast, no cómo
  funciona el toast.
- **Dueño de la UI de error del login con Google.** `exchangeCode` se suscribe en el constructor de
  `AuthService` porque el callback del popup es global y no cuelga de ningún componente. Se conservó el
  comportamiento de hoy (`console.warn`, nada en pantalla). Elegir dueño — un signal de estado en
  `AuthService` que renderice `GoogleAuthButtonComponent`, o mover el wiring del provider — es una decisión
  de diseño propia.
- **`singleUseTokenIsValid`** (`auth.service.ts`): fail-open deliberado con `of(true)`, lo consume un guard,
  no toastea. Se dejó exactamente como estaba, incluidos sus dos `console.log`.
- **Los otros seis servicios** (`course`, `enrollment`, `payment`, `category`, `lesson`, `module`): ya
  propagan con `throwError` y no inyectan `UIService`.
- **`cart.service.ts:58-72`**: el cálculo de total falla en silencio (`console.error` y nada más), y el
  `throwError` de `:30` se crea y nunca se suscribe.
- **`course.service.ts:137`**: `deleteCourse` construye el `throwError` y **no lo retorna**.
- **Tests.** El target `ng test` no compila por un problema previo (ver `CLAUDE.md`).

## 3. Deuda nueva que deja esta implementación

### 3.1 Un 5xx mientras se edita el perfil saca al usuario

La regla "5xx → `/error`" vale para **todos** los flujos de `AuthService`, incluido `onSaveProfile` en
`/auth/me`. Si el servidor se rompe mientras el usuario edita, pierde lo que escribió. Trade-off aceptado al
elegir una regla única; la vuelta atrás está acotada a `user-profile-page`.

### 3.2 Los cinco métodos `void` no pasan por `handleAuthError`

`updatePassword`, `sendVerificationEmail`, `confirmEmailVerification`, `sendForgotPasswordEmail` y
`resetPassword` propagan con `throwError` directo. La spec nombra exactamente cinco llamadores de
`handleAuthError` y ninguno de estos está en la lista, así que se respetó. Consecuencia: un 401 en esos
flujos **no** desloguea ni destraba `authStatus`. Es el comportamiento de hoy, no una regresión, pero es una
asimetría que conviene decidir a conciencia.

### 3.3 `checkStatus` atrapa el error con un `catchError` anidado

```ts
catchError( ( error : HttpErrorResponse ) =>
  this.handleAuthError( error ).pipe( catchError( () => of(false) ) )
),
```

Lanza y vuelve a atrapar en la misma expresión. Se escribió así para mantener literal la spec, que lista
`checkStatus` entre los cinco llamadores de `handleAuthError`. La alternativa más limpia es extraer las dos
responsabilidades estructurales a un `settleAuthState( error )` privado que llamen tanto `handleAuthError`
como `checkStatus`, dejando a este último con un `catchError` plano.

### 3.4 `teacher-request` perdió el mensaje del backend

`become-teacher-page` muestra un copy fijo del front. Antes mostraba
`error?.error ?? '<fallback>'`. El criterio de aceptación exige que `getAuthErrorMessage` sea el único lugar
del repo que lee un body de error, y la spec excluye `teacher-request` de la regla de ruteo, así que no puede
usar ese helper. Si el backend contestaba algo útil (p. ej. "ya tenés una solicitud pendiente"), eso ya no se
ve.

### 3.5 Toast de éxito nuevo en la solicitud de profesor

Se agregó "Recibimos tu solicitud. Te avisamos por correo." porque la spec pide que la página "decida los dos
mensajes". Antes no existía: el éxito se comunicaba solo con el panel que cambia a `pending`. Es redundante
con ese panel.

### 3.6 `isSubmitting` sube fuera del observable

`TeacherRequestState.submitRequest` hace `isSubmitting.set(true)` en el cuerpo del método, no dentro del
observable que devuelve. Como `become-teacher-page` se suscribe de inmediato el comportamiento es idéntico al
de hoy, pero si alguien llamara `submitRequest()` sin suscribirse, el flag quedaría en `true` para siempre.

### 3.7 Presupuestos de SCSS

- **`user-profile-page.component.scss` rompe el build desde antes de esta spec**: 9.91 kB contra un budget de
  8 kB. El error existe en `main` y no lo causó este trabajo; el criterio "`npm run build` compila sin
  errores" se verificó como "**sin errores nuevos**".
- **`auth/form-global.scss` pasó de 4.42 kB a 4.83 kB** (budget de warning: 4 kB) por el bloque
  `.form-error-banner`. El warning ya existía; creció ~410 bytes.

### 3.8 Los cinco inputs de `ErrorPage` son `input.required`

Si una ruta futura olvida uno, la página de error explota en vez de renderizar un bloque vacío. Se eligió
fallar fuerte en desarrollo, pero es una elección discutible justamente en la página que existe para cuando
algo ya falló.

### 3.9 `shared/pages/index.ts` exporta un módulo default-only

`export * from './error/error-page'` no exporta nada: el único export del archivo es `default`. La línea ya
era un no-op cuando apuntaba a `not-found-page` y se reapuntó tal cual lo pedía la spec.

### 3.10 Los otros servicios leen un campo de error que no existe

`course`, `lesson`, `module` y `enrollment` construyen sus errores con `error.errorMessage`. `ErrorResponse`
no tiene ese campo — el campo es `error` — así que esos `throwError` producen `Error("undefined")`. Fuera del
alcance de esta spec (no inyectan `UIService` y ya propagan), pero es la misma clase de bug que el
`[object Object]` que esta spec arregló.

### 3.11 Hay una cuenta de prueba en la base de desarrollo

`spec16-prueba@ejemplo.test` (id `6afe023972c460d615af4719`), creada durante la verificación del contrato de
error. Borrarla si molesta.
