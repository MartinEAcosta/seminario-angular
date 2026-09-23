# SPEC 15 — División en pasos reales (rutas) del checkout: revisar carrito y pagar

> **Status:** Aprobado
> **Depends on:** SPEC 01, SPEC 02, SPEC 14
> **Date:** 2026-09-23
> **Objective:** Dividir `buy-page` en dos rutas hijas reales ("revisar carrito" y "pagar") con navegación efectiva entre ellas, en vez del step indicator puramente informativo de una sola pantalla que fijó la spec 14.

## Scope

**In:**

- `src/app/payment/payment.routes.ts`: la ruta `buy` pasa a tener rutas hijas:
  - `''` → `redirectTo: 'cart'`, `pathMatch: 'full'`.
  - `'cart'` → nuevo componente `BuyCartPage`.
  - `'pay'` → nuevo componente `BuyPayPage`, con `canMatch: [CartNotEmptyGuard]`.
- Nuevo guard funcional `src/app/payment/guards/cart-not-empty.guard.ts` (`CanMatchFn`, mismo patrón que `AuthenticatedGuard`): inyecta `CartService`, si `cart().items.size === 0` redirige a `/payment/buy/cart` y devuelve `false`.
- `src/app/payment/pages/buy/buy-page.ts/html/scss` se convierte en **shell**: layout tipo `wizard-layout` (mismo patrón que `form-course.component`) con `<app-checkout-steps>` a un lado y `<router-outlet>` al otro. Inyecta `CartService`, calcula `isEmpty` y se lo pasa a `checkout-steps` vía `[cartEmpty]`.
- Nuevo `src/app/payment/pages/buy-cart/buy-cart-page.ts/html/scss`: contiene el bloque `@if (!isEmpty())` con `<section class="cart-section">` (`app-cart-checkout`) + `<aside aria-label="Resumen de la compra">` (`app-purchase-summary`, con botón "Continuar" proyectado) y la rama `@else` de estado vacío (tal cual quedó implementado en spec 14, sin cambios de diseño).
- Nuevo `src/app/payment/pages/buy-pay/buy-pay-page.ts/html/scss`: `<aside aria-label="Resumen de la compra">` (`app-purchase-summary`, sin CTA) + link "Volver al carrito" (`routerLink="../cart"`) + `<app-form-card-checkout>`.
- Nuevo componente presentacional `src/app/payment/components/purchase-summary/` (`.ts`/`.html`/`.scss`): recibe `cart = input.required<Cart>()` y `total = input.required<number>()`. Renderiza el `.ticket` de resumen (título, `detailed-resume`, `item-reserved` por ítem, `ticket-total`) — es el mismo markup que hoy vive inline en `buy-page.html`, extraído tal cual. Expone `<ng-content>` al final del ticket para que cada página proyecte su propio CTA (botón "Continuar" en `buy-cart-page`, nada en `buy-pay-page`). Sin lógica de negocio ni inyección de servicios.
- `src/app/payment/components/checkout-steps/`: reemplaza el input `activeStep: 1 | 2` por `cartEmpty = input.required<boolean>()`. Los pasos pasan de `<div>`/`<span>` no interactivos a `<a routerLink>` reales:
  - Paso 1 ("Revisar carrito"): `[routerLink]="'cart'"`, `routerLinkActive="active"`, `[class.done]="!cartEmpty()"`.
  - Paso 2 ("Pagar"): `[routerLink]="cartEmpty() ? null : 'pay'"` (mismo patrón condicional que `form-course.component.html` con `courseId()`), `routerLinkActive="active"`, `[class.disabled]="cartEmpty()"`.
  - SCSS vuelve al comportamiento responsive original de `form-course` (columna vertical + `position: sticky` en desktop, fila horizontal en mobile `≤48rem`) — revierte el "siempre vertical" que había fijado spec 14, ya que ahora el stepper convive al lado del contenido como sidebar de un layout de dos columnas (igual que en crear/editar curso).
  - Sigue sin inyectar servicios: la única fuente de si "Pagar" está habilitado es el input `cartEmpty`.

**Out of scope (queda para otra spec si se decide encarar):**

- Editar cantidades o eliminar ítems del carrito desde el paso "Pagar" — esa interacción sigue existiendo solo en `cart-checkout`, dentro del paso "Revisar carrito".
- Animaciones o transiciones entre pasos (fade, slide, etc.).
- Persistir el paso actual más allá de la URL — la ruta ya es la fuente de verdad, no hace falta estado adicional.
- Guard de autenticación adicional — ya cubierto por el `AuthenticatedGuard` existente a nivel de la ruta `buy` (padre de `cart`/`pay`).
- Reescribir estructura o `id`s de `form-card-checkout` (bloqueado desde SPEC 02 por el SDK de MercadoPago).
- Rediseño visual del estado vacío o del propio `.ticket` de resumen — se reutilizan tal cual quedaron en spec 14.
- Cambios a `variables.scss` global.
- Arreglar `buy-page.spec.ts` (roto desde antes de SPEC 01).

## Data model

No se introducen modelos de dominio nuevos. Solo estado de UI local y contratos de componentes:

- `BuyPage.isEmpty: Signal<boolean>` — computed sobre `cartService.cart().items.size === 0` (se mueve el cómputo desde el antiguo `buy-page.ts` monolítico; ahora vive en el shell y se pasa hacia abajo).
- `CheckoutStepsComponent.cartEmpty: InputSignal<boolean>` — reemplaza al anterior `activeStep: InputSignal<1|2>`. El paso activo/hecho ya no se infiere de un número sino de la ruta actual (`routerLinkActive`) más este booleano para el estado `disabled` del paso 2.
- `PurchaseSummaryComponent.cart: InputSignal<Cart>` y `total: InputSignal<number>` — nuevo componente presentacional, sin estado propio.
- `CartNotEmptyGuard: CanMatchFn` — sin estado propio, lee `CartService.cart()` en el momento del match.

## Implementation plan

1. Crear el guard `CartNotEmptyGuard` en `payment/guards/cart-not-empty.guard.ts`, análogo a `AuthenticatedGuard`: inyecta `CartService` y `Router`, si `cart().items.size === 0` navega a `/payment/buy/cart` y retorna `false`; si no, retorna `true`. Todavía no está referenciado en ninguna ruta — sistema sigue funcionando igual.
2. Extraer `PurchaseSummaryComponent` (`payment/components/purchase-summary/`) copiando el bloque `.ticket` de resumen tal cual existe hoy en `buy-page.html` (título, `detailed-resume`, `@for` de `item-reserved`, `ticket-total`), parametrizado por `cart`/`total` inputs, con `<ng-content>` al final. Todavía no referenciado en ningún lado.
3. Actualizar `checkout-steps.component.ts/html/scss`: cambiar `activeStep` por `cartEmpty` input; convertir los pasos en `<a routerLink>` con el patrón condicional descripto arriba; revertir el SCSS al layout responsive original de `form-course` (columna + sticky en desktop, fila en mobile). Como todavía no está dentro de un contexto con rutas `cart`/`pay`, sigue sin usarse — no rompe nada existente hasta el paso 5.
4. Actualizar `payment.routes.ts`: agregar `children` a la ruta `buy` (`'' → redirect a 'cart'`, `'cart' → BuyCartPage`, `'pay' → BuyPayPage` con `canMatch: [CartNotEmptyGuard]`). `BuyCartPage`/`BuyPayPage` todavía no existen — este paso se hace junto con los pasos 6 y 7 para no dejar rutas rotas a mitad de camino.
5. Convertir `buy-page.ts/html/scss` en shell: layout `wizard-layout` (stepper + `<router-outlet>`), inyecta `CartService`, calcula `isEmpty`, pasa `[cartEmpty]="isEmpty()"` a `<app-checkout-steps>`. Elimina del shell el bloque `@if/@else` de contenido (se traslada a los pasos 6 y 7).
6. Crear `BuyCartPage`: mueve el `@if (!isEmpty())` con `<section class="cart-section">` + `<aside aria-label="Resumen de la compra">` conteniendo `<app-purchase-summary [cart]="shoppingList()" [total]="cartService.total()">` con el botón "Continuar" (`routerLink="../pay"`) proyectado dentro; y la rama `@else` de estado vacío de spec 14, sin cambios visuales.
7. Crear `BuyPayPage`: `<aside aria-label="Resumen de la compra">` con `<app-purchase-summary>` (sin CTA proyectado) + link "Volver al carrito" (`routerLink="../cart"`) arriba del form + `<app-form-card-checkout [amount]="cartService.total()">` sin cambios.
8. QA manual:
   - `/payment/buy` redirige a `/payment/buy/cart`.
   - Carrito vacío: estado vacío visible en `/cart`, paso "Pagar" del stepper sin `routerLink` (no navega al click, clase `disabled`), acceso directo por URL a `/payment/buy/pay` redirige a `/payment/buy/cart`.
   - Carrito con ítems: botón "Continuar" navega a `/pay`; en `/pay` se ve resumen + botón "Volver" (navega a `/cart`) + form de tarjeta; stepper clickeable en ambos sentidos.
   - Responsive: stepper en columna (desktop) y fila (mobile) en ambas rutas, sin errores de consola.

## Acceptance criteria

- [ ] `/payment/buy` redirige a `/payment/buy/cart`.
- [ ] Con carrito vacío, `/payment/buy/cart` muestra el estado vacío de spec 14 (sin botón "Continuar" renderizado, ya que no existe dentro de la rama `@else`).
- [ ] Con carrito vacío, el paso "Pagar" del stepper no tiene `routerLink` activo (no navega al hacer click) y tiene clase `disabled`.
- [ ] Acceso directo por URL a `/payment/buy/pay` con carrito vacío redirige a `/payment/buy/cart` (vía `CartNotEmptyGuard`).
- [ ] Con al menos un ítem en el carrito, el botón "Continuar" del resumen navega a `/payment/buy/pay` sin recarga completa de página.
- [ ] En `/payment/buy/pay`: se ve el mismo componente de resumen (`app-purchase-summary`) reutilizado, un botón/link "Volver al carrito" que navega a `/payment/buy/cart`, y `app-form-card-checkout` sin cambios (ids de MercadoPago intactos).
- [ ] Con ítems en el carrito, el stepper permite navegar libremente entre "Revisar carrito" y "Pagar" haciendo click en cualquiera de los dos pasos.
- [ ] El stepper usa el layout responsive original de `form-course`: columna vertical (con `position: sticky`) en desktop, fila horizontal en mobile.
- [ ] `purchase-summary` es un componente presentacional sin inyección de servicios, recibe `cart`/`total` como inputs.
- [ ] `checkout-steps` sigue sin inyectar servicios; recibe `cartEmpty` como único input booleano.
- [ ] `form-card-checkout.component.ts/html` no cambia.
- [ ] Ambas rutas (`cart`/`pay`) mantienen la semántica de spec 14: único `<h1>` en la página (el de `app-page-title`, en el shell), `<section>`/`<aside aria-label="Resumen de la compra">`.
- [ ] Sin errores de consola en ningún estado (vacío/con ítems) ni ruta (`cart`/`pay`), en desktop y mobile.

## Decisions

- **Sí:** navegación real vía rutas hijas (`/payment/buy/cart`, `/payment/buy/pay`) en vez de estado local. Permite deep-link directo a cada paso y reutiliza el guard pattern ya establecido (`AuthenticatedGuard`) en vez de inventar un mecanismo de estado nuevo.
- **Sí:** esto reabre y reemplaza la decisión de spec 14 "sin navegación real entre pasos, step indicator informativo" — spec 14 la dejó fuera explícitamente por ser sobre-ingeniería para una sola pantalla; ahora el usuario pidió el split real, así que esta spec la reemplaza.
- **Sí:** guard `CartNotEmptyGuard` en la ruta `pay` — reabre y reemplaza la decisión de spec 14 "sin guard de ruta para carrito vacío", que aplicaba cuando todo era una sola pantalla sin rutas propias.
- **Sí:** el stepper vuelve al comportamiento responsive original de `form-course` (columna sticky en desktop, fila en mobile) — reemplaza el "siempre vertical" fijado en spec 14, porque ahora el stepper sí convive como sidebar de un layout de dos columnas (stepper + contenido), el mismo contexto para el que se diseñó el patrón original.
- **Sí:** `checkout-steps` se mantiene presentacional (recibe `cartEmpty` como input) en vez de inyectar `CartService` directamente — mantiene la decisión de spec 14 de "sin lógica ni dependencias de servicios", solo cambia qué dato recibe por input.
- **Sí:** avance mediante botón "Continuar" (dentro del resumen, cerca del total) **y** stepper clickeable — ambos mecanismos conviven; el botón es el flujo principal guiado, el stepper permite saltar libremente una vez que hay ítems en el carrito.
- **Sí:** botón "Volver al carrito" en el paso "Pagar", además del stepper clickeable — refuerza la salida sin depender solo del stepper.
- **Sí:** `PurchaseSummaryComponent` extraído y reutilizado en ambos pasos (mismo markup completo, no una versión reducida) — evita duplicar el `.ticket` de resumen y mantiene consistencia visual entre pasos.
- **Sí:** `PurchaseSummaryComponent` expone `<ng-content>` para el CTA en vez de aceptar un input tipo `showCta`/`ctaLabel` — mantiene el componente ignorante de la navegación (no sabe a dónde va el botón ni cuándo mostrarlo), cada página decide qué proyectar.
- **Sí:** `buy-page.ts/html/scss` pasa a ser un shell sin contenido propio de paso — sigue el mismo patrón ya usado en `form-course.component` (wizard-layout con stepper + `router-outlet`), consistencia entre los dos flujos "wizard" de la app.
- **No:** editar cantidades/eliminar ítems desde "Pagar" — se mantiene esa interacción únicamente en `cart-checkout`, dentro de "Revisar carrito"; agregarla en el paso de pago es un cambio de alcance mayor, no pedido.
- **No:** animaciones/transiciones entre pasos — no se pidió, agregarlas ahora es alcance extra.
- **No:** guard de autenticación adicional en `cart`/`pay` — ya cubierto por `AuthenticatedGuard` en la ruta padre `buy`.

## What is **not** in this spec

- Edición de cantidades o eliminación de ítems desde el paso "Pagar".
- Animaciones o transiciones entre pasos.
- Persistencia del paso actual más allá de la URL.
- Guard de autenticación adicional (ya cubierto a nivel de `buy`).
- Reescritura estructural de `form-card-checkout` (ids de MercadoPago).
- Rediseño visual del estado vacío o del `.ticket` de resumen.
- Cambios a `variables.scss` global.
- Fix de `buy-page.spec.ts`.

Cada uno de estos, si se decide encarar, va en su propia spec.