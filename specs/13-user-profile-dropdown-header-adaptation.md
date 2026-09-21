# SPEC 13 — Adaptar el trigger del user-profile-dropdown al header liquid glass

> **Status:** Aprobado
> **Depends on:** SPEC 12 (header liquid glass + link a /about) — asume que `header.component.scss` ya define las clases `header-transparent`/`header-glass` y la custom property `--header-text`.
> **Date:** 2026-09-21
> **Objective:** Hacer que el ícono fallback del avatar y el ring de hover/active del trigger de `user-profile-dropdown` cambien de color según el estado del header (blanco en transparente, teal en glass), igual que el resto del nav, y corregir el espaciado del trigger dentro de `.container-nav-anchors` para que sea consistente con el margen de los demás links.

## Por qué existe esta spec

SPEC 12 le dio al `dropdown-wrapper` (el panel desplegable) un tratamiento glass coherente con el nuevo header, pero dejó explícitamente sin tocar el trigger (`.profile-trigger`) "porque el dropdown es un overlay propio, no hereda el color de texto del header". En la práctica esto dejó dos inconsistencias visuales:

- El ícono SVG de fallback (`assets/user-profile.svg`, sin foto de perfil) tiene color teal fijo (`fill="#00788c"`). En rutas con hero oscuro y el header en modo transparente (texto blanco), ese ícono queda teal sobre fondo oscuro mientras el resto del nav (logo, links, search-icon) es blanco — no sigue el mismo lenguaje de adaptación.
- El ring de hover/active del trigger (`box-shadow` alrededor del avatar) usa siempre `rgba(v.$brand-color, 0.45)` (teal), sin adaptarse al modo transparente.
- El trigger vive dentro de `.container-nav-anchors` con `margin-left: 1rem` fijo en su propio componente, mientras los `<a>` del nav usan `margin: 0 10px 0 10px` — la separación entre el último link y el avatar no guarda la misma proporción que entre los demás links.

## Scope

**In:**

- `header.component.scss`: agregar dos custom properties nuevas, definidas junto a `--header-text` dentro de `header.header-transparent` y `header.header-glass`:
  - `--header-icon-filter`: `brightness(0) invert(1)` en transparente, `none` en glass — para invertir a blanco el ícono SVG de fallback del avatar.
  - `--header-ring-color`: `rgba(255, 255, 255, 0.45)` en transparente, `rgba(v.$brand-color, 0.45)` en glass — color del ring de hover/active del trigger.
  - Estas custom properties se declaran en el header y se heredan de forma normal por el árbol DOM (herencia estándar de CSS custom properties, no depende de que `user-profile-dropdown` sea otro componente Angular) hasta `app-user-profile-dropdown`, que vive dentro de `<nav>` dentro de `<header>`.
- `user-profile-dropdown.component.html`: agregar una clase distintiva (`fallback-icon`) solo al `<img>` del ícono de fallback (rama `@else`, sin `avatar_url`), para poder aplicarle el filtro sin afectar la foto real del usuario cuando sí hay `avatar_url`.
- `user-profile-dropdown.component.scss`:
  - `.fallback-icon { filter: var(--header-icon-filter, none); }` con su propia `transition` de `filter` (coherente con las transiciones de 0.9s del resto del header).
  - `.profile-trigger:hover, .profile-trigger.active` pasa de `box-shadow: 0 0 0 2px rgba(v.$brand-color, 0.45)` a `box-shadow: 0 0 0 2px var(--header-ring-color, rgba(v.$brand-color, 0.45))`.
  - `.container-user-profile` cambia `margin-left: 1rem` por `margin-left: 10px`, igualando el `margin` horizontal de los `<a>` del nav (`nav a { margin: 0px 10px 0px 10px; }` en `header.component.scss`).

**Sin cambios funcionales:**

- `user-profile-dropdown.component.ts` — sin cambios de lógica, sigue igual (`open`, `onClickProfile`, `onCloseDropdown`, suscripción a `NavigationEnd`).
- `dropdown-wrapper`, `dropdown-inner`, `dropdown-item` y el overlay — su estilo glass, posición (`top: calc(100% + 0.75rem)`, `right: 0`) y z-index quedan igual que en SPEC 12; no se tocan.
- La imagen real del usuario (`userState.user()?.avatar_url`) no recibe ningún filtro ni borde adicional — solo el ring adaptado por color según el estado del header.
- `header.component.html`/`.ts` — sin cambios; solo se agregan dos declaraciones de custom property dentro de las reglas SCSS ya existentes de `header.header-transparent`/`header.header-glass`.
- `user-profile-dropdown.component.spec.ts` (si solo verifica `should create`, sigue pasando sin cambios).

**Out of scope (para futuras specs):**

- Posición, tamaño o z-index del `dropdown-wrapper` respecto al nuevo header pill (`border-radius: 40px`, `top: 16px`, `overlaysDarkHero`) — se confirmó que hoy no hay problema visual ahí, queda fuera.
- Cualquier borde/contorno adicional sobre la foto real del usuario en modo transparente — decisión explícita del usuario de no tocarla, solo el ring.
- Extraer el trigger o el dropdown a un componente de diseño compartido.
- Cambios a `variables.scss` global — las nuevas custom properties quedan definidas localmente en `header.component.scss`, mismo patrón que `--header-text` de SPEC 12.
- Tests automatizados nuevos (se corre la suite existente como parte de la verificación).

## Data model

Esta spec no introduce estructuras de datos de negocio, estado nuevo ni signals. Únicamente agrega dos CSS custom properties, calculadas en SCSS y consumidas vía `var()`:

```scss
// src/app/shared/components/layout/header/header.component.scss

header.header-transparent{
    --header-text: #fff;
    --header-icon-filter: brightness(0) invert(1);
    --header-ring-color: rgba(255, 255, 255, 0.45);
    // ...resto de la regla ya existente sin cambios
}

header.header-glass{
    --header-text: #{v.$brand-color};
    --header-icon-filter: none;
    --header-ring-color: #{rgba(v.$brand-color, 0.45)};
    // ...resto de la regla ya existente sin cambios
}
```

```scss
// src/app/user/components/user-profile-dropdown/user-profile-dropdown.component.scss

.profile-trigger {
    // ...reglas existentes sin cambios
    &:hover,
    &.active {
        box-shadow: 0 0 0 2px var(--header-ring-color, rgba(v.$brand-color, 0.45));
    }
}

.fallback-icon {
    filter: var(--header-icon-filter, none);
    transition: filter 0.9s ease;
}
```

```html
<!-- src/app/user/components/user-profile-dropdown/user-profile-dropdown.component.html -->
@if( userState.user()?.avatar_url ) {
    <img [src]="userState.user()?.avatar_url" alt="User icon profile" class="user-profile-img">
} @else {
    <img src="assets/user-profile.svg" alt="User icon profile" class="user-profile-img fallback-icon">
}
```

## Implementation plan

1. `header.component.scss`: agregar `--header-icon-filter` y `--header-ring-color` dentro de las reglas `header.header-transparent` y `header.header-glass` ya existentes (junto a `--header-text`). Verificación: compila, sin efecto visible todavía (nada las consume aún).
2. `user-profile-dropdown.component.html`: agregar la clase `fallback-icon` al `<img>` de la rama `@else` (sin tocar la rama `@if` con `avatar_url`). Verificación: compila, sin efecto visible todavía (la clase existe pero el SCSS no la usa aún).
3. `user-profile-dropdown.component.scss`: agregar la regla `.fallback-icon` con `filter: var(--header-icon-filter, none)` y su `transition`, y actualizar `.profile-trigger:hover`/`.active` para usar `var(--header-ring-color, ...)`. Cambiar `.container-user-profile { margin-left: 1rem }` a `margin-left: 10px`. Verificación: compila.
4. QA manual: `ng build` sin errores. En `/` o `/about`, logueado, con la página arriba del todo (header transparente): el ícono de fallback del avatar (sin `avatar_url`) se ve blanco, y al hacer hover/click sobre el trigger el ring es blanco. Al scrollear pasado el umbral (header glass): el ícono vuelve a teal y el ring vuelve a teal, con transición suave, no un salto brusco. En cualquier otra ruta (`/explore`, `/enrollment`, etc., header siempre glass): ícono y ring siempre teal. Con un usuario que sí tiene `avatar_url` (foto real): la foto no cambia de color en ningún estado, solo el ring del hover/active. La separación entre el último link del nav ("Conviértete en profesor" o el que corresponda) y el avatar se ve pareja con la separación entre los demás links entre sí. El dropdown sigue abriendo/cerrando y posicionándose igual que antes. Sin errores de consola.

## Acceptance criteria

- [ ] En modo header transparente (rutas `/` y `/about`, sin scrollear), el ícono de fallback del avatar (sin foto de perfil) se muestra blanco.
- [ ] En modo header glass (cualquier otra ruta, o `/`/`/about` tras pasar el umbral de scroll), el ícono de fallback del avatar se muestra teal (`v.$brand-color`), como hoy.
- [ ] El cambio de color del ícono de fallback tiene transición suave al cruzar el umbral de scroll, no un salto brusco.
- [ ] El ring de hover/active del trigger es blanco en modo transparente y teal en modo glass.
- [ ] Cuando el usuario tiene `avatar_url` (foto real), la imagen no recibe ningún filtro de color en ningún estado del header — solo el ring cambia de color.
- [ ] La separación horizontal entre el trigger y el link anterior del nav es consistente (10px) con la separación entre los demás links del nav entre sí.
- [ ] El `dropdown-wrapper` (panel desplegable) sigue abriendo/cerrando, posicionándose y viéndose exactamente igual que antes de esta spec (sin cambios de posición, tamaño o z-index).
- [ ] `user-profile-dropdown.component.spec.ts` sigue pasando sin modificaciones (si solo prueba `should create`).
- [ ] `ng build` compila sin errores y no hay errores de consola en desktop.

## Decisions

- **Sí:** el ícono de fallback y el ring del trigger se adaptan al estado del header (blanco/teal) usando las mismas custom properties (`--header-text`-style) que ya introdujo SPEC 12, en vez de duplicar la lógica de `isTransparentTop()` dentro de `user-profile-dropdown.component.ts` — decisión explícita del usuario, mantiene el dropdown como componente "tonto" en cuanto a estado del header, solo consume CSS.
- **Sí:** dos custom properties nuevas y puntuales (`--header-icon-filter`, `--header-ring-color`) en vez de reusar `--header-text` directamente para el ring — `--header-text` es un color sólido sin alpha, y el ring necesita transparencia (`rgba(..., 0.45)`); usar una property dedicada evita tener que envolver `--header-text` en `color-mix()`/manipulación adicional.
- **Sí:** se distingue el `<img>` de fallback del `<img>` de foto real con una clase nueva (`fallback-icon`) en vez de aplicar el filtro a `.user-profile-img` en general — necesario para que la foto real del usuario nunca reciba el filtro de inversión de color, solo el ícono SVG genérico.
- **Sí:** ajustar `.container-user-profile` de `margin-left: 1rem` (16px) a `margin-left: 10px`, igualando el `margin` de los `<a>` del nav — decisión explícita del usuario tras señalar la separación despareja.
- **No:** tocar posición/z-index/tamaño del `dropdown-wrapper` — confirmado que no hay problema visual ahí, se deja tal cual quedó en SPEC 12.
- **No:** agregar borde/contorno adicional sobre la foto real del usuario en modo transparente — decisión explícita del usuario, la foto se deja tal cual, solo el ring da contraste.
- **No:** tocar `variables.scss` global — las nuevas custom properties quedan locales a `header.component.scss`, mismo patrón que SPEC 12.

## Identified risks

| Riesgo | Mitigación |
| --- | --- |
| Las custom properties CSS dependen de herencia normal del DOM; si en el futuro `app-user-profile-dropdown` se mueve fuera del árbol de `<header>` (ej. se renderiza en un overlay/portal separado), `--header-icon-filter`/`--header-ring-color` dejarían de resolverse y caerían al valor por defecto del `var(..., fallback)`. | Los `var()` incluyen un fallback explícito (`none` / `rgba(v.$brand-color, 0.45)`, el color teal actual) — si la herencia se rompe, el resultado degrada al comportamiento visual de hoy, no a un color roto o transparente. |
| `filter: brightness(0) invert(1)` sobre el ícono de fallback es la misma técnica que ya usa `search-icon` en SPEC 12 — funciona porque el SVG es de un solo color sólido; si en el futuro se reemplaza `user-profile.svg` por un ícono multicolor, el filtro dejaría de verse bien. | Riesgo aceptado y documentado — mismo patrón ya validado en SPEC 12 para `search-icon`, que es del mismo tipo de asset (SVG de línea/relleno único). |

## Lo que **no** entra en esta spec

- Posición, tamaño o z-index del panel `dropdown-wrapper`.
- Borde/contorno adicional sobre la foto real del usuario.
- Extracción del trigger o el dropdown a un componente de diseño compartido.
- Cambios a `variables.scss` global.
- Tests automatizados nuevos.

Cada uno de estos, si aterriza, va en su propia spec.
