import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter, withComponentInputBinding, withInMemoryScrolling, withRouterConfig } from '@angular/router';

import { routes } from './app.routes';
import {
  provideHttpClient,
  withFetch,
  withInterceptors,
} from '@angular/common/http';

import { authInterceptor } from '../app/auth/interceptors/auth.interceptor';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';

export const appConfig: ApplicationConfig = {
  providers: [
    importProvidersFrom(BrowserModule, ReactiveFormsModule),
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
  ],
};