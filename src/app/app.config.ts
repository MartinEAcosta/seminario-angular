import { ApplicationConfig } from '@angular/core';
import { provideRouter, withComponentInputBinding, withInMemoryScrolling } from '@angular/router';

import { routes } from './app.routes';
import {
  provideHttpClient,
  withFetch,
  withInterceptors,
} from '@angular/common/http';

import { authInterceptor } from '@auth/interceptors/auth.interceptor';
import { GoogleAuthService } from '@auth/services/google-auth.service';
import { AUTH_PROVIDER } from '@auth/auth.provider';

export const appConfig: ApplicationConfig = {
  providers: [
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