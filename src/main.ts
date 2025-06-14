import { platformBrowser, BrowserModule, bootstrapApplication } from '@angular/platform-browser';

import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './app/auth/interceptors/auth.interceptor';
import { AppRoutingModule } from './app/app-routing.module';
import { ReactiveFormsModule } from '@angular/forms';
import { AppComponent } from './app/app.component';
import { importProvidersFrom } from '@angular/core';

bootstrapApplication(AppComponent, {
    providers: [
        importProvidersFrom(BrowserModule, AppRoutingModule, ReactiveFormsModule),
        // Habilito las peticiones fetch
        provideHttpClient(withFetch(), withInterceptors([
            authInterceptor,
        ]))
    ]
})
  .catch(err => console.error(err));
