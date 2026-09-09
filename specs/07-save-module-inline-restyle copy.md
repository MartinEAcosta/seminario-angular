# SPEC 07 — Restyle inline de SaveModuleComponent

> **Status:** Aprobado
> **Depends on:** SPEC 06
> **Date:** 2026-09-09
> **Objective:** Rediseñar `SaveModuleComponent` (crear y editar módulo) para que se vea como una fila más del acordeón de `CourseModuleItemComponent` — mismo header, tipografía y botones outline — en vez de una card con lenguaje visual propio, compartiendo esas reglas vía un partial SCSS común.

## Por qué existe esta spec

SPEC 06 dejó `SaveModuleComponent` funcional (inputs `idCourse`/`moduleToEdit`, outputs `saved`/`cancelled`) y ya insertado inline tanto para crear módulo (en `CourseStepContentComponent`, dentro de `.modules-list`) como para editar uno existente (reemplazando el header de `CourseModuleItemComponent`). Pero su `.scss` quedó con un lenguaje visual propio — borde `$brand-color` fijo, header/body en dos bloques, botones pill sólidos — que no calza con el de `CourseModuleItemComponent` — borde `rgba(0,0,0,0.12)` que se enciende solo al expandir, fila única, botón outline. El usuario pidió un restyle completo para que ambos formen una sola familia visual.

## Scope

**In:**

- Reescribir `save-module.component.html` a una fila única (sin separar header/body): prefijo estático `"Módulo {{ displayUnit() }}"` + input de título ocupando el mismo lugar/tamaño de fuente que `.module-title` en `CourseModuleItemComponent`, con los botones Guardar/Cancelar a la derecha de esa misma fila — mismo layout que `.module-header` (izquierda flexible, acciones a la derecha).
- Nuevo partial `src/app/course/components/form-course/steps/course-step-content/_module-item.scss` con las reglas compartidas: contenedor `.module-item` (borde, radio, overflow, transición), `.module-header` (flex, padding, background), `.module-title` (tipografía) y una clase de botón outline reutilizable (generalización de `.btn-edit-module`: pill, borde 2px `$brand-color`, fondo transparente, hover invertido) más su variante neutra para "Cancelar" (borde `$black-custom`).
- `course-module-item.component.scss` pasa a `@use` ese partial y conserva solo lo propio: `.expand-icon`, `.module-toggle`, `.module-body`, `.lesson-row`, `.lesson-title`, `.lesson-actions`, `.btn-link`/`.btn-link-danger`, `.lesson-panel`, `.btn-add-lesson`.
- `save-module.component.scss` pasa a `@use` el mismo partial para contenedor/header/título/botones, y conserva solo el estilo propio del input de título inline (ancho flexible dentro de la fila, borde sutil o solo inferior, foco en `$brand-color`) — deja de usar el patrón `.field-float` de label flotante, que ya no aplica a un input inline de una sola línea.
- Botones "Guardar Módulo" y "Cancelar" migran al lenguaje outline del partial (antes: pill sólido brand-color / pill outline negro).
- La skill `frontend-design` aplica a la forma final del input inline y de los botones outline.

**Sin cambios funcionales:** `save-module.component.ts` (inputs, outputs, `onSaveModule`, `onCancel`, `nextUnit`, `displayUnit`), `ModuleService`, `course-module-item.component.ts`, `course-step-content.component.ts`/`.html` — la fila de creación ya se renderiza dentro de `.modules-list` en el lugar correcto; esta spec solo cambia su apariencia.

**Out of scope (para futuras specs):**

- `FormLessonComponent` y `.lesson-panel`: sin cambios, ni de estructura ni de estilo.
- Cualquier campo o validación nueva en `SaveModuleComponent`.
- Reordenar o eliminar módulos (sigue fuera de alcance desde SPEC 06).
- Mover el partial compartido a `shared/styles/` — queda acotado a `course-step-content/` porque es un patrón específico del acordeón de contenido de curso.
- Cambios a `variables.scss`, header, footer o `app.routes.ts`.
- Tests automatizados nuevos.

## Data model

Esta spec no introduce ni modifica estructuras de datos. Reutiliza el modelo de `Module`/`ModulePopulated` y el `moduleForm` de `SaveModuleComponent` tal cual quedaron en SPEC 06. Es puramente de presentación (HTML + SCSS).

## Implementation plan

1. Crear `course-step-content/_module-item.scss` extrayendo de `course-module-item.component.scss` las reglas `.module-item`, `.module-header`, `.module-title` y generalizando `.btn-edit-module` en una clase de botón outline reutilizable (`.btn-outline` + variante `.btn-outline-neutral` para "Cancelar", usando `$black-custom` como color base). Verificación: archivo nuevo sin consumidores todavía, `ng serve` sigue compilando igual.
2. Actualizar `course-module-item.component.scss` para `@use './_module-item.scss'` y borrar las reglas ya movidas, dejando solo lo propio del cuerpo expandido (`.expand-icon`, `.module-toggle`, `.module-body`, filas de lección, `.btn-add-lesson`). Verificación: `ng serve` compila; el acordeón de módulos/lecciones se ve exactamente igual que antes (sin regresión visual).
3. Reescribir `save-module.component.html`: `<div class="module-item">` con un único `<div class="module-header">` que contiene el prefijo `"Módulo {{ displayUnit() }}"`, el `<input formControlName="title">` inline ocupando el espacio restante, y un `<div class="header-actions">` con los botones Guardar/Cancelar. Se elimina la estructura `.module-form-header`/`.module-form-body` y el patrón `.field-float`. Verificación: compila; el formulario dentro del acordeón todavía tiene el CSS viejo (se ve descuadrado, se corrige en el paso siguiente).
4. Reescribir `save-module.component.scss` para `@use '../../course/components/form-course/steps/course-step-content/_module-item.scss'` (ruta real según ubicación final del archivo) y dejar solo el estilo propio del input de título (fondo transparente, sin caja completa, borde inferior o sutil, foco en `$brand-color`, `flex: 1 1 auto`) y de `.header-actions` (`display:flex; gap`). Verificación manual: crear un módulo nuevo en `/course/create/content` — la fila fantasma tiene el mismo borde/radio/alto que un módulo colapsado existente; editar un módulo existente reemplaza su header sin saltos de layout; los botones Guardar/Cancelar son pill outline con hover invertido.
5. QA manual: crear módulo, editar módulo, cancelar en ambos casos, revisar consola y el layout en mobile (`<48rem`, breakpoint ya usado en el resto del wizard).

## Acceptance criteria

- [ ] Crear un módulo nuevo muestra una fila con el mismo borde, radio y padding que un `module-item` colapsado — no una card con estilo distinto.
- [ ] El input de título aparece en el mismo lugar y tamaño de fuente donde se muestra `.module-title` en un módulo ya guardado.
- [ ] `"Módulo {n}"` se muestra como prefijo estático junto al input, igual al crear que al editar.
- [ ] Los botones "Guardar Módulo" y "Cancelar" son pill outline (borde 2px, fondo transparente) con hover invertido (fondo sólido, texto blanco/negro según corresponda), mismo criterio visual que el botón "Editar" de un módulo.
- [ ] Editar un módulo existente reemplaza el header de `CourseModuleItemComponent` sin cambiar el ancho ni el alto de la fila respecto al estado colapsado.
- [ ] `.module-item`, `.module-header`, `.module-title` y el botón outline están definidos una sola vez, en `_module-item.scss` — ni `course-module-item.component.scss` ni `save-module.component.scss` redefinen esas reglas.
- [ ] `FormLessonComponent` y su `.lesson-panel` no cambian visualmente.
- [ ] Guardar y cancelar (tanto crear como editar) siguen funcionando igual que antes: `POST`/`PUT` según corresponda, eventos `saved`/`cancelled` emitidos.
- [ ] No hay errores de consola en desktop ni en mobile (`<48rem`).

## Decisions

- **Sí:** HTML + CSS, no solo CSS — compactar header y body en una sola fila requiere reordenar el template de `SaveModuleComponent`, no alcanza con repintar colores.
- **Sí:** la fila de creación se queda donde ya está (dentro de `.modules-list`, antes del botón "+ Agregar módulo") — `course-step-content.component.html` ya la ubica ahí correctamente; solo se restylea, no se mueve.
- **Sí:** partial SCSS compartido `_module-item.scss` junto a sus dos consumidores en `course-step-content/` — evita duplicar bordes/paddings/botones entre `course-module-item.component.scss` y `save-module.component.scss`, y queda acotado porque es un patrón específico de este acordeón, no un componente reusado por otras features.
- **Sí:** botones outline (mismo lenguaje que `.btn-edit-module`) en vez de mantener el pill sólido actual — decisión explícita del usuario, para que Guardar/Cancelar hablen el mismo idioma visual que el resto del acordeón.
- **Sí:** `"Módulo {n}"` como prefijo estático + input inline en una sola fila, reemplazando el layout de header/body separados — decisión explícita del usuario.
- **No:** extender este restyle a `FormLessonComponent` en esta spec — decisión explícita del usuario; si hace falta después, va en spec propia.
- **No:** mover el partial a `shared/styles/` — se descartó por ser un patrón acotado al acordeón de contenido de curso, no un componente reusado.
- **No:** cambios funcionales en `SaveModuleComponent.ts` o `ModuleService` — esta spec es puramente de presentación.

## Identified risks

| Riesgo | Mitigación |
| --- | --- |
| El partial compartido acopla visualmente `course-module-item` y `save-module`; un cambio futuro en uno puede romper al otro sin querer. | El paso 2 verifica explícitamente que el acordeón existente no cambie tras extraer las reglas, antes de tocar `save-module`. |
| Quitar `.field-float` de `save-module` puede dejar el input sin affordance de foco clara al ser de una sola línea. | El paso 4 define explícitamente un estado `:focus` con borde/`$brand-color` para el input inline como parte de la verificación manual. |

## Lo que **no** entra en esta spec

- Restyle de `FormLessonComponent`.
- Campos o validaciones nuevas en `SaveModuleComponent`.
- Reordenar o eliminar módulos.
- Mover el partial a `shared/styles/`.
- Cambios a `variables.scss`, header, footer o `app.routes.ts`.
- Tests automatizados nuevos.

Cada uno de esos, si aterriza, va en su propia spec.
