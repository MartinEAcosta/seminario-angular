# SPEC 12 — Header liquid glass + link a /about

> **Status:** Aprobado
> **Depends on:** Ninguna (restyle sobre el shared header ya existente; asume que `/about` ya existe, ver SPEC 11)
> **Date:** 2026-09-20
> **Objective:** Rediseñar `app-header` (shared layout) con un tratamiento visual "liquid glass" tipo Apple/iOS — translúcido con blur, transparente sobre el hero oscuro de home/about y con glass claro en el resto de las páginas o al scrollear — y agregar un link de navegación a `/about`.

## Por qué existe esta spec

El header actual (`header.component.html/.scss/.ts`) es una barra sólida blanca con sombra dura (`box-shadow: 0px 0px 15px rgba(0,0,0,0.4)`), sticky, con links teal planos y una barra de búsqueda con simple `border-bottom`. No tiene tratamiento de profundidad/blur, no distingue entre páginas con hero oscuro (home, about) y páginas con fondo claro (explore, cart, profile, etc.), y no tiene un link a `/about` — la única forma de llegar a esa página hoy es el botón "Sobre nosotros" del hero de home (SPEC 03).

Esta spec introduce un lenguaje visual "liquid glass" (blur + translucidez + adaptación de color) coherente con el resto del proyecto (que ya usa `$about-ink` en vez de negro puro y un motivo de "pase de acceso" en about — SPEC 11) y resuelve la navegación directa a `/about` desde cualquier página.

## Scope

**In:**

- Restyle completo de `header.component.scss`: header **sticky**, con dos estados de fondo controlados por `HeaderComponent`:
  - **Transparente** (`header-transparent`): sin fondo, sin sombra, texto/logo/search/nav en blanco. Solo aplica en rutas con hero oscuro debajo (`''` y `/about`) mientras el scroll está por debajo del umbral.
  - **Glass** (`header-glass`, estado por defecto en todas las demás rutas, y estado tras superar el umbral de scroll en las rutas con hero oscuro): fondo blanco translúcido (`rgba` sobre `v.$white-custom`) + `backdrop-filter: blur(...) saturate(...)`, borde inferior sutil translúcido, texto/logo/nav en los colores teal/marca actuales (`v.$brand-color`, `rgb(0, 120, 140)`).
  - Transición suave (`transition`) entre ambos estados (fondo, color de texto, box-shadow), sin salto brusco.
- `header.component.ts` gana el estado necesario para decidir el modo (ver Data model): un signal `isScrolled` actualizado por un listener de scroll con umbral de 48px, limpiado correctamente al destruirse el componente, y un signal derivado de la URL activa (`Router`) que determina si la ruta actual tiene hero oscuro debajo (whitelist `['/', '/about']`).
- Barra de búsqueda (`.container-input-svg`/`.search-input`) rediseñada como pill translúcida (`border-radius` completo, fondo `rgba` + blur en vez de `border-bottom`), coherente con el nuevo lenguaje glass, en ambos estados (transparente/glass) usando la misma variable de color de texto que el resto del header.
- Nuevo link de navegación a `/about` en `header.component.html`, label **"Nosotros"**, ubicado **primero en `.container-nav-anchors`, inmediatamente antes de "Explorar"**, visible siempre (no depende de `userState.authStatus()`), mismo trato de hover que el resto de los links del nav.
- Restyle de `user-profile-dropdown.component.scss`: el panel desplegable (`.dropdown-wrapper`) pasa de fondo sólido blanco a fondo blanco translúcido + `backdrop-filter: blur(...)`, mismo radio/sombra que hoy pero coherente con el glass del header. El trigger (`.profile-trigger`) y su anillo de hover/activo se mantienen con la lógica actual (no dependen del modo transparente/glass del header — el dropdown es un overlay propio, no hereda el color de texto del header).
- Tokens visuales nuevos, **locales a `header.component.scss`** (no se tocan `variables.scss` globales): variables SCSS para el fondo glass (`$header-glass-bg`), el blur (`$header-blur`) y el color de texto en modo transparente (blanco), reutilizando `v.$brand-color`/`v.$white-custom`/`v.$black-custom` ya existentes para el resto.
- Skill `frontend-design` aplica para el detalle visual (blur, saturación, bordes, timing de transición).

**Sin cambios funcionales:**

- `header.component.spec.ts` (si solo verifica `should create`, sigue pasando sin cambios).
- Lógica de `userState`/`searchService`/roles/autenticación del nav (qué links se muestran según `authStatus`/`role`) — se mantiene igual, solo se agrega el link estático a `/about`.
- Ruta `/about` en `app.routes.ts` (ya existe, SPEC 11).
- `home-page.html`/`.scss` y `about-page.html`/`.scss` (esta spec no las modifica; solo lee `Router.url` desde el header para saber si la ruta actual es una de ellas).
- `user-profile-dropdown.component.ts`/`.html` (solo cambia el `.scss`, sin cambios de lógica ni de template).

**Out of scope (para futuras specs):**

- Menú mobile/hamburguesa — decisión explícita del usuario: el nav sigue siendo siempre visible sin colapsar en pantallas chicas, igual que hoy; el header puede seguir sin ser 100% responsive en mobile hasta que esa spec aparte lo resuelva.
- Cualquier ajuste de layout de página necesario para "dejar espacio" bajo el header en modo transparente (ej. padding-top extra en el hero de home/about) — si el hero actual ya queda detrás del header sticky sin ajuste visual raro, no se toca esa página; si hiciera falta un ajuste puntual de espaciado, se resuelve en implementación sin cambiar contenido/estructura de esas páginas.
- Extraer el header o el dropdown a componentes de diseño compartido/reutilizables más allá de lo que ya son.
- Cambios a `variables.scss` global.
- Tests automatizados nuevos (se corre la suite existente como parte de la verificación).

## Data model

Esta spec no introduce estructuras de datos de negocio ni llamadas a servicios/backend nuevas. `header.component.ts` gana únicamente estado de UI:

```ts
// src/app/shared/components/layout/header/header.component.ts
const DARK_HERO_ROUTES = ['/', '/about'];
const SCROLL_THRESHOLD = 48; // px

private router = inject(Router);
private destroyRef = inject(DestroyRef);

private currentUrl = signal(this.router.url);
private isScrolled = signal(window.scrollY > SCROLL_THRESHOLD);

private hasDarkHero = computed(() => DARK_HERO_ROUTES.includes(this.currentUrl()));

// Header arranca transparente solo si la ruta tiene hero oscuro Y todavía no se superó el umbral de scroll.
isTransparentTop = computed(() => this.hasDarkHero() && !this.isScrolled());

// constructor(): router.events.pipe(filter(NavigationEnd)).subscribe(() => currentUrl.set(router.url))
// y un listener 'scroll' en window (addEventListener/removeEventListener via destroyRef.onDestroy)
// que actualiza isScrolled cuando scrollY cruza SCROLL_THRESHOLD.
```

En el template, `<header [class.header-transparent]="isTransparentTop()" [class.header-glass]="!isTransparentTop()">`. El CSS define los tokens de color/fondo para cada clase y la transición entre ambas.

## Implementation plan

1. `header.component.ts`: agregar `DARK_HERO_ROUTES`, `SCROLL_THRESHOLD`, inyectar `Router` y `DestroyRef`, los signals `currentUrl`/`isScrolled`, el computed `hasDarkHero`/`isTransparentTop`, la suscripción a `router.events` (actualiza `currentUrl` en cada `NavigationEnd`) y el listener de `scroll` en `window` con cleanup vía `destroyRef.onDestroy`. Verificación: compila, sin uso en el template todavía.
2. `header.component.html`: bindear `[class.header-transparent]`/`[class.header-glass]` en `<header>`; agregar `<a [routerLink]="['/about']">Nosotros</a>` como primer elemento de `.container-nav-anchors`, antes de "Explorar". Verificación: compila, la página renderiza (sin estilos de glass todavía si el SCSS no está).
3. `header.component.scss`: definir tokens locales (`$header-glass-bg`, `$header-blur`), estilos base de `.header-transparent` (fondo transparente, sin sombra, texto/logo/nav blancos) y `.header-glass` (fondo translúcido + `backdrop-filter`, sombra suave, texto/logo/nav en los colores actuales), con `transition` entre ambos estados sobre `background-color`, `box-shadow` y `color`. Rediseñar `.container-input-svg`/`.search-input` como pill translúcida que también responde a las variables de color del estado activo. Verificación: compila, el header cambia de aspecto visualmente al alternar clases en devtools.
4. `user-profile-dropdown.component.scss`: cambiar `.dropdown-wrapper` (y su `::before`) de fondo sólido a fondo translúcido + `backdrop-filter`, mismo radio y sombra que hoy. Verificación: compila, el dropdown sigue abriendo/cerrando igual, ahora con panel glass.
5. QA manual: `ng build` sin errores. En `/` y `/about`: header arranca transparente con texto blanco sobre el hero oscuro, y al superar ~48px de scroll pasa suavemente a glass claro con texto teal — probar bajando y volviendo a subir (el estado sigue el scroll en ambas direcciones, no es "una sola vez"). En `/explore`, `/enrollment`, `/course/create`, `/auth/me` (o cualquier otra ruta fuera de la whitelist): el header arranca directamente en modo glass claro+teal, sin importar el scroll. El link "Nosotros" navega a `/about` desde cualquier página y está siempre visible (logueado o no, cualquier rol). El dropdown de perfil abre con panel glass legible sobre cualquier fondo. Sin errores de consola ni listeners de scroll colgados al navegar entre rutas repetidas veces.

## Acceptance criteria

- [ ] El header ya no es una barra sólida blanca fija — tiene dos estados visuales (transparente y glass) con `backdrop-filter`.
- [ ] En `/` y `/about`, el header arranca transparente con texto/logo/nav en blanco (legible sobre el hero oscuro) y cambia a glass claro con texto teal al superar ~48px de scroll, con transición suave (no un salto brusco).
- [ ] El cambio de estado por scroll funciona en ambas direcciones (bajar y volver a subir), no es un efecto de una sola vez.
- [ ] En cualquier ruta fuera de `['/', '/about']`, el header se muestra siempre en modo glass claro+teal, sin estado transparente, sin importar el scroll.
- [ ] Existe un link "Nosotros" en el nav que navega a `/about`, ubicado antes de "Explorar", visible para cualquier usuario (autenticado o no, cualquier rol).
- [ ] La barra de búsqueda tiene forma de pill translúcida en vez del `border-bottom` actual, y su color de texto/ícono es coherente con el estado activo del header (blanco en transparente, teal en glass).
- [ ] El panel del dropdown de perfil (`user-profile-dropdown`) usa fondo translúcido con blur en vez de blanco sólido, sin cambios de comportamiento (abre/cierra igual).
- [ ] El listener de scroll se limpia correctamente al destruirse el header — sin errores de consola ni listeners colgados al navegar repetidamente entre rutas.
- [ ] El header sigue siendo `sticky` (permanece visible al hacer scroll) en todas las rutas.
- [ ] `header.component.spec.ts` sigue pasando sin modificaciones (si solo prueba `should create`).
- [ ] `ng build` compila sin errores y no hay errores de consola en desktop.

## Decisions

- **Sí:** liquid glass claro translúcido (blur + fondo blanco semi-transparente, texto teal) como paleta base, en vez de una variante oscura — decisión explícita del usuario, mantiene la identidad visual ya establecida del proyecto (fondos claros predominan, teal como acento).
- **Sí:** header transparente arriba y glass al bajar (comportamiento adaptativo por scroll), en vez de un único aspecto fijo — decisión explícita del usuario, más fiel al comportamiento real de `apple.com`.
- **Sí:** el modo transparente con texto blanco solo aplica en rutas con hero oscuro debajo (`/` y `/about`, whitelist explícita en el componente) — decisión explícita del usuario tras detectar que texto blanco sobre el fondo claro de `/explore` u otras páginas sería ilegible; en el resto de las rutas el header arranca directo en modo glass+teal sin depender del scroll.
- **Sí:** umbral de scroll de ~48px (entre los 40-60px propuestos) para el cambio de estado, vía listener de `scroll` + signal, en vez de medir la altura real del hero por página — más simple y no depende de que cada página exponga su altura de hero.
- **Sí:** link "Nosotros" a `/about` ubicado primero en el nav, antes de "Explorar", siempre visible sin depender de `authStatus`/`role` — decisión explícita del usuario.
- **Sí:** barra de búsqueda y dropdown de perfil se rediseñan también para verse coherentes con el glass — decisión explícita del usuario, evita que queden como elementos "viejos" dentro de un header nuevo.
- **No:** menú mobile/hamburguesa — decisión explícita del usuario de dejarlo fuera de esta spec; el nav sigue siempre visible sin colapsar en pantallas chicas.
- **No:** tocar `home-page`/`about-page` (estructura, contenido o padding) — el header solo lee `Router.url` para decidir su propio modo, no depende de que esas páginas cambien nada.
- **No:** tocar `variables.scss` global — los tokens nuevos del glass quedan locales a `header.component.scss`.

## Identified risks

| Riesgo | Mitigación |
| --- | --- |
| Un listener de `scroll` en `window` sin cleanup puede acumular listeners fantasma si el header se recrea (ej. al navegar entre layouts). | El plan de implementación exige registrar el listener con `destroyRef.onDestroy` para removerlo explícitamente, y el QA manual (paso 5) prueba navegar repetidas veces entre rutas. |
| `backdrop-filter` no tiene el mismo soporte/rendimiento en todos los navegadores/GPUs; puede verse como un fondo semi-transparente plano sin blur en navegadores viejos. | Degradación aceptable: sin `backdrop-filter`, el header sigue siendo legible (fondo translúcido igual aplica vía `background-color` con alpha), solo se pierde el efecto de blur — no es un fallback que haya que codear aparte. |
| La whitelist `DARK_HERO_ROUTES` es una lista estática (`['/', '/about']`); si en el futuro se agrega una página nueva con hero oscuro, el header no lo va a detectar automáticamente. | Riesgo aceptado y documentado — agregar una ruta a la whitelist es una línea de código en `header.component.ts`, no requiere rediseño; queda para quien agregue esa página futura. |

## Lo que **no** entra en esta spec

- Menú mobile/hamburguesa para el nav.
- Ajustes de padding/estructura en `home-page`/`about-page` más allá de lo que ya funciona con el header sticky actual.
- Extracción del header o el dropdown a componentes de diseño compartido.
- Cambios a `variables.scss` global.
- Tests automatizados nuevos.

Cada uno de estos, si aterriza, va en su propia spec.
