# SPEC 07 — Deuda técnica

> Companion de `07-home-curso-destacado-y-item-de-carrusel.md`. Registra lo que la spec deja a sabiendas sin resolver.

## 1. El curso destacado se elige en el cliente

`HomeComponent.featuredCourse` devuelve `coursesToShow().items[0]`. No hay ningún criterio editorial ni de producto detrás: es el primero que manda la API.

Lo correcto es un campo `is_featured` en el modelo `Course` y un `GET /courses/featured` en el backend, o al menos un `created_at` que permita un corte defendible ("Nuevos en Udemix"). Mientras tanto el copy se limita a "Curso destacado", que no promete un criterio que el dato no sostiene.

**Impacto si no se resuelve:** el destacado cambia solo cuando cambia el orden de la API; no hay forma de elegir qué curso se muestra en la puerta de entrada.

## 2. El nombre de categoría se resuelve con un fallback por nombre

`featuredCategoryName` busca la categoría primero por `id` y después por `name`:

```ts
return categories.find((category) => category.id === key)?.name
    ?? categories.find((category) => category.name === key)?.name
    ?? null;
```

La segunda rama existe sólo porque `src/app/utils/defaultCourses.ts` guarda el **nombre** de la categoría ("Legacy", "Framework") en el campo `id_category`, donde el backend real manda un id. Arreglar el mock para que use ids de `defaultCategories` deja esa rama sin razón de ser y se puede borrar.

**Impacto si no se resuelve:** una categoría real cuyo `id` coincidiera con el `name` de otra devolvería la etiqueta equivocada. Improbable, pero la rama no debería existir.

## 3. El camino sin backend quedó sin verificar en vivo

Durante la implementación el backend estaba levantado, así que todo se verificó contra datos reales: el destacado resolvió "Angular desde Cero hasta Experto" con la pill "Tecnología" vía la rama de `id`.

Falta ejercitar el escenario de `PRODUCT.md:33` — backend caído, `defaultCourses` en juego — donde el destacado debería ser *Introducción a JavaScript* y la pill debería decir **"Legacy"** resuelta por la rama de nombre (ver deuda 2). Es el escenario de evaluación más probable y no se corrió.

**Cómo cerrarla:** bajar el backend, recargar `/`, y confirmar que aparece la pill "Legacy" y no un hash crudo ni la pill ausente.

## 4. El feedback de "agregado al carrito" vive en tres componentes

El bloque `justAdded` / `ADDED_FEEDBACK_MS = 2200` / `clearTimeout` en `ngOnDestroy`, más el acuse en una región `aria-live`, está duplicado literal en:

- `course-mini-card.component.ts`
- `course-carousel-item.component.ts` (nuevo)
- `course-featured.component.ts` (nuevo)

Pasó de una copia a tres en esta spec. El patrón de link full-bleed (`a.card-link` en absoluto con `.sr-only`) está duplicado en los dos primeros.

Se dejó así a propósito: son ocho líneas, el repo no tiene un patrón establecido para compartir comportamiento entre componentes, y la decisión de la spec fue extraer el item de carrusel *tal cual*. Con un cuarto consumidor conviene factorizarlo — probablemente como una función que devuelva `{ justAdded, onAddToCart }`, no como clase base.

## 5. El vocabulario de ticket está duplicado, no compartido

El festón de semicírculos por `radial-gradient` repetido y el sello circular teal existen ahora en dos hojas sin partial común:

- `src/app/shared/pages/about/about-page.scss` (vertical: banda teal arriba, festón horizontal)
- `src/app/course/components/course-featured/course-featured.component.scss` (rotado: talón a la izquierda, festón vertical, y festón horizontal abajo de `md`)

Factorizarlas hoy produciría un partial con dos ramas de orientación y cero consumidores más. Conviene esperar al tercer caso. Nota aparte: `.ticket-card` en `about-page.scss` usa `0 10px 30px rgba(0,0,0,0.05)` escrito a mano en vez de `$shadow-surface-rest`; el componente nuevo sí usa el token.

## 6. El item de carrusel sigue siendo una superficie oscura en la sala clara

La extracción no cambió nada visual, así que el hallazgo `nested-cards` de la crítica sigue en pie: `.carousel-item` es `$black-custom` dentro de la banda de papel hueso, la "tercera condición de superficie" que la regla de dos salas (DESIGN.md:194) no cubre.

Esto es exactamente lo que la spec habilita: ahora el item del carrusel se puede rediseñar sin tocar `/explore`. Queda para la pasada de rediseño.

## 7. Faltan tokens de radio y de levante

El componente nuevo escribe `20px`, `999px` y `56px` como literales porque `src/variables.scss` no tiene tokens de radio — la escala `rounded` de DESIGN.md es sólo documentación. Lo mismo con el levante: existe `$lift-control` (-3px) pero no `$lift-surface` (-6px) ni `$lift-card` (-10px), que `course-carousel-item.component.scss` escribe a mano.

Deuda de la hoja de tokens, no de esta spec, pero cada componente nuevo la agranda.

## 8. `ng test` sigue sin compilar

Preexistente y fuera de alcance: specs que apuntan a archivos movidos (`explore-page.spec.ts`, `pagination.service.spec.ts`, el spec de `enrollment-card`, un spec de `lesson-form-state`) y `angular.json` referenciando `node_modules/@videojs/themes/...`, un paquete ausente de `package.json`.

Los dos componentes nuevos se crearon **sin** `.spec.ts`. Agregarlos mientras la suite no corre sumaría archivos que nadie ejecuta; corresponde hacerlo junto con el arreglo de la suite.
