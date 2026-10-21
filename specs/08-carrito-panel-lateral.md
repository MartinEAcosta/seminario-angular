# SPEC 08 — Carrito: panel lateral full-height (reemplaza popover de esquina)

> **Status:** Aprobado
> **Depends on:** 01 (breakpoints y escala fluida)
> **Date:** 2026-10-21
> **Objective:** Reemplazar el popover flotante de esquina del carrito actual por un panel lateral que ocupa todo el alto del viewport anclado al borde derecho, con items de curso rediseñados, siguiendo el mockup "Carrito · panel lateral sobre la home".

## Por qué existe esta spec

El carrito actual (`cart.component`) abre un popover flotante de 300-400×400-620px con esquinas redondeadas en la esquina inferior derecha, con un morph animado FAB-a-caja. El mockup de referencia (`https://claude.ai/artifact/8QA8kX4B4G3DvtAf2k2Srg#artboard-c2a0445a0dc8`) muestra en cambio un panel que ocupa el 100% del alto de la pantalla, anclado al borde derecho sin margen ni esquinas redondeadas exteriores — el patrón clásico de drawer de e-commerce. Los tokens de color del mockup (fondo hueso, botón teal, texto oscuro) ya existen en `variables.scss` (`$white-custom`, `$brand-color`, `$black-custom`), así que es un cambio de estructura/chrome, no de paleta.

## Scope

**In:**

- `cart.component.ts|html|scss` reescritos: panel `position: fixed; top: 0; right: 0; height: 100vh`, ancho `clamp(360px, 28vw, 420px)`, fondo `$white-custom`, sin `border-radius` en el contenedor exterior. Se mantiene el FAB circular existente (ícono + badge de notificación) como trigger — el mock sólo ilustra el panel ya abierto, no un trigger distinto.
- Header nuevo: "Tu carrito" (bold, `$black-custom`) + "{n} cursos" en gris muted al lado, botón cuadrado redondeado (fondo gris claro) con ✕ a la derecha, borde inferior de 1px.
- Nuevo `CartPanelItemComponent` (`src/app/cart/components/cart-panel-item/`), selector `app-cart-panel-item`, input `item: CartItem`: card blanca redondeada con sombra (`$shadow-surface-rest`), thumbnail a la izquierda, a la derecha `category_name` en mayúsculas/bold/teal, título bold debajo, precio bold grande debajo, botón de tacho arriba a la derecha que llama a `cartService.removeFromCart(item.course)`. Sin selector de cupos ni texto de capacidad restante.
- `cart.component.html` renderiza `app-cart-panel-item` en vez de `app-cart-item-card` dentro del panel lateral. `cart-item-card.component` sigue existiendo sin cambios para su otro consumidor (`cart-checkout.component`, página `/payment/buy`).
- Sección de cupón colapsable: signal local `isDiscountOpen`, enlace teal "+ ¿Tenés un código de descuento?" que al clickearse muestra `<app-discount-code-input/>` (componente existente, sin cambios). Colapsado por defecto.
- Resumen: fila "Subtotal" — nuevo `computed` en `cart.component.ts` que suma `course.price * quantity` de todos los items (pre-descuento) — y fila "Total" en bold usando el `animatedTotal` ya existente (post-descuento).
- Botón "Ir a pagar" ancho completo, `$brand-color`, texto bold blanco, mismo `routerLink` a `payment/buy` que ya existe hoy.
- Texto "Pagás de forma segura con Mercado Pago" con ícono de candado, centrado debajo del botón, gris muted.
- Estado vacío existente (ícono SVG + "Tu carrito está vacío" + copy + CTA "Explorar cursos") se mantiene igual, sólo reestilado al nuevo chrome (fondo hueso en vez de blanco).
- Breakpoint `sm` hacia abajo: se mantiene el fallback existente de hoja inferior, ajustado a los nuevos colores/chrome (sin floating corners, ancho completo).

**Out of scope (para otra spec):**

- Tocar `cart-item-card.component` o `cart-checkout.component` — siguen funcionando tal cual, con su selector de cupos intacto.
- Selector de cupos (+/-) en el panel lateral. Decisión explícita: se saca del panel; reservar más de 1 cupo por curso sólo se puede hacer desde `/payment/buy`.
- Mover el trigger del carrito del FAB flotante a un header/navbar.
- La coreografía de animación escalonada (header/lista/acciones entrando en cascada) que tiene el popover actual — se simplifica a una transición única de deslizamiento/opacidad del panel completo, porque el layout full-height ya no tiene el morph FAB→caja que la justificaba.
- Cambios en `PaymentService.calculateTotal`, en el backend, o en el modelo `Cart`/`CartItem`.
- Compartir el estado `isCartOpen` entre las 3 instancias de `cart.component` (home/explore/buy-cart) — sigue siendo local a cada instancia, igual que hoy.

## Data model

No se agregan interfaces ni se cambia el modelo de `Cart`/`CartItem`. Único agregado: un `computed` de sólo lectura `subtotal` dentro de `CartComponent`, derivado de `cart().items` — no se persiste.

## Implementation plan

1. Crear `CartPanelItemComponent` standalone (`cart/components/cart-panel-item/`): input `item: CartItem`, template con thumbnail/category_name/título/precio/botón quitar, sin lógica de cupos. Verificación manual: renderiza aislado con datos de prueba.
2. Reescribir `cart.component.html`: header nuevo, lista usando `app-cart-panel-item`, bloque colapsable de cupón envolviendo `app-discount-code-input`, resumen con subtotal/total, botón de pago, nota de pago seguro, estado vacío reestilado.
3. Agregar el `computed` `subtotal` en `cart.component.ts` y conectarlo al template.
4. Reescribir `cart.component.scss`: panel full-height fijo al borde derecho sin `border-radius` exterior, header con borde inferior, cards de item con sombra/radio, botón de pago con `$brand-color`, ajuste del breakpoint `sm` a hoja inferior con el nuevo chrome.
5. Verificación manual en navegador: agregar cursos al carrito desde `/explore` o `/`, abrir el FAB, confirmar panel full-height a la derecha, items sin selector de cupos, cupón colapsado funcional, subtotal/total correctos, botón navega a `/payment/buy`, estado vacío correcto, y breakpoint mobile (<640px) cae a hoja inferior.

## Acceptance criteria

- [ ] Al abrir el carrito desde el FAB, el panel ocupa el 100% del alto del viewport, anclado al borde derecho, sin esquinas redondeadas en el contenedor exterior.
- [ ] El header muestra "Tu carrito" + "{n} cursos" + botón cuadrado con ✕ que cierra el panel.
- [ ] Cada curso se muestra con `CartPanelItemComponent`: thumbnail, `category_name` en mayúsculas, título, precio — sin selector de cupos ni texto de capacidad.
- [ ] El botón de tacho elimina el curso del carrito.
- [ ] El enlace "¿Tenés un código de descuento?" está colapsado por defecto y al clickearlo muestra `app-discount-code-input`.
- [ ] Se muestran filas "Subtotal" (suma sin descuento) y "Total" (con descuento aplicado, animado).
- [ ] El botón "Ir a pagar →" navega a `/payment/buy`.
- [ ] Con el carrito vacío se muestra el estado vacío existente, reestilado al nuevo chrome.
- [ ] Por debajo del breakpoint `sm`, el panel degrada a hoja inferior en vez de panel lateral full-height.
- [ ] `cart-item-card.component` y `cart-checkout.component` no cambian de comportamiento ni de estilo.

## Decisiones tomadas y descartadas

- **Sí:** mantener el FAB flotante como trigger. El mockup sólo muestra el panel ya abierto; no hay referencia visual de un trigger distinto y moverlo no fue pedido.
- **No:** selector de cupos en el panel lateral. Decisión explícita del usuario — se pierde la posibilidad de reservar más de 1 cupo desde ahí; queda sólo disponible en `/payment/buy`.
- **Sí:** crear `CartPanelItemComponent` nuevo en vez de modificar `cart-item-card`. `cart-item-card` tiene un segundo consumidor (`cart-checkout`, vía `.detailed-card`) que depende del selector de cupos y el texto de capacidad; tocarlo ahí rompería ese flujo.
- **Sí:** reusar `app-discount-code-input` tal cual, sólo envuelto en un toggle de visibilidad. Ya existe y funciona en `cart-checkout`; no hay necesidad de reescribirlo.
- **No:** rediseñar la coreografía de animación escalonada existente. Se simplifica porque el layout full-height no tiene el morph FAB-a-caja que la justificaba.

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| El panel full-height (`z-index` alto, `position: fixed`) puede superponerse con otros overlays fixed de la página (headers, modales) | Mantener el mismo `z-index: 100` que ya usa `.overlay`/`.bg-cart` hoy; no hay otro overlay fixed con z-index mayor detectado en `home-page`/`explore-page`/`buy-cart-page`. |
| `isCartOpen` sigue siendo local a cada instancia de `cart.component` (home/explore/buy-cart) | Ya es el comportamiento actual, no lo introduce esta spec; fuera de alcance resolverlo acá. |

## Qué **no** está en esta spec

- Selector de cupos en el panel lateral (se saca, ver Scope).
- Cambios en `cart-item-card.component` o `cart-checkout.component`.
- Mover el trigger del carrito fuera del FAB flotante.
- Estado compartido de `isCartOpen` entre instancias.
- Cambios en `PaymentService`, backend, o modelo `Cart`/`CartItem`.

Cada uno de estos, si se necesita, va en su propia spec.
