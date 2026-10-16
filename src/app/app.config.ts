import { ApplicationConfig, DEFAULT_CURRENCY_CODE, LOCALE_ID } from '@angular/core';
import { provideRouter, withComponentInputBinding, withInMemoryScrolling } from '@angular/router';
import { registerLocaleData } from '@angular/common';
import localeEsAr from '@angular/common/locales/es-AR';

import { routes } from './app.routes';
import {
  provideHttpClient,
  withFetch,
  withInterceptors,
} from '@angular/common/http';

import { authInterceptor } from '@auth/interceptors/auth.interceptor';
import { GoogleAuthService } from '@auth/services/google-auth.service';
import { AUTH_PROVIDER } from '@auth/auth.provider';

// Los precios del catálogo están en pesos argentinos y el checkout es MercadoPago:
// sin esto el pipe `currency` los formatea como dólares.
registerLocaleData(localeEsAr);

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: LOCALE_ID, useValue: 'es-AR' },
    { provide: DEFAULT_CURRENCY_CODE, useValue: 'ARS' },
    provideRouter(
                  routes,
                  withInMemoryScrolling({
                    scrollPositionRestoration: 'enabled',
                  }),
                  withComponentInputBinding()
                  ),
    provideHttpClient(
      withFetch(),
      withInterceptors([
        authInterceptor,
      ])
    ),
    { provide: AUTH_PROVIDER , useExisting : GoogleAuthService }
  ],
};