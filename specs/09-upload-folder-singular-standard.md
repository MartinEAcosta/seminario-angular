# SPEC 09 — Estándar singular para carpetas de upload

> **Status:** Aprobado
> **Depends on:** Ninguna (refactor transversal sobre código ya existente)
> **Date:** 2026-09-10
> **Objective:** Unificar el nombre de carpeta usado para subir archivos (`course`/`lesson`/`user`) en un único tipo `UploadFolder` centralizado en singular, corrigiendo el mismatch real que hoy deja el picker de avatar sin efecto y eliminando la duplicación de union types sueltos en 4+ archivos.

## Por qué existe esta spec

`FileService.onFileChanged` declara el union `'lessons' | 'courses' | 'user'`, pero `user-profile-page.component.html` le pasa `'users'` (plural) al evento `(change)` — no matchea ningún `case` del switch, cae al `default`, y el avatar elegido nunca llega a setear `tempAvatar`/`avatarFile` en `AuthService`. Aparte del bug puntual, el nombre de carpeta está declarado de forma independiente en 4 lugares (`FileService`, `ThumbnailSelectorComponent.folder`, `LessonService.folder`, literales sueltos en `CourseService`) sin una fuente única de verdad, mezclando plural (`courses`/`lessons`) y singular (`user`) sin criterio. El usuario definió el estándar: singular en todos los casos, con el backend ya preparado (o a preparar) para recibir esas rutas en singular.

## Scope

**In:**

- Nuevo tipo `export type UploadFolder = 'course' | 'lesson' | 'user';` en `src/app/file/models/file.interfaces.ts`, como única fuente de verdad del nombre de carpeta.
- `FileService.uploadFiles`/`uploadFile` tipan su parámetro `folder` como `UploadFolder` (en vez de `string`).
- `FileService.onFileChanged` tipa su parámetro `type` como `UploadFolder` (en vez del union local `'lessons' | 'courses' | 'user'`) y su switch pasa a comparar `'course'`/`'lesson'`/`'user'`.
- `ThumbnailSelectorComponent.folder` pasa de `input.required<'lessons' | 'courses'>()` a `input.required<Extract<UploadFolder, 'course' | 'lesson'>>()` (excluye `'user'`, que no pasa por este componente) y su template ajusta las comparaciones a singular.
- Los 7 call-sites que hoy pasan el literal viejo se actualizan a singular: `course-step-data.component.html`, `slider-content-manager.component.html` (2 usos), `course.service.ts` (2 usos), `form-lesson.component.html`, `user-profile-page.component.html` (fix del bug).
- `LessonService` pierde la propiedad suelta `folder = 'lessons'`; sus 2 llamadas a `uploadFile(...)` pasan el literal `'lesson'` inline, mismo patrón que ya usa `CourseService`.
- `FormLessonComponent` pierde `folder = 'lessons'`: propiedad muerta, no se referencia en su propio template (el `(change)` de ese componente ya usaba un literal hardcodeado aparte).
- `UserProfilePageComponent.onAvatarSelected` tipa su parámetro `folder` como `UploadFolder` (en vez de `string`).
- La skill `frontend-design` no aplica — esta spec no toca HTML/CSS visual, solo strings, tipos y un import.

**Sin cambios funcionales:** `LessonFormState`, `CourseFormState`, `AuthService.setTempAvatar`/`setAvatarFile`, `UserProfilePageComponent.onSaveProfile` (sigue mock, sin llamada HTTP real), `FileMapper`, cualquier endpoint o lógica de negocio — esta spec es puramente de naming/tipos.

**Out of scope (para futuras specs):**

- Wiring del upload real de avatar contra el backend (`fileService.uploadFile('user', ...)` desde `onSaveProfile` o similar) — hoy `onSaveProfile` es mock sin llamada HTTP; conectarlo es spec aparte, junto con el endpoint de actualización de perfil que todavía no existe.
- Cualquier cambio de contrato/ruta en el backend (`seminario-angular-backend`, repo aparte) — esta spec asume que el backend ya expone (o va a exponer, coordinado fuera de este repo) `/upload/single/course/:id`, `/upload/single/lesson/:id`, `/upload/single/user/:id`.
- Un array/const runtime de folders válidos (ej. `UPLOAD_FOLDERS: UploadFolder[]`) — no se agrega porque hoy ningún consumidor necesita iterar sobre los valores; si aparece esa necesidad, se agrega en spec o PR aparte.
- Limpieza de `SliderContentManagerComponent`/`BtnNavigationComponent` como código huérfano (ya señalado como fuera de alcance en SPEC 08) — no se toca acá tampoco.
- Tests automatizados nuevos.
- Cambios a `variables.scss`, header, footer o `app.routes.ts`.

## Data model

Un único tipo nuevo, sin runtime asociado:

```ts
// src/app/file/models/file.interfaces.ts
export type UploadFolder = 'course' | 'lesson' | 'user';
```

No se crea un const array de valores (`UPLOAD_FOLDERS`) porque ningún consumidor actual necesita iterar sobre ellos — el tipo alcanza para el chequeo estático en los switch/inputs/parámetros existentes. `UploadedFile.folder` (en el mismo archivo) queda como `string` tal cual está, porque representa el valor ya persistido que devuelve el backend, no una entrada de usuario a validar.

## Implementation plan

1. **`file.interfaces.ts`**: agregar `export type UploadFolder = 'course' | 'lesson' | 'user';` junto a `UploadedFile`. Verificación: compila, sin consumidores todavía.
2. **`file.service.ts`**: importar `UploadFolder` desde `@file/models/file.interfaces`; tipar `folder` en `uploadFiles`/`uploadFile` como `UploadFolder`; tipar `type` en `onFileChanged` como `UploadFolder`; cambiar los `case` del switch de `'courses'`/`'lessons'` a `'course'`/`'lesson'` (el `case 'user'` no cambia de string, solo de tipo declarado). Verificación: compila con errores esperados en los call-sites que aún mandan el string viejo (se resuelven en los pasos siguientes).
3. **`thumbnail-selector.component.ts`**: importar `UploadFolder`; `folder = input.required<Extract<UploadFolder, 'course' | 'lesson'>>();`. **`thumbnail-selector.component.html`**: `folder() === 'courses'` → `'course'`, `folder() === 'lessons'` → `'lesson'`. Verificación: compila.
4. **`course-step-data.component.html`**: `[folder]="'courses'"` → `[folder]="'course'"`. Verificación: compila.
5. **`slider-content-manager.component.html`**: `[folder]="'courses'"` → `'course'`; `onFileChanged($event, 'lessons')` → `'lesson'`. Verificación: compila (aunque este componente no está enrutado, per SPEC 08).
6. **`course.service.ts`**: las 2 llamadas `uploadFile('courses', ...)` → `uploadFile('course', ...)`. Verificación: compila; tipo `UploadFolder` en `uploadFile` acepta el literal.
7. **`lesson.service.ts`**: quitar `folder = 'lessons';`; en las 2 llamadas `this.fileService.uploadFile(this.folder, ...)` → `this.fileService.uploadFile('lesson', ...)`. Verificación: compila.
8. **`form-lesson.component.ts`**: quitar `folder = 'lessons';` (dead code). **`form-lesson.component.html`**: `onFileChanged($event, 'lessons')` → `'lesson'`. Verificación: compila.
9. **`user-profile-page.component.ts`**: importar `UploadFolder`; `onAvatarSelected(event: Event, folder: UploadFolder)`. **`user-profile-page.component.html`**: `onAvatarSelected($event, 'users')` → `onAvatarSelected($event, 'user')` (fix del bug). Verificación: compila.
10. **QA manual**: `ng build` sin errores. Subir portada de curso (`course-step-data` y `slider-content-manager`) sigue funcionando igual que antes — mismo comportamiento visual, ahora contra la ruta singular. Subir media de lección (imagen/video) sigue funcionando igual. Elegir avatar en `/profile` ahora sí setea preview (`tempAvatar`) sin caer al `default` del switch — confirmar en consola/UI que ya no es no-op. Sin errores de consola en desktop ni mobile (`<48rem`).

## Acceptance criteria

- [ ] Existe `UploadFolder` en `src/app/file/models/file.interfaces.ts` como `'course' | 'lesson' | 'user'`, y es la única definición de ese union en el proyecto (ningún otro archivo redeclara un union propio para folders).
- [ ] `FileService.uploadFiles`, `uploadFile` y `onFileChanged` usan `UploadFolder` en vez de `string` o unions locales.
- [ ] Ningún archivo del proyecto pasa `'courses'`, `'lessons'` o `'users'` (plural) como valor de folder — todos usan `'course'`, `'lesson'` o `'user'`.
- [ ] `ThumbnailSelectorComponent.folder` tipa `Extract<UploadFolder, 'course' | 'lesson'>`, no acepta `'user'`.
- [ ] `LessonService` ya no tiene la propiedad `folder`; `FormLessonComponent` ya no tiene su `folder` muerta.
- [ ] Elegir un avatar en `/profile` setea `AuthService.tempAvatar`/`avatarFile` (el bug del mismatch `'user'`/`'users'` queda resuelto) — verificable por el preview que aparece en la UI.
- [ ] Subir portada de curso (crear/editar curso) sigue funcionando igual que antes de la spec, ahora contra la ruta `/upload/single/course/:id`.
- [ ] Subir media de lección (imagen/video) sigue funcionando igual que antes, ahora contra la ruta `/upload/single/lesson/:id`.
- [ ] `ng build` compila sin errores.
- [ ] No hay errores de consola en desktop ni en mobile (`<48rem`).

## Decisions

- **Sí:** convención singular (`course`/`lesson`/`user`) en vez de plural — decisión explícita del usuario; confirmó que el backend ya espera (o va a exponer) esas rutas en singular, así que no hace falta capa de traducción entre nombre interno y URL real.
- **Sí:** tipo único `UploadFolder` centralizado en `@file/models/file.interfaces.ts` — decisión explícita del usuario; elimina la duplicación de unions sueltos en `FileService`, `ThumbnailSelectorComponent` y la ausencia de tipo en `LessonService`/`CourseService`.
- **Sí:** se refactorizan los 3 folders (`course`, `lesson`, `user`), no solo el roto — decisión explícita del usuario, para que no queden strings plural sueltos conviviendo con el tipo nuevo en singular.
- **Sí:** se elimina `LessonService.folder` y `FormLessonComponent.folder` en vez de solo re-tipar — la primera es redundante frente al literal inline que ya usa `CourseService`; la segunda es código muerto sin ningún consumidor.
- **No:** const array runtime (`UPLOAD_FOLDERS`) — no hay consumidor que itere sobre los valores hoy; se agrega si aparece esa necesidad real.
- **No:** wiring del upload real de avatar contra el backend — decisión explícita del usuario; `onSaveProfile` sigue mock, esta spec solo arregla que el flujo de preview/tipo sea consistente.
- **No:** cambios en el backend (`seminario-angular-backend`) — fuera de este repo; la spec asume que las rutas singulares ya están (o van a estar) disponibles, coordinado aparte por el usuario.

## Identified risks

| Riesgo | Mitigación |
| --- | --- |
| Renombrar `'courses'→'course'` y `'lessons'→'lesson'` cambia la URL real que golpea `uploadFile()` para portadas de curso y media de lección — casos que hoy funcionan en producción en plural. Si el backend no tiene ya desplegadas las rutas singulares, el upload se rompe en vivo. | El usuario confirmó que el backend ya está preparado para singular; aun así, el paso 10 (QA manual) exige probar explícitamente subir portada de curso y media de lección contra el backend real antes de dar la spec por verificada — no alcanza con que compile. |
| `Extract<UploadFolder, 'course' \| 'lesson'>` en `ThumbnailSelectorComponent` es más estricto que el tipo anterior; si en el futuro alguien intenta reusar ese componente para avatares, el tipo lo va a rechazar en compilación. | Es el comportamiento deseado (ese componente nunca debería aceptar `'user'`); si hiciera falta soportarlo, es una decisión nueva y explícita, no un ajuste silencioso. |

## Lo que **no** entra en esta spec

- Wiring del upload real de avatar contra el backend.
- Cambios de contrato/ruta en el backend.
- Const array runtime de folders válidos.
- Limpieza de `SliderContentManagerComponent`/`BtnNavigationComponent`.
- Tests automatizados nuevos.
- Cambios a `variables.scss`, header, footer o `app.routes.ts`.

Cada uno de esos, si aterriza, va en su propia spec.
