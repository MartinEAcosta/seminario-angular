---
name: Udemix Learning
description: Plataforma de cursos que alterna vitrinas oscuras y catálogo claro, con un único teal como voz de color.
colors:
  brand-teal: "rgb(0, 120, 140)"
  paper: "rgb(233, 233, 233)"
  ink: "rgb(40, 40, 40)"
  night: "#161616"
  night-teal: "#0e1a1a"
  card-white: "#ffffff"
  red-warning: "rgb(197, 14, 14)"
  green-success: "rgb(0, 150, 50)"
  yellow-caution: "rgb(255, 190, 40)"
typography:
  display:
    fontFamily: "Playwrite DK Loopet, cursive"
    fontSize: "clamp(2rem, 1.5rem + 2.5vw, 3rem)"
    fontWeight: 400
    lineHeight: 1.25
    letterSpacing: "normal"
  headline:
    fontFamily: "Montserrat, sans-serif"
    fontSize: "clamp(2.5rem, 6vw, 5rem)"
    fontWeight: 900
    lineHeight: 1.05
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Montserrat, sans-serif"
    fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)"
    fontWeight: 800
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Montserrat, sans-serif"
    fontSize: "clamp(0.95rem, 0.9rem + 0.3vw, 1.1rem)"
    fontWeight: 500
    lineHeight: 1.6
    letterSpacing: "normal"
  label:
    fontFamily: "Montserrat, sans-serif"
    fontSize: "0.8rem"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "0.08em"
rounded:
  pill: "999px"
  control: "20px"
  action: "1.5rem"
  panel: "24px"
  card: "12px"
  thumb: "0.3rem"
  header: "40px"
spacing:
  xs: "clamp(0.5rem, 0.4rem + 0.5vw, 0.75rem)"
  sm: "clamp(1rem, 0.8rem + 1vw, 1.5rem)"
  md: "clamp(1.5rem, 1.1rem + 2vw, 2.5rem)"
  lg: "clamp(2rem, 1.4rem + 3vw, 4rem)"
components:
  button-primary:
    backgroundColor: "{colors.brand-teal}"
    textColor: "#ffffff"
    rounded: "{rounded.control}"
    padding: "10px 20px"
    typography: "{typography.label}"
  button-primary-hover:
    backgroundColor: "rgba(0, 120, 140, 0.80)"
  button-primary-disabled:
    backgroundColor: "rgba(0, 120, 140, 0.3)"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.brand-teal}"
    rounded: "{rounded.control}"
    padding: "10px 20px"
  button-outline-hover:
    backgroundColor: "{colors.brand-teal}"
    textColor: "#ffffff"
  button-hero:
    backgroundColor: "{colors.brand-teal}"
    textColor: "{colors.paper}"
    rounded: "{rounded.action}"
    padding: "0.7rem 1.5rem"
  button-hero-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.paper}"
    rounded: "{rounded.action}"
    padding: "0.7rem 1.5rem"
  button-oauth:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "0 0.75rem"
    height: "2.75rem"
    width: "100%"
  button-destructive:
    backgroundColor: "transparent"
    textColor: "{colors.red-warning}"
    rounded: "{rounded.pill}"
    padding: "10px 20px"
  input-auth:
    backgroundColor: "rgb(50, 50, 50)"
    textColor: "{colors.paper}"
    rounded: "{rounded.control}"
    padding: "0 1rem"
    height: "3rem"
  input-inline:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "0"
    height: "2.5rem"
  card-ticket:
    backgroundColor: "{colors.card-white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "2.5rem 1.75rem 1.75rem"
  card-mini:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "0.2rem"
    padding: "5% 2.5%"
    width: "22rem"
    height: "26rem"
  card-stat:
    backgroundColor: "rgba(233, 233, 233, 0.06)"
    textColor: "{colors.paper}"
    rounded: "{rounded.panel}"
    padding: "2rem 1.5rem"
  badge-pill:
    backgroundColor: "rgba(233, 233, 233, 0.04)"
    textColor: "rgba(233, 233, 233, 0.7)"
    rounded: "{rounded.pill}"
    padding: "0.4rem 1.1rem"
  nav-header-glass:
    backgroundColor: "rgba(233, 233, 233, 0.72)"
    textColor: "{colors.brand-teal}"
    rounded: "{rounded.header}"
    padding: "0 28px"
    height: "80px"
  nav-header-transparent:
    backgroundColor: "transparent"
    textColor: "#ffffff"
    rounded: "{rounded.header}"
    padding: "0 28px"
    height: "80px"
---

# Design System: Udemix Learning

## Overview

**Creative North Star: "La Vitrina Nocturna"**

Udemix se lee como una vitrina iluminada de noche. La página avanza alternando bloques: una sala oscura donde el producto se presenta (hero `#161616`, hero y CTA de `/about` en `#0e1a1a`), y una sala clara donde el catálogo se trabaja (papel hueso `rgb(233, 233, 233)`). El header de vidrio es la única pieza que cruza entre las dos: nace transparente sobre lo oscuro y se condensa en vidrio esmerilado al entrar en lo claro.

La densidad es alta en lo claro y generosa en lo oscuro. Los bloques oscuros respiran — un `h1`, una línea de texto, tres tarjetas, dos botones y nada más — porque su trabajo es que algo se vea. Los bloques claros se apilan: listados, formularios de varios pasos, carrito, checkout. Esa asimetría es deliberada y es la base del sistema: **cuando una pantalla nueva no sabe de qué lado está, está mal planteada.**

El color es monógamo. Un solo teal de pizarra sostiene todo el acento; el rojo, el verde y el ámbar existen solo para decir en qué estado está algo. La letra manuscrita Playwrite aparece tres o cuatro veces en toda la aplicación y por eso funciona. Lo que este sistema rechaza, confirmado por el código que ya existe: el gris medio de panel administrativo, el degradado como relleno, y el acento repartido en cada borde hasta perder significado.

**Key Characteristics:**

- Alternancia de salas: bloque oscuro / bloque claro, sin página de gris medio intermedio.
- Un único teal de acento sobre neutros; el trío semántico solo informa estado.
- Formas de pastilla para lo que se toca; 12px para lo que se lee.
- Profundidad difusa y ambiental, nunca sombra dirigida de póster.
- El hover levanta la superficie; no la agranda.
- Escala fluida con `clamp()` en tipografía y espaciado: una sola escala, sin saltos por breakpoint.

## Colors

Paleta de taller: un teal apagado y serio sobre papel hueso y tinta grafito, con tres señales saturadas reservadas al estado.

### Primary

- **Teal Profundo de Pizarra** (`rgb(0, 120, 140)`): el único acento del sistema. Pinta el botón primario, el borde del botón de contorno, el `eyebrow` en mayúsculas, la viñeta de las listas, el sello circular de las tarjetas-ticket, el subrayado de `2px` bajo el input de título en el formulario de curso, y el texto del header una vez que entró en modo vidrio. En superficie oscura no se usa como fondo de área grande: ahí vive como borde o como texto.

### Secondary

- **Papel Hueso** (`rgb(233, 233, 233)`): fondo de las salas claras y del `body`. También es el color del texto dentro de las salas oscuras, donde baja a `0.7`, `0.65`, `0.6` o `0.55` de opacidad para construir jerarquía secundaria sin agregar un gris nuevo a la paleta.
- **Blanco Ficha** (`#ffffff`): reservado a las superficies que se levantan sobre papel hueso — tarjeta-ticket, resumen de compra, panel de checkout. Nunca como fondo de página.

### Tertiary

- **Negro Vitrina** (`#161616`): la sala oscura del home. Fondo del hero y del marquee de categorías.
- **Verdinegro de Sala** (`#0e1a1a`): la sala oscura de `/about`, con una insinuación de verde que la emparenta con el teal. Hero y CTA final.
- **Tinta Grafito** (`rgb(40, 40, 40)`): texto sobre claro, y fondo de las superficies oscuras de componente (mini-card, panel de autenticación). Bajado a `0.75`, `0.7` o `0.65` de opacidad para texto de apoyo sobre claro.

### Neutral

- **Rojo Aviso** (`rgb(197, 14, 14)`): error de validación y acción destructiva. Borde y texto en reposo; fondo lleno solo en hover del botón destructivo.
- **Verde Confirmación** (`rgb(0, 150, 50)`): paso siguiente en flujos de varios pasos, y estado confirmado.
- **Ámbar Atención** (`rgb(255, 190, 40)`): paso anterior, y advertencia no bloqueante.

### Named Rules

**La Regla de la Vitrina.** Cada sección pertenece a una sala: oscura (`#161616` / `#0e1a1a`) o clara (papel hueso). No existe una tercera opción. Un fondo de página en gris medio o en teal lavado rompe el sistema entero.

**La Regla de Una Sola Voz.** El teal es el único acento decorativo. El rojo, el verde y el ámbar solo pueden aparecer cuando comunican estado — error, confirmación, advertencia, dirección en un flujo. Usarlos como color de marca o de adorno los vuelve ilegibles cuando realmente importan.

**La Regla de la Opacidad en vez del Gris.** La jerarquía secundaria se construye bajando la opacidad del neutro que ya está en la sala (`rgba(233, 233, 233, 0.6)` sobre oscuro, `rgba(40, 40, 40, 0.75)` sobre claro). No se introducen grises nuevos a la paleta.

## Typography

**Display Font:** Playwrite DK Loopet (con `cursive` de respaldo)
**Body Font:** Montserrat (con `sans-serif` de respaldo)

**Character:** Una manuscrita de cuaderno escolar contra una geométrica de peso industrial. La Playwrite aporta el gesto de alguien que enseña a mano; la Montserrat, con pesos de 500 a 900, aporta la estructura de plataforma. El contraste funciona porque la proporción es extrema: la manuscrita no llega al 1% del texto de la aplicación.

### Hierarchy

- **Display** (Playwrite DK Loopet, 400, `clamp(2rem, 1.5rem + 2.5vw, 3rem)`, línea 1.25): el wordmark del header (fijo en `2rem`), el `h1` del home y el título de la pantalla de autenticación. Nada más.
- **Headline** (Montserrat 900, `clamp(2.5rem, 6vw, 5rem)`, línea 1.05, tracking `-0.02em`): el titular de apertura de una sala oscura de página completa. Hoy solo el hero de `/about`.
- **Title** (Montserrat 800, `clamp(1.8rem, 3.5vw, 2.6rem)`, tracking `-0.01em`): encabezado de sección dentro del cuerpo. Su variante chica es el `h3` de tarjeta (`1.4rem`, 800).
- **Body** (Montserrat 500, `clamp(0.95rem, 0.9rem + 0.3vw, 1.1rem)`, línea 1.6): texto corrido. En párrafos de lectura, medida máxima de `640px`.
- **Label** (Montserrat 600, `0.8rem`, tracking `0.08em`, mayúsculas): el `eyebrow` que antecede a un título de sección, siempre en teal. La variante del panel de autenticación abre el tracking a `0.2em` y agrega una regla de `2rem` antes del texto.

### Named Rules

**La Regla del Wordmark.** Playwrite DK Loopet solo aparece en momentos de firma: logo, `h1` de portada, título de autenticación. Jamás en cuerpo, etiqueta, botón, input o tabla. Es una manuscrita de trazo fino: a tamaño de interfaz deja de ser legible y pasa a ser textura.

**La Regla de la Escala Única.** Los tamaños salen de la escala fluida de `src/variables.scss` (`$text-sm` … `$text-display`), interpolada entre 320px y 1280px de viewport. No se redeclara un `font-size` por breakpoint: la escala ya lo resuelve. Los `clamp()` propios del hero y del about son la excepción histórica para titulares de portada, no la práctica general.

## Layout

El modelo es de bandas horizontales a ancho completo, cada una con su color de sala, y un contenido centrado adentro. Los anchos máximos observados son tres: `900px` para el bloque de hero, `1100px` para las rejillas de contenido de `/about`, y `640px` para párrafos de lectura. El header es `sticky` a `top: 16px` con `margin: 0 24px`, de modo que flota como una píldora separada de los bordes en vez de pegarse al viewport.

El padding de banda se expresa en porcentaje (`6%`, `4%`, `7% 6% 6%`) y crece al bajar de breakpoint en lugar de encogerse — el hero pasa de `6%` a `8%` en `laptop` y a `12%` en `md`. Es la convención incumbente; mantenerla en secciones nuevas de portada. Dentro de los componentes, en cambio, el espaciado sale de la escala fluida (`$space-xs` … `$space-lg`), que ya absorbe el cambio de viewport sin media query.

Las rejillas son de columnas iguales y colapsan en una sola columna en `md` (768px): `repeat(3, 1fr)` en las tarjetas de estadística, `repeat(2, 1fr)` en el spotlight y en las tarjetas-ticket. Los grupos de botones hacen lo mismo y además pasan a ancho completo (`.container-actions`, `.cta-actions`). Breakpoints disponibles vía los mixins `bp-up()` / `bp-down()`: `sm` 640, `md` 768, `lg` 1024, `xl` 1280, `laptop` 1366.

El `html` fuerza `overflow-y: scroll` con `scrollbar-gutter: stable`, así que el ancho de contenido no salta entre páginas con y sin scroll. Cualquier banda que use `overflow: hidden` para contener un fondo debe seguir respetando eso.

## Elevation & Depth

Sistema de sombra difusa y ambiental: la luz viene de arriba y sin dirección lateral, el desenfoque es grande y la opacidad baja. La profundidad informa jerarquía de superficie — qué flota sobre qué — y responde al hover levantando la pieza. No hay sombra dura ni offset diagonal en el lenguaje normativo.

Sobre fondo oscuro la profundidad no se hace con sombra sino con tono: la tarjeta de estadística es `rgba(233, 233, 233, 0.06)` con borde `rgba(233, 233, 233, 0.14)` y una trama de rejilla de `24px` apenas visible encima. Esa es la forma correcta de levantar algo en una sala oscura.

### Shadow Vocabulary

- **surface-rest** (`box-shadow: 0 10px 30px rgba(40, 40, 40, 0.12)`): reposo de toda superficie de contenido sobre fondo claro — tarjeta-ticket, resumen de compra, panel de checkout.
- **surface-hover** (`box-shadow: 0 16px 36px rgba(0, 0, 0, 0.10)`): la misma superficie en hover, combinada con `translateY(-6px)`.
- **chrome** (`box-shadow: 0 4px 15px rgba(40, 40, 40, 0.15)`): barras y controles internos de un panel, donde la pieza se despega apenas.
- **panel** (`box-shadow: 0 10px 30px rgba(40, 40, 40, 0.18)`): paneles flotantes de nivel superior — el carrito deslizable, el botón flotante del carrito a `0.20`.
- **glass-header** (`box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08)`): exclusivo del header en modo vidrio, junto a `backdrop-filter: blur(18px) saturate(1.4)`.
- **focus-ring** (`box-shadow: 0 0 0 2px var(--header-ring-color)`): anillo de foco, con el color heredado del modo de header activo.

### Named Rules

**La Regla de la Sombra Difusa.** Reposo `0 10px 30px rgba(40, 40, 40, 0.12)`, hover `0 16px 36px rgba(0, 0, 0, 0.10)`. Sin offset lateral, sin opacidad por encima de `0.22`, sin radio de desenfoque menor a `15px` fuera de `chrome` y `focus-ring`. Test: si la sombra permite deducir desde dónde entra la luz en el eje horizontal, está mal.

**La Regla del Tono sobre lo Oscuro.** En una sala oscura, una superficie se eleva con un velo de papel hueso al 4–6% y un borde al 14–16%, no con sombra. Una sombra negra sobre `#161616` no se ve y solo ensucia el borde.

## Shapes

Dos familias de forma, separadas por función. Lo que se toca es redondo: pastilla completa (`999px`) para píldoras de etiqueta, campo de búsqueda y botón destructivo; `20px` para botón primario, botón de contorno, input de autenticación y botón OAuth; `1.5rem` para los botones grandes de portada; `40px` para el header flotante. Lo que se lee es apenas curvo: `12px` para tarjetas y paneles de contenido, `24px` para la tarjeta de estadística, `0.3rem` para miniaturas de curso y `0.2rem` para la mini-card del carrusel.

Los bordes son líneas de un píxel al 6–16% de opacidad del neutro de la sala, no líneas sólidas de gris. La excepción es el borde de intención: `2px` sólidos en teal bajo el input de título del formulario de curso, y `2px` en rojo aviso alrededor del botón destructivo en reposo.

Dos siluetas recurrentes y propias: el **sello circular** de 48–56px que marca una categoría o un beneficio, y la **perforación de ticket** — una banda en teal con trama de rejilla de `16px`, cortada por un festón de semicírculos hecho con `radial-gradient` repetido. Las miniaturas de la mini-card usan dos `mask-image` lineales compuestos con `mask-composite: intersect`, que desvanecen los cuatro bordes de la imagen en lugar de recortarla con un radio.

### Named Rules

**La Regla de la Pastilla.** Si se puede hacer clic, el radio es `999px`, `20px` o `1.5rem`. Si se lee, es `12px`. Un botón con `4px` o una tarjeta con `999px` delatan que la pieza no entendió el sistema.

## Components

### Buttons

- **Shape:** pastilla de esquina suave (`20px`) para controles en línea; pastilla grande (`1.5rem`) para los dos botones de portada; pastilla completa (`999px`) para el destructivo.
- **Primary:** fondo teal con texto blanco, borde de `1px` del mismo teal, `padding: 10px 20px`, peso `bold`. En hover el fondo baja a `rgba(0, 120, 140, 0.80)` y el borde pasa a transparente. Deshabilitado: fondo `rgba(0, 120, 140, 0.3)`, sin cambio de opacidad en el texto.
- **Outline:** fondo transparente, texto y borde de `1px` en teal. En hover invierte: fondo teal, texto blanco. Deshabilitado: todo el par baja a `rgba(0, 120, 140, 0.3)`.
- **Hero:** fondo teal, texto papel hueso, `padding: 0.7rem 1.5rem`, sin borde. Su par secundario es fondo transparente con borde de `2px` en papel hueso, que en hover se rellena de papel hueso y pasa el texto a teal.
- **OAuth:** fondo papel hueso sobre el panel oscuro, texto tinta grafito, borde `1px` `rgba(40, 40, 40, 0.15)`, `height: 2.75rem`, icono SVG de `1rem` a la izquierda con `gap: 0.4rem`. Hover: `translateY(-3px)` más `0 4px 12px rgba(0, 0, 0, 0.25)`.
- **Destructive:** fondo transparente, texto y borde de `2px` en rojo aviso, radio de pastilla completa. En hover se rellena de rojo, el texto pasa a papel hueso y el icono se invierte con `filter: brightness(0) invert(1)`.
- **Hover / Focus:** transición `all 0.3s ease` en controles. El movimiento es `translateY`, nunca `scale`. El foco usa el anillo de `2px` descrito en Elevation.

### Cards / Containers

- **Corner Style:** `12px` en paneles de contenido y checkout; `20px` en la tarjeta-ticket; `24px` en la tarjeta de estadística.
- **Background:** blanco ficha sobre papel hueso; velo de papel hueso al 6% sobre sala oscura.
- **Shadow Strategy:** `surface-rest` en reposo y `surface-hover` con `translateY(-6px)` al pasar el mouse. En sala oscura, sin sombra — ver La Regla del Tono sobre lo Oscuro.
- **Border:** `1px` `rgba(40, 40, 40, 0.08)` sobre claro; `1px` `rgba(233, 233, 233, 0.14)` sobre oscuro.
- **Internal Padding:** `2.5rem 1.75rem 1.75rem` en la tarjeta-ticket (el extra arriba deja lugar al sello); `2rem 1.5rem` en la tarjeta de estadística.

### Inputs / Fields

- **Autenticación (sala oscura):** fondo `rgb(50, 50, 50)`, borde de `2px` en teal, radio `20px`, `height: 3rem`, sombra interior `inset 0 2px 6px rgba(0, 0, 0, 0.1)`. El `placeholder` es transparente y la etiqueta flota: al enfocar o al tener contenido, el label se mueve `translateY(-30px)` y el campo sube `translateY(-5px)` con el fondo aclarado a `rgb(60, 60, 60)`.
- **En línea (sala clara):** sin caja. Fondo transparente, sin borde ni `outline`, el campo es el texto mismo; el título del formulario de curso se marca solo con un `border-bottom` de `2px` en teal. Es el dialecto correcto para editores donde el contenido es el protagonista.
- **Focus:** desplazamiento vertical y aclarado de fondo en el dialecto oscuro; cambio de borde en el claro. Nunca se elimina el indicador de foco sin reemplazarlo.
- **Error:** `border-color` a rojo aviso vía la clase `.hasError`.

### Navigation

El header es una píldora flotante de `80px` de alto, `sticky` a `top: 16px`, con dos modos que transicionan en `0.9s ease` — una transición deliberadamente lenta, porque el cambio ocurre mientras el usuario hace scroll y no debe parpadear.

- **Transparente** (sobre sala oscura): sin fondo ni sombra, borde `rgba(255, 255, 255, 0.25)`, texto blanco, iconos invertidos con `filter: brightness(0) invert(1)`, campo de búsqueda en `rgba(255, 255, 255, 0.18)`.
- **Vidrio** (sobre sala clara): fondo `rgba(233, 233, 233, 0.72)` con `backdrop-filter: blur(18px) saturate(1.4)`, sombra `glass-header`, texto en teal, iconos sin filtro.
- Los enlaces son Montserrat 500 a `1.3rem` y responden bajando a `opacity: 0.7`. El modo activo expone `--header-text`, `--header-icon-filter` y `--header-ring-color` como custom properties, de las que heredan los hijos: un control nuevo dentro del header debe consumir esas variables en vez de fijar su propio color.

### Tarjeta-Ticket

El componente de firma del sistema. Una tarjeta vertical en blanco ficha que imita una entrada: un sello circular de `48px` en teal posicionado en absoluto sobre la esquina superior izquierda, una banda de perforación de `5.5rem` en teal con trama de rejilla de `16px`, y un festón de semicírculos de `20px` generado con `radial-gradient` repetido que separa la banda del cuerpo. El cuerpo lleva `eyebrow` en teal, `h3` en Montserrat 800 y párrafo al 70% de tinta. Es el patrón a reutilizar cuando una pieza representa un acceso adquirido — inscripción, comprobante, pase de profesor.

### Named Rules

**La Regla del Levante.** El hover mueve la pieza en el eje vertical con `translateY` (`-3px` en controles, `-6px` en superficies, `-10px` en mini-cards), nunca con `scale`. `scale` estira el texto y el grosor del borde.

## Do's and Don'ts

### Do:

- **Do** asignar cada sección nueva a una sala antes de maquetarla: oscura (`#161616` / `#0e1a1a`) o clara (`rgb(233, 233, 233)`).
- **Do** usar `$brand-color` como único acento, y reservar `$red-warning` / `$green-success` / `$yellow-caution` para estado.
- **Do** importar los tokens con `@use '@variables' as v;` y tomar tamaños de `$text-*` y espaciados de `$space-*` en lugar de literales.
- **Do** elevar con `0 10px 30px rgba(40, 40, 40, 0.12)` en reposo y `0 16px 36px rgba(0, 0, 0, 0.10)` más `translateY(-6px)` en hover.
- **Do** elevar con velo de tono (4–6%) y borde (14–16%) cuando la superficie está en sala oscura.
- **Do** construir jerarquía secundaria bajando la opacidad del neutro de la sala.
- **Do** consumir `--header-text`, `--header-icon-filter` y `--header-ring-color` en cualquier control que viva dentro del header.
- **Do** envolver toda animación de entrada en `@media (prefers-reduced-motion: reduce)`, como ya hacen `/about` y el layout de autenticación.
- **Do** mantener las miniaturas en `aspect-ratio: 16 / 9` con `object-fit: cover`, para que una imagen de proporción distinta no desalinee la rejilla.

### Don't:

- **Don't** usar texto con degradado y `color: transparent`. Existe hoy en `home-page.scss:84` (`h1`, `.stat-value`) y en `about-page.scss:73` (`.hero-title`): es deuda a retirar, no patrón a copiar. Rompe la selección de texto, la lectura de alto contraste y el renderizado en Safari. Un titular en papel hueso sólido sobre la sala oscura ya tiene contraste suficiente.
- **Don't** agrandar con `transform: scale(1.05)` en hover. Está en `btn-primary`, `btn-add-to-cart`, `btn-rounded`, `btn-remove-inline`, `btn-sumbit` y la paginación — todas migrables a `translateY`. `scale` estira el texto y el grosor del borde.
- **Don't** usar sombra dura con offset diagonal (`5px 7px 20px rgba(0, 0, 0, 0.8)` en `mini-card-component.scss:14`, `5px 5px 5px rgba(0, 0, 0, 0.4)` en `btn-rounded.scss`). Es el dialecto viejo; migrar al vocabulario difuso.
- **Don't** escribir colores fuera del sistema. `course-card.component.scss:112` usa `color: green` y `rgb(71, 71, 71)`; lo correcto es `$green-success` y una opacidad de `$black-custom`.
- **Don't** declarar `font-size` por breakpoint. La escala fluida ya interpola; una media query de tipografía indica que se eligió el token equivocado.
- **Don't** aplicar Playwrite DK Loopet a nada que no sea wordmark o titular de portada.
- **Don't** introducir un fondo de página en gris medio, ni una sala de color teal lavado. Son dos salas, no tres.
- **Don't** apilar dos declaraciones de `box-shadow` sobre el mismo selector esperando que se sumen — `form-global.scss:43-44` lo hace y la primera se descarta en silencio. Usar una sola declaración con las capas separadas por coma.
- **Don't** repartir el teal en cada borde de la pantalla. Su peso viene de aparecer poco.
