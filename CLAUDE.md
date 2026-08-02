# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Angular 19 (standalone components, no NgModules for feature code) e-commerce-style course platform: browse/create/enroll in courses, cart, checkout via MercadoPago, video lessons via video.js. Backend is a separate repo (`seminario-angular-backend`, not in this workspace) — without it running, auth/login/course-creation/image-upload flows won't work; the app falls back to mocked data for browsing.

## Commands

- `npm start` / `ng serve` — dev server (uses `environment.development.ts`)
- `npm run build` / `ng build` — production build to `dist/seminario-angular`
- `npm run watch` — dev build with `--watch`
- `npm test` / `ng test` — Karma/Jasmine unit tests (Chrome launcher)
  - Run a single spec: temporarily scope with `fdescribe`/`fit` in the spec file (Karma has no built-in `--include` file filter in this config)
- No lint script is configured in `package.json`.

Backend setup (separate repo, needed for full functionality): clone `seminario-angular-backend`, `npm install`, create `.env` from `env.template`, `npm run dev`.

## Architecture

**Feature-folder structure**, per Angular's official style guide. Each feature under `src/app/<feature>/` typically contains its own `components/`, `pages/`, `services/`, `models/`, `state/`, and sometimes `guards/`, `resolver/`, `interceptors/`, `utils/`. Features: `auth`, `cart`, `category`, `course`, `enrollment`, `file`, `lesson`, `module`, `payment`, `shared`, `user`, plus top-level `mappers/` and `utils/`.

**Path aliases** (see `tsconfig.json`) — always prefer these over relative imports across features: `@auth/*`, `@course/*`, `@cart/*`, `@enrollment/*`, `@file/*`, `@lesson/*`, `@module/*`, `@payment/*`, `@utils/*`, `@shared/*`, `@mappers/*`, `@guards/*`, `@interfaces/*` (aggregates model dirs from course/auth/module/lesson), `@variables` (→ `src/variables.scss`).

**Routing**: `app.routes.ts` is the root route table; each feature with routes exports its own `<feature>.routes.ts` (default export) lazy-loaded via `loadChildren`. Route guards use the functional `CanMatchFn`/`CanActivateFn` style (e.g. `AuthenticatedGuard`), and route data resolvers live in each feature's `resolver/` dir.

**State management**: no NgRx/store library — plain Angular `signal`/`computed`/`effect` in `@Injectable({providedIn:'root'})` services. Many features extend the generic base class `src/app/shared/state/state.ts` (`State<T>`), which wraps state in `{ isLoading, error, data }` and provides `handleError`, `setIsLoading`, `resetState`. Feature state services (e.g. `course/state/course-state.ts`) extend `State<FeaturePropsInterface>` and add feature-specific signals/methods on top.

**API/DTO boundary**: raw HTTP responses are never used directly in components — each feature that talks to the backend has a corresponding class in `src/app/mappers/` (e.g. `CourseMapper`) that translates between backend response shapes (`*Response`/`*DTO` types in feature `models/`) and the app-internal model types. Follow this mapper pattern when adding new API integrations rather than consuming HTTP responses inline.

**HTTP**: `provideHttpClient(withFetch(), withInterceptors([authInterceptor]))` in `app.config.ts`. `authInterceptor` (`auth/interceptors/auth.interceptor.ts`) attaches `Authorization: Bearer <token>` from `AuthService`'s token signal to outgoing requests when present. `environment.ts` / `environment.development.ts` hold `apiURL` and `MERCADOPAGO_PUBLIC_KEY`; the dev build swaps in the development environment via `fileReplacements`.

**Cart/Payment**: `CartService` (`cart/state/cart.service.ts`) persists cart contents to `localStorage` via an `effect`, and reactively recomputes the total by calling `PaymentService.calculateTotal` in another `effect` whenever cart items or the applied discount code change.
