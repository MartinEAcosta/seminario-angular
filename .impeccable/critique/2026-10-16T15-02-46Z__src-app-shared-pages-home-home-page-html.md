---
target: home page
total_score: 13
max_score: 36
na_heuristics: 10
p0_count: 1
p1_count: 2
target_identity: "file:C:\\Users\\marti\\Desktop\\Personal\\AprendiendoAngularSeminario\\seminario-angular\\src\\app\\shared\\pages\\home\\home-page.html"
target_fingerprint: "sha256:eb7614244636b73fe27000052fd836b6a5b46a14aaeac37725a4f5eebfe0ad7d"
target_path: "C:\\Users\\marti\\Desktop\\Personal\\AprendiendoAngularSeminario\\seminario-angular\\src\\app\\shared\\pages\\home\\home-page.html"
timestamp: 2026-10-16T15-02-46Z
slug: src-app-shared-pages-home-home-page-html
closed: true
---
Method: dual-agent (A: design review, isolated · B: detector + browser evidence, isolated)

Deviation disclosed: Assessment B returned to the parent context before Assessment A finished. A ran fully isolated and never saw B's output, so A's judgment is unanchored; only the parent synthesis saw them out of order.

Target: `src/app/shared/pages/home/home-page.html` (+ `home-page.scss`, `home-page.ts` y los componentes que compone), servido en `http://localhost:4200/`. Backend caído — condición de evaluación documentada en PRODUCT.md. Visitor mode: **Persuade**.

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 1 | El único estado que importa — "el backend está caído, este catálogo es mock" — se oculta activamente: `home-page.ts:59-65` inyecta `defaultCourses` sin que ninguna bandera llegue al template. Loading = dos slabs de `height:100vh` con "Cargando…". |
| 2 | Match System / Real World | 2 | `<h4>Descripción</h4>` sobre cada cuerpo de tarjeta (`course-mini-card.component.html:11`) es un nombre de columna en una vidriera. Precios en ARS formateados con `currency:'USD'`. "Mejores valorados" nombra un concepto que el modelo no tiene. |
| 3 | User Control and Freedom | 1 | Tocar una tarjeta del carrusel agrega al carrito sin causa visible. `Comprar` muta el carrito y navega a checkout en un click. Ningún undo en toda la página. |
| 4 | Consistency and Standards | 2 | Dos `<h1>` en un documento. Precio en `color: green` / `$green-success` — el verde de estado usado como decoración, contra DESIGN.md:196. Hover `scale(1.05)` acá, `translateY` en el spec. |
| 5 | Error Prevention | 1 | Overlay `opacity: 0` con `pointer-events: all` encima de cada mini-card; `elementFromPoint` al centro devuelve `BUTTON.btn-add-to-cart`. Un tap perdido = mutación del carrito. |
| 6 | Recognition Rather Than Recall | 2 | La mini-card no muestra ninguna acción en reposo: "Ver curso" y "Añadir al carrito" viven dentro del overlay de hover. Las tarjetas no llevan rating, instructor, duración ni nivel. La lista de categorías se mueve, así que no podés re-encontrar la que viste a medias. |
| 7 | Flexibility and Efficiency | 1 | Aplicable, no n/a: el único acelerador de la página es el buscador del header, y es un control muerto — `header.component.html:10` sin `ngModel`, sin `(keyup)`, sin form, `name=""` `id=""`. Verificado. |
| 8 | Aesthetic and Minimalist Design | 2 | El hero se merece un 4; la página promedia abajo porque la mitad del contenido bajo el fold repite literalmente la otra mitad, y cinco `<h4>Descripción</h4>` seguidos son puro cromo. |
| 9 | Error Recovery | 1 | Camino de error cableado y muerto: `home-page.html:43` bindea `[errorMessage]`, `course-list.component.ts:16` declara el input y `course-list.component.html` no lo renderiza nunca (verificado: 0 ocurrencias). Una caída del backend produce cero palabras en pantalla. |
| 10 | Help and Documentation | n/a | Superficie Persuade sin tarea que completar ni feature cuyo funcionamiento haya que explicar. |
| **Total** | | **13/36** | **Poor (36%)** |

## Design Specificity Verdict

**La página son dos diseños grapados, y sólo el de arriba es Udemix.**

**LLM assessment.** La sala oscura sobre el fold está autorada y nadie más la podría shipear sin cambios: el canvas del hero (`hero-canvas-background.directive.ts:131-167`) es un spotlight teal que deriva por `sin/cos` sobre tres tiles de ruido de 72px pre-renderizados y rotados cada 140ms — decisión técnica real con razón real. Las stat cards se elevan con velo de papel al 6%, borde al 14% y trama de 24px en vez de sombra (`home-page.scss:135-150`): exactamente "La Regla del Tono sobre lo Oscuro" de DESIGN.md. El wordmark Playwrite aparece en los dos lugares que el sistema permite y en ninguno más.

Todo lo que está debajo de `app-category-marquee` es intercambiable de categoría, y en dos lugares es literalmente de un competidor:

- **El catálogo está vestido de Udemy.** `src/app/utils/defaultCourses.ts` hotlinkea thumbnails de `img-c.udemycdn.com:31`, `encrypted-tbn0.gstatic.com:9,52`, `saludelectronica.com:42` y un banner de devtalles en `res.cloudinary.com:20` con la cara de otro instructor y la marca de agua `{dev/talles}` visible. La primera impresión visual de "Udemix" es un muro de arte ajeno.
- **Los mismos cinco cursos se renderizan dos veces, en dos lenguajes visuales distintos.** `home-page.html:37` pasa `carouselCourses()` y `home-page.html:42` pasa `coursesToShow().items` — con mock son los mismos cinco ítems, mismo orden. Dos diseños de tarjeta, dos escalas tipográficas, dos tratamientos de precio, un dataset.
- **Las dos etiquetas de sección son infundadas.** "Recomendados para ti" para un visitante anónimo sin señal alguna; "Mejores valorados" cuando la interfaz `Course` (`course.interfaces.ts:1-10`) no tiene campo de rating. Nada en el producto puede ordenar por rating.
- **El footer es el genérico que el resto de la página intenta no ser.** Slab a sangre completa de `$brand-color` (`footer.component.scss:4`): el área de color más grande de la página es el acento que DESIGN.md:331 dice que saca su peso de aparecer poco. Copy en español internacional neutro, no el voseo rioplatense que PRODUCT.md:55 fija como identidad, y termina en tres links a los homes de `facebook.com`, `twitter.com`, `instagram.com` que no son de nadie.
- **Carácter desperdiciado.** La tarjeta-ticket es "el componente de firma del sistema" (DESIGN.md:299) y el home la usa cero veces.

Veredicto: cualquier marketplace de cursos podría shipear todo desde `home-page.html:37` hacia abajo sin cambiar un pixel. El hero es la única parte que es Udemix.

**Deterministic scan.** CLI `impeccable detect --json` sobre 8 archivos de markup: 8 findings. **Todos falsos positivos**, confirmado: 7× `design-system-color` con `ignoreValue: "rgb(0,0,0)"` son el detector renderizando fragmentos de template sin `styles.scss` ni compilación Angular (el snippet de `course-carousel` cita control flow sin compilar como texto, prueba directa); 1× `broken-image` en `course-card.component.html` es el binding `[src]="course().thumbnail_url || '/assets/thumbnail-icon.svg'"` que el parser estático no reconoce. Valor real del scan CLI en este proyecto: cero. El detector in-page es el que sirve.

**Visual overlays.** Inyección exitosa (`http://localhost:8400/detect.js`, helper ya detenido). Header de consola: `[impeccable] 24 anti-patterns found`, con 27 líneas de detalle logueadas — discrepancia registrada tal cual. Agrupadas:

| Rule | Count | Coincide con la revisión de diseño |
|---|---|---|
| `low-contrast` | 13 | Sí — `4.3:1` texto `#e9e9e9` sobre teal en `button.btn-primary`/`p.text`/`a`; `3.3:1` en `span.marquee-eyebrow`; `3.8:1` y `4.2:1` en `p.price`. Confirma P2-contraste abajo. |
| `nested-cards` | 5 | Sí — `div.mini-card` dentro del slab `#161616` del carrusel, la "tercera sala" que la regla de dos salas no cubre. |
| `gradient-text` | 4 | Sí — `h1` + 3× `span.stat-value`. DESIGN.md:323 ya lo registra como deuda a retirar, no patrón a copiar. |
| `blinking-cursor` | 1 | Sí — `span.cursor` 1Hz en el primer viewport, sin guardia de `prefers-reduced-motion`. |
| `line-length` | 1 | Sí — `~129 chars` en `p.text` (el footer mide 103ch; DESIGN.md:212 capea en 640px). |
| `overused-font` | 1 | No es defecto acá: Montserrat al 85% es el sistema declarado. Falso positivo por diseño. |
| `marquee` | 1 | Parcial — el loop infinito es intencional y sí está guardado por `prefers-reduced-motion`, pero es el punto de decisión de 10 categorías en movimiento. |
| `codex-grid-background` | 1 | No es defecto: la trama de rejilla es vocabulario declarado en DESIGN.md:235. |

El overlay reportó **cero** findings de `design-system-color` — lo opuesto al CLI sobre el mismo markup, lo que cierra el caso de los falsos positivos.

El overlay quedó visible en la pestaña de Chrome con título "Udemix" (`localhost:4200`) que abrió la evaluación B — badges `OVERUSED FONT`, `AUTO-SCROLLING MARQUEE`, `DECORATIVE GRID-L…`, `GRADIENT TEXT` sobre el h1 y los tres stat values, y `DECORATIVE BLINKING CURSOR` sobre el cursor del hero. Un reload la limpia.

## Cognitive Load

**7 de 8 ítems fallan — carga crítica.**

Pasa sólo chunking (3 stat cards, 2 CTAs, 3 nav links). Fallan: single focus (el hero pide cinco actos atencionales antes de cualquier acción), grouping (el badge "Nuestro impacto en números" etiqueta un grid que arranca dos elementos después), jerarquía visual (`.stat-value` usa `$text-display`, el **mismo token** que el `h1`, así que "5" grita igual que el titular), one-thing-at-a-time (typewriter + cursor 1Hz + marquee 36s en simultáneo, y sólo el marquee está guardado por `prefers-reduced-motion`), working memory, y progressive disclosure **invertido** (el overlay esconde las acciones *primarias* de la tarjeta en reposo).

**Puntos de decisión por encima de 4 opciones — cinco:** marquee de categorías 10 categorías / 20 links en movimiento; "Recomendados para ti" 5 cards × 2 botones = 10 targets invisibles hasta el hover; "Mejores valorados" 5 cursos × 3 controles = 15 controles visibles a la vez; header 5; footer 7.

## Overall Impression

El hero es lo mejor que tiene este proyecto y llega en los primeros dos segundos — correcto según peak-end. Después la página cae tres veces: "5 cursos" bajo el marco "Nuestro impacto en números" al lado de dos números hardcodeados que sí parecen reales; el carrusel con arte de Udemy y devtalles; y los mismos cinco cursos otra vez bajo otro título. Termina en un slab teal con tres puertas de salida a redes que no son de Udemix, sin CTA de cierre.

La oportunidad más grande no es estética: **la página nunca se corrió abajo de 768px.** `course-card.component.scss` y `header.component.scss` tienen **cero** media queries (verificado). Lo primero que hace un revisor técnico es redimensionar.

## What's Working

1. **El canvas del hero es craft real y además es barato.** `hero-canvas-background.directive.ts` pre-renderiza tres tiles de ruido de 72px una sola vez (`:43-46`), los rota en un reloj de 140ms (`:154-157`) y compone un `createRadialGradient` teal a la deriva sobre `#161616`. `ResizeObserver` en el padre, DPR capeado en 2 (`:94`), y branch a un único frame estático en mobile o `prefers-reduced-motion` (`:59-62`). La mayoría de los "hero animado" son un incendio de GPU; este está pensado.

2. **El contrato de dos modos del header es pensamiento de sistema, no CSS.** `header.component.ts:30-37` deriva transparente-vs-vidrio de ruta + scroll; `header.component.scss:26-50` expresa cada modo como custom properties (`--header-text`, `--header-icon-filter`, `--header-ring-color`) que los hijos heredan, con transición deliberadamente lenta de `0.9s` para que el cambio no parpadee a mitad del scroll. Un control nuevo dentro del header sale correcto por defecto.

3. **La stat card sabe elevarse sobre oscuro.** Velo de papel al 6%, borde al 14%, trama de 24px al 3%, y cero sombra. Sobre `#161616` una sombra negra sólo ensucia el borde, y esta tarjeta correctamente la rechaza.

## Priority Issues

### [P0] Abajo de 768px la página está sin construir
**Qué.** `course-card.component.scss` y `header.component.scss` tienen **0 media queries** (verificado con grep). A 390px: `.container-thumbnail-course` es `width: 340px` fijo dentro de una tarjeta de 338px, así que la columna de texto colapsa y el título y la descripción desaparecen; el precio (`position: relative; bottom: -1.5rem`) se renderiza en verde **encima** del thumbnail amarillo a ~1.5:1; "Agregar al carrito" se parte en tres líneas sobre la imagen. En el header, los tres anchors (131px de caja, 78px de alto) se apilan encima del wordmark "Udemix" y del campo de búsqueda de 71px. Además, los botones prev/next del carrusel son `display: none` abajo de 640px (`course-carousel.component.scss:93-96`) sin nada que los reemplace — ni dots, ni peek, ni pista de que la estantería scrollea. Y el overlay invisible (`opacity: 0` + `pointer-events: all`, `course-mini-card.component.scss:63,91`) hace que tocar una tarjeta para leerla **agregue el curso al carrito**: `elementFromPoint` al centro devuelve `BUTTON.btn-add-to-cart`. En touch, el carrusel no tiene ninguna forma de llegar al detalle del curso.
**Por qué importa.** Esto es el catálogo real del home y el segundo bloque más grande de la página. En un teléfono no está degradado, está destruido — y el header arriba es ilegible antes de que el usuario scrollee. PRODUCT.md posiciona el producto por craft; esta es la contradicción más fuerte de ese posicionamiento. Un control invisible que muta estado sobre un target que el usuario cree que es contenido es la forma más filosa de "el sistema hizo algo que no pedí".
**Fix.** Bloque `bp-down('md')` en `course-card.component.scss`: `flex-direction: column`, thumbnail `width: 100%; aspect-ratio: 16/9`, sacar `max-height: 250px`, y mover `.price` al flujo normal arriba de la fila de botones. Bloque `bp-down('md')` en `header.component.scss` que colapse búsqueda y nav en un único afordance de menú. Convertir la mini-card entera en `<a [routerLink]="['/course', id]">` para que el tap por defecto navegue; dejar el overlay como mejora de desktop detrás de `@media (hover: hover) and (pointer: fine)` y darle `pointer-events: none` en `opacity: 0`; exponer "Añadir al carrito" como control persistente en el cuerpo de la tarjeta. Ambos componentes se componen en todas las páginas: no es un fix sólo del home.
**Suggested command:** `/impeccable adapt`

### [P1] La página dice lo mismo dos veces, bajo dos etiquetas que no puede sostener
**Qué.** `home-page.html:37` y `:42` renderizan el mismo set `coursesToShow()`. "Recomendados para ti" (`course-carousel.component.ts:16`) personaliza para un anónimo con cero señal; "Mejores valorados" (`home-page.html:40`) ordena por un rating que no existe en `Course` (`course.interfaces.ts:1-10`).
**Por qué importa.** La duplicación parte al medio el catálogo percibido *y* cuesta confianza dos veces: quien nota la repetición concluye que las dos etiquetas son decoración, lo que retroactivamente contamina las stat cards. También gasta ~1.900px de scroll mobile en contenido ya visto.
**Fix.** Elegir una. Dejar la estantería oscura para un corte defendible con datos que existen ("Nuevos en Udemix", por fecha de creación) y reemplazar la sección de abajo por algo que el catálogo no pueda repetir: grid de categorías con conteos reales desde `categoriesToShow()`, o una banda única "Explorá los N cursos" que lleve a `/explore`. Si hay cinco cursos, decir cinco y que parezca intencional en vez de mostrarlos dos veces para llenar altura.
**Suggested command:** `/impeccable distill`

### [P1] El estado sin backend está disfrazado de contenido real, con arte de competidores
**Qué.** `home-page.ts:59-65` sustituye `defaultCourses` cuando el resource es null o vacío, sin bandera al template. `errorMessage` está bindeado (`home-page.html:43`) a un input que `course-list.component.html` nunca renderiza (verificado: 0 ocurrencias) — camino de error cableado y muerto. Los thumbnails mock hotlinkean `img-c.udemycdn.com`, `encrypted-tbn0.gstatic.com` (×2), `saludelectronica.com` y un banner de devtalles en Cloudinary con la cara de un tercero y su marca de agua.
**Por qué importa.** PRODUCT.md:69 pide que el estado sin backend "se lea como una decisión, no como una app rota". Hoy no se lee como ninguna de las dos: se lee como un catálogo real de cursos de Udemy. El revisor no puede distinguir mock de live, y lo único que *sí* es live (el `5` de `coursesToShow().total`) es el número que parece un bug — al lado de "+200 estudiantes" y "+20 profesores" hardcodeados (`home-page.html:16,22`), que son los que parecen reales. Hotlinkear arte de terceros en el producto de portafolio es además un riesgo que no compra nada.
**Fix.** Exponer el modo: computed `isUsingFallbackData` junto a la sustitución y una píldora discreta en la banda de catálogo — "Modo demo · el backend no está conectado" — usando el estilo de badge ya definido en `home-page.scss:68-82`. Renderizar `errorMessage` en `course-list.component.html` o sacar el binding. Reemplazar cada thumbnail de terceros en `defaultCourses.ts` por arte propio; `public/assets/` ya tiene un estilo de ilustración de la casa (`about-course-builder-mockup.svg`, `stat-*-icon.svg`) que haría que el estado demo se vea autorado en vez de scrapeado.
**Suggested command:** `/impeccable harden`

### [P2] Un buscador que es un prop, y una superficie Persuade sin movimiento de cierre
**Qué.** El input del header (`header.component.html:10`) no tiene ningún binding: `name=""`, `id=""`, sin `ngModel`, sin `(keyup)`, sin form. Renderiza, enfoca, acepta tipeo y no hace nada nunca — mientras un `SearchBarComponent` funcional con `(keyup.enter)` ya existe en `shared/components/search-bar/` y `SearchService` ya está inyectado en `header.component.ts:21`. Del otro lado, los últimos 500px son un footer teal cuyos links salientes van a `facebook.com` / `twitter.com` / `instagram.com` (`footer.component.html:20-22`), sin CTA de cierre.
**Por qué importa.** Peak-end: la última impresión es un slab decorativo de color y tres salidas. Y el control más invitante del cromo persistente es utilería — un revisor técnico va a tipear ahí dentro de los primeros treinta segundos.
**Fix.** Cablear el input a `SearchService` + `/explore`, o sacarlo hasta que funcione: un buscador ausente es honesto, uno falso no. Agregar una banda oscura de cierre antes del footer reusando la sala del hero y un único CTA ("Empezá por una categoría" → `/explore`), según la alternancia de salas de DESIGN.md. Sacar los tres links sociales o apuntarlos a cuentas reales.
**Suggested command:** `/impeccable clarify`

### [P2] Piso de contraste, foco y motion — 13 fallas AA confirmadas por el detector
**Qué.** El detector in-page midió 13 fallas de contraste AA contra sus fondos compuestos reales: eyebrow del marquee **3.37:1** a 12.5px, precio de mini-card **3.80:1** (`$green-success` sobre `rgb(40,40,40)`), precio de lista **4.23:1** (`color: green`, `course-card.component.scss:112` — ya registrado como deuda en DESIGN.md:326), texto del footer **4.25:1** a 19.2px sobre teal, links del header en modo vidrio **4.25:1**, botón primario y párrafos `#e9e9e9` sobre teal **4.3:1**. `.search-input` pone `outline: none` (`header.component.scss:138`) sin reemplazo: el foco de teclado es invisible, contra DESIGN.md:288. Sólo `.marquee-item` tiene un ring autorado; todo lo demás depende del default del navegador, incluidos los dos botones invisibles por mini-card (diez paradas de foco sobre nada). El typewriter (`home-page.ts:110`) y el cursor a 1Hz (`home-page.scss:115`) no están guardados por `prefers-reduced-motion` en ningún lado — WCAG 2.2.2 aplica a los dos. Además `gradient-text` × 4 (`h1` + 3 `stat-value`), que DESIGN.md:323 ya declara deuda a retirar.
**Por qué importa.** Es el piso, no el techo: texto secundario ilegible, foco de teclado invisible y motion que no respeta la preferencia del sistema son exactamente lo que un revisor audita primero cuando el claim del producto es craft.
**Fix.** Subir las opacidades secundarias de sala oscura de `0.4/0.5` a `0.6/0.7`; reemplazar los dos verdes de precio por `$black-custom`/`$white-custom` a opacidad plena y que el peso tipográfico cargue el énfasis (un precio no es un estado); oscurecer el texto del footer a `#fff` o oscurecer el teal; un único token `:focus-visible` compartido que consuma `--header-ring-color`; envolver typewriter y cursor en `prefers-reduced-motion`; retirar los cuatro `background-clip: text`.
**Suggested command:** `/impeccable audit`

## Persona Red Flags

**Jordan (primera vez).** Cae en "Nuestro impacto en números" arriba de un titular que no es sobre números, con una frase que se borra y se retipea tres veces — no puede saber si la página terminó de cargar. Pasa por "5 cursos", ve esos cinco en el carrusel, ve los mismos cinco otra vez bajo otro título y no logra determinar si son cursos distintos con el mismo nombre. Lee "Descripción" cinco veces y no entiende por qué un sitio le muestra el nombre de un campo. Hace click en `Comprar` esperando una página de producto y aterriza en checkout. Nada en el home lo llevó nunca al detalle de un curso, porque el único link de la mini-card está escondido en el overlay de hover. **Los dos CTAs del hero están bajo el fold a 1440×900** (`.container-actions` arranca en y=626 contra ~600px de viewport útil): la acción primaria de la página no es visible al llegar.

**Riley (stress tester).** Tipea en el buscador del header, Enter, nada. Prueba el ícono. Nada. Tabea: el foco entra al input y desaparece (`outline: none`, sin sombra). Sigue tabeando y aterriza en dos botones *invisibles* por tarjeta del carrusel — diez paradas de foco sobre nada, con el ring del navegador dibujado sobre oscuro vacío. Corre el outline de headings: `H1, H2, H3, H4×5, H1`. Hoverea el marquee — pausa, bien — mueve el mouse y el link al que apuntaba se corre. Prende `prefers-reduced-motion`: el marquee para, el canvas se congela, y el typewriter y el cursor siguen.

**Casey (mobile distraído).** Primer frame: tres anchors de nav renderizados *encima* del wordmark "Udemix" y una caja de búsqueda de 71px. Antes de cualquier contenido, la página parece rota. Tiene que scrollear 768px de columna de stats para llegar al primer CTA en y=1091 — ~1.3 viewports de estadísticas antes de que una superficie Persuade ofrezca una acción. Toca una tarjeta para leerla y la agrega al carrito en silencio; la única señal es un badge en un FAB en la esquina opuesta. Llega a "Mejores valorados" y encuentra una columna de thumbnails sobredimensionados con el precio en verde pintado encima y botones solapando el arte; los títulos y descripciones no se renderizan. 4.157px de página en una pantalla de 844px, para cinco cursos mostrados dos veces.

**Persona del proyecto — el revisor técnico que llega sin backend** (PRODUCT.md:13, audiencia #1). Abre la página en la condición de evaluación exactamente documentada y ve un catálogo de arte de Udemy y devtalles, incluida la fotografía de otro instructor y una marca de agua `{dev/talles}`. Antes de juzgar una línea de código tiene que decidir si eso es un placeholder o un asset levantado, y la página no da ninguna señal de que sea un fallback. Ve "+200 estudiantes" contra 5 cursos y reconoce de inmediato que dos de tres números están hardcodeados, porque esa forma no es plausible. Redimensiona a teléfono por reflejo y el catálogo colapsa. Tipea en el buscador: muerto. Busca la historia del no-backend y encuentra que el input de error está bindeado a un componente que lo ignora. La conclusión disponible para este revisor es "degrada en silencio y con poca honestidad", exactamente lo opuesto al principio 3 de PRODUCT.md.

## Minor Observations

- `.container-actions` usa `gap: 5%` del ancho de su propio contenedor (`home-page.scss:194`), por lo que "Explorar cursos" y "Sobre nosotros" se parten en dos líneas cada uno a 1440px. Usar `$space-sm` fijo y `white-space: nowrap`.
- El fade izquierdo del marquee no se lee: `mask-composite: intersect` declarado con un único `mask-image` (`category-marquee.component.scss:24-25`), así que "DISEÑO UX/UI" se corta con borde duro en x=0.
- `.card-course { z-index: 1000000 }` (`course-card.component.scss:6`); el header es `z-index: 1000`. Sólo lo salva que el header sea `sticky`.
- `.carousel-shelf` es un slab `#161616` flotando en la sala clara (`:9`) — una tercera condición de superficie que la regla de dos salas (DESIGN.md:194) no cubre — y las mini-cards adentro son `rgb(40,40,40)`, 18 unidades de separación que apenas registran. El detector lo marcó como `nested-cards` ×5.
- Voz inconsistente dentro de un mismo viewport: `marquee-eyebrow` dice "Explorá por categoría" (voseo correcto) mientras el placeholder del header dice "Busca un tema que te interese…" y el link dice "Conviértete en profesor" (`header.component.html:34`) — PRODUCT.md:55 fija "Convertite en profesor". El empty state del carrito también usa "Explora".
- `.footer .text` mide **103ch** a 1440px; el detector in-page midió `~129 chars` en `p.text`. DESIGN.md:212 capea la medida de lectura en 640px.
- "Enlaces Utiles" sin tilde (`footer.component.html:13`); el logo de X etiquetado "Twitter" (`:21`).
- `.stat-description` mide 25ch, produciendo tres líneas desparejas de 4-5 palabras — demasiado angosto en el mismo layout donde el footer es demasiado ancho.
- Dos `app-loader` pueden montarse en simultáneo (`home-page.html:37,42`), cada uno `height: 100vh`: una columna de "Cargando…" de dos viewports y después un reflow completo.
- El FAB del carrito se renderiza para un visitante anónimo con carrito vacío y solapa contenido en mobile; es el único elemento fijo compitiendo con el CTA real de la página.
- El scan CLI del detector no aporta nada en este proyecto (8/8 falsos positivos por falta de compilación Angular). Para Angular, usar sólo el detector in-page.

## Questions to Consider

1. **¿Qué afirma esta página que un competidor no podría afirmar palabra por palabra?** Sacá el hero y leé lo que queda: "Recomendados para ti", "Mejores valorados", un precio, un thumbnail, "Agregar al carrito". Si la respuesta es nada, el hero hace el 100% del trabajo de posicionamiento con el 15% de los pixeles.
2. **Si el catálogo tiene cinco cursos, ¿por qué la página finge lo contrario en vez de hacer de los cinco el punto?** Cinco cursos elegidos y descritos por una persona con nombre es una historia creíble. Cinco duplicados en dos estanterías tituladas "recomendados" y "mejores valorados" no lo es.
3. **La tarjeta-ticket es "el componente de firma del sistema" y aparece cero veces en la puerta de entrada del producto. ¿Es una firma o una sobra?** Un curso en un marketplace *es* "un acceso adquirido" por definición.
4. **¿Hace cuánto que el buscador del header es utilería, y qué dice eso sobre cuántas veces esta página se usa en vez de mirarse?** El `SearchBarComponent` funcional está dos directorios más allá. La distancia entre "existe" y "está conectado" es donde mueren los claims de craft.
5. **¿Para quién es el "+200 estudiantes"?** No puede ser para el usuario final (sería el 201° de 200 repartidos en 5 cursos) ni para el revisor (PRODUCT.md le avisa que el backend está apagado). Un número que no persuade a ninguna de las dos audiencias y viola tu propio principio de honestidad te cuesta dos veces para no comprar nada.
6. **¿Por qué la página termina con tres links fuera de tu sitio, a empresas para las que no trabajás?** La última impresión de una superficie Persuade es una decisión de diseño que carga peso. Hoy es un default.
