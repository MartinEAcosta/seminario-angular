# SPEC 14 — Reordenamiento semántico, estado vacío y step indicator en buy-page

> **Status:** Aprobado
> **Depends on:** SPEC 01, SPEC 02
> **Date:** 2026-09-23
> **Objective:** Dar a `buy-page` estructura HTML semántica, un indicador de progreso de checkout de 2 pasos, y estados vacíos consistentes (carrito y resumen) cuando el usuario no tiene ítems seleccionados.

## Scope

**In:**

- `src/app/payment/pages/buy/buy-page.ts`: agregar `isEmpty = computed(() => this.shoppingList().items.size === 0)`.
- `src/app/payment/pages/buy/buy-page.html`:
  - Insertar `<app-checkout-steps [activeStep]="isEmpty() ? 1 : 2" />` debajo de `app-page-title`.
  - Envolver el bloque `app-cart-checkout` + `.container-resume` (ticket de resumen) y `app-form-card-checkout` en `@if (!isEmpty())`.
  - Agregar rama `@else` con estado vacío: card reutilizando el motivo `.ticket`, mensaje "Tu carrito está vacío", texto secundario, y CTA (`routerLink="/explore"`) tipo "Ver cursos".
  - Tags semánticos: el contenedor del carrito pasa a `<section>`, el contenedor del resumen pasa a `<aside aria-label="Resumen de la compra">`.
- `src/app/payment/pages/buy/buy-page.scss`: estilos del bloque de estado vacío (reutilizando tokens `$ticket-*` ya existentes) y spacing para `app-checkout-steps`.
- Nuevo componente presentacional `src/app/payment/components/checkout-steps/` (`.ts`/`.html`/`.scss`): recibe `activeStep = input.required<1 | 2>()`, renderiza "Revisar carrito" y "Pagar" con estado activo/completado. Sin lógica ni dependencias de servicios. Visualmente reutiliza el lenguaje del `stepper` ya existente en `form-course.component` (`src/app/course/components/form-course/`) usado en crear/editar curso: número grande (`01`/`02`), título en mayúsculas pequeño, barra de acento a la izquierda de cada paso en `v.$brand-color`, estados `.active`/`.done`/`.disabled` con los mismos tratamientos de color/opacidad. A diferencia del original: siempre en columna vertical (en todo breakpoint, sin swap a fila en mobile — a diferencia del original que sí cambia por breakpoint), y sin `routerLink` — son `<span>`/`<div>` no interactivos, ya que no hay navegación real entre pasos (decisión ya cerrada: informativo, no clickeable).
- `src/app/cart/components/cart-checkout/cart-checkout.component.html`: cambiar `<h1>Carrito de compras</h1>` a `<h2>` (jerarquía semántica — único `<h1>` de la página es el de `app-page-title`).

**Out of scope (queda para otra spec si se decide encarar):**

- Navegación real entre pasos o separar el flujo en rutas distintas — sigue siendo una sola pantalla; el step indicator es informativo, no interactivo.
- Guard de ruta que redirija fuera de `/buy` si el carrito está vacío.
- Reescribir estructura o `id`s de `form-card-checkout` (bloqueado desde SPEC 02 por el SDK de MercadoPago).
- Reescribir `item-reserved` / líneas de precio a `<dl>/<dt>/<dd>`.
- Arreglar `buy-page.spec.ts` (roto desde antes de SPEC 01).
- Cambios a `variables.scss` global.
- Invertir el orden visual carrito/resumen (se mantiene: carrito izquierda, resumen derecha en desktop; apilado en mobile).

## Data model

No se introducen modelos de dominio nuevos. Solo estado de UI local:

- `BuyPage.isEmpty: Signal<boolean>` — computed sobre `shoppingList().items.size === 0`.
- `CheckoutStepsComponent.activeStep: InputSignal<1 | 2>` — `1` cuando `isEmpty()` es `true` (carrito vacío, invita a agregar ítems, paso 2 queda `.disabled`), `2` cuando hay ítems (paso 1 pasa a `.done`, paso 2 queda `.active`, listo para pagar).

## Implementation plan

1. Agregar `isEmpty` computed a `buy-page.ts`. No se toca el template todavía — sistema sigue funcionando igual.
2. Crear `checkout-steps` component standalone y presentacional, con `activeStep` como único input. Renderiza los dos pasos ("Revisar carrito" / "Pagar") como `<span>`/`<div>` no interactivos, con número (`01`/`02`) y clase `.active` / `.done` / `.disabled` según `activeStep`. Todavía no está referenciado en ningún lado.
3. Importar y ubicar `<app-checkout-steps>` en `buy-page.html`, debajo de `app-page-title`, pasándole `[activeStep]="isEmpty() ? 1 : 2"`. Estilizar en su propio `.scss` reutilizando el mismo lenguaje visual del `.stepper` de `form-course.component.scss` (número grande, título uppercase pequeño, barra de acento izquierda en `v.$brand-color`, mismos tratamientos de color para `.active`/`.done`/`.disabled`), pero siempre en columna vertical (sin el swap columna/fila por breakpoint del original, en todo tamaño de pantalla).
4. Envolver en `buy-page.html` el bloque existente (`app-cart-checkout` + `.container-resume` + `app-form-card-checkout`) en `@if (!isEmpty())`. Sistema sigue funcional para carritos con ítems, sin cambios visuales respecto a specs 01/02.
5. Agregar rama `@else` con el estado vacío: reutilizar `.ticket` (misma card blanca con sombra y franja de acento) conteniendo mensaje principal "Tu carrito está vacío", texto secundario breve, y botón/link CTA a `/explore`. Estilos nuevos en `buy-page.scss` reutilizando tokens `$ticket-*`.
6. Aplicar tags semánticos: contenedor de `app-cart-checkout` a `<section>`, `.container-resume` a `<aside aria-label="Resumen de la compra">`.
7. En `cart-checkout.component.html`, cambiar `<h1>Carrito de compras</h1>` a `<h2>`.
8. QA manual en `/buy`:
   - Carrito vacío (desktop y mobile): step indicator marca paso 1 activo, se ve solo la card de estado vacío con CTA, no se renderizan `cart-checkout`/resumen/`form-card-checkout`, botón "Ver cursos" navega a `/explore`.
   - Carrito con ítems (desktop y mobile): step indicator marca paso 2 activo, layout idéntico al de specs 01/02, sin errores de consola.

## Acceptance criteria

- [ ] Con carrito vacío, `/buy` muestra únicamente: page-title, step indicator (paso 1 activo), y la card de estado vacío con mensaje + CTA a `/explore`.
- [ ] Con carrito vacío, `app-cart-checkout`, `.container-resume` y `app-form-card-checkout` no están en el DOM (no solo ocultos con CSS).
- [ ] Con carrito vacío, el discount-code-input no es visible (queda oculto al no renderizarse `cart-checkout`).
- [ ] Con al menos un ítem en el carrito, el layout es idéntico al definido en specs 01/02 (sin regresiones visuales), y el step indicator marca el paso 2 como activo.
- [ ] El botón/link CTA del estado vacío navega a `/explore` sin recarga completa de página (usa `routerLink`).
- [ ] `checkout-steps` es un componente standalone sin inyección de servicios, recibe `activeStep` como único input y no tiene lógica de negocio.
- [ ] La página tiene un único `<h1>` (el de `app-page-title`); "Carrito de compras" es `<h2>`.
- [ ] El contenedor de carrito usa `<section>` y el de resumen usa `<aside aria-label="Resumen de la compra">`.
- [ ] `form-card-checkout.component.ts/html` no cambia (ids de MercadoPago intactos).
- [ ] La ruta `/buy` renderiza sin errores de consola en ambos estados (vacío / con ítems), en desktop y mobile.

## Decisions

- **Sí:** `buy-page` controla toda la lógica de estado vacío vía un único `isEmpty` computed; los componentes hijos (`cart-checkout`, `form-card-checkout`) no reciben lógica de vacío propia. Menos duplicación, un solo punto de verdad.
- **Sí:** se toca `buy-page.ts` (specs 01/02 lo habían dejado afuera). Es imprescindible para condicionar el template de forma limpia con `@if`/`@else` en vez de checks inline repetidos.
- **Sí:** ocultar `form-card-checkout` por completo con carrito vacío. No tiene sentido mostrar un formulario de pago para cobrar $0.
- **Sí:** ocultar el cupón de descuento junto con el resto — es consecuencia de que `cart-checkout` completo no se renderiza, no requiere lógica adicional.
- **Sí:** CTA a `/explore` (ruta existente confirmada en `app.routes.ts`).
- **Sí:** reutilizar el motivo `.ticket` (card blanca, sombra, franja de acento) para el estado vacío, en vez de un estado vacío sin estilo. Consistencia visual con el resto de la pantalla ya cerrada en specs 01/02.
- **Sí:** step indicator de 2 pasos con estado activo dinámico derivado de `isEmpty()`. Aunque es una sola pantalla sin navegación real entre pasos, ubica al usuario mentalmente en el flujo (patrón estándar de checkout e-commerce).
- **Sí:** step indicator como componente nuevo y separado (`checkout-steps`), puramente presentacional. Mantiene `buy-page.html` legible y es reutilizable si en el futuro se necesita en otra pantalla de pago.
- **Sí:** reutilizar el lenguaje visual del `stepper` de `form-course.component` (crear/editar curso) — número grande + título uppercase + barra de acento lateral en `v.$brand-color`, estados `.active`/`.done`/`.disabled`. Da consistencia entre los dos flujos "wizard" de la app (crear curso / comprar) en vez de inventar un patrón visual nuevo. Difiere en layout (siempre columna vertical en todo breakpoint, sin `routerLink`) porque el contexto de uso es distinto: no es sidebar de un layout de dos columnas ni hay rutas por paso.
- **Sí:** step indicator sigue visible con carrito vacío (marca paso 1 activo) — ayuda a entender en qué punto del flujo está el usuario.
- **Sí:** se mantiene el orden visual actual (carrito izquierda, resumen derecha en desktop) — patrón estándar de checkout (ítems editables primero, resumen/pago después); no hay razón funcional para invertirlo.
- **No:** navegación real entre pasos o split en rutas — sobre-ingeniería para una sola pantalla; se deja para una spec futura si el flujo de checkout crece en complejidad.
- **No:** guard de ruta para carrito vacío en `/buy` — el estado vacío in-page ya resuelve la UX sin necesitar redirect.
- **No:** reescribir `form-card-checkout` a nivel estructura/ids — bloqueado por integración con MercadoPago (spec 02).
- **No:** arreglar `buy-page.spec.ts` en esta spec — fuera de foco, consistente con decisión de specs 01/02.

## What is **not** in this spec

- Navegación real / rutas separadas para los pasos del checkout.
- Guard de ruta para `/buy` con carrito vacío.
- Reescritura estructural de `form-card-checkout` (ids de MercadoPago).
- Semántica `<dl>/<dt>/<dd>` para líneas de precio.
- Fix de `buy-page.spec.ts`.
- Cambios a `variables.scss` global.
- Inversión del orden visual carrito/resumen.

Cada uno de estos, si se decide encarar, va en su propia spec.