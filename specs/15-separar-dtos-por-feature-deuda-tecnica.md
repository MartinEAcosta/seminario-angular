# SPEC 15 — Deuda técnica

> **Spec:** `15-separar-dtos-por-feature.md`
> **Date:** 2026-11-17

Lo que la SPEC 15 deja pendiente a propósito, con el motivo de cada decisión. El criterio general fue:
esta spec mueve declaraciones y reapunta imports, **no** arregla lo que encuentra en el camino. Todo lo de
acá se vio durante la implementación o en la auditoría posterior y se dejó deliberadamente afuera.

## 1. Los dos TODO viajaron sin resolverse

- `LessonResponseDto.id ?: string` (`lesson/models/lesson.response.ts`): un `id` opcional en una respuesta
  delata que el tipo se usa también como body de creación. Partirlo en respuesta + request obliga a tocar
  `Lesson`/`LessonPopulated`, que también declaran `id` opcional.
- `IdentificationTypeResponseDto.min_length` / `max_length` tipados `string`
  (`payment/models/payment.response.ts`): MercadoPago los documenta como número. Hay que verificar contra una
  respuesta real antes de cambiar el tipo — el mapper los pasa tal cual.

Ambos estaban en `api.interfaces.ts` antes de la spec y siguen igual, sólo que ahora en la carpeta de su
feature.

## 2. Uniones inline duplicadas que la dedup no alcanzó

La spec dedupló las tres uniones **nombradas** (`TeacherRequestStatus`, `TeacherExperienceLevel`,
`ResourceValidTypes`). Quedaron fuera tres copias anónimas, que el criterio "ningún símbolo declarado en dos
lugares" no ve porque no son símbolos:

- `'video' | 'document'` en `module/models/module.response.ts` y `module/models/module.interface.ts`.
- `'image' | 'video'` en `lesson/models/lesson.response.ts` (campo `file.resource_type`) y en
  `lesson/models/lesson.interface.ts` (con `| null`), que son una tercera y cuarta copia del concepto que
  ahora vive como `ResourceValidTypes` en `file/models/file.interface.ts`.

Nombrarlas implica decidir de quién son (¿`lesson` reusa el tipo de `file`?), que es una discusión de
modelado, no de movimiento de archivos.

## 3. Sólo se separó la mitad **entrante** del contrato

Los DTO de salida siguen mezclados con el modelo interno, sin criterio de dónde deberían vivir:
`CourseDTO` (`course.interface.ts`), `SaveLessonDto`/`LessonDto` (`lesson.interface.ts`), `ModuleDTO`
(`module.interface.ts`), `TeacherRequestDTO` (`teacher-request.interface.ts`), `CreateOrderRequestDTO` /
`OrderPayerDTO` (`payment.interface.ts`), `UserDTO` (`auth.interface.ts`).

En la misma línea quedaron fuera de la tabla de nueve:

- `AuthResponse` (`auth/models/auth.interface.ts`), que **es** una forma cruda del backend (`{ ok, user,
  token }`) y además embute el modelo interno `User`, de modo que `AuthMapper.mapResponseToUser` termina
  mapeando modelo → modelo. La spec sólo excluyó explícitamente `user/models/`; `auth` quedó afuera por
  omisión.
- `ItemQuantity` (`cart/models/cart.interface.ts`), que es la forma que espera el backend para los items de
  pago.

## 4. `api.interfaces.ts` sigue en plural

Es el único archivo bajo un `models/` que conserva el nombre plural, por decisión de Scope: renombrarlo
sumaba 18 imports más a un diff que ya tocaba 55 archivos, sin ganar nada. El criterio de aceptación se
corrigió para decirlo explícitamente en vez de contradecirse. Tampoco son singulares `cart/models/cart.model.ts`
ni `file/models/file-preview-control.ts`, pero esos son clases, no archivos de tipos.

## 5. DTOs y mappers sin ningún consumidor vivo

La spec creó archivos "la feature es dueña del contrato que consume" para contratos que nadie consume:

- `IssuerResponseDto` (`payment/models/payment.response.ts`) sólo lo usan
  `PaymentMapper.mapIssuerListResponseToEntityArray` / `mapIssuerResponseToEntity`, que no llama nadie —
  `PaymentService` no tiene endpoint de issuers (los métodos se resuelven client-side desde el BIN).
- `CourseMapper.mapResponseToCourseArray`, `LessonMapper.mapResponseToLessonArray` y
  `ModuleMapper.mapResponseToModuleArray` tampoco tienen llamadores.
- De `OrderResponseDto`, los campos `id_user`, `date` y `method` no se leen en `OrderMapper`.

Borrar código muerto es un cambio de comportamiento potencial (alguien podría estar por usarlo) y no entraba
en una spec de movimiento.

## 6. Incoherencias de contrato que ahora son visibles

Al juntar los DTOs de una feature en un archivo, quedaron a la vista cosas que antes estaban a 100 líneas de
distancia y no se tocaron:

- `course/models/course.response.ts`: `CourseResponseDto.spots_remaining` es `number` requerido y
  `CoursePopulatedResponseDto.spots_remaining` es `?: number | null`. `CourseMapper.mapResponseToCourse`
  aplica `?? null` sobre el campo que el tipo declara requerido — rama muerta según el tipo, viva en runtime.
- `ResourceValidTypes` (`'image' | 'video' | 'raw' | 'auto'`) es más ancha que lo único que el repo produce
  (`FileService` sólo manda `image`/`video`), y no hay validación en runtime: un `resource_type` inesperado
  del backend entra silencioso a `UploadedFile`.
- `teacher-request.response.ts` tipa `experience_level` con `TeacherExperienceLevel`, la misma unión que tipa
  las opciones del formulario. Hoy son idénticas (por eso el cambio es seguro), pero un valor nuevo del
  backend obliga a editar el archivo que tipa la UI.

## 7. Invariantes declarados en comentarios que el código no garantiza

Las cabeceras de los nueve `*.response.ts` repiten "nada de este archivo se usa en un componente: todo pasa
antes por su mapper". Dos lugares no lo cumplen, los dos preexistentes:

- `lesson/services/lesson.service.ts` usa `http.get<any>` y pasa la respuesta al mapper sin `.data`, salteando
  `ApiResponse` por completo.
- `file/services/file.service.ts::getFileByPublicId` devuelve `ApiResponse<FileResponseDto>` crudo al
  llamador, sin pasar por `FileMapper` (hoy no tiene llamadores).

## 8. Bugs preexistentes encontrados y no tocados

Van a su propia spec; esta no los arregla:

- `mappers/payment.mapper.ts`: `secure_thumbnail: response.thumbnail` — copia el campo equivocado, y el
  `secure_thumbnail` del DTO nunca se mapea.
- `mappers/module.mapper.ts` y `mappers/lesson.mapper.ts` tienen defensas `?? []` / `?? 'image'` sobre campos
  que el DTO declara requeridos: o el tipo miente o la defensa sobra, y nada decide cuál.

## 9. Sin tests

`ng test` no compila en este repo desde antes (`angular.json` referencia `@videojs/themes`, que no está
instalado — ver `CLAUDE.md`), y la spec lo declaró fuera de alcance. Más allá de eso, aunque el target
funcionara no habría cobertura: ningún mapper tiene spec, los specs de servicios son stubs
`TestBed.configureTestingModule({})` sin `provideHttpClient`, ningún `*.spec.ts` importa un archivo de
`models/`, y no hay tests a nivel de tipos (`tsd`, `expectTypeOf`, `satisfies`).

La verificación real fueron: `npx tsc -p tsconfig.app.json --noEmit` después de cada paso, `npm run build`
completo al final, y el pase manual con el backend corriendo. Para un cambio de tipos con corte limpio el
compilador es un verificador fuerte — pero sólo donde hay tipos: cualquier `any` en el camino (como el
`http.get<any>` de arriba) es un punto ciego.

## 10. Convenciones que quedaron sin fijar

- Cuándo una feature necesita más de un `*.response.ts`: payment tiene dos porque espeja el split que ya
  existía entre `payment.interface.ts` y `order.interface.ts`. Para una feature nueva con N endpoints no hay
  regla.
- Orden de imports (modelo antes o después del `.response`), comillas simples vs dobles (se siguió el estilo
  de cada archivo huésped) y `import type` vs `import` (sólo `course.mapper.ts` usa `import type`, copiando la
  línea vecina).
- `cart/models/cart.model.ts` importa `Course` por `@interfaces/course.interface` y su vecino
  `cart.interface.ts` por `@course/models/course.interface`: dos alias para el mismo archivo en la misma
  carpeta. La spec decidió no tocar `@interfaces/*`.
- Los mappers siguen centralizados en `src/app/mappers/` mientras el DTO se descentralizó. Mover el mapper a
  su feature es el paso lógico siguiente y no está discutido en ninguna sección.

## 11. Pendiente de coordinación con la SPEC 16

`specs/16-toast-decidido-por-el-componente.md` toca tres de los archivos que esta spec modificó. El orden
acordado es 15 primero, 16 después, para no mezclar diffs — pero el merge de 15 tiene que entrar antes de
empezar 16 o los conflictos vuelven.
