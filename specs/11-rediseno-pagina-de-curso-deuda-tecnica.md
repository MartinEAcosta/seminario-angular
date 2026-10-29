# SPEC 11 — Deuda técnica

> **Spec:** `11-rediseno-pagina-de-curso.md`
> **Date:** 2026-10-28

Lo que la SPEC 11 deja pendiente a propósito, con el motivo de cada decisión.

## 1. El backend todavía no manda los campos nuevos

`owner_name`, `owner_avatar_url`, `owner_bio`, `spots_remaining` (en `GET /courses/:id`) y
`content_type` / `duration_minutes` por lección (en el endpoint de módulos) son un **cambio de
contrato pendiente** en `seminario-angular-backend`. El frontend ya los consume con fallback `null`:

- sin `owner_name` no se renderiza la card "Tu profesor" ni el autor del hero;
- sin `spots_remaining` el panel muestra el copy neutro `"{capacity} cupos"` y oculta la barra de cupos;
- sin `duration_minutes` en **alguna** lección, `computeModuleStats` devuelve `totalDurationMinutes: null`
  y desaparece el badge de duración total (decisión explícita: un total parcial sería un número falso);
- sin `content_type` la lección usa el ícono genérico.

Hasta que el backend los mande, `/course/:id` se ve correcto pero más pobre que el mock.

## 2. Verificación en navegador incompleta

El backend (`localhost:4201`) no estaba levantado durante la verificación, así que se validó con
fallbacks temporales en `CourseService.getById` / `ModuleService.getModulesByCourseId`
(**ya revertidos**, no están en el commit). Quedó verificado en navegador: layout desktop de dos
columnas con panel sticky, layout mobile de una columna con barra fija abajo, acordeón del Temario
con ícono + duración + candado, "Agregar al carrito" → "En el carrito", y el estado de error de la
página.

Quedó **sin verificar en navegador**:

- el CTA "Continuar" → `/enrollment/:id` del usuario ya inscripto (necesita sesión + inscripción real);
- el caso `price === 0` → "Gratis" (lógica trivial `price === 0`, pero no se vio renderizado);
- el Temario dentro de `/enrollment/:id/lesson/:id_lesson`, que cambió junto con `list-of-content`
  (ahora recibe `modules` por input en vez de cargarlos él mismo; `lesson-viewer-page` quedó como
  dueño de ese `rxResource`).

## 3. Sin tests

Se borró `course-detail.component.spec.ts` junto con el componente, y los tres componentes nuevos
(`course-hero`, `course-instructor`, `course-purchase-panel`) y el util `module-stats` entran **sin
spec**. Además `ng test` sigue sin compilar en el repo por specs rotos preexistentes (ver `CLAUDE.md`),
así que agregarlos ahora no se podría ni correr. `computeModuleStats` / `formatDuration` son funciones
puras: es lo primero que conviene testear cuando la suite vuelva a arrancar.

## 4. `spots_remaining` es sólo display

El panel muestra "Quedan X lugares de Y" y la barra de cupos ocupados, pero nada impide agregar al
carrito un curso con `spots_remaining === 0`. El control de cupo real es del backend al crear la
inscripción; esta spec no lo toca.

## 5. "Sobre este curso" repite el subtítulo del hero

Decisión explícita de la spec (evitar un segundo campo de descripción larga sin pedirlo). Queda la
repetición visible de `course().description` en dos lugares de la misma página hasta que exista un
campo propio.

## 6. Detalles de layout que quedaron aceptables, no perfectos

- Mobile: títulos de módulo largos se truncan con `…` en el header del acordeón (ancho compartido con
  el contador de lecciones).
- Mobile: `content-band` reserva `8rem` abajo para la barra fija, que mide ~70px — queda una franja
  vacía antes del footer.
