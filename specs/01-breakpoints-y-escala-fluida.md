# SPEC 01 — Breakpoints compartidos y escala fluida de tipografía/espaciado

> **Status:** Implementado
> **Depends on:** (ninguna)
> **Date:** 2026-10-01
> **Objective:** Agregar breakpoints compartidos y mixins, más una escala fluida (`clamp()`) de tipografía y espaciado en `src/variables.scss`, y aplicarlos en el home y el login para que dejen de verse mal en pantallas de laptop (~1366×768).

## Por qué existe esta spec

`src/variables.scss` hoy solo tiene colores y fuentes — cero breakpoints. Los `@media` del repo están hardcodeados y son inconsistentes entre archivos: `768px`, `48rem` (= 768px), `37.5rem` (= 600px), `30rem` (= 480px), `640px`, cada uno escrito a mano por componente. Ninguno cubre el rango de laptops comunes (~1366px de ancho): todo lo que mide más de 768px y no es mobile cae en los estilos de escritorio "grandes" sin ningún ajuste, por eso el home y el login se ven apretados/desproporcionados en una laptop típica.

## Scope

**In:**

- Mapa `$breakpoints` y mixins `bp-up($name)` / `bp-down($name)` en `src/variables.scss`, para no escribir `@media (max-width: ...)` a mano en cada componente.
- Breakpoints: `sm` (640px), `md` (768px), `lg` (1024px), `xl` (1280px), `laptop` (1366px — cubre el hueco de laptops tipo 1366×768 donde hoy no dispara ningún query).
- Escala fluida de tipografía en `src/variables.scss`: `$text-sm`, `$text-base`, `$text-lg`, `$text-xl`, `$text-2xl`, `$text-display` (todas con `clamp()`).
- Escala fluida de espaciado en `src/variables.scss`: `$space-xs`, `$space-sm`, `$space-md`, `$space-lg` (todas con `clamp()`).
- Refactor de `src/app/shared/pages/home/home-page.scss`: usar las nuevas escalas en lugar de `font-size`/`padding` fijos, migrar su `@media (max-width: 768px)` a `@include bp-down('md')`, y agregar un bloque `@include bp-down('laptop')` con ajustes para el rango 1366px (padding del hero, gap del `stats-grid`).
- Refactor de `src/app/auth/layout/auth-layout/auth-layout.component.scss`: misma idea — escalas fluidas para `title-auth`/`text-auth`/`eyebrow`/textos de redes sociales, migrar sus dos `@media` (48rem y 37.5rem) a los mixins compartidos, agregar bloque `bp-down('laptop')` con ajustes de padding horizontal **y vertical** (`.container-auth`, `margin-top` del `bg-auth`) para que el panel de login entre sin scroll a 1366×768 con navegador maximizado.
- Refactor de `src/app/auth/form-global.scss`: escalas fluidas para `title-form`/`text-forgot-pass`/`text-register`/`text-login`, migrar sus dos `@media` a los mixins compartidos, agregar bloque `bp-down('laptop')` que reduce los márgenes verticales entre `title-form`/inputs/`btn-sumbit` (hoy todos en `4%`/`3%` del alto acumulado) para aportar a que el panel de login entre sin scroll a 1366×768.
- Refactor de `src/app/auth/components/form-login/form-login.component.scss`: sus `font-size` fijos (1.15rem / 1.3rem) pasan a usar los nuevos tokens de texto.

**Out of scope (para specs futuras):**

- Migrar el resto de componentes del repo (cart, payment, course, module, lesson, about, teacher-request, etc.) a los nuevos breakpoints/escala. Siguen con sus `@media` actuales.
- Un sistema de design tokens más amplio (color fluido, dark mode, tokens de radio/sombra). Esta spec es solo breakpoints + tipografía + espaciado.
- Rediseño visual o de contenido del home o el login — solo se ajusta cómo responden a distintos anchos, no qué muestran.
- `src/app/auth/pages/login-page/login-page.component.scss` queda vacío, no se toca (no tiene estilos propios, todo vive en `form-login` y `auth-layout`).

## Data model

Esta spec no introduce datos de aplicación. Introduce tokens de diseño (variables Sass), estructura concreta:

```scss
// src/variables.scss

$breakpoints: (
  'sm': 640px,
  'md': 768px,
  'lg': 1024px,
  'xl': 1280px,
  'laptop': 1366px,
);

@mixin bp-up($name) {
  @media (min-width: map-get($breakpoints, $name)) { @content; }
}

@mixin bp-down($name) {
  @media (max-width: map-get($breakpoints, $name)) { @content; }
}

// Escala fluida de tipografía (interpolada entre 320px y 1280px de viewport)
$text-sm: clamp(0.8rem, 0.75rem + 0.2vw, 0.9rem);
$text-base: clamp(0.95rem, 0.9rem + 0.3vw, 1.1rem);
$text-lg: clamp(1.05rem, 0.95rem + 0.5vw, 1.25rem);
$text-xl: clamp(1.4rem, 1.2rem + 1vw, 2rem);
$text-2xl: clamp(1.75rem, 1.4rem + 1.75vw, 2.5rem);
$text-display: clamp(2rem, 1.5rem + 2.5vw, 3rem);

// Escala fluida de espaciado
$space-xs: clamp(0.5rem, 0.4rem + 0.5vw, 0.75rem);
$space-sm: clamp(1rem, 0.8rem + 1vw, 1.5rem);
$space-md: clamp(1.5rem, 1.1rem + 2vw, 2.5rem);
$space-lg: clamp(2rem, 1.4rem + 3vw, 4rem);
```

Mapeo propuesto de clases existentes a tokens (de referencia para el paso de implementación, no exhaustivo):

| Clase actual | Archivo | Token nuevo |
| --- | --- | --- |
| `.badge` | home-page.scss | `$text-sm` |
| `.container section h1`, `.stat-value` | home-page.scss | `$text-display` |
| `.typewriter-text`, `.stat-label` | home-page.scss | `$text-lg` |
| `.stat-description` | home-page.scss | `$text-sm` |
| `.title-auth` | auth-layout.component.scss | `$text-display` |
| `.text-auth`, `.text-forgot-pass`/`.text-register`/`.text-login` | auth-layout/form-global | `$text-base` |
| `.eyebrow`, `.text-social-media` | auth-layout.component.scss | `$text-sm` |
| `.container-social-media h2` | auth-layout.component.scss | `$text-lg` |
| `.title-form` | form-global.scss | `$text-xl` |

## Implementation plan

1. Agregar el mapa `$breakpoints`, los mixins `bp-up`/`bp-down` y los tokens `$text-*`/`$space-*` a `src/variables.scss`. No rompe nada: son tokens nuevos, nadie los consume todavía.
2. Refactorizar `src/app/shared/pages/home/home-page.scss`: reemplazar `font-size`/`padding` fijos por los tokens, migrar `@media (max-width: 768px)` a `@include bp-down('md')`, y agregar `@include bp-down('laptop')` con el padding del hero y el gap del `stats-grid` ajustados para 1366px.
3. Refactorizar `src/app/auth/layout/auth-layout/auth-layout.component.scss`: tokens de texto, migrar `@media (max-width: 48rem)` → `bp-down('md')` y `@media (max-width: 37.5rem)` → `bp-down('sm')`, agregar `@include bp-down('laptop')`.
4. Refactorizar `src/app/auth/form-global.scss`: tokens de texto, migrar sus dos `@media` a los mixins compartidos, agregar `@include bp-down('laptop')` si hace falta.
5. Refactorizar `src/app/auth/components/form-login/form-login.component.scss`: sus dos `font-size` fijos pasan a `$text-base`/`$text-lg` según corresponda.
6. Verificación manual: abrir home y login en devtools a 640/768/1024/1280/1366/1920px de ancho, confirmar que no hay overflow ni apretado y que el texto escala sin saltos. Correr el build de Angular para confirmar que el Sass compila.

## Acceptance criteria

- [ ] `src/variables.scss` exporta `$breakpoints`, `bp-up`, `bp-down`, y los tokens `$text-sm` … `$text-display` y `$space-xs` … `$space-lg`.
- [ ] `home-page.scss`, `auth-layout.component.scss`, `form-global.scss` y `form-login.component.scss` no tienen ningún `@media (max-width: <número hardcodeado>)` — todos usan `@include bp-down(...)` / `bp-up(...)`.
- [ ] A 1366px de ancho, el hero del home y el panel de login no se ven apretados ni cortados (verificado visualmente en devtools).
- [ ] A 1366×768 con navegador maximizado (alto visible real ~543–600px), el panel de login (`bg-auth`) entra completo sin scroll vertical ni contenido cortado.
- [ ] Los textos de `h1`/`.stat-value`/`.title-auth` escalan de forma continua, sin saltos brusco, entre 320px y 1280px de viewport.
- [ ] `ng build` compila sin errores de Sass tras los cambios.
- [ ] El resto de componentes del repo (cart, payment, course, etc.) sigue funcionando igual, sin cambios visuales.

## Decisions

- **Sí:** breakpoint `laptop` (1366px) como token independiente, no parte de la progresión mobile-first clásica. Razón: es justo el hueco que hoy no dispara ningún `@media` y causa el bug reportado.
- **Sí (revisado en implementación):** interpretar "pantalla baja" principalmente como ancho (~1366px), pero el bloque `bp-down('laptop')` también puede reducir paddings/márgenes **verticales** del panel de login. Razón: verificación visual (paso 6) mostró que a 1366×768 con navegador maximizado (alto visible real ~543–600px tras barra de Chrome) el panel de login (`bg-auth`) mide ~657px de alto y desborda el viewport, cortando "¿Olvidaste tu contraseña?" y forzando scroll — el problema reportado por el usuario ("todo se ve muy grande") es en parte de alto, no solo de ancho.
- **Sí:** mixins `bp-up`/`bp-down` sobre un mapa, en vez de solo variables sueltas. Razón: el usuario pidió explícitamente no tener que escribir media queries a mano por componente.
- **Sí:** escala fluida interpolada entre 320px y 1280px de viewport (vía `vw` en el `clamp()`). Razón: cubre de mobile a xl sin necesitar breakpoints extra solo para tipografía.
- **No:** migrar todos los componentes del repo a los nuevos tokens en esta spec. Razón: alcance acordado es solo home + login; el resto queda para specs futuras.
- **No:** sistema de design tokens completo (color, dark mode, radios, sombras). Razón: fuera del problema reportado.

## Risks

| Riesgo | Mitigación |
| --- | --- |
| Migrar `@media (max-width: 37.5rem)` (600px) a `bp-down('sm')` (640px) dispara el cambio 40px antes de lo que disparaba hoy. | Revisar visualmente los textos/inputs afectados en login tras el cambio; es un corrimiento menor y buscado (unificar valores). |
| `clamp()` mal calibrado puede achicar el texto más de lo esperado en pantallas muy anchas (>1280px) o no achicarlo lo suficiente en 1366px. | Verificar visualmente en 1366px y 1920px como parte del paso 6; ajustar los valores `min`/`max` del `clamp()` si no se ve bien. |
| El panel de login (`bg-auth`) desborda verticalmente a 1366×768 maximizado (alto visible ~543–600px), generando scroll y la sensación de "todo muy grande". | Reducir en `bp-down('laptop')` el padding vertical de `.container-auth`, el `margin-top` de `.bg-auth` y los márgenes verticales de `form-global.scss` (título/inputs/botón) hasta que el panel entre sin scroll. |

## What is **not** in this spec

- Migración de cart, payment, course, module, lesson, about, teacher-request a los nuevos tokens.
- Sistema de design tokens más amplio (color, dark mode).
- Rediseño visual o de contenido del home o el login.
- Cambios en `login-page.component.scss` (queda vacío).

Cada uno de estos, si se necesita, va en su propia spec.