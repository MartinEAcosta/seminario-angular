# SPEC 17 — Los DTOs de salida y la limpieza del contrato que la SPEC 15 dejó a la vista

> **Status:** Aprobado
> **Depends on:** SPEC 15 (separar los DTOs por feature), SPEC 16 (toast decidido por el componente — toca `auth`, `file` y `teacher-request` service, que esta spec también abre)
> **Date:** 2026-11-18
> **Re-auditada:** 2026-11-19 contra `main` post-`b271a52` (merge del PR #29: SPEC 16 + los restos de la
> 15). Todas las citas `archivo:línea` de este doc apuntan a ese estado.
> **Objective:** Terminar el corte entre modelo interno y contrato del backend que la SPEC 15 hizo sólo del lado entrante, separando los DTOs de salida en un `*.request.ts` por feature, devolviéndole al mapper la construcción del body, y resolviendo el código muerto y las incoherencias de tipo que el movimiento dejó a la vista.

## Por qué existe esta spec

La SPEC 15 movió la mitad **entrante** del contrato: nueve `*.response.ts`, uno por feature. La mitad
**saliente** quedó donde estaba, mezclada con el modelo interno: `CourseDTO` vive en `course.interface.ts`,
`UserDTO` en `auth.interface.ts`, `ModuleDTO` en `module.interface.ts`. El resultado es un archivo de modelo
que declara dos cosas de naturaleza distinta — lo que la app usa internamente y lo que le manda al backend —
y un `*.response.ts` al lado que declara la tercera. El triángulo que la SPEC 15 describió (modelo ≠ DTO ≠
mapper) está dibujado a medias.

Hay además dos cosas que esa spec no pudo arreglar porque era de movimiento, y que ahora están a la vista
en vez de a cien líneas de distancia:

- **Defensas que contradicen al tipo.** `course.mapper.ts:36` hace `response.spots_remaining ?? null` sobre
  un campo que `CourseResponseDto` declara `number` requerido. `module.mapper.ts:12` hace `?? []` sobre
  `lessons: string[]`. `lesson.mapper.ts:41-46` hace `?? null` tres veces y un `?? 'image'` sobre campos
  que `LessonPopulatedResponseDto.file` declara requeridos y no-null. En cada caso **o el tipo miente o la
  defensa sobra**, y nada en el repo decide cuál. El `?? 'image'` es el peor: inventa un `resource_type` que
  el backend nunca mandó.
- **Contratos sin consumidor.** La SPEC 15 creó archivos "la feature es dueña del contrato que consume" para
  contratos que nadie consume. La cadena completa de issuers (`IssuerResponseDto`, la entidad `Issuer`, dos
  métodos de `PaymentMapper` y dos imports muertos en `payment.service.ts`) no tiene un solo llamador: los
  medios de pago se resuelven client-side desde el BIN. Dentro de esa cadena muerta vive el único bug real
  de los mappers (`payment.mapper.ts:17` copia `thumbnail` en `secure_thumbnail`), así que el borrado lo
  resuelve sin que haya nada que arreglar.

- **Una defensa nueva, nacida después de escribirse esta spec.** La SPEC 16 agregó en `auth.service.ts:100`
  la guarda `if( authResponse.user && authResponse.token )`, con un comentario que lo dice explícito:
  «`AuthResponse` tipa `user` y `token` como requeridos, pero este endpoint puede contestar sin ellos; sin la
  guarda, un cambio de contraseña exitoso borraría `x-token` y desloguearía al usuario». Es el mismo patrón,
  en el tipo que el punto B viene a reemplazar, y con evidencia de un fallo observado — así que entra a la
  tabla del punto D en vez de quedar afuera por haber llegado tarde.

Y la SPEC 15 dejó explícitamente sin escribir las reglas que su propio diff tuvo que improvisar: cuándo una
feature necesita más de un archivo de contrato, qué orden llevan los imports, `import type` o `import`,
comillas. Esta spec las fija — sólo para los archivos que abre, no con una pasada global.

## Scope

### In

**A. Los DTOs de salida pasan a un `*.request.ts` por feature.** Simetría exacta con los nueve
`*.response.ts`, y la misma regla de dependencia: `request` → `interface`, nunca al revés.

| Archivo nuevo | Símbolos que recibe | De dónde salen |
| --- | --- | --- |
| `src/app/course/models/course.request.ts` | `CourseDTO` | `course.interface.ts` |
| `src/app/lesson/models/lesson.request.ts` | `SaveLessonDto` | `lesson.interface.ts` |
| `src/app/module/models/module.request.ts` | `ModuleDTO` | `module.interface.ts` |
| `src/app/teacher-request/models/teacher-request.request.ts` | `TeacherRequestDTO` | `teacher-request.interface.ts` |
| `src/app/payment/models/payment.request.ts` | `CreateOrderRequestDTO`, `OrderPayerDTO`, `ItemQuantity` | `payment.interface.ts`, `cart/models/cart.interface.ts` |
| `src/app/auth/models/auth.request.ts` | `UserDTO`, `PasswordDTO` | `auth.interface.ts` |

`category`, `enrollment` y `file` no reciben archivo: `Category`, `Enrollment` y `EnrollmentDetailed` no
tienen DTO de salida, y `FileService` manda `FormData`, no un tipo. `ItemQuantity` se va de `cart` a
`payment` porque es parte del body de `POST /orders/` — la feature dueña del endpoint es dueña del contrato,
que es la regla que fijó la SPEC 15. Eso invierte el import que hoy existe (`payment.interface.ts` importa
de `@cart/*`): a partir de acá `cart/state/cart.service.ts` importa de `@payment/models/payment.request`.

**B. `AuthResponse` se convierte en un DTO de verdad.** Nace `src/app/auth/models/auth.response.ts` con:

- `AuthResponseDto` (`{ ok: boolean; user ?: UserResponseDto; token ?: string }`), renombrado desde
  `AuthResponse`. `user` y `token` van **opcionales**: `PUT auth/password/` y
  `POST auth/validate-email/:token` contestan sin ellos y la guarda de `auth.service.ts:100` ya depende de
  eso. Queda igual como fila de la tabla del punto D, para confirmarlo contra el backend en el paso 6.
- `UserResponseDto` nuevo: la forma cruda que manda el backend para el usuario (`id`, `first_name`,
  `last_name`, `email`, `isEmailVerified`, `role`, `avatar_url`, `id_file`), hoy inexistente.

Hoy `AuthResponse` embute el modelo interno `User`, de modo que `AuthMapper.mapResponseToUser` mapea modelo
→ modelo: es el único mapper del repo que no mapea nada. Con `UserResponseDto` pasa a mapear DTO → `User`.
Los campos son por ahora idénticos; el punto es que dejen de ser el **mismo tipo**, para que un cambio del
backend se pueda absorber en el mapper sin tocar `User`. `auth/models/auth.interface.ts` queda con exactamente
dos símbolos: `AuthStatus` y `User` (`UserDTO` y `PasswordDTO` se van a `auth.request.ts`, `AuthResponse` a
`auth.response.ts`).

**C. Las uniones inline duplicadas se nombran, reusando el tipo de `file`.**

- `ResourceValidTypes` (ya en `file/models/file.interface.ts`) pasa a tipar también
  `LessonPopulatedResponseDto.file.resource_type` y `LessonPopulated.file.resource_type` (ésta con `| null`,
  según cómo cierre el punto D). Tipa además las dos anotaciones de
  `lesson/state/lesson-form/lesson-form-state.ts:23,74` (`signal<'image' | 'video' | null>` y el parámetro de
  `setTypeMedia`). Son cuatro copias anónimas, no dos, y con esto no queda ninguna — que es lo que el criterio
  de aceptación exige.
- Nace `LessonContentType = 'video' | 'document'` en `lesson/models/lesson.interface.ts`, importada por
  `module/models/module.interface.ts` y `module/models/module.response.ts`. Vive en `lesson` aunque hoy el
  campo sólo aparezca anidado en los dos tipos de `module`: tipa una propiedad de una lección, y `module`
  ya depende de `lesson` de hecho al embutir su forma.

**D. Cada defensa `??` termina resuelta: o el DTO es opcional, o la defensa no existe.** Ningún campo queda
con las dos cosas. La resolución **se verifica contra el backend corriendo**, campo por campo, antes de
tocar el tipo:

| Campo | Hoy | Dónde |
| --- | --- | --- |
| `spots_remaining` | `number` requerido en `CourseResponseDto`, `?: number \| null` en `CoursePopulatedResponseDto`, `?? null` en el mapper | `course.response.ts:17,41`, `course.mapper.ts:36,62` |
| `lessons` | `string[]` / array requerido en los dos DTO, `?? []` en el mapper | `module.response.ts`, `module.mapper.ts:12,36` |
| `file.id`, `file.url`, `file.extension` | requeridos y no-null, `?? null` en el mapper | `lesson.response.ts`, `lesson.mapper.ts:42,43,45` |
| `file.resource_type` | requerido, `?? 'image'` en el mapper | `lesson.response.ts`, `lesson.mapper.ts:44` |
| `resource_type` de `FileResponseDto` | `ResourceValidTypes` (`'image' \| 'video' \| 'raw' \| 'auto'`), más ancho que lo único que `FileService` produce | `file.response.ts`, `file.interface.ts:1` |
| `AuthResponse.user`, `AuthResponse.token` | **RESUELTO** (ver abajo): requeridos en el DTO, guarda conservada a propósito | `auth.response.ts`, `auth.service.ts` |

Las dos variantes de `spots_remaining` quedan iguales entre sí, sea cual sea el resultado: hoy el mismo
campo del mismo recurso se declara distinto según el endpoint, y eso no se sostiene. Si la verificación
confirma que el backend sólo manda `image` y `video`, `ResourceValidTypes` se angosta a esos dos.

#### Verificación de `auth` contra el backend (parte del paso 6, ya hecha)

Hecha el 2026-11-19 leyendo `MartinEAcosta/udemix-backend@main` (push 2026-11-16), no una respuesta en vivo:

- `HandlerResponses.handleAuthSuccess` emite **`{ ok, user, token }` plano** (no `ApiResponse<T>`) en
  `POST /register`, `POST /login`, `POST /login/google`, `PUT /update/user/:id`, `GET /renew`,
  `PUT /password` y `PUT /password/set`. `AuthResponseDto` declara los tres campos **requeridos**.
- `PUT /auth/password` pasa por ese mismo helper y su use case (`UpdatePassword`) devuelve `{ user, token }`
  o lanza `CustomError`: **no existe rama que conteste sin ellos**. La guarda que agregó la SPEC 16 en
  `auth.service.ts` es por lo tanto redundante hoy, y **se conserva igual por decisión explícita**: el costo
  de que un backend futuro conteste sin esos campos es borrar `x-token` y desloguear al usuario en medio de un
  cambio de contraseña exitoso. Es la única excepción consciente al criterio "ningún `??`/guarda sobre un
  campo requerido" de esta spec.
- `POST /auth/validate-email/:token` **no es una respuesta de auth**: va por `handleSuccess` y devuelve
  `ApiResponse<{ verified : boolean }>`. El front la tipaba `AuthResponse` y sólo leía `.ok`, así que
  funcionaba por accidente. Retipada.
- El `user` del backend (`UserMapper.fromUserResponseDto`) **no es** el `User` interno: `role` viaja como
  `string`, `avatar_url` e `id_file` llegan `null` cuando el usuario no tiene File, y viaja un `balance`
  que esta app no usa. `UserResponseDto` espeja esas tres primeras diferencias y **omite `balance` a
  propósito**; `AuthMapper.mapResponseToUser` las cierra (`role as User['role']`, `?? ''`, `?? ''`). Eso
  invalida la frase original del punto B ("los campos son por ahora idénticos").
- Fuera de la letra del punto B, tres anotaciones más no describían lo que manda el backend y se corrigieron
  en el mismo paso: `POST /send-validation-email` es `ApiResponse<{ send : boolean }>`, y
  `POST /forgot-password` y `POST /reset-password` son `ApiResponse<string>` (devuelven el mensaje neutro),
  no `ApiResponse<boolean>`. Ninguno de los tres lee `data`, así que no cambia comportamiento.

**E. Se borra el código muerto.**

- Cadena issuer completa: `IssuerResponseDto` (`payment.response.ts:4`), la entidad `Issuer`
  (`payment.interface.ts:3`), `PaymentMapper.mapIssuerListResponseToEntityArray`,
  `PaymentMapper.mapIssuerResponseToEntity` y los dos imports muertos de `payment.service.ts:9,11`. El bug
  `secure_thumbnail: response.thumbnail` (`payment.mapper.ts:17`) desaparece con ella.
- `CourseMapper.mapResponseToCourseArray`, `LessonMapper.mapResponseToLessonArray` y
  `ModuleMapper.mapResponseToModuleArray` — cero llamadores. Las variantes `*PopulatedArray` **sí** se usan
  (`module.service.ts:55`, `lesson.service.ts:29`) y no se tocan.
- `LessonDto` (`lesson/models/lesson.interface.ts`): cero consumidores en todo el repo, ni siquiera su
  propio archivo lo usa. **Hallazgo de esta spec**, no estaba en la deuda de la 15.

**F. `file.service.getFileByPublicId` pasa por `FileMapper`** y devuelve `UploadedFile` en vez del
`ApiResponse<FileResponseDto>` crudo. Es el último lugar que viola el invariante que las nueve cabeceras
declaran. El `map` de hoy (`file.service.ts:84-87`) es `res => { console.log(res); return res; }`: ese
`console.log` se va en el mismo paso, reemplazado por la llamada al mapper.

El otro caso (`lesson.service.getLessonById` con `http.get<any>` y sin `.data`) **ya está arreglado y
commiteado** en `main` desde `b271a52`: hoy es `http.get<ApiResponse<LessonResponseDto>>` +
`lessonResponse.data` (`lesson.service.ts:38-49`). Esta spec no lo incluye.

**G. Convenciones, como sección normativa.** Se escriben acá y se aplican **sólo a los archivos que esta
spec abre** — sin pasada global por el repo:

1. **Archivos de contrato por feature:** un `*.response.ts` y un `*.request.ts`. Se parte en más de uno sólo
   cuando la feature ya tiene dos modelos internos separados — el único caso es `payment` / `order`, que
   espeja el split preexistente entre `payment.interface.ts` y `order.interface.ts`. **Nunca** por cantidad
   de endpoints.
2. **Orden de imports:** Angular → `rxjs` → aliases de feature → relativos; dentro de los aliases, el modelo
   antes que su `.response` / `.request`.
3. **`import type`** para todo lo que se importa solamente como tipo.
4. **Comillas simples** en todo archivo que la spec toque, en vez de seguir el estilo del archivo huésped.
5. **Un tipo, una ruta: se borra el alias `@interfaces/*`.** Sale de `tsconfig.json` y sus siete imports
   pasan al alias de la feature dueña del tipo: `cart/models/cart.model.ts`,
   `course/components/course-carousel`, `course/components/course-featured`, `course/resolver/course-resolver`,
   `course/state/course-form/course-form-state` y
   `shared/components/btns/btn-remove/btn-remove.component.ts` (los seis a
   `@course/models/course.interface`) y `user/state/user-state.ts` (a `@auth/models/auth.interface`).
6. **Un `*.request.ts` se importa para anotar un borde, nunca para construir el body.** Ver el punto H: la
   construcción es del mapper. Las cabeceras de los seis `*.request.ts` dicen eso en vez de copiar la frase
   del `*.response.ts` ("nada de este archivo llega a un componente"), que sería un invariante falso — un
   `output<TeacherRequestDTO>()` o el parámetro de un handler son anotaciones legítimas en un componente.

**H. El mapper construye el body; el componente sólo lo entrega.** Un DTO es un `interface`: no existe en
runtime y no puede producir nada. El repo ya tiene cinco métodos salientes (`AuthMapper.mapFormToUserDTO`,
`mapFormToPasswordDTO`, `CourseMapper.mapToCourseDto`, `LessonMapper.mapToCreateLessonDto`,
`ModuleMapper.mapToModuleDto`), así que la regla no es nueva — está incumplida en dos lugares y de más en un
tercero:

- `teacher-request/components/teacher-request-form/teacher-request-form.component.ts:83-89` arma el literal
  `TeacherRequestDTO` a mano, con el `experienceLevel!` y el spread condicional de `portfolioUrl` adentro
  del componente. `TeacherRequestMapper` tiene sólo el lado entrante. **Nace
  `TeacherRequestMapper.mapFormToTeacherRequestDTO( form : FormGroup ) : TeacherRequestDTO`** con esa lógica
  movida tal cual, y el componente queda con `this.submitRequest.emit( TeacherRequestMapper.mapFormToTeacherRequestDTO( this.teacherRequestForm ) )`.
  El `output<TeacherRequestDTO>()` y el handler `onSubmitRequest( dto : TeacherRequestDTO )` de
  `become-teacher-page.component.ts:66` se quedan: son el borde, no la construcción.
- `payment/state/checkout-form-state.ts:238-253` arma `CreateOrderRequestDTO` a mano. **Nace
  `OrderMapper.mapCheckoutToCreateOrderRequest( items, token, paymentMethod, installments, cardholder )`**
  y el state pasa a juntar los insumos y delegar la forma. No recibe un `FormGroup` porque el payload
  compone tres fuentes (los items del carrito, el token que devuelve `createCardToken` y el form del
  titular); la firma es explícita por eso. Beneficio extra: el payload que lleva el token de la tarjeta, el
  mail y el documento queda escrito en **un** solo lugar, que es más fácil de mantener fuera de un `console.log`.
- `auth/components/form-login/form-login.component.ts:67` **ya** pasa por `AuthMapper.mapFormToUserDTO`; su
  import de `UserDTO` (línea 10) sólo anota una variable local cuyo tipo el mapper ya devuelve. Se borra la
  anotación redundante y con ella el import: ese componente deja de tocar el DTO.
- Lo mismo en `auth/pages/user-profile-page/user-profile-page.component.ts:211`
  (`const passwordDto : PasswordDTO = AuthMapper.mapFormToPasswordDTO( this.passwordForm )`, import en la
  línea 20): es su único uso del símbolo — la línea 137 ya llama a `mapFormToUserDTO` sin anotar nada. Se borra
  la anotación y `PasswordDTO` sale del import, que queda sólo con `User`. Este caso apareció con el rediseño
  de esa página en la SPEC 16, así que no estaba en la lista original.

### Out of scope

- **Mover los mappers de `src/app/mappers/` a cada feature.** Son 11 archivos más todos sus importadores, y
  es otro diff mecánico del tamaño del paso 1 de la SPEC 15. Va en su propia spec, junto con qué pasa con el
  alias `@mappers/*`.
- **Partir `LessonResponseDto` en respuesta + request** y resolver el `id ?: string` que también declaran
  `Lesson` y `LessonPopulated` (deuda 15.1). Arrastra los modelos internos y no es un movimiento.
- **`min_length` / `max_length` de `IdentificationTypeResponseDto`** tipados `string` donde MercadoPago
  documenta número (deuda 15.1). Necesita una respuesta real del endpoint de identification-types, que es
  verificación de datos, no de tipos.
- **`teacher-request.response.ts` tipando `experience_level` con `TeacherExperienceLevel`**, la misma unión
  que tipa las opciones del formulario (deuda 15.6). Se deja y se documenta: duplicar la unión contradice
  directamente la deduplicación que la SPEC 15 hizo a propósito. El riesgo queda anotado — un valor nuevo
  del backend obliga a editar el archivo que tipa la UI.
- **Validación en runtime de los DTOs** (zod, valibot, guards a mano). El repo no tiene librería de
  validación y agregar una es una decisión de stack, no de tipado.
- **Renombrar `shared/models/api.interfaces.ts` a singular** (deuda 15.4). Sigue siendo 18 imports por cero
  ganancia.
- **Revisar los otros dos aliases torcidos.** `@guards/*` resuelve a `auth/guards/*` y no a un directorio
  top-level, y `@mappers/*` queda sin destino si algún día los mappers se van a su feature. Los dos son
  single-target: el nombre engaña, pero ninguna ruta es ambigua. Distinto problema que `@interfaces/*`.
- **Barrels `index.ts` en los `models/`.** La única línea de `tsconfig.json` que esta spec toca es el borrado
  de `@interfaces/*` (punto G.5).
- **Tests.** `ng test` no compila en este repo desde antes (`angular.json` referencia `@videojs/themes`, que
  no está instalado — ver `CLAUDE.md`). La verificación es la misma que usó la SPEC 15: `tsc --noEmit` por
  paso, `npm run build` al final y pase manual con el backend corriendo.

## Data model

Esta spec no introduce estructuras de datos nuevas en runtime, pero **sí cambia declaraciones de tipo**, a
diferencia de la SPEC 15:

- **Nuevo:** `UserResponseDto` (`auth/models/auth.response.ts`) — la forma cruda del usuario, que hoy no
  existe como tipo propio.
- **Nuevo:** `LessonContentType` (`lesson/models/lesson.interface.ts`) — `'video' | 'document'`, hoy inline
  en dos archivos de `module`.
- **Nuevos métodos de mapper (punto H):** `TeacherRequestMapper.mapFormToTeacherRequestDTO` y
  `OrderMapper.mapCheckoutToCreateOrderRequest`. No agregan tipos: mueven código que hoy vive en un
  componente y en un state.
- **Renombrado:** `AuthResponse` → `AuthResponseDto`, y su campo `user` pasa de `User` a `UserResponseDto`.
- **Borrado:** `Issuer`, `IssuerResponseDto`, `LessonDto`.
- **Movido sin cambios:** `CourseDTO`, `SaveLessonDto`, `ModuleDTO`, `TeacherRequestDTO`,
  `CreateOrderRequestDTO`, `OrderPayerDTO`, `ItemQuantity`, `UserDTO`, `PasswordDTO`.
- **Opcionalidad a definir en el paso de verificación (punto D):** `spots_remaining` en los dos DTO de
  course, `lessons` en los dos de module, los cuatro campos de `LessonPopulatedResponseDto.file`, y el ancho
  de `ResourceValidTypes`. Cada uno queda requerido-sin-defensa u opcional-con-defensa, nunca las dos cosas.

## Implementation plan

1. **Crear los seis `*.request.ts` y reapuntar sus importadores.** Un commit por feature o uno solo, pero el
   símbolo se borra del `*.interface.ts` en el mismo paso en que nace en el `*.request.ts` — corte limpio,
   sin re-export de compatibilidad, igual que la SPEC 15: el compilador es el checklist. `ItemQuantity` es
   el único que cambia de feature (cart → payment) y por lo tanto el único cuyo import se invierte.
   `npx tsc -p tsconfig.app.json --noEmit` limpio al cerrar el paso.

2. **Crear `auth/models/auth.response.ts`.** Declarar `UserResponseDto` y `AuthResponseDto`, borrar
   `AuthResponse` de `auth.interface.ts`, y reescribir `AuthMapper.mapResponseToUser` para que su parámetro
   sea `AuthResponseDto` — el cuerpo del método no cambia, pero ahora cruza una frontera real. Reapuntar
   `auth/services/auth.service.ts` y `mappers/auth.mapper.ts`.

3. **Nombrar las dos uniones inline.** Declarar `LessonContentType` en `lesson.interface.ts`; que
   `module.interface.ts` y `module.response.ts` la importen. Reemplazar los dos `'image' | 'video'` de lesson
   por `ResourceValidTypes` importado de `@file/models/file.interface`.

4. **Devolverle al mapper la construcción del body** (punto H). Crear
   `TeacherRequestMapper.mapFormToTeacherRequestDTO` moviendo las líneas 82-89 del componente tal cual, y
   dejar el `submit()` del formulario en una sola llamada. Crear
   `OrderMapper.mapCheckoutToCreateOrderRequest` moviendo el literal de `checkout-form-state.ts:238-253`,
   con el comentario de "este payload no se loguea nunca" pegado al método. Borrar las dos anotaciones
   redundantes y sus imports: `UserDTO` en `form-login.component.ts` y `PasswordDTO` en
   `user-profile-page.component.ts`. El `/become-teacher` y el `/payment/buy/pay`
   tienen que seguir enviando exactamente el mismo body: el payload es idéntico campo por campo, incluido
   el `portfolioUrl` que se omite cuando viene vacío.

5. **Borrar el código muerto** (punto E, en un commit propio y aislado para que el borrado se pueda revertir
   solo si aparece un consumidor): cadena issuer, los tres `map*Array` sin llamadores, `LessonDto`.
   `npm run build` después de este paso: es el único con riesgo de comportamiento.

6. **Verificar las incoherencias contra el backend corriendo y resolverlas.** verificar en el repositorio `MartinEAcosta/udemix-backend` las entidades para chequear los atributos requeridos.

7. **Pasar `getFileByPublicId` por `FileMapper`** y actualizar su firma a `Observable<UploadedFile>`. No
   tiene llamadores, así que no hay nada más que reapuntar.

8. **Borrar el alias `@interfaces/*`.** Reapuntar los siete imports a su alias de feature **primero**, y
   recién después sacar la entrada de `tsconfig.json` — en ese orden el build falla si quedó alguno, en vez
   de resolver silencioso. `npm run build`, no el autocompletado del IDE.

9. **Aplicar las convenciones del punto G a los archivos tocados** y escribir las cabeceras de los seis
   `*.request.ts` con el invariante correcto (se importa para anotar un borde; construir es del mapper).
   Cerrar con `npm run build` y el pase manual: explorar cursos, abrir `/course/:id`, agregar al carrito,
   llegar a `/payment/buy/pay` y pagar con una tarjeta de prueba, abrir `/auth/me`, enviar una solicitud en
   `/become-teacher` y abrir una lección con archivo.

## Acceptance criteria

- [ ] Existen los seis `*.request.ts` listados en Scope A, y ningún `*.interface.ts` declara un DTO de
      salida: `grep -rn "DTO\|Dto" src/app/*/models/*.interface.ts` no devuelve ninguna declaración
      `export interface` / `export type` de un tipo de request.
- [ ] `grep -rn "ItemQuantity" src/app --include=*.ts` no muestra ninguna declaración en `cart/`, y
      `cart/state/cart.service.ts` la importa de `@payment/models/payment.request`.
- [ ] `auth/models/auth.response.ts` existe con `AuthResponseDto` y `UserResponseDto`;
      `grep -rn "\bAuthResponse\b" src/` no devuelve nada y `AuthMapper.mapResponseToUser` recibe
      `AuthResponseDto`, no un tipo que embuta `User`.
- [ ] `auth/models/auth.interface.ts` exporta exactamente dos símbolos: `AuthStatus` y `User`.
- [ ] No queda ninguna copia inline de las dos uniones: las únicas apariciones de `'image' | 'video'` y
      `'video' | 'document'` en `src/app` son las declaraciones de `ResourceValidTypes` y
      `LessonContentType` — incluidas las dos anotaciones de `lesson-form-state.ts`, que el punto C también
      reapunta.
- [ ] `grep -rn "Issuer" src/app --include=*.ts` no devuelve nada salvo el comentario de
      `mercadopago-fields.interface.ts:2`, que menciona `mp.getIssuers` como parte de la API del SDK.
- [ ] `grep -rn "mapResponseToCourseArray\|mapResponseToLessonArray\|mapResponseToModuleArray\|LessonDto" src/`
      no devuelve nada. Las tres variantes `*PopulatedArray` siguen existiendo y siguen teniendo su llamador.
- [ ] Ningún mapper aplica `??` sobre un campo que su DTO declara requerido y no-null: para cada fila de la
      tabla del punto D, el campo está o requerido sin defensa, o opcional con defensa. Las dos
      declaraciones de `spots_remaining` son idénticas entre sí.
- [ ] `grep -n "'image'" src/app/mappers/lesson.mapper.ts` no devuelve el `?? 'image'`.
- [ ] `file.service.getFileByPublicId` devuelve `Observable<UploadedFile>` y pasa por `FileMapper`; ningún
      método de ningún servicio devuelve un `ApiResponse<...>` crudo al llamador.
- [ ] Ningún componente construye un DTO de salida: `TeacherRequestMapper.mapFormToTeacherRequestDTO` y
      `OrderMapper.mapCheckoutToCreateOrderRequest` existen, y ni `teacher-request-form.component.ts` ni
      `checkout-form-state.ts` contienen un literal de objeto anotado con un tipo de request.
- [ ] `form-login.component.ts` no importa `UserDTO` ni `user-profile-page.component.ts` importa
      `PasswordDTO`.
- [ ] Los únicos componentes que importan un `*.request.ts` lo hacen para anotar un borde — un `output<>()`
      o un parámetro de handler — no para armar el objeto.
- [ ] Las cabeceras de los seis `*.request.ts` **no** repiten la frase "nada de este archivo se usa en un
      componente": dicen que se importa para anotar un borde y que construir el body es del mapper.
- [ ] `grep -rn "@interfaces/" src/` no devuelve nada y `tsconfig.json` ya no declara la entrada
      `@interfaces/*`.
- [ ] `npx tsc -p tsconfig.app.json --noEmit` limpio y `npm run build` sin errores ni warnings nuevos.
- [ ] El paso 6 quedó registrado: la spec o su companion de deuda anota, por cada campo de la tabla D, qué
      manda el backend realmente. Si no se pudo verificar un campo, queda dicho cuál y por qué, y el campo
      no se toca.
- [ ] Pase manual con el backend corriendo: explorar cursos, `/course/:id`, agregar al carrito,
      `/payment/buy/pay`, `/auth/me`, `/become-teacher` y una lección con archivo — todo renderiza los mismos
      datos que antes.
- [ ] Los dos bodies que cambiaron de dueño salen idénticos: el `POST teacher-requests/` de
      `/become-teacher` y el `POST orders/` de `/payment/buy/pay`, comparados campo por campo en la pestaña
      Network contra lo que enviaban antes del cambio (incluido que `portfolioUrl` se omita cuando el campo
      quedó vacío).

## Decisiones

- **Sí:** un `*.request.ts` por feature, simétrico al `*.response.ts`. Meter los DTOs de salida dentro del
  `*.response.ts` obligaría a renombrar los nueve archivos que la SPEC 15 acaba de crear (a `*.dto.ts` o
  `*.api.ts`), que es otro diff mecánico sobre lo recién movido. Dejarlos en el `*.interface.ts` conserva la
  asimetría que esta spec existe para cerrar.
- **Sí:** `ItemQuantity` se va a `payment`. Es parte del body de `POST /orders/`, y la regla que la SPEC 15
  fijó es que la feature dueña del endpoint es dueña del contrato. Que `cart` lo produzca no lo hace suyo:
  `cart.service.getItemsArray()` es justamente el traductor.
- **Sí:** `UserResponseDto` nuevo, aunque sus campos sean hoy idénticos a `User`. El punto no es que difieran
  ahora, es que puedan diferir sin que el cambio llegue al modelo interno. Mientras `AuthResponse` embuta
  `User`, el mapper es decorativo y el día que el backend renombre un campo hay que tocar `User` y con él
  todo componente que lo lea.
- **Sí:** `AuthResponse` se renombra a `AuthResponseDto`. La SPEC 15 decidió no renombrar símbolos porque
  convertía un diff mecánico en uno que había que leer línea por línea; acá el tipo **cambia de forma** de
  todos modos (su campo `user` pasa a ser otro tipo), así que el diff hay que leerlo igual y el nombre queda
  alineado con los otros diez DTOs.
- **Sí:** verificar contra el backend antes de resolver las defensas, caso por caso. Las dos salidas rápidas
  —"gana la defensa, el DTO pasa a opcional" y "gana el tipo, se borra la defensa"— son adivinanzas en
  direcciones opuestas, y adivinar es exactamente lo que la deuda reportó. Una defensa puede estar ahí porque
  alguien la vio fallar o porque se copió de la línea de arriba, y sólo la respuesta real lo distingue.
- **Sí:** las uniones compartidas viven en el archivo de modelo de la feature dueña del **concepto**, no de
  la que las usa. `ResourceValidTypes` es de `file` y `lesson` la importa; `LessonContentType` es de `lesson`
  y `module` la importa, aunque hoy el campo sólo exista anidado en los dos tipos de `module`. La
  alternativa — que cada feature declare la suya — deja el mismo concepto con dos nombres, que es el estado
  del que venimos.
- **Sí:** borrar la cadena issuer completa en vez de arreglar `secure_thumbnail: response.thumbnail`.
  Arreglar un mapper que nadie llama es trabajo que no se puede verificar; el borrado sí. El criterio es el
  mismo que para los tres `map*Array` y `LessonDto`: si nadie lo usa, no se arregla, se borra. Va en su
  propio commit para poder revertirlo solo.
- **Sí:** el mapper construye el body, no el componente. Un DTO es un `interface`: no sobrevive a la
  compilación y no puede producir nada, así que alguien tiene que escribir el objeto — y el repo ya decidió
  quién, con cinco métodos salientes en cuatro mappers. Los dos lugares que lo incumplen no son excepciones
  legítimas: son los dos únicos que nunca tuvieron su mitad saliente escrita. Con eso la regla "un
  componente no construye un DTO" se puede verificar en vez de quedar como aspiración.
- **Sí:** `OrderMapper.mapCheckoutToCreateOrderRequest` recibe cinco argumentos y no un `FormGroup`, a
  diferencia de los otros cinco métodos salientes. El payload de `POST /orders/` compone tres fuentes (items
  del carrito, token de `createCardToken`, form del titular) y no existe ningún formulario que las tenga a
  las tres: forzar la firma uniforme obligaría a inventar un form intermedio. La firma explícita es el
  precio correcto por tener el payload con el token de la tarjeta escrito en un solo lugar del repo.
- **Sí:** se borra el alias `@interfaces/*`, no sólo el import de `cart`. Es multi-target sobre cuatro
  carpetas, así que la ruta no dice de qué feature es el tipo; permite dos deletreos del mismo archivo, lo
  que hace mentir a cualquier `grep` de importadores — es exactamente lo que le pasó a la auditoría de la
  SPEC 15, que escribió "un solo consumidor real" habiendo siete; y resuelve probando los cuatro destinos en
  orden, de modo que un archivo nuevo con el mismo nombre en un destino anterior shadowea sin avisar. La
  SPEC 15 lo dejó afuera porque tocarlo eran 60 imports: hoy son siete y una línea de `tsconfig.json`, así
  que el precedente no aplica.
- **No:** borrar `id_user`, `date` y `method` de `OrderResponseDto` aunque `OrderMapper` no los lea. Un
  `*.response.ts` **describe lo que el backend manda**, no lo que la app consume: recortarlo a los campos
  usados lo convierte en una vista parcial y esconde información del contrato. Es distinto de
  `IssuerResponseDto`, donde lo muerto es el endpoint entero.
- **No:** separar `experience_level` del DTO de la unión que tipa el formulario. Son textualmente idénticas
  y duplicarlas es deshacer la deduplicación que la SPEC 15 hizo a propósito. El riesgo queda documentado,
  no mitigado.
- **No:** validación en runtime. El `ResourceValidTypes` ancho y los campos que pueden faltar se resuelven
  angostando o abriendo el **tipo**, no agregando guards: el repo no tiene librería de validación y meter una
  es una decisión de stack que merece su propia discusión.
- **No:** mover los mappers a su feature, aunque sea el paso lógico siguiente y la deuda lo señale. Mezclar
  11 archivos de mudanza con decisiones de modelado vuelve el diff ilegible, que es exactamente el motivo por
  el que la SPEC 15 puso su rename en el paso 1 y solo.
- **Convenciones sólo en los archivos tocados.** Fijar la regla es útil ahora; aplicarla con una pasada
  global al repo mezcla un reformateo de cientos de líneas con un cambio de contrato y hace imposible leer
  ninguno de los dos.

## Risks

| Riesgo | Mitigación |
| --- | --- |
| El paso 6 no se puede completar porque el backend no está disponible o un endpoint no devuelve el caso borde | Es el único paso que depende de algo externo. Si un campo no se puede verificar, queda sin tocar y anotado en la deuda — nunca se resuelve "por intuición". Los pasos 1 a 5 y 7 a 9 no dependen de él y se entregan igual. |
| Borrar la cadena issuer rompe algo que no aparece en un `grep` (uso dinámico, string en un template) | `IssuerResponseDto` e `Issuer` son tipos: no existen en runtime y no pueden referenciarse desde un `.html`. Los dos métodos de `PaymentMapper` son estáticos y se llaman por nombre. El commit va aislado para revertirlo sin arrastrar el resto. |
| Mover `ItemQuantity` a `payment` crea un ciclo `cart` ↔ `payment` | La dependencia queda en una sola dirección: `cart` importa de `payment` y `payment` deja de importar de `cart`. Se verifica con `npm run build`, que falla ante un ciclo de módulos. |
| Cambiar la opcionalidad de un campo del DTO propaga `undefined` a los modelos internos y rompe templates con `strictTemplates` | Es el comportamiento buscado: si el campo puede faltar, el template tiene que decidir qué muestra. Los errores aparecen en compilación, no en runtime, y el paso 6 se cierra sólo cuando `npm run build` está limpio. |
| La SPEC 16 y esta tocan `auth.service.ts`, `file.service.ts` y `teacher-request.service.ts` | **Resuelto.** El orden 15 → 16 → 17 se cumplió: el merge de la 16 (`b271a52`) entró en `main` el 2026-11-19, antes de abrir esta spec. Los tres servicios cambiaron ahí (`auth.service.ts` ±208 líneas, `file.service.ts` ±45, `teacher-request.service.ts` ±27) y las citas de este doc ya apuntan al código post-merge. |
| La SPEC 16 también toca `shared/models/api.interfaces.ts` — pasa `ok` y `status` de `ErrorResponse` a opcionales, porque la rama de excepción no prevista del backend manda solo `error` | **Resuelto.** Ya está aplicado y mergeado (`api.interfaces.ts:25-29`, con el comentario de las dos ramas de `HandlerResponses.handleError`). `ErrorResponse` es parte del sobre genérico y se queda donde está: el punto A no lo mueve. |
| Mover la construcción del payload de checkout al mapper cambia el body sin que nadie lo note, y el pago falla en MercadoPago | El literal se mueve **tal cual**, sin reordenar ni renombrar campos, y el criterio de aceptación exige comparar el `POST orders/` en Network contra el anterior. El paso va antes del borrado de muerto y de tocar opcionalidades, así que si el pago se rompe hay un solo commit sospechoso. |
| Borrar `@interfaces/*` de `tsconfig.json` deja un import sin resolver que el IDE autocompleta igual | Los siete imports se reapuntan **antes** de sacar la entrada, no después: en ese orden el `npm run build` del paso 8 falla ante cualquiera que haya quedado. El alias no tiene consumidores fuera de `src/app`. |

## Lo que esta spec **no** hace

- Mover los mappers a su feature.
- Partir `LessonResponseDto` en respuesta + request, ni resolver el `id ?: string` de `Lesson`.
- Verificar `min_length` / `max_length` contra MercadoPago.
- Separar `TeacherExperienceLevel` en dos uniones.
- Agregar validación en runtime de los DTOs.
- Renombrar `shared/models/api.interfaces.ts`.
- Revisar `@guards/*` ni `@mappers/*`. La única línea de `tsconfig.json` que se toca es el borrado de
  `@interfaces/*`.
- Barrels `index.ts` en los `models/`.
- Arreglar el target `ng test`.

Cada uno, si se necesita, va en su propia spec.
