# SPEC 15 — Separar los DTOs del backend por feature y unificar el nombrado de `models/`

> **Status:** Aprobado
> **Depends on:** ninguna
> **Date:** 2026-11-17
> **Objective:** Disolver `shared/models/api.interfaces.ts` en un archivo de respuestas por feature y dejar todos los archivos de `models/` nombrados en singular, sin cambiar una sola línea de comportamiento.

## Por qué existe esta spec

`src/app/shared/models/api.interfaces.ts` concentra hoy 20 símbolos exportados de ocho features distintas:
course, teacher-request, file, category, enrollment, module, lesson y payment. Lo importan 20 archivos
(9 servicios, 10 mappers y `file/models/file.interfaces.ts`). Agregar un campo al DTO de `lesson` abre el
mismo archivo que tocar el de `payment`, y ninguna feature es dueña del contrato que consume: el único lugar
donde se lee la forma que manda el backend está fuera de la carpeta de la feature que la usa.

Es lo contrario de lo que hace el resto del repo. Cada feature ya tiene su `models/` con sus tipos internos
(`Course`, `Lesson`, `TeacherRequest`), su `services/` y su mapper correspondiente en `src/app/mappers/`.
El DTO es el tercer lado de ese triángulo y es el único que vive lejos.

De paso queda a la vista una inconsistencia de nombrado: ocho archivos se llaman `*.interfaces.ts` (plural)
y tres `*.interface.ts` (singular, en cart y payment). Si esta spec va a crear nueve archivos nuevos en esas
mismas carpetas, elegir un sufijo sin unificar el resto deja el problema peor que antes.

Esta spec no cambia comportamiento: no se renombra ningún símbolo, no se corrige ningún tipo, no se toca
ningún `.html` ni `.scss`. Es movimiento de declaraciones y reapuntado de imports.

## Scope

**In:**

- **Lo que queda en `src/app/shared/models/api.interfaces.ts`**: únicamente el sobre genérico —
  `ApiResponse<T>`, `ErrorResponse`, `PaginationResponseDto<T>` y `PaginationResponse<T>`. Se conserva el
  comentario de cabecera (fechas como `string`, nada llega a un componente sin pasar por su mapper) y se le
  agrega una línea indicando que los DTOs concretos viven en el `models/` de cada feature.

- **Nueve archivos nuevos**, uno por feature, nombrados en singular, con los símbolos movidos textualmente
  (mismos nombres, mismos comentarios, mismos campos):

  | Archivo nuevo | Símbolos que recibe |
  | --- | --- |
  | `src/app/course/models/course.response.ts` | `CourseResponseDto`, `CoursePopulatedResponseDto` |
  | `src/app/teacher-request/models/teacher-request.response.ts` | `TeacherRequestResponseDto` |
  | `src/app/file/models/file.response.ts` | `FileResponseDto` |
  | `src/app/category/models/category.response.ts` | `CategoryResponseDto` |
  | `src/app/enrollment/models/enrollment.response.ts` | `EnrollmentResponseDto`, `EnrollmentPopulatedResponseDto` |
  | `src/app/module/models/module.response.ts` | `ModuleResponseDto`, `ModulePopulatedResponseDto` |
  | `src/app/lesson/models/lesson.response.ts` | `LessonResponseDto`, `LessonPopulatedResponseDto` |
  | `src/app/payment/models/payment.response.ts` | `IssuerResponseDto`, `IdentificationTypeResponseDto` |
  | `src/app/payment/models/order.response.ts` | `OrderResponseDto` |

  Los dos archivos de payment espejan el split que esa feature ya tiene entre `payment.interface.ts` y
  `order.interface.ts`. Los dos comentarios con TODO que hoy viven en el archivo central viajan pegados a su
  símbolo y **no se resuelven acá**: el `id ?: string` de `LessonResponseDto` y el `min_length`/`max_length`
  tipados `string` de `IdentificationTypeResponseDto`.

- **Las tres uniones compartidas entre modelo y DTO pasan a vivir en el archivo de modelo**, y el archivo de
  respuesta las importa. Son uniones de strings idénticas en los dos mundos, y los componentes las usan para
  renderizar — así que el archivo que las exporta no puede ser el de DTOs, cuyo contrato explícito es que
  nada de ahí llega a un componente:

  - `TeacherRequestStatus` → vive en `teacher-request.interface.ts` (donde ya existía una copia textual);
    `teacher-request.response.ts` la importa.
  - `TeacherExperienceLevel` → vive en `teacher-request.interface.ts`. `TeacherExperienceLevelResponse`
    **se elimina**: era el mismo `'none' | 'informal' | 'teacher'` con otro nombre.
  - `ResourceValidTypes` → se mueve del archivo central a `file.interface.ts`; `file.response.ts` la importa.
    Invierte la dependencia actual (hoy `file/models/file.interfaces.ts:1` importa del archivo central con
    el único path relativo cruzando features que queda en el repo).

- **Renombrar a singular los ocho `*.interfaces.ts` existentes** (`git mv`, sin tocar su contenido):
  `auth/models/auth.interfaces.ts`, `category/models/category.interfaces.ts`,
  `course/models/course.interfaces.ts`, `enrollment/models/enrollment.interfaces.ts`,
  `file/models/file.interfaces.ts`, `lesson/models/lesson.interfaces.ts`,
  `module/models/module.interfaces.ts`, `teacher-request/models/teacher-request.interfaces.ts`.
  Son **60 imports en 55 archivos** los que hay que reapuntar, incluidos los que entran por el alias
  multi-target (`@interfaces/course.interfaces` → `@interfaces/course.interface` en
  `cart/models/cart.model.ts`). `cart.interface.ts`, `payment.interface.ts` y `order.interface.ts` ya están
  en singular y no se tocan; `file/models/file-preview-control.ts` no entra (no es un archivo de tipos).

- **Reapuntar los 20 importadores del archivo central**: 9 servicios (`auth` y `pagination` solo usan
  genéricos y no cambian), 10 mappers y `file.interface.ts`. Siempre por alias de feature
  (`@course/models/course.response`), nunca relativo cruzando features; dentro del mismo `models/`, el
  relativo `./course.response` es lo correcto.

**Out of scope (para otra spec):**

- Sacar `UIService` de los servicios y devolverle al componente la decisión del toast — es la spec 16, que
  toca tres de los mismos archivos y se implementa después para no mezclar diffs.
- Agregar barrels `index.ts` a los `models/`. Hoy ningún `models/` tiene uno y los cinco `index.ts` del repo
  son de componentes y pages. Si se quieren, van en su propia spec.
- Tocar el alias `@interfaces/*` (multi-target sobre cuatro carpetas de models, con un solo consumidor real).
  Los aliases de feature ya resuelven los archivos nuevos sin cambiar `tsconfig.json`.
- Resolver los dos TODO que se mueven, ni partir `LessonResponseDto` en respuesta + request.
- Desanidar los DTOs "populated" (`CoursePopulatedResponseDto.owner`, `ModulePopulatedResponseDto.lessons`,
  `LessonPopulatedResponseDto.file`, `EnrollmentPopulatedResponseDto.course`). Son la forma real que manda
  el backend y se mueven tal cual, con su acoplamiento y todo.
- Crear `src/app/user/models/`. Los tipos de user (`User`, `UserDTO`, `PasswordDTO`) viven en
  `auth/models/auth.interface.ts` y ahí se quedan.

## Data model

Esta spec no introduce ni modifica ninguna estructura de datos. Mueve declaraciones existentes entre
archivos, elimina dos declaraciones duplicadas (`TeacherRequestStatus` repetida y
`TeacherExperienceLevelResponse`) y renombra archivos. Ningún campo, ningún tipo y ninguna firma cambian.

## Implementation plan

1. **Renombrar los ocho archivos a singular.** `git mv <feature>/models/<nombre>.interfaces.ts
   <feature>/models/<nombre>.interface.ts` para los ocho, y reapuntar los 60 imports en los 55 archivos que
   los consumen (incluido el `@interfaces/course.interfaces` de `cart/models/cart.model.ts`). Un
   search & replace por archivo renombrado es suficiente: el nombre del símbolo importado no cambia.
   `npm run build` compila igual que antes de empezar.

2. **Crear `course.response.ts` y migrar course.** Mover `CourseResponseDto` y `CoursePopulatedResponseDto`
   desde `api.interfaces.ts` (borrándolos de ahí en el mismo paso) y reapuntar sus tres importadores:
   `course/services/course.service.ts`, `mappers/course.mapper.ts` y — si aparece alguno más al compilar —
   el que el compilador marque. Este paso fija el patrón que repiten los siguientes.

3. **Repetir el patrón del paso 2 para category, enrollment, module, lesson y payment.** Cada feature es un
   paso compilable por separado: crear el `*.response.ts`, borrar los símbolos del archivo central, reapuntar
   su servicio y su mapper. Payment produce dos archivos (`payment.response.ts` para `IssuerResponseDto` e
   `IdentificationTypeResponseDto`, `order.response.ts` para `OrderResponseDto`) con tres importadores
   (`payment.service.ts`, `payment.mapper.ts`, `order.mapper.ts`).

4. **Migrar file, invirtiendo `ResourceValidTypes`.** Mover la unión al final de los imports de
   `file/models/file.interface.ts` como declaración propia y borrar de ahí el import relativo
   `"../../shared/models/api.interfaces"`. Crear `file/models/file.response.ts` con `FileResponseDto`,
   importando `ResourceValidTypes` desde `./file.interface`. Reapuntar `file/services/file.service.ts` y
   `mappers/file.mapper.ts`.

5. **Migrar teacher-request y deduplicar.** Crear `teacher-request.response.ts` con
   `TeacherRequestResponseDto`, que importa `TeacherRequestStatus` y `TeacherExperienceLevel` desde
   `./teacher-request.interface`. Borrar del archivo central `TeacherRequestStatus`,
   `TeacherExperienceLevelResponse` y `TeacherRequestResponseDto`. En `teacher-request.interface.ts` las dos
   uniones ya existen y quedan como única fuente. Reapuntar `teacher-request/services/teacher-request.service.ts`
   y `mappers/teacher-request.mapper.ts`, y cambiar a `TeacherExperienceLevel` el único uso de
   `TeacherExperienceLevelResponse` que quede.

6. **Cerrar el archivo central.** Verificar que `api.interfaces.ts` quedó con exactamente cuatro símbolos,
   actualizar su comentario de cabecera con la línea sobre dónde viven ahora los DTOs, y correr
   `npm run build` más un pase manual de los flujos principales (explorar cursos, detalle de curso, carrito,
   perfil) para confirmar que no se rompió ningún mapeo.

## Acceptance criteria

- [ ] `src/app/shared/models/api.interfaces.ts` exporta exactamente cuatro símbolos: `ApiResponse`,
      `ErrorResponse`, `PaginationResponseDto` y `PaginationResponse`.
- [ ] Existen los nueve `*.response.ts` listados en Scope, y ningún símbolo quedó declarado en dos lugares.
- [ ] `grep -rn "ResponseDto" src/app --include=*.ts | grep "api.interfaces"` no devuelve nada.
- [ ] Ningún archivo de `models/` se llama `*.interfaces.ts`: los once archivos de tipos del repo están en
      singular.
- [ ] `grep -rn "TeacherExperienceLevelResponse" src/` no devuelve nada, y `TeacherRequestStatus` está
      declarada una sola vez en todo el repo.
- [ ] No queda ningún import relativo que cruce de una feature a otra para traer un tipo
      (`"../../shared/models/api.interfaces"` desaparece).
- [ ] `npm run build` compila sin errores ni warnings nuevos atribuibles a este cambio.
- [ ] `git diff --stat` no toca ningún `.html`, `.scss` ni archivo bajo `components/` o `pages/` salvo por
      la línea del import renombrado: esta spec es puramente de tipos.
- [ ] Pase manual con el backend corriendo: explorar cursos, abrir `/course/:id`, agregar al carrito, abrir
      `/auth/me` y `/become-teacher` — todo renderiza los mismos datos que antes.

## Decisiones

- **Sí:** un archivo de respuestas por feature, separado del archivo de modelo. Es lo que ya hace el repo en
  la práctica (modelo interno ≠ forma del backend ≠ mapper) y lo que el comentario de cabecera del archivo
  central viene declarando desde que existe. Meterlos dentro del `*.interface.ts` ahorraría nueve archivos
  pero borraría justamente la frontera que el mapper existe para custodiar.
- **Sí:** nombrado en singular para todo `models/`, renombrando los ocho archivos viejos. Crear nueve
  archivos nuevos en carpetas donde conviven dos estilos y no elegir uno es agregar ruido, no sacarlo. El
  costo (60 imports mecánicos) se paga una vez.
- **Sí:** corte limpio, sin re-export de compatibilidad en `api.interfaces.ts`. El símbolo se borra del
  archivo central en el mismo paso en que nace en el de la feature, así cualquier importador sin migrar deja
  de compilar (`error TS2305: … has no exported member 'CourseResponseDto'`) y el compilador funciona como
  checklist. Un `export *` temporal compilaría siempre, dejaría el archivo central vivo y nada obligaría a
  terminar la migración.
- **Sí:** deduplicar `TeacherRequestStatus` y eliminar `TeacherExperienceLevelResponse` ahora, en esta spec.
  Una vez que las dos copias caen en la misma carpeta, dejarlas es una invitación a que se desincronicen. Son
  uniones de strings textualmente idénticas: el riesgo del cambio es nulo y verificable por compilación.
- **Sí:** las uniones compartidas entre modelo y DTO viven en el archivo de **modelo**, y el de respuesta las
  importa. La dirección opuesta obligaría a los componentes que renderizan un estado (`TeacherRequestStatus`
  en `teacher-request-status.component.ts`) a importar de un archivo de DTOs, que es exactamente lo que la
  convención del repo prohíbe.
- **No:** barrels `index.ts` en los `models/`. Hoy ninguno los tiene; agregarlos acá mezclaría una discusión
  de ergonomía de imports con un movimiento de archivos, y cambiaría 20 imports más sin necesidad.
- **No:** tocar el alias `@interfaces/*` ni ningún otro. Los aliases de feature ya resuelven los archivos
  nuevos; `tsconfig.json` no se modifica en esta spec.
- **No:** renombrar símbolos. `CourseResponseDto` sigue llamándose `CourseResponseDto` aunque ahora viva en
  `course.response.ts` y el sufijo se vuelva redundante. Renombrar al mismo tiempo que se mueve convierte un
  diff mecánico en uno que hay que leer línea por línea.

## Risks

| Riesgo | Mitigación |
| --- | --- |
| El rename de los ocho archivos toca 55 archivos y se mezcla con el movimiento de DTOs, volviendo el diff ilegible | Es el paso 1 y va **solo**, en su propio commit, antes de crear cualquier `*.response.ts`. Solo cambia la ruta del import, nunca el símbolo. |
| Un import queda apuntando al archivo central y nadie se entera porque el símbolo todavía está ahí | El corte limpio lo impide: el símbolo se borra en el mismo paso en que se crea en la feature. Ver Decisiones. |
| Mover `ResourceValidTypes` a `file.interface.ts` crea un ciclo si algún día `file.interface.ts` necesita un tipo de `file.response.ts` | La dependencia va en una sola dirección por diseño (`response` → `interface`, nunca al revés), igual que la que ya rige entre mapper y modelo. Si alguna vez hiciera falta la inversa, es señal de que el tipo debería estar en el modelo. |
| El alias multi-target `@interfaces/*` resuelve a una carpeta distinta de la esperada después del rename y el import compila apuntando a otro archivo | El alias tiene cuatro destinos con nombres de archivo distintos entre sí, así que no hay colisión posible; igual se verifica con `npm run build`, no con el autocompletado del IDE. |
| Algún mapper deja de compilar por un símbolo que se usaba sin import explícito | `tsconfig.json` corre en `strict`: no hay símbolos implícitos. Todo lo que falte aparece como error de compilación en el paso que lo rompe. |

## What is **not** in this spec

- `UIService` dentro de los servicios (spec 16).
- Barrels `index.ts` en `models/`.
- Cambios en `tsconfig.json`, incluido el alias `@interfaces/*`.
- Resolver los TODO de `LessonResponseDto.id` y de `IdentificationTypeResponseDto`.
- Desanidar los DTOs "populated".
- Crear `src/app/user/models/`.
- Tests: el target `ng test` está roto de antes (ver CLAUDE.md) y esta spec no lo arregla.

Cada uno de esos, si se necesita, va en su propia spec.
