# 03 - Inputs de form-course minimalistas y estandarizados

**Estado:** aprobado
**Depende de:** —
**Fecha:** 2026-08-15

**Objetivo:** Rediseñar los inputs de `form-course` (title, description, capacity, price) con un patrón único de label flotante animado y borde completo, eliminando placeholders redundantes, para que el formulario se vea minimalista y consistente entre campos.

## Alcance

**Incluye:**

- Los cuatro campos de texto/numéricos del formulario (`title`, `description`, `capacity`, `price`) pasan a compartir un mismo patrón visual: input con borde completo (`border`, no `border-bottom`) y label flotante animado (el label vive dentro del campo como placeholder; al enfocar o al tener valor, sube y se encoge sobre el borde superior del input, técnica CSS estándar basada en `:focus` / `:not(:placeholder-shown)` + `<label>` hermano, sin JS adicional).
- Se elimina el atributo `placeholder` visible en `title` y `description` (hoy muestran "Título del curso" / "Escribe una breve descripción del curso..."); el label flotante reemplaza esa función.
- `capacity` y `price` migran de su label fijo actual (`label-capacity` / `label-pricing`, siempre visible arriba del input) al mismo patrón de label flotante que el resto, para unificar el estándar.
- `title` conserva su énfasis visual actual (fuente más grande y en negrita respecto a los demás campos) pero usando el mismo patrón de borde completo + label flotante — sigue leyéndose como el campo principal del formulario, solo cambia el tratamiento del borde/label.
- Los estados de validación existentes (`invalid-border` / `valid-border`, aplicados hoy vía `[ngClass]` en `capacity` y `price`) se adaptan al nuevo esquema de borde completo (el color de validación tiñe el borde completo, no solo el `border-bottom`). `title` y `description` no tienen hoy estas clases de validación — no se les agrega en este spec (ver "No incluye").
- Ajustes de `form-course.component.scss` necesarios para soportar el nuevo patrón (nuevas clases de contenedor tipo `.field-float`, reglas de label flotante, spacing).

**No incluye (explícitamente fuera de alcance):**

- `category-select` y `thumbnail-selector`: son componentes hijos con su propia UI (grid de categorías, botón de portada) — no se tocan en este spec.
- Agregar clases de validación (`invalid-border`/`valid-border`) a `title` o `description` — hoy no las tienen y no es parte de este pedido; solo se migra su tratamiento visual de label/borde.
- Cambios a `form-course.component.ts` — no hay lógica nueva, es un cambio puramente de template/estilos.
- Cambios al layout general (grid 2 columnas, colapso del formulario, header con chevron) — eso ya se resolvió en el spec 01 y no se toca aquí.
- Cambios a `form-error-label` (componente de mensajes de error) — se sigue usando tal cual.

## Modelo de datos

No se introducen entidades ni signals nuevos. Es un cambio de template (`form-course.component.html`) y estilos (`form-course.component.scss`) únicamente.

## Plan de implementación

1. `form-course.component.scss`: agregar el patrón de label flotante — clase contenedora (p. ej. `.field-float`) con `position: relative`, input/textarea con `border` completo, `padding` ajustado para dejar espacio al label, y el label posicionado en `position: absolute` sobre el borde superior-izquierdo cuando el input está enfocado o tiene contenido (`:focus`, `:not(:placeholder-shown)`), con `transition` para la animación de subida/achique. Incluir variante para `title` que mantiene tamaño de fuente mayor y negrita. Adaptar `invalid-border`/`valid-border` para pintar el borde completo.
2. `form-course.component.html`: envolver `title` en el nuevo contenedor `.field-float`, agregar su `<label>`, quitar `placeholder="Título del curso"` (usar `placeholder=" "` — un espacio — requerido por el truco CSS `:placeholder-shown`, no se muestra al usuario).
3. Repetir el mismo cambio en `description` (label + `placeholder=" "` en el `textarea`).
4. Repetir en `capacity`: quitar el `<label class="label-capacity">` fijo actual, envolver en `.field-float` con label flotante, agregar `placeholder=" "` al input.
5. Repetir en `price`: mismo tratamiento, quitar `<label class="label-pricing">` fijo, migrar a label flotante.
6. Verificación manual: `ng serve`, abrir `create-course` y `update-course`, comprobar que cada input muestra su label flotando correctamente al enfocar, al tener valor precargado (edición) y al quedar vacío; comprobar que los bordes de validación (rojo/verde) siguen funcionando en `capacity`/`price`; comprobar responsive en mobile (~375px).

Cada paso deja la app compilando y funcional.

## Criterios de aceptación

- [ ] `title`, `description`, `capacity` y `price` muestran cada uno su label flotante (visible siempre, no solo como placeholder fantasma).
- [ ] Ningún input del formulario muestra texto de placeholder tradicional superpuesto al valor (ni "Título del curso", ni "Escribe una breve descripción...", ni "5" en capacity/price).
- [ ] Los cuatro campos usan borde completo (no `border-bottom` suelto) como estilo base.
- [ ] Al enfocar un input vacío, su label sube y se encoge sobre el borde; al perder el foco sin contenido, el label vuelve a su posición inicial dentro del input.
- [ ] Al editar un curso existente (`update-course-page`), los campos precargados muestran el label ya flotando arriba (no superpuesto al valor).
- [ ] `title` se sigue viendo visualmente más grande/en negrita que `description`, `capacity` y `price`.
- [ ] Los estados de validación (borde rojo si inválido y tocado, borde verde/marca si válido y tocado) en `capacity` y `price` se siguen viendo correctamente con el nuevo borde completo.
- [ ] El formulario se sigue viendo correctamente en mobile (~375px), sin overlaps entre label y borde.
- [ ] `ng build` compila sin errores.

## Decisiones tomadas y descartadas

- **Label flotante animado en vez de label fijo arriba**: elegido explícitamente por el usuario por sobre mantener el patrón fijo que ya tenían `capacity`/`price`. Da un resultado más minimalista (menos texto estático ocupando espacio) a costa de algo más de CSS.
- **Borde completo en vez de mantener el underline (`border-bottom`) actual**: elegido explícitamente por el usuario. Reemplaza el estilo underline que hoy comparten `title`, `capacity` y `price`.
- **Se quita el placeholder de texto en `title`/`description`**: con el label flotante ocupando ese rol, un placeholder adicional sería redundante. Se usa `placeholder=" "` (espacio) únicamente como requisito técnico del selector CSS `:not(:placeholder-shown)`, invisible para el usuario.
- **`title` conserva su jerarquía visual (fuente grande/negrita)**: decisión explícita del usuario — se estandariza el patrón de borde/label, pero no se aplana el énfasis visual del campo principal del formulario.
- **`category-select` y `thumbnail-selector` quedan fuera de alcance**: son componentes hijos con UI propia y afordancias ya establecidas (grid de categorías, click sobre miniatura) — no son `<input>` de texto simples y mezclarlos infla el spec innecesariamente.
- **Numeración del spec como `03` pese a que `specs/` está vacío en este momento**: los specs `01-form-course-minimalista.md` y `02-form-lesson-minimalista.md` existieron y fueron mergeados (ver historial de git), pero están borrados sin commitear en el working tree al momento de escribir este spec. Se continúa la numeración desde `03` para no colisionar con esa historia si los archivos se restauran.
