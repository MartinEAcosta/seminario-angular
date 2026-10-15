# Deuda técnica — Spec 01: Breakpoints compartidos y escala fluida de tipografía/espaciado

**Spec original:** specs/01-breakpoints-y-escala-fluida.md
**Implementado en:** commit 7e0fae0

## Resumen

La implementación cumple el scope declarado: `src/variables.scss` expone `$breakpoints`/`bp-up`/`bp-down` y los tokens fluidos, y los cuatro archivos objetivo (`home-page.scss`, `auth-layout.component.scss`, `form-global.scss`, `form-login.component.scss`) ya no tienen `@media` hardcodeado. El problema no es lo que se hizo, sino lo que quedó a medio camino: la adopción del sistema fuera del scope es nula, varios tokens/breakpoints definidos no tienen ningún consumidor, y una pieza de código nueva introducida en el mismo commit (los botones OAuth) ya rompe el patrón recién creado.

## Hallazgos

- **[Severidad: alta]** Adopción del sistema compartido limitada a 3 de ~20 archivos `.scss` con `@media` en el repo. `cart-checkout.component.scss:122`, `course-carousel.component.scss:93`, `form-lesson.component.scss:132,334`, `course-step-data.component.scss:20,110`, `become-teacher-page.component.scss:99`, `course-module-item.component.scss:126`, `form-course.component.scss:147,162`, `category-marquee.component.scss:96`, `about-page.scss:335`, `purchase-summary.component.scss:69`, `checkout-steps.component.scss:79,90`, `form-card-checkout.component.scss:199`, `buy-pay-page.scss:39`, `buy-cart-page.scss:149`, `buy-page.scss:27`, `user-profile-page.component.scss:178,219,314,465` y `verify-email-page.component.scss:138` siguen usando `768px`/`48rem`/`37.5rem`/`30rem`/`640px` escritos a mano. Esto coincide numéricamente con `$breakpoints` por casualidad, no por referencia: si en el futuro alguien cambia un valor del mapa (p.ej. mover `md` de 768px a 800px), estos 18 archivos quedan desincronizados en silencio, sin ningún error de compilación que lo detecte. Explícitamente "out of scope" en la spec, pero es la fuente de deuda más grande que deja la implementación.

- **[Severidad: media]** `src/app/auth/form-global.scss:222` — `.btn-oauth { font-size: 0.8rem; ... }` usa un valor fijo en lugar de un token `$text-*`, mientras que `.oauth-divider` a solo 40 líneas de distancia (línea 180) sí usa `v.$text-sm`. Ambos bloques de estilos OAuth se agregaron en el mismo commit 7e0fae0 que introdujo el sistema de tokens, así que la inconsistencia no es deuda heredada: es código nuevo que no siguió el patrón que el propio commit establece.

- **[Severidad: media]** Breakpoints `lg` (1024px) y `xl` (1280px) están definidos en `$breakpoints` (`src/variables.scss:10-16`) pero no tienen ningún `@include bp-down('lg')`/`bp-up('lg')`/`bp-down('xl')`/`bp-up('xl')` en todo el repo (confirmado por búsqueda global). El mixin `bp-up` tampoco se usa nunca — toda la migración resultante es exclusivamente desktop-first vía `bp-down`. Quedan dos piezas de la API pública del sistema (`bp-up`, y 2 de 5 breakpoints) sin un solo caso de uso real que valide que funcionan como se espera.

- **[Severidad: media]** Tokens sin ningún consumidor: `$space-md`, `$space-lg` (`src/variables.scss:37-38`) y `$text-2xl` (`src/variables.scss:31`) no aparecen en ningún archivo `.scss` del repo fuera de su propia declaración. La tabla de mapeo de la spec (sección "Data model") no los incluye tampoco — fueron agregados "por completitud" de la escala pero ninguna clase real los necesitó, lo que sugiere tokens especulativos en lugar de derivados de un caso de uso concreto.

- **[Severidad: baja]** `src/variables.scss` no termina en salto de línea (confirmado con `git show` → `\ No newline at end of file`, y verificado en el archivo actual). No rompe el build de Sass, pero genera diffs ruidosos y puede disparar warnings de linters/editorconfig en cada edición futura del archivo.

- **[Severidad: baja]** `src/app/shared/pages/home/home-page.scss` — al migrar el antiguo `@media (max-width: 768px)` a `@include v.bp-down('md')` (línea 258), se eliminó el override `.stat-value { font-size: 2.25rem; }` sin dejar un reemplazo ni un comentario explicando por qué el `clamp()` de `$text-display` (línea 153) es ahora suficiente en mobile. Es un cambio de comportamiento implícito: antes el tamaño en `≤768px` era fijo y explícito, ahora depende de que la interpolación `vw` del `clamp()` "adivine" un valor visualmente equivalente. Ninguno de los acceptance criteria de la spec cubre explícitamente este caso (se centran en 1366px y en el alto a 1366×768).

- **[Severidad: baja]** Los bloques `@include v.bp-down('laptop')` repetidos en `home-page.scss:247`, `auth-layout.component.scss:164` y `form-global.scss:239` ajustan paddings/márgenes muy específicos (`calc(3% + 80px)`, anchos en `%` acoplados al layout flex del padre) sin ningún comentario que remita a la spec o explique la razón del ajuste vertical en ese breakpoint puntual. La spec sí documenta la razón (sección "Decisions", el caso de 1366×768 con navegador maximizado), pero el código no la referencia, así que quien edite estos archivos sin haber leído la spec puede no entender por qué ese breakpoint es distinto de los demás.

- **[Severidad: baja]** No hay ningún test automatizado (unitario, visual o e2e) que valide los acceptance criteria de la spec. La verificación quedó 100% manual vía devtools (paso 6 del plan de implementación) y no hay snapshot/regresión visual en CI que detecte si una futura edición reintroduce un `@media (max-width: <número>)` hardcodeado en los archivos ya migrados, o si el `clamp()` deja de verse bien en 1366px.

## Recomendaciones

- Abrir una spec de seguimiento para migrar incrementalmente los ~18 archivos listados en el primer hallazgo a `bp-up`/`bp-down`, empezando por los que comparten valores exactos con `$breakpoints` (768px, 640px) para minimizar riesgo visual.
- Agregar una regla de lint (stylelint, si se incorpora al proyecto) que prohíba `@media (max-width|min-width: <literal>)` fuera de `src/variables.scss`, para que el próximo componente nuevo use los mixins por defecto en lugar de copiar un `@media` a mano.
- Corregir `src/app/auth/form-global.scss:222` para usar `v.$text-sm` en `.btn-oauth`, igual que `.oauth-divider`.
- Decidir explícitamente sobre los tokens/breakpoints sin uso (`$space-md`, `$space-lg`, `$text-2xl`, `lg`, `xl`, `bp-up`): o se eliminan hasta que haya un caso real que los necesite, o se documenta en la spec que quedan reservados para migraciones futuras (evitar que queden como código muerto no intencional).
- Añadir salto de línea final a `src/variables.scss`.
- Si se agrega tooling de testing visual (Playwright/Chromatic u otro) al proyecto, capturar al menos los anchos 768/1024/1366/1920px de home y login como snapshot de regresión, reemplazando la verificación manual descrita en la spec.
- Dejar un comentario breve en cada bloque `bp-down('laptop')` de `home-page.scss`, `auth-layout.component.scss` y `form-global.scss` remitiendo a `specs/01-breakpoints-y-escala-fluida.md` (sección Decisions) para que el motivo del ajuste vertical no se pierda si se edita el código sin leer la spec.
