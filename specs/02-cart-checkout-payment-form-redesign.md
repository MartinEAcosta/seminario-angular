# SPEC 02 — Rediseño de cart-checkout y form-card-checkout (componentes hijos de buy-page)

> **Status:** Implementado
> **Depends on:** SPEC 01
> **Date:** 2026-09-02
> **Objective:** Adaptar visualmente `cart-checkout.component` y `form-card-checkout.component` al layout fluido de `buy-page` (spec 01), armonizando tokens de diseño y corrigiendo el layout roto que dejaban sus anchos fijos en `vw`/`%`, sin tocar lógica ni el motivo visual de "ticket".

## Scope

**In:**

- `src/app/cart/components/cart-checkout/cart-checkout.component.scss`:
  - Reemplazar `width: 50vw` / `height: 55vh` / `box-sizing: content-box` por un layout fluido (`width: 100%` del contenedor flex que le da `buy-page.scss` vía `app-cart-checkout { flex: 1 1 55%; }`).
  - Quitar `position: sticky` de `.container-shopping-header` y `.container-shopping-footer`, y las reglas `::-webkit-scrollbar*` (dejan de aplicar sin scroll interno propio).
  - Armonizar tokens (`border-radius`, `box-shadow`, colores) con los locales definidos en `buy-page.scss` (`v.$brand-color`, `v.$black-custom`, `v.$white-custom`, `v.$font-primary`), sin repetir el motivo literal de "ticket" (sin franja de acento ni separadores punteados).
  - Agregar `@media (max-width: 768px)`: `.detailed-card` pasa de fila (`.card` 60% + `.detailed-resume` 40%) a columna, ambos hijos a `width: 100%`.
- `src/app/payment/components/form-card-checkout/form-card-checkout.component.scss`:
  - Armonizar tokens (`border-radius`, `box-shadow`, colores) con `buy-page.scss`, sin cambiar estructura ni `id`s (el SDK de MercadoPago los usa para inyectar los campos de tarjeta).
  - Agregar `@media (max-width: 768px)`: `.container-payment` pasa de `width: 50%` a `width: 100%`, ajustar `margin` para mobile.
- Ambos `.component.ts` **no se modifican** — solo HTML/SCSS.
- Ambos `.component.html` solo se tocan si hace falta ajustar clases para el nuevo layout responsive (sin tocar bindings, `@for`, `input()`s).

**Out of scope (for future specs):**

- Aplicar el motivo literal de "ticket" (franja superior de acento, separadores punteados, tipografía tabular) a estos dos componentes — se limita a armonizar tokens (color/radio/sombra/espaciado).
- Arreglar `cart-checkout.component.spec.ts` / `form-card-checkout.component.spec.ts`.
- Cambios de lógica o funcionalidad de pago (integración MercadoPago, `CheckoutFormState`, `CartService`).
- Cambios a `variables.scss` global.
- Cambios adicionales a `buy-page.html` / `buy-page.scss` (ya cerrados en spec 01).
- En caso de que sea necesario utilizar skill frontend-design.

## Data model

Esta spec no introduce estructuras de datos nuevas. Reutiliza `cart` (`input.required<Cart>()`) y `amount` (`input.required<Number>()`) ya existentes, más `CartService` inyectado en `CartCheckoutComponent`.

## Implementation plan

1. En `cart-checkout.component.scss`, reemplazar el sizing fijo (`50vw`/`55vh`/`content-box`) por `width: 100%` fluido, quitar `position: sticky` de header/footer y las reglas de scrollbar custom. Armonizar `border-radius`/`box-shadow`/colores con los tokens locales de `buy-page.scss`. El sistema sigue funcional: cart-checkout se integra al `flex: 1 1 55%` que ya define `buy-page.scss`.
2. Agregar `@media (max-width: 768px)` en `cart-checkout.component.scss`: `.detailed-card` en columna, `.card` y `.detailed-resume` a `width: 100%`.
3. En `form-card-checkout.component.scss`, armonizar `border-radius`/`box-shadow`/colores con `buy-page.scss`, sin tocar ningún `id` ni la estructura del `<form>` (el SDK de MercadoPago sigue funcionando igual).
4. Agregar `@media (max-width: 768px)` en `form-card-checkout.component.scss`: `.container-payment` a `width: 100%`, `margin` ajustado para mobile.
5. QA visual manual en `/buy`: desktop (>768px) con carrito + resumen lado a lado y formulario de pago debajo; mobile (<768px) con los tres bloques apilados al 100% de ancho. Verificar consola sin errores y que los campos de MercadoPago (número de tarjeta, vencimiento, CVV) sigan renderizando y aceptando input.

## Acceptance criteria

- [ ] `cart-checkout` ya no usa `50vw`/`55vh`/`content-box`; ocupa el 100% del espacio que le asigna el `flex` de `buy-page.scss`.
- [ ] `cart-checkout` no tiene scroll interno propio ni header/footer `sticky`; la página completa scrollea normalmente con listas largas de ítems.
- [ ] En desktop (>768px), dentro de cada ítem del carrito, `.card` y `.detailed-resume` siguen lado a lado sin overflow.
- [ ] Por debajo de 768px, cada ítem del carrito apila `.card` sobre `.detailed-resume`, ambos al 100% de ancho, sin overflow horizontal.
- [ ] `form-card-checkout` usa `width: 50%` en desktop y `width: 100%` por debajo de 768px.
- [ ] Los `id`s de los campos de MercadoPago (`form-checkout__cardNumber`, `form-checkout__expirationDate`, `form-checkout__securityCode`, etc.) no cambian y el formulario sigue funcionando.
- [ ] Colores, radios y sombras de ambos componentes están tomados de los mismos tokens/variables que usa `buy-page.scss` (no hardcodeados nuevos sin relación).
- [ ] Ninguno de los dos componentes reproduce el motivo de "ticket" (franja de acento, separadores punteados, tipografía tabular) — eso queda exclusivo del resumen en `buy-page`.
- [ ] `cart-checkout.component.ts` y `form-card-checkout.component.ts` no cambian.
- [ ] La ruta `/buy` renderiza sin errores en consola con ítems en el carrito, tanto en desktop como en mobile.

## Decisions

- **Sí:** una sola spec para ambos componentes. Mismo objetivo (integrarse al layout de spec 01), mismo tipo de cambio (HTML/SCSS), misma pantalla.
- **No:** repetir el motivo literal de "ticket" en estos componentes. Se arma solo con armonía de tokens (color/radio/sombra) para no diluir la firma visual del resumen de compra.
- **Sí:** pasar `cart-checkout` de `vw`/`vh` fijos a layout fluido. Es requisito para integrarse al `flex: 1 1 55%` que ya define `buy-page.scss`; con los valores viejos el componente sigue midiendo contra el viewport en vez de contra su contenedor.
- **Sí:** quitar `sticky` y scroll interno de `cart-checkout`. Más simple y consistente con que `buy-page` ya no encierra al carrito en una caja de altura fija; el scroll de la página maneja listas largas.
- **Sí:** breakpoint `768px` en ambos componentes, igual que `buy-page` (spec 01). Mantiene el corte mobile/tablet consistente en toda la pantalla de compra.
- **Sí:** en `form-card-checkout`, solo tocar estilos, nunca estructura ni `id`s. El SDK de MercadoPago (`form-card-checkout.component.ts`) inyecta campos en esos `id`s exactos — cambiarlos rompe la integración.
- **No:** arreglar los `.spec.ts` de estos dos componentes en esta spec. Consistente con la decisión de spec 01.
- **No:** tocar `variables.scss` global ni volver a modificar `buy-page.html`/`buy-page.scss` (ya cerrado en spec 01).

## What is **not** in this spec

- Motivo literal de "ticket" (franja de acento, separadores punteados, tipografía tabular) en `cart-checkout` o `form-card-checkout`.
- Tests automatizados nuevos, ni el fix de `cart-checkout.component.spec.ts` / `form-card-checkout.component.spec.ts`.
- Cambios de lógica o funcionalidad de pago (MercadoPago, `CheckoutFormState`, `CartService`).
- Cambios a `variables.scss` global.
- Cambios adicionales a `buy-page.html` / `buy-page.scss`.

Cada uno de estos, si se decide encarar, va en su propia spec.
