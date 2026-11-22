# SPEC 18 — El toast deja de ser solo de error: severidad, renombre y una sola instancia

> **Status:** Aprobado
> **Depends on:** SPEC 16 (toast decidido por el componente — movió *quién* llama al toast y dejó `ui.service.ts` explícitamente fuera de alcance; esta spec es la mitad que faltaba)
> **Date:** 2026-11-20
> **Objective:** Convertir `UIService` / `ModalErrorMessageComponent` en un toast genérico de tres
> severidades (`error` / `success` / `warning`), renombrándolos a `ToastService` / `ToastComponent`,
> reclasificando los 23 call sites existentes y dejando una sola instancia del componente en la app.

## Por qué existe esta spec

La SPEC 16 movió la decisión del mensaje del servicio al componente, y en su sección *Out of scope* dijo
textualmente: «Esta spec mueve **quién llama** al toast, no cómo funciona el toast». Su companion de deuda
(`16-...-deuda-tecnica.md`, sección 2) listó lo que quedó pendiente: *«Sigue descartando cualquier mensaje
nuevo mientras haya uno visible (`:16`), sin severidad `success`/`error`, con una `private timer` declarada y
nunca usada (`:12`) y `_errorMessage` público por falta de modificador (`:8`)»*. Esta spec es ese pendiente.

El problema de fondo es que **el componente ya muestra éxitos hoy, pintados de rojo**. Seis de los 23 call
sites son mensajes de éxito (`'Contraseña actualizada.'`, `'Cambios guardados.'`, `'Recibimos tu solicitud.
Te avisamos por correo.'`, los dos de "te enviamos el email" y el de reset), y todos salen por el mismo
`<section>` con fondo `rgba(197,14,14,0.85)` y el icono `warning-white.svg`. El usuario cambia su contraseña
con éxito y la app le contesta con una banda roja de advertencia. No es un detalle estético: es el canal
diciendo lo contrario de lo que dice el texto.

Tres cosas más están medidas y no estaban reportadas:

- **El componente se monta cuatro veces.** `app.component.html:6` (root, cubre toda la app),
  `shared/pages/home/home-page.html:71`, `auth/layout/auth-layout/auth-layout.component.html:64` y
  `auth/layout/password-recovery-layout/password-recovery-layout.component.html:2`. Como `UIService` es
  `providedIn: 'root'`, las cuatro instancias leen el mismo signal: en `/` y en `/auth/*` hoy se renderizan
  **dos toasts idénticos superpuestos** en la misma posición `fixed`. Con un fondo opaco al 85% la
  superposición pasa casi desapercibida; con una superficie con borde, no.
- **El SCSS no usa ni un token de `variables.scss`** para el color (`rgba(197,14,14,0.85)` es `$red-warning`
  escrito a mano con alpha), y dimensiona con porcentajes del viewport: `width: 30%` y **`height: 9%`**. Un
  mensaje de dos líneas se desborda de ese alto fijo.
- **El `<section>` no declara ningún atributo ARIA**, así que un lector de pantalla no anuncia nada. El toast
  es, en varios flujos, el único feedback que existe.

## Scope

### In

**A. `UIService` → `ToastService`, con tres métodos y severidad.** El archivo se mueve de
`src/app/shared/services/ui/ui.service.ts` a `src/app/shared/services/toast/toast.service.ts`, y su `.spec.ts`
hermano con él (`ui.service.spec.ts` → `toast.service.spec.ts`, actualizando el `import`, el `describe` y el
`TestBed.inject`; contenido de test sin agregar — ver *Out of scope*).

```ts
export type ToastSeverity = 'error' | 'success' | 'warning';

export interface Toast {
  message  : string;
  severity : ToastSeverity;
}

const DEFAULT_DURATION : Record<ToastSeverity, number> = {
  success : 3000,
  warning : 4500,
  error   : 6000,
};
```

- `_errorMessage` → `private _toast = signal<Toast | null>(null)`. Pasa a **privado** (hoy es público por
  falta de modificador) y se expone como `public toast = this._toast.asReadonly()`.
- `private timer : any` pasa a `private timer ?: ReturnType<typeof setTimeout>`. El `any` era el tipo de Node,
  no el del browser.
- Tres métodos públicos, arrow-function class properties como el resto del repo:

  ```ts
  showSuccess = ( message : string , duration ?: number ) : void => this.show( message , 'success' , duration );
  showWarning = ( message : string , duration ?: number ) : void => this.show( message , 'warning' , duration );
  showError   = ( message : string , duration ?: number ) : void => this.show( message , 'error'   , duration );
  ```

  `show` queda **privado**: el único punto de entrada público es uno de los tres, así que no existe forma de
  llamar al toast sin declarar la severidad. `duration` sigue siendo sobrescribible por call site, aunque
  ningún call site de esta spec la use.
- **Se borra el guard `if( this.errorMessage() ) return`** (`ui.service.ts:16`). El mensaje nuevo reemplaza al
  visible y reinicia el timer. Es el arreglo del bug que la deuda 16 documentó: en `user-profile-page`, el
  toast de "no pudimos subir la foto" se emitía y nunca se veía porque ya había uno en pantalla. El
  `clearTimeout( this.timer )` que ya existe es lo que vuelve seguro el reemplazo.
- `clearErrorMessage` → `clear`. No tiene llamadores hoy fuera del propio servicio; se conserva público
  porque es la salida de escape si algún flujo futuro necesita bajar el toast antes de su tiempo.

**B. `ModalErrorMessageComponent` → `ToastComponent`.** De
`shared/components/modal-error-message/modal-error-message.component.*` a
`shared/components/toast/toast.component.*`, clase `ToastComponent`, selector **`app-toast`**, y su `.spec.ts`
renombrado igual que el del servicio.

- `errorMessage = computed(...)` → `toast = computed( () => this.toastService.toast() )`. El `effect` que
  sincroniza `fadeAnimation` se conserva tal cual, leyendo `toast()` en vez de `errorMessage()`.
- Se suma un `computed severity` que devuelve `this.toast()?.severity ?? 'error'` — el fallback existe solo
  para el instante en que el toast se está desvaneciendo y el signal ya es `null`: sin él, la banda cambiaría
  de color durante la animación de salida.
- **Icono: tres `<svg>` inline** en un `@switch` sobre la severidad, con `fill="currentColor"` /
  `stroke="currentColor"` para que hereden el color del acento. `assets/warning-white.svg` deja de usarse
  desde este componente (**el archivo no se borra**: `warning.svg` / `warning-white.svg` tienen otros
  consumidores en el repo).
- **ARIA según severidad**: `role="alert"` en `error` y `warning` (interrumpe al lector de pantalla),
  `role="status"` en `success` (lo anuncia sin cortar). Se declaran como atributo bindeado en el `<section>`.
- `NgClass` se conserva para `show`; la clase de severidad se agrega al mismo binding
  (`[ngClass]="{ show : fadeAnimation() }"` + `[class]="severity()"`, o un solo objeto — el detalle lo
  resuelve la implementación).

**C. Una sola instancia, en `app.component.html`.** Se borran las tres instancias redundantes y sus imports:

| Archivo | Qué se borra |
| --- | --- |
| `shared/pages/home/home-page.html:71` | el `<app-modal-error-message />` |
| `shared/pages/home/home-page.ts:10,20` | el `import` y la entrada de `imports` |
| `auth/layout/auth-layout/auth-layout.component.html:64` | el `<app-modal-error-message />` |
| `auth/layout/auth-layout/auth-layout.component.ts:5,9` | el `import` y la entrada de `imports` |
| `auth/layout/password-recovery-layout/password-recovery-layout.component.html:2` | el `<app-modal-error-message />` |
| `auth/layout/password-recovery-layout/password-recovery-layout.component.ts:4,12` | el `import` y la entrada de `imports` |

`app.component.html:6` queda como `<app-toast />` y es la única instancia. Está en el root, fuera del
`<router-outlet>`, así que sigue cubriendo las rutas que montaban su propia copia — incluido el caso de
`reset-password-page.component.ts:68`, que emite el toast de éxito y navega a `/auth/login` en la misma
tanda: con una instancia en el root el mensaje sobrevive la navegación, con una instancia por layout
dependía de que el layout destino también la tuviera.

**D. Rediseño visual: una superficie, tres acentos.** `toast.component.scss` reescrito con tokens de
`@variables`:

- **Superficie única** `#161616` con `$veil-border` y `$shadow-panel`. Es el lenguaje de superficies elevadas
  que el repo ya usa (`CLAUDE.md`: «dark surfaces are elevated with a border, **not** a shadow» — acá lleva
  las dos cosas porque es un overlay flotante sobre contenido claro, no una sección de página).
- **El acento es lo que cambia**: borde izquierdo de 4px y color del icono en `$red-warning`,
  `$green-success` o `$yellow-caution` según la severidad. El texto queda en `$white-custom` en las tres —
  los tres acentos sobre `#161616` se usan como borde e icono, no como color de texto, así que la regla de
  accesibilidad de `variables.scss` (que pide `$brand-color-bright` / `$yellow-caution-deep` para *texto*)
  no aplica acá.
- **Dimensiones por contenido**: `max-width: min(28rem, calc(100vw - 2 * #{v.$space-sm}))` y alto automático,
  en vez de `width: 30%` / `height: 9%`. Dos líneas de texto dejan de desbordarse.
- **Posición sin cambios**: `fixed`, `bottom`/`left`, `z-index: 1000`, misma animación de `translateY` +
  `opacity`. Esta spec no mueve el toast de esquina (ver *Out of scope*).
- **`pointer-events: none` se conserva**: no hay botón de cerrar, así que el toast nunca debe interceptar un
  click del usuario.
- Se suma un bloque `@media (prefers-reduced-motion: reduce)` que anula el `translateY` y deja solo el cambio
  de `opacity`, siguiendo lo que ya hace `@utils/animate-number.ts`.

**E. Los 23 call sites se reclasifican.** Inventario completo y medido — no hay ningún
`showToastMessage` fuera de esta tabla:

| Archivo:línea | Mensaje | Pasa a |
| --- | --- | --- |
| `auth/pages/forgot-password-page/forgot-password-page.component.ts:49` | `'Te enviamos un enlace para recuperar tu contraseña...'` | `showSuccess` |
| `forgot-password-page.component.ts:58` | `getAuthErrorMessage(...)` | `showError` |
| `auth/pages/user-profile-page/user-profile-page.component.ts:89` | `reject(message)`: `INVALID_MEDIA_TYPE_MESSAGE` y `'La imagen supera los 2 MB...'` | `showWarning` |
| `user-profile-page.component.ts:131` | `'No pudimos eliminar la foto. No guardamos los cambios.'` | `showError` |
| `user-profile-page.component.ts:179` | `'Tu sesión expiró. Ingresá de nuevo...'` | `showError` |
| `user-profile-page.component.ts:183` | `getAuthErrorMessage(...)` | `showError` |
| `user-profile-page.component.ts:194` | el `message` que recibe `finishProfileSave` | **según el caso** (ver abajo) |
| `user-profile-page.component.ts:220` | `'Contraseña actualizada.'` | `showSuccess` |
| `user-profile-page.component.ts:232` | `getAuthErrorMessage(...)` | `showError` |
| `auth/pages/reset-password-page/reset-password-page.component.ts:68` | `'Contraseña actualizada. Ingresá con tu nueva contraseña.'` | `showSuccess` |
| `reset-password-page.component.ts:78` | `CONNECTION_ERROR_MESSAGE` | `showError` |
| `auth/components/email-verification-banner/email-verification-banner.component.ts:49` | `'Te enviamos un email para validar tu cuenta...'` | `showSuccess` |
| `email-verification-banner.component.ts:58` | `getAuthErrorMessage(...)` | `showError` |
| `teacher-request/pages/become-teacher-page/become-teacher-page.component.ts:72` | `'Recibimos tu solicitud. Te avisamos por correo.'` | `showSuccess` |
| `become-teacher-page.component.ts:73` | `'No pudimos enviar tu solicitud, intentá nuevamente.'` | `showError` |
| `course/components/form-course/steps/course-step-data/course-step-data.component.ts:56` | `'No pudimos crear el curso. Probá de nuevo.'` | `showError` |
| `course-step-data.component.ts:72` | `'Cambios guardados.'` | `showSuccess` |
| `course-step-data.component.ts:74` | `'No pudimos guardar los cambios. Probá de nuevo.'` | `showError` |
| `course-step-data.component.ts:89` | `'No pudimos eliminar el curso. Probá de nuevo.'` | `showError` |
| `lesson/components/form-lesson/form-lesson.component.ts:51` | `'No pudimos guardar la lección. Probá de nuevo.'` | `showError` |
| `lesson/components/slider-content-manager/slider-content-manager.component.ts:50` | `'No pudimos cargar las lecciones del curso.'` | `showError` |
| `slider-content-manager.component.ts:93` | `'Debes crear un modulo antes de crear una lección'` | `showWarning` |
| `slider-content-manager.component.ts:139` | `'Debes crear el curso antes de agregar un módulo'` | `showWarning` |

Total: 6 `showSuccess`, 13 `showError`, 3 `showWarning` y un caso condicional. Ese caso es
**`finishProfileSave( user : User , message : string )`** (`user-profile-page.component.ts:188-195`), que
recibe el texto por parámetro y lo usa para **dos desenlaces distintos**: `'Perfil actualizado.'` (L154 y
L165, éxito) y `'Perfil actualizado, pero no pudimos subir la foto.'` (L167, el guardado salió a medias). La
firma pasa a `finishProfileSave( user : User , message : string , severity : ToastSeverity )` y los tres
llamadores pasan `'success'`, `'success'` y `'warning'` respectivamente. Clasificar el helper entero como
éxito volvería a pintar de verde el caso en que la foto no se subió, que es exactamente el bug de feedback
que la SPEC 16 arregló en ese mismo método.

Los 23 call sites también cambian el nombre del símbolo inyectado: `inject(UIService)` → `inject(ToastService)`
y el campo `uiService` → `toastService`. En `slider-content-manager.component.ts:33` el campo es **público**
(`uiService = inject(UIService)`); se conserva público para no tocar su template si lo usa, pero se renombra
igual.

### Out of scope

- **Cola o stack de toasts.** El nuevo reemplaza al visible, y con eso alcanza para el bug reportado. Una
  cola real (array de pendientes, uno visible a la vez) o un stack (varios simultáneos apilados) son una
  máquina de estados nueva y, en el caso del stack, un layout nuevo. Si aparece un flujo que emite dos
  mensajes legítimos seguidos y pierde uno, va en su propia spec.
- **Botón de cerrar.** Implica quitar `pointer-events: none` del contenedor, un `focus-ring`, área táctil y
  decidir si el timer se pausa al hover. Las duraciones por severidad cubren el motivo real (un error
  necesita más tiempo de lectura) sin esa superficie.
- **Mover el toast de esquina.** Sigue abajo a la izquierda, con la misma animación. Cambiar la posición es
  una decisión de layout que no tiene nada que ver con la severidad, y mezclarla haría imposible verificar
  que el rediseño visual no rompió nada.
- **Una cuarta severidad `info`.** Ningún call site la necesita hoy; nacería sin consumidor, que es
  exactamente lo que la SPEC 17 borró en otros lugares del repo.
- **Revisar si el toast es el canal correcto en cada uno de los 23 lugares.** Esta spec clasifica lo que ya
  se emite; no mueve ningún mensaje a una banda inline ni lo borra. El caso más dudoso está documentado: la
  deuda 16 (`3.5`) anota que el `'Recibimos tu solicitud. Te avisamos por correo.'` de `become-teacher` es
  redundante con el panel que cambia a `pending`. Se deja y se reclasifica a `success`.
- **El `'Perfil actualizado, pero no pudimos subir la foto.'` como flujo.** Se reclasifica a `warning` y nada
  más: que el guardado quede a medias sin posibilidad de reintentar la foto es un problema de flujo, no de
  toast.
- **Tests.** `ng test` no compila en este repo desde antes (`angular.json` referencia `@videojs/themes`, que
  no está instalado — ver `CLAUDE.md`), y ocho especificaciones tienen imports rotos. Los dos `.spec.ts` que
  esta spec toca se renombran y se les corrigen los imports para **no sumar un noveno**, pero no se les
  agrega contenido. La verificación es `npm run build` y un pase manual.

## Data model

Esta spec no introduce estructuras persistidas ni toca ningún DTO. Los símbolos nuevos son todos de UI y
viven en `shared/services/toast/toast.service.ts`:

- `ToastSeverity` = `'error' | 'success' | 'warning'`. Vive en el propio servicio y no en un
  `*.model.ts`: no cruza la frontera del backend, así que no le corresponde la convención de la SPEC 15,
  y `shared/models/api.response.ts` está reservado al sobre genérico de API (la SPEC 15 lo dice explícito).
- `Toast` = `{ message : string; severity : ToastSeverity }`. El signal pasa de `string | null` a
  `Toast | null`, que es lo que vuelve imposible tener un mensaje sin severidad.
- `DEFAULT_DURATION : Record<ToastSeverity, number>` — constante privada del módulo. `Record` sobre la unión
  es lo que obliga a que una severidad nueva declare su duración en vez de caer en un default silencioso.

Firmas que cambian:

| Símbolo | Hoy | Después |
| --- | --- | --- |
| `UIService` | `shared/services/ui/ui.service.ts` | `ToastService` en `shared/services/toast/toast.service.ts` |
| `UIService._errorMessage` | `signal<string \| null>`, público | `private _toast : signal<Toast \| null>` |
| `UIService.errorMessage` | `Signal<string \| null>` | `toast : Signal<Toast \| null>` |
| `UIService.showToastMessage` | `( message , duration = 3500 ) : void` | **borrado**, reemplazado por `showSuccess` / `showWarning` / `showError`, cada uno `( message : string , duration ?: number ) : void` |
| `UIService.clearErrorMessage` | `() : void` | `clear() : void` |
| `ModalErrorMessageComponent` | selector `app-modal-error-message` | `ToastComponent`, selector `app-toast` |
| `user-profile-page.finishProfileSave` | `( user , message ) : void` | `( user , message , severity : ToastSeverity ) : void` |

**Corte limpio, sin alias de compatibilidad**: `showToastMessage` se borra en el mismo paso en que nacen los
tres métodos. Es el mismo criterio que usaron las SPEC 15 y 17 («el compilador es el checklist»): un alias
deprecado deja la puerta abierta a emitir un toast sin severidad, que es justo lo que esta spec elimina.

## Implementation plan

1. **Una sola instancia del componente.** Borrar los tres `<app-modal-error-message />` redundantes de
   `home-page.html`, `auth-layout.component.html` y `password-recovery-layout.component.html`, más sus
   `import` y sus entradas de `imports`. Commit propio y primero, porque es el único paso que se verifica
   mirando una pantalla sin haber tocado todavía ningún tipo: con el código de hoy, un toast en `/` y en
   `/auth/login` tiene que pasar de dos bandas superpuestas a una. `npm run build` limpio.

2. **El servicio.** Mover `ui.service.ts` a `shared/services/toast/toast.service.ts` con su `.spec.ts`;
   declarar `ToastSeverity`, `Toast` y `DEFAULT_DURATION`; pasar el signal a `Toast | null` y a privado;
   escribir los tres métodos públicos sobre un `show` privado; borrar el guard de descarte; renombrar
   `clearErrorMessage` a `clear` y tipar el `timer`. El build **rompe acá a propósito** en los 23 call sites
   y en el componente: esa lista de errores es el checklist de los pasos 3 y 4.

3. **El componente.** Mover a `shared/components/toast/toast.component.*` con su `.spec.ts`, renombrar clase
   y selector, leer `toast()` y `severity()`, reemplazar el `<img>` por el `@switch` con los tres SVG inline,
   bindear el `role`, y reescribir el SCSS con los tokens de `@variables`, la superficie única, el acento por
   severidad, el dimensionado por contenido y el bloque de `prefers-reduced-motion`. Reapuntar
   `app.component.ts` / `app.component.html`. Probar las tres severidades a mano antes de tocar los call
   sites: alcanza con llamar temporalmente a los tres métodos desde `app.component`, verificar color, icono y
   que un mensaje de dos líneas no se desborde, y borrar la llamada.

4. **Los 23 call sites, feature por feature**, siguiendo la tabla del punto E: `auth` (forgot, reset,
   email-verification-banner, user-profile), `teacher-request`, `course` y `lesson`. En `user-profile-page`,
   sumar el tercer parámetro a `finishProfileSave` y pasar `'warning'` en el llamador de la foto que falló
   (L167). `npx tsc -p tsconfig.app.json --noEmit` limpio al cerrar el paso.

5. **Cierre.** Verificar con `grep` que no queda ninguna referencia a `UIService`, `showToastMessage`,
   `modal-error-message` ni `app-modal-error-message`; `npm run build`; y el pase manual con el backend
   corriendo de los flujos de la tabla.

## Acceptance criteria

- [ ] `grep -rn "UIService\|showToastMessage\|clearErrorMessage\|errorMessage" src/app` no devuelve nada
      relacionado con el toast (`errorMessage` puede seguir apareciendo en otros contextos, p. ej. mensajes de
      error de formularios, pero no como señal del toast).
- [ ] `grep -rn "modal-error-message\|ModalErrorMessageComponent" src/` no devuelve nada.
- [ ] `grep -rn "app-toast" src/app --include=*.html` devuelve **exactamente una** línea:
      `app.component.html`.
- [ ] `toast.service.ts` exporta `ToastSeverity`, `Toast`, `showSuccess`, `showWarning`, `showError`, `toast`
      y `clear`, y **no** exporta `show`: no existe forma pública de emitir un toast sin declarar severidad.
- [ ] El signal del servicio es `private _toast` y se expone solo como `asReadonly()`.
- [ ] `DEFAULT_DURATION` es un `Record<ToastSeverity, number>`: agregar una severidad a la unión sin darle
      duración no compila.
- [ ] Un toast de éxito se ve verde con icono de check, uno de advertencia ámbar, uno de error rojo — los
      tres sobre la misma superficie oscura, con el texto legible en los tres.
- [ ] El icono es un `<svg>` inline con `currentColor`: `grep -n "warning-white.svg" src/app/shared/components/toast`
      no devuelve nada. Los assets `warning.svg` / `warning-white.svg` siguen existiendo en `public/assets/`.
- [ ] Un mensaje de dos líneas (p. ej. `'Te enviamos un enlace para recuperar tu contraseña. Revisá tu
      bandeja de entrada.'`) se renderiza completo, sin desbordarse ni recortarse, en viewport de 360px y de
      1366px.
- [ ] El `<section>` declara `role="alert"` con severidad `error` o `warning`, y `role="status"` con
      `success`.
- [ ] Emitir un toast mientras hay otro visible **reemplaza** el visible y el nuevo dura su tiempo completo.
      Verificable en el flujo real: guardar el perfil con una foto que el backend rechaza muestra
      `'Perfil actualizado, pero no pudimos subir la foto.'` en **ámbar** — hoy ese mensaje se emite y nunca
      se ve.
- [ ] Un error dura más en pantalla que un éxito (6000ms contra 3000ms), medible a ojo en dos flujos
      consecutivos.
- [ ] En `/` y en `/auth/login` se renderiza **un** toast, no dos superpuestos.
- [ ] El toast de `'Contraseña actualizada. Ingresá con tu nueva contraseña.'` de `reset-password-page` sigue
      visible después de la navegación a `/auth/login`.
- [ ] `finishProfileSave` recibe la severidad por parámetro y sus tres llamadores pasan `'success'`,
      `'success'` y `'warning'`.
- [ ] Las tres advertencias son ámbar y no rojas: elegir un `.pdf` como avatar, intentar crear una lección
      sin módulos y agregar un módulo sin curso creado.
- [ ] Con `prefers-reduced-motion: reduce` activado, el toast aparece sin desplazamiento vertical.
- [ ] `npx tsc -p tsconfig.app.json --noEmit` limpio.
- [ ] `npm run build` sin errores ni warnings **nuevos**. El error preexistente de
      `user-profile-page.component.scss` (9.91 kB contra un budget de 8 kB, documentado en la deuda 16 como
      previo a esa spec) sigue ahí y no lo causa este trabajo; `toast.component.scss` tiene que quedar bien
      por debajo del warning de 4 kB.
- [ ] Pase manual con el backend corriendo de los flujos de la tabla del punto E: recuperar contraseña,
      resetear contraseña, validar email, guardar perfil (con foto, sin foto y con foto que falla), cambiar
      contraseña (bien y con la actual equivocada), enviar solicitud de profesor, crear/editar/eliminar un
      curso y guardar una lección.

## Decisiones

- **Sí:** tres severidades, `error` / `success` / `warning`. No es una elección de catálogo: es el
  inventario medido de los 23 call sites (13 fallos, 6 éxitos, 3 precondiciones que el usuario puede
  resolver, más uno condicional). `'Debes crear un modulo antes de crear una lección'` no es un fallo —
  nada se rompió — y pintarlo de rojo es la misma clase de mentira que pintar de rojo
  `'Contraseña actualizada.'`. Los tres mapean a tokens que `variables.scss` ya tiene.
- **No:** una cuarta severidad `info`. Ningún mensaje de hoy la necesita, y la SPEC 17 pasó un paso entero
  borrando tipos y métodos que nacieron sin consumidor (la cadena issuer, los tres `map*Array`, `LessonDto`).
  Agregar uno a sabiendas sería reabrir eso.
- **Sí:** tres métodos dedicados (`showSuccess` / `showWarning` / `showError`) y un `show` privado, en vez de
  un método público con la severidad como parámetro. El call site declara la intención sin repetir un literal
  de unión, y lo más importante: **no existe la forma de llamar al toast sin severidad**. Con un único
  `showToast( message , severity = 'error' )`, el default seguiría permitiendo el estado de hoy — un éxito
  emitido como error por omisión — y los 23 call sites había que reescribirlos de todos modos.
- **No:** un objeto de configuración (`showToast({ message, severity, duration })`). Es extensible sin romper
  la firma, pero ningún otro servicio del repo usa ese patrón y el precio se paga en 23 call sites más
  verbosos para una extensibilidad que esta spec no necesita.
- **Sí:** el signal pasa de `string | null` a `Toast | null`. Dos signals paralelos (`message` y `severity`)
  pueden quedar desincronizados durante la animación de salida, que es exactamente cuando el color importa;
  un solo objeto los hace imposibles de separar.
- **Sí:** borrar el guard de descarte y que el mensaje nuevo reemplace al visible. Es el bug que la deuda 16
  documentó con un caso real y observado — el toast de "no pudimos subir la foto" nunca llega a la pantalla —
  y el arreglo es borrar una línea, porque el `clearTimeout` que vuelve seguro el reemplazo ya está escrito.
- **No:** una cola ni un stack. Las dos resuelven un problema que todavía no se observó (dos mensajes
  legítimos seguidos, los dos necesarios) y la segunda además rehace el layout. El reemplazo es el
  comportamiento menos sorprendente: el toast dice lo último que pasó.
- **Sí:** renombrar servicio, componente, archivos y signal. Es el renombre más grande que esta spec hace y
  se podría evitar, pero dejar un `UIService.errorMessage` que transporta `severity: 'success'` es la misma
  clase de tipo que miente que la SPEC 17 corrigió en `AuthResponse` (que embutía el modelo interno) y en las
  defensas `??` sobre campos requeridos. Además `UIService` es un nombre que invita a que le cuelguen
  cualquier estado de UI; `ToastService` dice qué hace y qué no.
- **Sí:** corte limpio, sin dejar `showToastMessage` como alias de `showError`. Un alias conservaría un punto
  de entrada que emite toasts sin severidad declarada, que es el estado que esta spec existe para cerrar. El
  precedente del repo es el mismo (SPEC 15 y 17: el símbolo se borra en el mismo paso en que nace el nuevo, y
  el compilador es el checklist).
- **Sí:** `ToastSeverity` y `Toast` viven en el propio `toast.service.ts`. La convención de la SPEC 15
  (`<feature>/models/<name>.model.ts`) existe para los tipos que cruzan la frontera del backend —
  modelo, request y response. Un tipo de UI que solo leen el servicio y su componente no gana nada en un
  archivo aparte, y `shared/models/api.response.ts` está explícitamente reservado al sobre genérico.
- **Sí:** una sola instancia del componente, la de `app.component.html`. Las otras tres no agregan nada
  —el servicio es singleton y el root está fuera del `<router-outlet>`— y hoy producen dos bandas
  superpuestas en `/` y en `/auth/*`. El arreglo va primero y en su propio commit porque es verificable sin
  haber cambiado ningún tipo todavía.
- **Sí:** superficie oscura única con acento por severidad, en vez de intercambiar tres fondos opacos. Un
  bloque verde al 85% de opacidad y 30% del ancho de pantalla para decir "Cambios guardados." es más
  agresivo que el error que hoy sale igual. Con una superficie neutra el peso visual es el mismo en las tres
  severidades y lo que cambia es la señal, que es lo que la severidad tiene que comunicar.
- **Sí:** SVG inline con `currentColor` en vez de tres assets. El icono tiene que tomar el color del acento,
  y un `.svg` servido como `<img>` no hereda `currentColor` — habría que duplicar cada archivo por color o
  recurrir a filtros CSS. Inline son tres `<path>` en el template, cero requests y el color sale del mismo
  lugar que el borde.
- **No:** quitar el icono y dejar solo el color. El color como único portador de la severidad falla para
  usuarios con daltonismo, y rojo/verde es justamente el par que más se confunde.
- **Sí:** `role="alert"` en error y warning, `role="status"` en success. Un fallo tiene que interrumpir al
  lector de pantalla porque el usuario necesita saberlo antes de seguir; un `'Cambios guardados.'` no debería
  cortar lo que esté escuchando. Es un atributo más en el `@switch` que ya decide el icono, así que la
  distinción no cuesta nada.
- **Sí:** duración por severidad (3000 / 4500 / 6000) manteniendo `duration` sobrescribible. Un error suele
  ser más largo y el usuario necesita leerlo entero, a veces para copiarlo; un éxito lo confirma de un
  vistazo. El `Record<ToastSeverity, number>` deja la tabla en un solo lugar.
- **No:** botón de cerrar. Obligaría a quitar `pointer-events: none` del contenedor —el toast pasaría a poder
  tapar un click en la esquina inferior izquierda— y arrastra focus-ring, área táctil y la pregunta de si el
  timer se pausa al hover. Las duraciones por severidad cubren el motivo real por el que alguien querría
  cerrarlo.
- **Sí:** reclasificar los 23 call sites en esta spec, no en otra. Dejar los 23 llamando a `showError` haría
  nacer la severidad sin un solo consumidor, y los 23 `subscribe` hay que tocarlos igual por el renombre del
  símbolo inyectado. Dejarlos sería elegir mantener los seis éxitos en rojo a propósito.
- **Sí:** `finishProfileSave` recibe la severidad por parámetro, en vez de clasificarse entero como éxito. Es
  el único helper del repo que emite el toast con un mensaje que le llega de afuera, y sus tres llamadores no
  comparten desenlace: uno de ellos es el guardado a medias. Fijarlo en `'success'` volvería a festejar un
  fallo parcial, que es el bug de feedback que la SPEC 16 arregló en ese mismo método.
- **No:** revisar si el toast es el canal adecuado en cada lugar. La SPEC 16 ya decidió caso por caso qué va
  a banda inline, qué a toast y qué a `/error`; esta spec clasifica lo que esa decisión dejó en el toast. El
  único caso que la deuda ya marcó como discutible (`3.5`, el éxito redundante de `become-teacher`) queda
  anotado y sin tocar.
- **Sí:** dimensionar por contenido (`max-width` + alto automático) en vez de `width: 30%` / `height: 9%`. El
  alto en porcentaje del viewport recorta cualquier mensaje de dos líneas, y ya hay varios en la tabla. El
  repo además tiene tokens fluidos (`$space-*`) para exactamente esto.

## Risks

| Riesgo | Mitigación |
| --- | --- |
| Borrar las tres instancias redundantes deja alguna ruta sin toast | La instancia de `app.component.html:6` está en el root, fuera del `<router-outlet>`, así que cubre toda la app por construcción. El paso va primero y aislado, y hay un criterio de aceptación que lo prueba en `/` y en `/auth/login` — las dos rutas que hoy montan una copia propia. |
| El renombre de 23 call sites se come alguno y queda un `showToastMessage` colgado | Imposible que compile: `showToastMessage` se borra en el paso 2, así que TypeScript en `strict` marca los 23. El `grep` del cierre es la segunda red, no la primera. |
| El rediseño visual rompe la animación o la posición y el toast queda tapado por el panel del carrito (`z-index`) o por el header | Posición, `z-index: 1000` y la animación de `translateY` + `opacity` se conservan textualmente; lo que cambia es superficie, acento, icono y dimensionado. El paso 3 se prueba a mano con las tres severidades antes de tocar un solo call site. |
| El acento sobre la superficie oscura no alcanza el contraste AA | El texto va en `$white-custom` sobre `#161616` en las tres severidades (la combinación que el repo ya usa en sus superficies oscuras); los tres acentos se usan como **borde e icono**, no como color de texto, que es la distinción que `variables.scss` documenta para `$yellow-caution` y `$brand-color`. |
| Que el mensaje nuevo reemplace al visible hace parpadear dos toasts en un flujo que emite dos seguidos | Es el comportamiento buscado y el arreglo de un bug reportado. El único flujo conocido que emite dos es `onSaveProfile` cuando falla la foto, y ahí el segundo mensaje es justamente el que hoy se pierde. Si aparece otro, la cola va en su propia spec. |
| `toast.component.scss` rompe el budget de 4 kB | El archivo de hoy son ~60 líneas; el rediseño suma el `@switch` de acentos y el bloque de `prefers-reduced-motion`, no un layout nuevo. Hay criterio de aceptación explícito. |
| Los dos `.spec.ts` renombrados suman una novena especificación que no compila | Son los dos specs autogenerados y vacíos del scaffold: el renombre es `import`, `describe` y `TestBed`, nada más. `ng test` no corre en este repo de todos modos (`@videojs/themes` no está instalado), así que la verificación real es `tsc --noEmit`, que sí los incluye vía `tsconfig.spec.json`. |
| `slider-content-manager.component.ts:33` expone el servicio como campo público, así que podría estar usándose desde su template | Se conserva público con el nombre nuevo. Si el template lo referencia, `strictTemplates` falla en el build del paso 4 y el renombre se completa ahí. |

## Lo que esta spec **no** hace

- Cola ni stack de toasts: el nuevo reemplaza al visible.
- Botón de cerrar, pausa al hover ni toast persistente.
- Mover el toast de esquina ni rehacer su animación de entrada/salida.
- Una severidad `info`.
- Revisar si el toast es el canal correcto en cada uno de los 23 lugares, ni borrar el éxito redundante de
  `become-teacher` (deuda 16, `3.5`).
- Arreglar que el guardado de perfil pueda quedar a medias sin reintento de la foto.
- Arreglar el target `ng test` ni las ocho especificaciones con imports rotos.
- Arreglar el budget de `user-profile-page.component.scss`, que ya rompe el build desde antes.

Cada uno, si se necesita, va en su propia spec.
