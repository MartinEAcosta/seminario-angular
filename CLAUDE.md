# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Angular 20 (standalone components, no NgModules anywhere) e-commerce-style course platform ("Udemix Learning"): browse/create/enroll in courses, cart, checkout via MercadoPago, video lessons via video.js, email/password + Google OAuth login. Personal portfolio playground.

Backend is a separate repo (`seminario-angular-backend`, not in this workspace) — without it running, auth/login/course-creation/image-upload flows won't work; the app falls back to mocked data for browsing. Backend setup: clone it, `npm install`, create `.env` from `env.template`, `npm run dev` (serves on `localhost:4201`).

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

**Schematics gotcha**: `angular.json` sets `standalone: false` for the component/directive/pipe schematics, so `ng generate component` emits NgModule-style code that matches nothing in this codebase. Write components by hand or strip the flag afterwards.

## Architecture

**Feature-folder structure**, per Angular's official style guide. Each feature under `src/app/<feature>/` typically contains its own `components/`, `pages/`, `services/`, `models/`, `state/`, and sometimes `guards/`, `resolver/`, `interceptors/`, `layout/`, `utils/`. Features: `auth`, `cart`, `category`, `course`, `enrollment`, `file`, `lesson`, `module`, `payment`, `shared`, `teacher-request`, `user`, plus top-level `mappers/` and `utils/`.

**Path aliases** (see `tsconfig.json`) — always prefer these over relative imports across features: `@auth/*`, `@course/*`, `@cart/*`, `@category/*`, `@enrollment/*`, `@file/*`, `@lesson/*`, `@module/*`, `@payment/*`, `@teacher-request/*`, `@user/*`, `@utils/*`, `@shared/*`, `@mappers/*`, `@guards/*`, `@interfaces/*` (aggregates model dirs from course/auth/module/lesson), `@variables` (→ `src/variables.scss`).

**Routing**: `app.routes.ts` is the root route table; each feature with routes exports its own `<feature>.routes.ts` (default export) lazy-loaded via `loadChildren`. Router is configured with `withComponentInputBinding()` and scroll-position restoration, so route params/data arrive as component inputs. Guards use the functional `CanMatchFn`/`CanActivateFn` style; route data resolvers live in each feature's `resolver/` dir.

**State management**: no NgRx/store library — plain Angular `signal`/`computed`/`effect`/`linkedSignal` in `@Injectable({providedIn:'root'})` services. Many features extend the generic base class `src/app/shared/state/state.ts` (`State<T>`), which wraps state in `{ isLoading, error, data }`, provides `handleError`/`setIsLoading`/`resetState`, and auto-calls `resetState()` via an `effect` whenever `UserState.user()` goes null (so logout clears all feature state for free). Feature state services (e.g. `course/state/course-state.ts`) extend `State<FeaturePropsInterface>` and add feature-specific signals on top.

**Auth/session**: `UserState` (`@user/state/user-state.ts`) is the single session holder — private `_user`/`_token`/`_authStatus` signals exposed as `computed`s, token mirrored to `localStorage` under the key `x-token`, plus the profile `FormGroup`. `authStatus` is derived: `'checking' | 'authenticated' | 'not-authenticated'`. `AuthService.checkStatusResource` is an `rxResource` that hits `/auth/renew` the first time the service is injected; the auth guards deliberately ignore `authStatus === 'checking'` and wait for a real transition, so **every error path in `AuthService.handleAuthError` must settle `authStatus`** or the guards hang forever (see `specs/06-*`).

**OAuth**: `AUTH_PROVIDER` (`auth/auth.provider.ts`) is an `InjectionToken<AuthProvider>` wired in `app.config.ts` to `GoogleAuthService` — add further providers behind that interface (`ready`/`prepare`/`signIn`/`onCode`) instead of injecting a concrete service. `GoogleAuthService` lazily injects Google's GSI script and runs `initCodeClient` in popup mode; the auth code is exchanged server-side via `POST /auth/login/google`. Note: it imports `environments/environment.development` directly rather than `environment`, so the dev client id ships in production builds too.

**Course cards**: `course-mini-card` was renamed/replaced by `course-catalog-card` (`course/components/course-catalog-card/`), paired with a `course-catalog-card-skeleton` loading placeholder — used by `explore-page`/carousels instead of the old mini-card.

**API/DTO boundary**: raw HTTP responses are never used directly in components — each feature that talks to the backend has a corresponding class in `src/app/mappers/` (e.g. `CourseMapper`, `AuthMapper`) that translates between backend shapes (`*Response`/`*DTO` types in feature `models/`) and app-internal model types. Follow this mapper pattern when adding new API integrations.

**HTTP**: `provideHttpClient(withFetch(), withInterceptors([authInterceptor]))`. `authInterceptor` (`auth/interceptors/auth.interceptor.ts`) attaches `Authorization: Bearer <token>` from `UserState`'s token signal when present. `environment.ts` / `environment.development.ts` hold `apiURL`, `MERCADOPAGO_PUBLIC_KEY` and `GOOGLE_CLIENT_ID`; the dev build swaps the file via `fileReplacements`.

**Cart/Payment**: `CartService` (`cart/state/cart.service.ts`) persists cart contents to `localStorage` via an `effect`, and reactively recomputes the total by calling `PaymentService.calculateTotal` in another `effect` whenever cart items or the applied discount code change. `cart.component` renders as a full-height side panel (fixed, anchored right, `100vh`, see `specs/08-*`) using `CartPanelItemComponent` (`cart/components/cart-panel-item/`, no cupo selector — that stays on `cart-item-card`/`cart-checkout` only, used at `/payment/buy`). The panel's total animates via `animateNumber` (`@utils/animate-number.ts`, rAF tween, respects `prefers-reduced-motion`) into a local `animatedTotal` signal driven by an `effect` watching `cartService.total()`; `subtotal` is a separate `computed` (pre-discount sum) for the panel's "Subtotal" row. The coupon input is behind a collapsible `isDiscountOpen` signal, collapsed by default.

## Styling

Global `src/styles.scss`; per-component `.scss`, plus shared partials (`shared/styles/`, `auth/form-global.scss`) pulled in via `styleUrls`. `src/variables.scss` is the design-token source — import with `@use '@variables' as v;` and use its tokens rather than literals:

- Colors/fonts: `$brand-color`, `$white-custom`, `$black-custom`, `$red-warning`, `$green-success`, `$yellow-caution`, `$font-brand`, `$font-primary`
- Breakpoints: `$breakpoints` map (`sm` 640, `md` 768, `lg` 1024, `xl` 1280, `laptop` 1366) consumed via the `bp-up($name)` / `bp-down($name)` mixins
- Fluid scales (`clamp()`, interpolated 320px→1280px viewport): `$text-sm`…`$text-display`, `$space-xs`…`$space-lg`

Production budgets: 4kB warning / 8kB error per component stylesheet, 500kB/1MB initial bundle.

## Specs workflow

Feature work is tracked as numbered spec docs under `specs/NN-slug.md` (Spanish, with a `Status`/`Depends on`/`Date`/`Objective` header and explicit In / Out-of-scope lists); `NN-slug-deuda-tecnica.md` companions record the tech debt each spec knowingly leaves behind. `specs/.spec-config.yml` has `AutoCreateBranch: true`, so the spec-implementation flow creates and switches to a `spec-NN-slug` branch without asking. Check `specs/` for in-progress context before starting related work.

## Skills

The `frontend-design` skill auto-applies when implementing changes to the user interface.
