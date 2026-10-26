# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Angular 20 (standalone components, no NgModules anywhere) e-commerce-style course platform ("Udemix Learning"): browse/create/enroll in courses, cart, checkout via MercadoPago, video lessons via video.js, email/password + Google OAuth login. Personal portfolio playground.

Backend is a separate repo (`seminario-angular-backend`, not in this workspace) — without it running, auth/login/course-creation/image-upload flows won't work; the app falls back to mocked data for browsing. Backend setup: clone it, `npm install`, create `.env` from `env.template`, `npm run dev` (serves on `localhost:4201`).

Runtime dependencies are deliberately few: Angular + `rxjs`, `video.js`, `@mercadopago/sdk-js`. No UI kit, no state library, no HTTP wrapper — don't add one without asking.

**Language**: code comments, spec docs and UI copy are in Spanish. Keep writing them in Spanish.

## Commands

- `npm start` / `ng serve` — dev server, `development` configuration (swaps in `environment.development.ts`, HMR off)
- `npm run build` — production build to `dist/seminario-angular`
- `npm run watch` — dev build with `--watch`
- `npm test` / `ng test` — Karma/Jasmine (`@angular/build:karma`)
  - Headless single run: `npx ng test --watch=false --browsers=ChromeHeadless`
  - Run a single spec: scope with `fdescribe`/`fit` in the spec file — this Karma config has no file-filter flag
- No lint script and no ESLint config in the repo.

**`ng test` currently fails to build** (pre-existing, not caused by your change). Unresolved imports: `shared/pages/explore/explore-page.spec.ts`, `shared/pagination/services/pagination.service.spec.ts`, the `enrollment-card` spec, and a `lesson-form-state` spec — all point at moved/renamed files; plus `angular.json`'s test `styles` references `node_modules/@videojs/themes/dist/fantasy/index.css`, a package that isn't in `package.json`. Fix those spec paths and drop/install the theme before trusting test output.

## Conventions

Files are `<name>.component.ts|html|scss` (+ `.spec.ts`), class `<Name>Component`, selector `app-<name>`; services `<name>.service.ts`, state `<name>-state.ts`. Standalone is implicit — no component declares `standalone: true`. DI is always `inject()`, never constructor params. Public service methods are frequently arrow-function class properties.

**Page naming drift**: older features name pages `<name>-page.component.ts` / class `<Name>PageComponent` (e.g. `teacher-request/pages/become-teacher-page/`), newer ones drop the `.component` infix and the class suffix — `payment/pages/buy/buy-page.ts` → `class BuyPage`, `shared/pages/not-found/not-found-page.ts`. Follow whichever the feature you're touching already uses; don't rename across the board.

**Schematics gotcha**: `angular.json` sets `standalone: false` for the component/directive/pipe schematics, so `ng generate component` emits NgModule-style code that matches nothing in this codebase. Write components by hand or strip the flag afterwards.

## Architecture

**Feature-folder structure**, per Angular's official style guide. Each feature under `src/app/<feature>/` typically contains its own `components/`, `pages/`, `services/`, `models/`, `state/`, and sometimes `guards/`, `resolver/`, `interceptors/`, `layout/`, `utils/`. Features: `auth`, `cart`, `category`, `course`, `enrollment`, `file`, `lesson`, `module`, `payment`, `shared`, `teacher-request`, `user`, plus top-level `mappers/` and `utils/`.

**Path aliases** (see `tsconfig.json`) — always prefer these over relative imports across features: `@auth/*`, `@course/*`, `@cart/*`, `@category/*`, `@enrollment/*`, `@file/*`, `@lesson/*`, `@module/*`, `@payment/*`, `@teacher-request/*`, `@user/*`, `@utils/*`, `@shared/*`, `@mappers/*`, `@guards/*`, `@interfaces/*` (aggregates model dirs from course/auth/module/lesson), `@variables` (→ `src/variables.scss`).

**Routing**: `app.routes.ts` is the root route table; each feature with routes exports its own `<feature>.routes.ts` (default export) lazy-loaded via `loadChildren`. Router is configured with `withComponentInputBinding()` and scroll-position restoration, so route params/data arrive as component inputs. Guards use the functional `CanMatchFn`/`CanActivateFn` style; route data resolvers live in each feature's `resolver/` dir. The `**` wildcard renders the 404 page (`loadComponent` of `@shared/pages/not-found/not-found-page`, which is an `export default class NotFoundComponent`) instead of redirecting to home.

**State management**: no NgRx/store library — plain Angular `signal`/`computed`/`effect`/`linkedSignal` in `@Injectable({providedIn:'root'})` services. Many features extend the generic base class `src/app/shared/state/state.ts` (`State<T>`), which wraps state in `{ isLoading, error, data }`, provides `handleError`/`setIsLoading`/`resetState`, and auto-calls `resetState()` via an `effect` whenever `UserState.user()` goes null (so logout clears all feature state for free). Feature state services (e.g. `course/state/course-state.ts`) extend `State<FeaturePropsInterface>` and add feature-specific signals on top.

**Auth/session**: `UserState` (`@user/state/user-state.ts`) is the single session holder — private `_user`/`_token`/`_authStatus` signals exposed as `computed`s, token mirrored to `localStorage` under the key `x-token`, plus the profile `FormGroup`. `authStatus` is derived: `'checking' | 'authenticated' | 'not-authenticated'`. `AuthService.checkStatusResource` is an `rxResource` that hits `/auth/renew` the first time the service is injected; the auth guards deliberately ignore `authStatus === 'checking'` and wait for a real transition, so **every error path in `AuthService.handleAuthError` must settle `authStatus`** or the guards hang forever (see `specs/06-*`).

**OAuth**: `AUTH_PROVIDER` (`auth/auth.provider.ts`) is an `InjectionToken<AuthProvider>` wired in `app.config.ts` to `GoogleAuthService` — add further providers behind that interface (`ready`/`prepare`/`signIn`/`onCode`) instead of injecting a concrete service. `GoogleAuthService` lazily injects Google's GSI script and runs `initCodeClient` in popup mode; the auth code is exchanged server-side via `POST /auth/login/google`. Note: it imports `environments/environment.development` directly rather than `environment`, so the dev client id ships in production builds too.

**Course cards**: `course-mini-card` was renamed/replaced by `course-catalog-card` (`course/components/course-catalog-card/`), paired with a `course-catalog-card-skeleton` loading placeholder — used by `explore-page`/carousels instead of the old mini-card.

**Teacher request**: `/become-teacher` was fully redesigned in `specs/10-*`. `TeacherRequestState` is wired (`myRequestResource` `rxResource` over `getMyTeacherRequest()`, `myRequest`/`isLoading` computeds, `submitRequest()` that `reload()`s on success, plus an `isSubmitting` signal for double-submit protection). The page switches between two layout families: blocking heroes (`role !== 'student'`, email not verified) and a two-column shell whose right panel swaps `teacher-request-form` ↔ `teacher-request-status` (pending/approved/rejected). The DTO shape (`categoryIds`, `aboutYou`, `experienceLevel`, `courseTitle`, `courseSummary`, `portfolioUrl`) is a **contract change the backend may not have yet** — the old `experience`/`motivation`/`courseIdea` fields are gone from this repo. `category-multiselect-dropdown` lives under `teacher-request/components/` on purpose; it's not meant as a reusable control.

**API/DTO boundary**: raw HTTP responses are never used directly in components — each feature that talks to the backend has a corresponding class in `src/app/mappers/` (e.g. `CourseMapper`, `AuthMapper`) that translates between backend shapes (`*Response`/`*DTO` types in feature `models/`) and app-internal model types. Follow this mapper pattern when adding new API integrations.

**HTTP**: `provideHttpClient(withFetch(), withInterceptors([authInterceptor]))`. `authInterceptor` (`auth/interceptors/auth.interceptor.ts`) attaches `Authorization: Bearer <token>` from `UserState`'s token signal when present. `environment.ts` / `environment.development.ts` hold `apiURL`, `MERCADOPAGO_PUBLIC_KEY` and `GOOGLE_CLIENT_ID`; the dev build swaps the file via `fileReplacements`.

**Cart**: `CartService` (`cart/state/cart.service.ts`) holds a `Cart` model (`Map<courseId, CartItem>`, quantity always 1 — no cupo selector and no coupon anywhere anymore, see `specs/09-*`), persists it to `localStorage` under the key `cart` via an `effect`, and recomputes `total` in a second `effect` that POSTs the items to `PaymentService.calculateTotal` (`payments/total`) — the total is always server-side, never summed in the client. `getItemsArray()` is the one place that maps `CartItem` → the backend's `ItemQuantity` shape (`id_course`/`title`/`unit_price` as string/`quantity`); every payment payload goes through it. `cart.component` renders as a full-height side panel (fixed, anchored right, `100vh`, see `specs/08-*`) using `CartPanelItemComponent`; its total animates via `animateNumber` (`@utils/animate-number.ts`, rAF tween, respects `prefers-reduced-motion`) into a local `animatedTotal` signal driven by an `effect` watching `cartService.total()`, while `subtotal` is a local `computed` off `cart().calculateTotal()`.

**Checkout flow**: `/payment/buy` is a 3-step wizard — `BuyPage` is the shell (`PageTitleComponent` + `CheckoutStepsComponent` + `<router-outlet>`) with children `cart` (default redirect) → `pay` → `confirmation`. `AuthenticatedGuard` protects the whole `buy` branch; `CartNotEmptyGuard` (`payment/guards/`) bounces `pay` back to `buy/cart` when the cart is empty. `PurchaseSummaryComponent` is the shared summary aside on `cart`/`pay`. `BuyConfirmationPage` reads the payment response from `history.state['payment']` (passed via `router.navigate(..., { state })`, deliberately not query params) and must handle `null` — a refresh loses it, which renders the "unknown" state rather than assuming success.

**MercadoPago (Fields API)**: `CheckoutFormState` (`payment/state/checkout-form-state.ts`) owns the whole SDK lifecycle: `loadMercadoPago()` + `new window.MercadoPago(publicKey)` in `initialize()`, then `mountFields()` creates/mounts the three secure iframes (`cardNumber`/`expirationDate`/`securityCode`) into DOM ids the component passes in. `FormCardCheckoutComponent` only owns the cardholder `FormGroup` and calls `initialize()`/`mountFields()` in `ngAfterViewInit` and `unmountFields()` in `ngOnDestroy` — **always unmount**, remounting over live fields breaks the SDK. All of `CheckoutFormState`'s state is `private _x = signal()` + `public x = computed(this._x)`; the only writes from outside go through `setAmount()` and `selectInstallments()`, and the component calls `reset()` in `ngOnDestroy` because the service is `providedIn: 'root'` and would otherwise carry the amount/error into the next checkout. The card number field's `binChange` event drives `mp.getPaymentMethods({bin})` then `mp.getInstallments({amount, bin})` to fill `paymentMethod`/`installmentOptions` signals; `submit()` calls `mp.fields.createCardToken(...)` and POSTs the order via `PaymentService.createOrder` (`orders/`) — **never log that payload**, it carries the card token, email and ID number. The SDK only ships types for `loadMercadoPago()`, so everything hanging off `window.MercadoPago` is hand-typed in `payment/models/mercadopago-fields.interface.ts` (`MPFieldInstance`, `MPPaymentMethodResult`, `MPPayerCost`) — extend that file instead of widening `any`. Field styling must be JS literals (`MP_FIELD_STYLE`) that mirror `variables.scss` tokens: the iframe can't read SCSS, custom properties or `clamp()`. `PaymentService.getAllPaymentMethods` is dead in this flow (methods are resolved client-side from the BIN).

**Order contract** (verified against `udemix-backend` `64ca194`): `POST /api/orders/` is a **single step** — the backend validates the flat body (`items`, `token`, `payment_method_id`, `payment_method_type`, `installments`, `payer`) with `OrderRequestAdapterDto.create`, recomputes the total from DB prices, creates the MercadoPago order, and creates the enrollments synchronously when the gateway returns `status === 'processed'`. There is no `orders/:id/pay`. The response is `ApiResponse<OrderUniqueResponse>` (the persisted payment: `id`, `id_payment` = MP order id, `status` = raw gateway status); `OrderMapper` (`mappers/order.mapper.ts`) translates it into the internal `Order` with `OrderStatus` = `'approved' | 'pending' | 'rejected' | 'unknown'`, which is what `BuyConfirmationPage` branches on. The backend's webhook (`POST /api/orders/notifications`) exists but isn't registered in the MercadoPago panel yet, so ticket payments (Rapipago/Pago Fácil) never get fulfilled.

## Styling

Global `src/styles.scss`; per-component `.scss`, plus shared partials (`shared/styles/`, `auth/form-global.scss`) pulled in via `styleUrls`. `src/variables.scss` is the design-token source — import with `@use '@variables' as v;` and use its tokens rather than literals:

- Colors/fonts: `$brand-color`, `$white-custom`, `$black-custom`, `$red-warning`, `$green-success`, `$yellow-caution`, `$font-brand`, `$font-primary`
- Breakpoints: `$breakpoints` map (`sm` 640, `md` 768, `lg` 1024, `xl` 1280, `laptop` 1366) consumed via the `bp-up($name)` / `bp-down($name)` mixins
- Fluid scales (`clamp()`, interpolated 320px→1280px viewport): `$text-sm`…`$text-display`, `$space-xs`…`$space-lg`

Production budgets: 4kB warning / 8kB error per component stylesheet, 500kB/1MB initial bundle.

## Specs workflow

Feature work is tracked as numbered spec docs under `specs/NN-slug.md` (Spanish, with a `Status`/`Depends on`/`Date`/`Objective` header and explicit In / Out-of-scope lists); `NN-slug-deuda-tecnica.md` companions record the tech debt each spec knowingly leaves behind. `specs/.spec-config.yml` has `AutoCreateBranch: true`, so the spec-implementation flow creates and switches to a `spec-NN-slug` branch without asking. Specs run `01`…`10` so far; `10-pase-de-profesor-rediseno` is the most recent. Check `specs/` for in-progress context before starting related work.

## Skills

The `frontend-design` skill auto-applies when implementing changes to the user interface. `.impeccable/` holds generated output from the `impeccable` design skill (per-screen critiques under `critique/`, live-session state under `live/`) — it's a work log, not source; don't hand-edit it.
