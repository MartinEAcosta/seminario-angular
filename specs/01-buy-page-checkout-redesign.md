# SPEC 01 — Rediseño estético de la pantalla de compra (buy-page)

> **Status:** Aprobada
> **Depends on:** ninguna
> **Date:** 2026-09-02
> **Objective:** Rediseñar visualmente `buy-page` (resumen de compra tipo ticket + layout responsive) sin tocar lógica ni componentes hijos.

## Scope

**In:**

- Reestructurar `src/app/payment/pages/buy/buy-page.html` (agrupar carrito + resumen, mantener `app-form-card-checkout` debajo).
- Reescribir `src/app/payment/pages/buy/buy-page.scss`: tokens locales derivados de `v.$brand-color` / `v.$black-custom` / `v.$white-custom` (sombra, tinte de fondo), spacing, tipografía con `v.$font-primary`.
- Elemento distintivo (signature): el resumen de compra estilizado como "ticket/recibo" — franja superior de acento, separadores punteados entre ítems, tipografía tabular en precios, total destacado.
- Breakpoint `768px`: `container-content` pasa de `flex-direction: row` a `column`, ambos bloques a `width: 100%`.
- `buy-page.ts` no se modifica — solo HTML/SCSS.

**Out of scope (for future specs):**

- Rediseño de `cart-checkout.component` y `form-card-checkout.component`.
- Arreglar `buy-page.spec.ts` (hoy roto: importa `BuyPageComponent` pero la clase real es `BuyPage`).
- Mostrar `paymentMethodsResource` en el resumen (no usado hoy en el template — agregarlo sería funcionalidad nueva, no estética).
- Cambios a `variables.scss` global.
- Cambios de lógica o funcionalidad de pago.

## Data model

Esta spec no introduce estructuras de datos nuevas. Reutiliza `CartService.total()` y `shoppingList()` (computed sobre `cartService.cart()`) ya existentes en `buy-page.ts`.

## Implementation plan

1. En `buy-page.scss`, definir variables SCSS locales derivadas de los tokens de `variables.scss` (sombra, tinte claro de fondo tipo "papel", acento) y limpiar el layout base de `.container-content` a `flex` con `gap` en vez de anchos mágicos en `%`. El sistema sigue funcional y visualmente igual al original en este paso.
2. Ajustar `buy-page.html`: envolver el bloque de resumen en el contenedor que recibirá el estilo de ticket, sin tocar bindings ni lógica (`shoppingList()`, `cartService.total()`, `@for`).
3. Estilizar `.container-resume` como card: fondo, `border-radius`, sombra y franja superior de acento en `$brand-color`.
4. Estilizar `.detailed-resume` / `.item-reserved`: separador punteado entre ítems, `font-variant-numeric: tabular-nums` en los precios, fila de total con borde superior reforzado y texto destacado.
5. Reforzar la jerarquía tipográfica de `.title-resume` (tamaño y tracking).
6. Agregar `@media (max-width: 768px)`: `.container-content` en columna, `.container-resume` y el bloque de carrito a `width: 100%`, ajustar paddings del contenedor para mobile.

## Acceptance criteria

- [ ] En desktop (>768px), carrito y resumen se muestran lado a lado sin solaparse.
- [ ] El resumen tiene fondo tipo card con sombra visible y una franja de acento en `$brand-color` en el borde superior.
- [ ] Los ítems y el total del resumen están separados por líneas punteadas, con precios en tipografía tabular alineada.
- [ ] El total final está visualmente destacado (mayor peso/tamaño/color) respecto a los demás renglones.
- [ ] Por debajo de 768px, carrito, resumen y formulario de pago se apilan en columna al 100% de ancho, sin overflow horizontal.
- [ ] `buy-page.ts` y los componentes fuera de `src/app/payment/pages/buy` no cambian.
- [ ] La ruta `/buy` renderiza sin errores en consola con ítems en el carrito, tanto en desktop como en mobile.

## Decisions

- **Sí:** tokens derivados localmente en `buy-page.scss` en vez de tocar `variables.scss` global. Contiene el alcance al componente y no arriesga romper otras pantallas.
- **No:** rediseñar `cart-checkout` / `form-card-checkout` en esta spec. Se deja para una spec futura si se decide extender la coherencia visual a toda la pantalla.
- **Sí:** signature "ticket/recibo". Encaja con el momento de confirmar una compra y da personalidad sin desviarse del tono sobrio del resto de la app.
- **No:** mostrar `paymentMethodsResource` en el resumen. Agregaría funcionalidad no pedida, no solo estética.
- **Sí:** breakpoint `768px`. Estándar de la industria para el corte mobile/tablet.
- **No:** arreglar `buy-page.spec.ts` roto en esta spec. Está fuera del foco de una spec puramente estética.

## What is **not** in this spec

- Rediseño de `cart-checkout` / `form-card-checkout` (otra spec si hace falta).
- Tests automatizados nuevos, ni el fix del `buy-page.spec.ts` existente.
- Cambios a `variables.scss` global.
- Cambios de lógica o funcionalidad de pago.

Cada uno de estos, si se decide encarar, va en su propia spec.
