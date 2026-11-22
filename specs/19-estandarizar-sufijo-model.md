# SPEC 19 — Un solo sufijo para el modelo interno: `*.interface.ts` pasa a `*.model.ts`

> **Status:** Implementado
> **Depends on:** SPEC 15 (separar los DTOs por feature — fijó el par modelo + `*.response.ts` que esta spec termina de nombrar bien)
> **Date:** 2026-11-22
> **Objective:** Dejar un único estándar de nombre para los archivos de tipos: `*.model.ts` para el modelo
> interno de la app y `*.response.ts` para la forma que llega del backend, eliminando las excepciones que la
> SPEC 15 dejó documentadas a propósito. De paso se borra el alias `@interfaces/*` y se renombra
> `CartService` a `CartState`.

## Por qué existe esta spec

El sufijo `.interface` nombra la **construcción de TypeScript**, no el **rol del archivo**. Eso falla en
cuanto el archivo deja de contener solo `interface`: `filter.interfaces.ts` exporta además un `type` unión, y
`cart/models/cart.model.ts` ya usaba el sufijo correcto para una clase. El resultado era que `CLAUDE.md`
tenía que documentar tres excepciones y una convención de plural que nadie podía deducir del código.

Hay un caso peor que la inconsistencia: `shared/models/api.interfaces.ts` no era un modelo en absoluto. Sus
diecinueve importadores son **todos** services y mappers — ni un componente. Es el sobre de respuesta del
backend, o sea exactamente lo que la SPEC 15 llama `*.response.ts`.

## Criterio

El sufijo describe el rol, no la construcción:

- **`*.model.ts`** — modelo interno de la app. Es lo que un componente puede importar.
- **`*.response.ts`** — forma que llega del backend. Solo services y mappers lo importan.

De ahí se siguen las dos decisiones que no son un rename mecánico:

- `shared/models/api.interfaces.ts` → **`shared/models/api.response.ts`**, no `.model.ts`. Describe el
  contrato del backend (`ApiResponse<T>`, `ErrorResponse`, `PaginationResponseDto<T>`,
  `PaginationResponse<T>`) y ningún componente lo importa. Esto elimina la excepción "plural, generic
  envelope only".
- `utils/filters/filter.interfaces.ts` → **`utils/filters/filter.model.ts`**. Acá sí es modelo: tipa el
  comportamiento de los componentes `filter-select` / `filter-option-hover` / `filter-option-price`, que lo
  importan directo. Nada que ver con el backend.

## Scope A — los catorce renames

Todos con `git mv`. Setenta y cinco líneas de import reapuntadas. No hay barrel en ninguna carpeta `models/`
y no hay imports dinámicos, así que no hubo indirección: cada import se reescribió en su lugar.

| Antes | Después | Imports |
|---|---|---|
| `course/models/course.interface.ts` | `course.model.ts` | 21 |
| `shared/models/api.interfaces.ts` | `api.response.ts` | 19 |
| `module/models/module.interface.ts` | `module.model.ts` | 8 |
| `category/models/category.interface.ts` | `category.model.ts` | 7 |
| `teacher-request/models/teacher-request.interface.ts` | `teacher-request.model.ts` | 7 |
| `utils/filters/filter.interfaces.ts` | `filter.model.ts` | 7 |
| `auth/models/auth.interface.ts` | `auth.model.ts` | 6 |
| `cart/models/cart.interface.ts` | `cart-item.model.ts` | 6 |
| `file/models/file.interface.ts` | `file.model.ts` | 5 |
| `lesson/models/lesson.interface.ts` | `lesson.model.ts` | 5 |
| `payment/models/order.interface.ts` | `order.model.ts` | 4 |
| `enrollment/models/enrollment.interface.ts` | `enrollment.model.ts` | 3 |
| `payment/models/payment.interface.ts` | `payment.model.ts` | 3 |
| `payment/models/mercadopago-fields.interface.ts` | `mercadopago-fields.model.ts` | 1 |

### La colisión de `cart`

`cart/models/cart.interface.ts` (los tipos `CartItem` / `ItemQuantity`) y `cart/models/cart.model.ts` (la
clase `Cart`) convivían, y el segundo importaba del primero. El rename mecánico habría producido un
auto-import y dos archivos con el mismo nombre en la misma carpeta.

Se resolvió renombrando los tipos a **`cart-item.model.ts`** y dejando `cart.model.ts` intacto. Los dos
consumidores de la clase `Cart` no se tocaron. `cart.model.ts` pasó a importar `./cart-item.model`.

La clase `Cart` **no** se renombró: es un modelo de dominio con comportamiento (`addToCart`, `removeItem`,
`calculateTotal`) y el archivo ya cumplía el estándar nuevo.

## Scope B — se borra el alias `@interfaces/*`

`tsconfig.json` declaraba un multi-target de cuatro rutas (`course/models`, `auth/models`, `module/models`,
`lesson/models`) que solo siete imports usaban, y los targets `module` / `lesson` no los usaba nadie. Los
siete se reapuntaron al alias de su feature y la entrada salió del `tsconfig.json`, en ese orden — así el
build falla si quedó alguno en vez de resolver silencioso.

- A `@course/models/course.model`: `cart/models/cart.model.ts`, `course/components/course-carousel`,
  `course/components/course-featured`, `course/resolver/course-resolver`,
  `course/state/course-form/course-form-state`, `shared/components/btns/btn-remove`.
- A `@auth/models/auth.model`: `user/state/user-state.ts`.

Esto era el punto G.5 / paso 8 de la SPEC 17. Se adelantó porque el rename tocaba los mismos imports de
todas formas; la SPEC 17 quedó actualizada marcándolo como hecho.

Efecto lateral buscado: `cart/models/cart.model.ts` importaba `Course` por `@interfaces/` mientras
`cart.interface.ts` lo importaba por `@course/` — dos alias para el mismo archivo. Ahora hay uno.

## Scope C — `CartService` pasa a `CartState`

`cart/state/cart.service.ts` era el **único** `*.service.ts` dentro de una carpeta `state/`. Los otros seis
archivos de estado del repo son `<name>-state.ts` con `class <Name>State` (`course-state`,
`enrollment-state`, `lesson-state`, `user-state`, `checkout-form-state`, `teacher-request-state`).

Y el contenido es estado, no servicio: signals `cart` / `total`, dos `effect` (persistencia a `localStorage`,
recálculo del total) y mutadores. No inyecta `HttpClient` — el único HTTP lo **delega** a
`PaymentService.calculateTotal`, igual que `checkout-form-state.ts`, que también delega y se llama `-state`.

- `cart/state/cart.service.ts` → `cart/state/cart-state.ts`
- `cart/state/cart.service.spec.ts` → `cart/state/cart-state.spec.ts`
- `class CartService` → `class CartState`
- El campo `cartService` → `cartState` en los trece consumidores, incluidas cuatro líneas de template
  (`buy-pay-page.html`, `course-card.component.html`).

**No** extiende `State<T>` de `shared/state/state.ts`, y no se lo forzó a extenderlo: `user-state.ts` y
`checkout-form-state.ts` tampoco lo hacen.

## Fuera de alcance

- `file/models/file-preview-control.ts` no se renombró: queda como la única excepción bajo un `models/`.
- `cart/models/cart.model.ts` (la clase) se dejó como está, por lo dicho en Scope A.
- Los dos `TODO` de tipos que la SPEC 15 dejó pendientes (`LessonResponseDto.id ?`,
  `IdentificationTypeResponseDto.min_length` / `max_length` tipados `string`) siguen pendientes. Esta spec
  mueve nombres, no arregla contratos.
- La separación de los DTOs de salida en `*.request.ts` sigue siendo trabajo de la SPEC 17. Nueve DTOs
  siguen declarados dentro de seis `*.model.ts` (`UserDTO` / `PasswordDTO`, `CourseDTO`, `SaveLessonDto` /
  `LessonDto`, `ModuleDTO`, `OrderPayerDTO` / `CreateOrderRequestDTO`, `TeacherRequestDTO`), que es la mitad
  saliente del contrato mezclada con el modelo interno. Esta spec renombró el archivo, no reclasificó lo que
  hay adentro. Nota para quien ejecute la SPEC 17: a diferencia de los `*.response.ts` — cuyos diecinueve
  importadores son todos services y mappers — estos DTOs **sí** los importan componentes
  (`TeacherRequestDTO` en `teacher-request-form` y `become-teacher-page`; `UserDTO` / `PasswordDTO` en
  `user-profile-page` y `form-login`). El invariante "ningún componente importa un DTO" no aplica al lado
  saliente, y el motivo para separarlos es otro: que el modelo interno no se mueva cuando se mueve el body
  que espera el backend.
- **Deuda nueva, de ninguna spec anterior: el casing de los DTOs está partido, y la línea divisoria es
  exactamente entrante / saliente.** Los entrantes usan `Dto` (`CourseResponseDto`, `LessonResponseDto`,
  `CategoryResponseDto`, `PaginationResponseDto`, …) y los salientes usan `DTO` (`CourseDTO`, `UserDTO`,
  `PasswordDTO`, `ModuleDTO`, `TeacherRequestDTO`, `CreateOrderRequestDTO`, `OrderPayerDTO`). Las dos
  excepciones son `SaveLessonDto` y `LessonDto`: salientes con casing de entrante. Unificar a `Dto` toca
  ~20 archivos y el ejecutor natural es la SPEC 17, que ya mueve y renombra esos mismos símbolos; hacerlo
  acá habría sido un segundo rename masivo encima del primero, sin relación con el sufijo de archivo.
- `LessonDto` (`lesson/models/lesson.model.ts`) tiene cero consumidores en todo `src/`. No se borró acá
  porque la SPEC 17 ya lo tiene listado para borrado.
- Las specs ya implementadas (03, 09, 10, 11, 15, 16) no se tocaron: son registro histórico, y varias ya
  citaban nombres en plural que nunca existieron. Tampoco `.impeccable/`, que es log generado.

## Acceptance criteria

- [x] `git ls-files "src/**/*.interface*.ts"` no devuelve nada.
- [x] No queda ningún especificador de import con el sufijo viejo ni ninguna referencia a `@interfaces/` en
      `src/`, y `tsconfig.json` ya no declara la entrada `@interfaces/*`.
- [x] No queda ninguna referencia a `CartService` / `cartService` / `cart.service` en `src/`.
- [x] `npx tsc -p tsconfig.app.json --noEmit` limpio.
- [ ] `npm run build` sin errores. **Bloqueado por una causa ajena a esta spec**: `course-page.html` lee
      `.owner.username` / `.owner.avatar_url` / `.owner.bio` mientras el trabajo en curso de la rama
      `spec-18-*` cambió `course-page.ts` a `getById()` (devuelve `Course` plano, sin `owner`) y el `owner`
      del modelo a `first_name` / `last_name` sin `bio`. Seis errores, todos de ese desfase. Cero errores de
      resolución de módulos.
- [ ] Pase manual con el backend corriendo: abrir un curso, agregarlo al carrito, verificar que el total se
      calcula, recargar y confirmar que el carrito persiste en `localStorage`, ir a `/payment/buy` y ver el
      resumen.

## Nota sobre `ng test`

No es señal útil para esta spec y no se usó como verificación: está roto de antes porque `angular.json`
referencia `node_modules/@videojs/themes/dist/fantasy/index.css` y el paquete no está instalado, y además hay
ocho specs que no compilan por renames anteriores que los specs nunca siguieron. `cart-state.spec.ts` sí
quedó apuntando bien aunque no corra.
