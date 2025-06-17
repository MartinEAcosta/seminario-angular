import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { CartComponent } from './shared/components/cart/cart.component';
import { HeaderComponent } from './shared/components/header/header.component';
import { HomeComponent } from './pages/home/home.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { BtnPrimaryComponent } from './shared/components/btn-primary/btn-primary.component';
import { BtnAddToCartComponent } from './shared/components/btn-add-to-cart/btn-add-to-cart.component';
import { AboutComponent } from './pages/about/about.component';
import { CourseListComponent } from './course/course-list/course-list.component';
import { AuthComponent } from './pages/auth/auth.component';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { FormRegisterComponent } from './auth/form-register/form-register.component';
import { FormLoginComponent } from './auth/form-login/form-login.component';
import { ReactiveFormsModule } from '@angular/forms';
import { authInterceptor } from './auth/interceptors/auth.interceptor';
import { CourseCreateComponent } from './course/course-create/course-create.component';

@NgModule({
    declarations: [],
    imports: [
        BrowserModule,
        AppRoutingModule,
        ReactiveFormsModule,
        CourseListComponent,
        CartComponent,
        HeaderComponent,
        HomeComponent,
        FooterComponent,
        BtnPrimaryComponent,
        BtnAddToCartComponent,
        AboutComponent,
        AuthComponent,
        FormRegisterComponent,
        FormLoginComponent,
        CourseCreateComponent,
    ],
    providers: [
        // Habilito las peticiones fetch
        provideHttpClient(withFetch(), withInterceptors([
            authInterceptor,
        ])),
    ],
    bootstrap: []
})
export class AppModule { }
