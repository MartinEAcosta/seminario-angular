# SPEC 09 — Quitar definitivamente el selector de cupos y el cupón de descuento

> **Status:** Aprobado
> **Depends on:** 08 (carrito panel lateral)
> **Date:** 2026-10-21
> **Objective:** Eliminar por completo el selector de cupos (+/-) del carrito y el bloque de código de descuento de la UI, dejando cada curso siempre con cantidad fija 1 y resolviendo la deuda técnica que spec 08 dejó pendiente en `cart-item-card.component` y `cart-checkout.component`.

## Por qué existe esta spec

Spec 08 sacó el selector de cupos del panel lateral nuevo (`CartPanelItemComponent`) pero lo dejó intacto en `cart-item-card.component`, el único componente que sigue usando `cart-checkout.component` en `/payment/buy` — esa fue la deuda técnica explícita de la spec anterior ("No: selector de cupos en el panel lateral... reservar más de 1 cupo por curso sólo se puede hacer desde `/payment/buy`"). Esta spec cierra esa deuda quitando el selector también de `/payment/buy`, y de paso saca el input de cupón de descuento de los dos lugares donde aparece (panel lateral y `cart-checkout`).

## Scope

**In:**

- `cart-item-card.component.ts|html|scss`: se elimina el bloque `.quantity-selector` (botones +/-, input numérico) y el texto `.text-capacity` ("Quedan N cupos" / "No quedan más cupos"), junto con los computeds `capacity`, `remainingSeats`, `isAtCapacity` y el efecto de animación de pulso ligado a cambios de `quantity`. El computed `quantity` se elimina si deja de tener consumidores en el template.
- `cart.model.ts`: se elimina el método público `upQuantity`/`downQuantity`. `addToCart` deja de incrementar cantidad — si el curso no está en el carrito lo agrega con `quantity: 1`; si ya está, no hace nada (no se puede agregar dos veces el mismo curso). `downQuantity` deja de existir como concepto: quitar un curso del carrito siempre es `removeItem`.
- `cart.service.ts`: se eliminan los métodos públicos `upQuantity` y `downQuantity` (ya sin consumidores tras el punto anterior).
- `cart.interface.ts`: `CartItem.quantity` y `ItemQuantity.quantity` se mantienen en la interfaz (el back-end sigue recibiendo `quantity`), pero su valor es siempre `1` — no se elimina el campo porque el contrato con el back-end (`ItemQuantity[]` en `PaymentService.calculateTotal`) no se toca en esta spec.
- `cart.component.html|ts|scss`: se elimina el uso de `<app-discount-code-input/>`, y el import de `DiscountCodeInputComponent` del array `imports`.
- `cart-checkout.component.html|ts`: se elimina el bloque `<div class="container-referral"><app-discount-code-input /></div>` y el import de `DiscountCodeInputComponent` del array `imports`. La fila de resumen por item pasa de `"{{ item.course.title }} x {{ item.quantity }}"` a sólo `"{{ item.course.title }}"`.
- `purchase-summary.component.html`: se elimina la línea `"Cantidad: {{ item.quantity }}"` del ticket de compra; queda sólo título del curso y precio unitario.
- Se borra entero `discount-code-input.component` (`.ts`/`.html`/`.scss`/`.spec.ts`) una vez que `cart.component` y `cart-checkout.component` dejan de usarlo (puntos anteriores) — sin ese import quedaría huérfano. Se quita también su `export *` de `cart/components/index.ts`.
- `CartService.applyDiscountCode`/`Cart.code`/el parámetro `code` de `PaymentService.calculateTotal` **no se borran** — quedan como código sin uso (decisión explícita, ver Decisiones). Son independientes de `discount-code-input.component`: no lo importan ni lo llaman, así que borrar el componente no los deja rotos.

**Out of scope (para otra spec):**

- Borrar `CartService.applyDiscountCode`, el campo `code` de `Cart`/`CartItem`, o el parámetro `code` de `PaymentService.calculateTotal` — queda como código muerto a propósito.
- Tocar `course.capacity` como campo del modelo `Course` o su uso en `course-featured.component`, `course-step-data.component` (formulario de creación de curso) — esos son "cupos del curso" como atributo del curso, no el selector de cantidad del carrito.
- Cambios en el contrato del back-end: `ItemQuantity` sigue enviando `{ id_course, quantity }` con `quantity` siempre en `1`.
- Cambios en `cart-panel-item.component` — ya no tiene selector de cupos desde spec 08, no requiere cambios.
- Permitir agregar el mismo curso dos veces o cualquier otro mecanismo para reservar más de un cupo del mismo curso, desde ningún lugar de la app.

## Data model

No se agregan interfaces. `CartItem.quantity` e `ItemQuantity.quantity` se mantienen sin cambio de tipo, pero su valor queda fijo en `1` en todos los casos (antes podía ser `> 1`). `Cart.addToCart` cambia de "incrementa cantidad si ya existe" a "no-op si ya existe".

## Implementation plan

1. `cart.model.ts`: reescribir `addToCart` para que agregue el item con `quantity: 1` sólo si no existe en el map, sin incrementar; eliminar `upQuantity` y `downQuantity`. Verificación: `cart.service.spec.ts` sigue compilando (no referencia estos métodos).
2. `cart.service.ts`: eliminar los métodos públicos `upQuantity`/`downQuantity` (ya no los llama nadie tras el paso 1 y el paso 3).
3. `cart-item-card.component.ts`: eliminar `capacity`, `remainingSeats`, `isAtCapacity`, el efecto de pulso de animación y el `viewChild('quantityRef')`; `cart-item-card.component.html`: eliminar el bloque `.quantity-selector` y `.text-capacity`; `cart-item-card.component.scss`: eliminar los estilos asociados a esas clases.
4. `cart.component.ts`: eliminar `isDiscountOpen`, `toggleDiscount` y el import/uso de `DiscountCodeInputComponent`; `cart.component.html`: eliminar el botón de toggle y `<app-discount-code-input/>`; `cart.component.scss`: eliminar estilos del botón de toggle si quedan sin uso.
5. `cart-checkout.component.ts`: eliminar el import/uso de `DiscountCodeInputComponent`; `cart-checkout.component.html`: eliminar el bloque de cupón y el `" x {{ item.quantity }}"` de la fila de resumen.
6. `purchase-summary.component.html`: eliminar la línea `"Cantidad: {{ item.quantity }}"`.
7. Borrar entero `src/app/cart/components/discount-code-input/` (`.ts`, `.html`, `.scss`, `.spec.ts`) y quitar su `export *` de `cart/components/index.ts` — ya sin consumidores tras los pasos 4 y 5.
8. Verificación manual en navegador: agregar 2+ cursos distintos al carrito desde `/explore` o `/`, abrir el panel lateral (sin cupón, como ya estaba), ir a `/payment/buy` y confirmar que `cart-item-card` no muestra selector de cupos ni texto de capacidad, que no hay bloque de cupón, que el resumen no muestra "x N" ni "Cantidad", y que el ticket final de compra (`purchase-summary`) tampoco muestra "Cantidad". Confirmar que sigue sin poder agregarse el mismo curso dos veces (el botón "Agregar al carrito" en la card de curso no debería duplicar el item).

## Acceptance criteria

- [ ] En `/payment/buy`, ningún item muestra selector +/- de cupos ni texto "Quedan N cupos" / "No quedan más cupos".
- [ ] En el panel lateral del carrito (home/explore) no aparece el enlace "¿Tenés un código de descuento?" ni el input de cupón.
- [ ] En `/payment/buy` no aparece el bloque de cupón de descuento.
- [ ] La fila de resumen en `cart-checkout` muestra sólo el título del curso y el precio, sin "x N".
- [ ] El ticket de `purchase-summary` no muestra la línea "Cantidad".
- [ ] Cada curso agregado al carrito tiene `quantity: 1` siempre; `CartService` ya no expone `upQuantity`/`downQuantity`.
- [ ] `discount-code-input.component` no existe más en el repo.
- [ ] `CartService.applyDiscountCode` y `Cart.code` siguen existiendo en el repo sin ser importados/llamados desde ningún componente del carrito.
- [ ] `course.capacity` sigue funcionando sin cambios en `course-featured` y en el formulario de creación de curso.

## Decisiones tomadas y descartadas

- **Sí:** fijar `quantity` en `1` en vez de sólo ocultar la UI del selector — elimina el código muerto de `upQuantity`/`downQuantity` en `Cart`/`CartService`, no sólo en el template.
- **Sí:** eliminar también el texto de "cupos restantes" (`capacity`/`remainingSeats`/`isAtCapacity`) de `cart-item-card`, porque pierde sentido sin selector de cantidad — `course.capacity` como atributo del curso en sí no se toca.
- **Sí:** borrar `discount-code-input.component` entero una vez que `cart.component`/`cart-checkout.component` dejan de usarlo — decisión explícita del usuario, revierte la decisión original de dejarlo como código sin uso.
- **No:** borrar la lógica de `applyDiscountCode`/`code` en `CartService`/`PaymentService` — decisión explícita del usuario de dejarla como código sin uso, por si se reutiliza en el futuro, en vez de invertir tiempo en limpiarla ahora. Es independiente del componente: no lo importa ni lo llama.
- **Sí:** quitar el "x {{ quantity }}" de `cart-checkout` y la línea "Cantidad" de `purchase-summary` — con `quantity` siempre en `1`, mostrar el multiplicador es ruido visual redundante.
- **No:** tocar `ItemQuantity`/el contrato con el back-end — sigue enviando `quantity: 1` por item, cambiarlo es un cambio de contrato fuera de alcance de esta spec de UI.

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| `cart.service.spec.ts` u otro spec pudiera referenciar `upQuantity`/`downQuantity` y romper la compilación de tests | Se verificó que ninguno de los `.spec.ts` existentes en `cart/` referencia estos métodos (son stubs mínimos de 17-23 líneas); no se requiere tocarlos. |
| Dejar `applyDiscountCode` sin uso puede generar una advertencia de "unused import" si queda algún import suelto | Revisar explícitamente el array `imports` de `cart.component.ts` y `cart-checkout.component.ts` al quitar los templates, no sólo el HTML, antes de borrar `discount-code-input.component`. |
| `discount-code-input.component.spec.ts` podría romper la compilación de tests al borrar el componente | Se borra junto con el resto del directorio (paso 7 del plan); no queda referenciado desde otro spec. |

## Qué **no** está en esta spec

- Borrado de `applyDiscountCode`, `Cart.code` o el parámetro `code` de `PaymentService.calculateTotal`.
- Cambios en `course.capacity` o en cualquier componente de curso (`course-featured`, formulario de creación).
- Cambios en el contrato del back-end (`ItemQuantity`).
- Cambios en `cart-panel-item.component` (ya conforme desde spec 08).

Cada uno de estos, si se necesita, va en su propia spec.
