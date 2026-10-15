# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Dos audiencias, en este orden de prioridad:

1. **Revisor técnico** (reclutador, tech lead, docente del seminario). Llega desde un portafolio o un link de repo, mira la app unos minutos, probablemente sin backend levantado, y decide si el trabajo es sólido. No crea cuenta ni paga.
2. **Usuario final del producto** — estudiante que explora el catálogo, se inscribe y ve lecciones en video; y profesor que pide su pase de instructor, arma módulos/lecciones y publica un curso.

La prioridad 1 no autoriza atajos de demo: cada flujo tiene que aguantar un uso real de estudiante y de profesor. El revisor juzga justamente eso.

## Product Purpose

Udemix Learning es una plataforma tipo e-commerce de cursos online: explorar por categoría, comprar vía carrito + MercadoPago, inscribirse, consumir lecciones en video, y publicar cursos propios tras convertirse en profesor.

Doble propósito real: producto funcional y pieza de portafolio personal (sin fines de lucro). Éxito = un revisor cierra la pestaña con la impresión de que está bien hecho, y un estudiante/profesor puede completar su recorrido de punta a punta sin encontrarse con un maniquí.

## Positioning

El diferencial declarado es el **craft**: mismo producto que la categoría (catálogo, carrito, checkout, player), pero la identidad visual y el detalle de interacción están por encima del promedio del rubro. No hay un mecanismo de producto que un competidor no pueda copiar — lo que no se copia es la ejecución.

Consecuencia para el trabajo futuro: el nivel de acabado es la propuesta de valor, no un extra. Una pantalla "funcional pero genérica" incumple el posicionamiento.

## Operating Context

- Navegación desktop y mobile web.
- **El backend es un repo aparte** (`seminario-angular-backend`, fuera de este workspace, no desplegado). Sin levantarlo caen auth/login, creación de cursos y subida de imágenes; el navegado del catálogo sigue vivo con datos mockeados. El escenario más probable de evaluación es exactamente ese: app sin backend.
- Checkout real vía MercadoPago SDK; lecciones en video con video.js.
- Roles: visitante, usuario autenticado (email/password o Google OAuth), profesor (tras aprobación del teacher-request), con verificación de email.
- Rutas vigentes: `/` (home), `/explore`, `/course/*`, `/auth/*`, `/enrollment/*`, `/payment/*`, `/become-teacher/*`, `/about`.

## Capabilities and Constraints

Funcionalidad confirmada: catálogo con categorías y paginación · detalle de curso · creación y edición de cursos con módulos y lecciones · subida de archivos (video, PDF, material) · carrito persistido en `localStorage` con códigos de descuento · checkout MercadoPago · inscripciones · player de lecciones · perfil de usuario · solicitud y estado de pase de profesor · login email/password y Google OAuth.

Restricciones técnicas:

- Angular 20, standalone en todo el proyecto (sin NgModules), estado con `signal`/`computed`/`effect` — sin librería de store.
- Sin Tailwind ni librería de componentes: SCSS propio con tokens en `src/variables.scss`. Cualquier trabajo visual se construye sobre esos tokens.
- Presupuestos de build en producción: 4kB warning / 8kB error por hoja de estilos de componente, 500kB/1MB de bundle inicial. Limita cuánta ambición visual entra por CSS de componente.
- Sin lint configurado; `ng test` hoy no compila por specs que apuntan a archivos movidos y un tema de videojs ausente en `package.json`.
- Trabajo rastreado como specs numeradas en `specs/NN-slug.md`, con companion de deuda técnica.

Terminología del dominio (en español, tal cual aparece en la UI): curso, módulo, lección, categoría, inscripción, carrito, pase de profesor.

## Brand Commitments

- Nombre: **Udemix Learning** (en UI, "Udemix").
- Todo el texto de interfaz, los comentarios de código y las specs se escriben en **español rioplatense con voseo** ("Grabá tus lecciones", "Convertite en profesor", "necesitás"). Es una decisión fijada, no una casualidad del contenido actual.
- Voz: directa y sin fricción retórica; promete el paso siguiente, no el resultado grandilocuente ("Empezá cuando quieras", "Sin pasos de más").

## Evidence on Hand

- **Catálogo y conteo de cursos**: datos reales del backend (`coursesToShow().total` sale de la API); sin backend, mockeados para poder navegar.
- **"+200 estudiantes" y "+20 profesores"** en el home: la intención es que sean cifras reales del backend, pero **hoy están hardcodeadas** en `src/app/shared/pages/home/home-page.html`. Deuda a cerrar con el endpoint correspondiente. El trabajo futuro no debe inventar métricas adicionales ni inflar estas.
- Iconografía e ilustración propias en SVG bajo `public/assets/` (`stat-*-icon.svg`, `about-*-icon.svg`, `about-course-builder-mockup.svg`).
- **No existen**: testimonios, logos de clientes, casos de éxito, prensa, pricing publicado ni deployment del backend. Nada de eso se fabrica.

## Product Principles

1. **El acabado es el producto.** Como el posicionamiento es craft, el detalle visual y de interacción se trata como requisito funcional, no como adorno opcional.
2. **Ninguna pantalla de maniquí.** El revisor y el usuario final ven la misma app; estados vacíos, de carga y de error se diseñan con el mismo cuidado que el camino feliz.
3. **Degradar con dignidad sin backend.** El escenario sin backend es el escenario probable: tiene que leerse como una decisión, no como una app rota.
4. **Honestidad en las cifras.** Nada de métricas, testimonios o tracción inventados; lo que no hay, no se insinúa.
5. **Español rioplatense en todo.** La voz es parte de la identidad; no se neutraliza a "español internacional".
