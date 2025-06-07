import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { UdemixCartComponent } from './shared/udemix-cart/udemix-cart.component';
import { HeaderComponent } from './shared/header/header.component';
import { HomeComponent } from './pages/home/home.component';
import { FooterComponent } from './shared/footer/footer.component';
import { BtnBuyComponent } from './shared/buttons/btn-buy/btn-buy.component';
import { BtnAddToCartComponent } from './shared/buttons/btn-add-to-cart/btn-add-to-cart.component';
import { AboutComponent } from './pages/about/about.component';
import { CourseListComponent } from './course/course-list/course-list.component';
import { AuthComponent } from './pages/auth/auth.component';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { FormRegisterComponent } from './auth/form-register/form-register.component';
import { FormLoginComponent } from './auth/form-login/form-login.component';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    AppComponent,
    CourseListComponent,
    UdemixCartComponent,
    HeaderComponent,
    HomeComponent,
    FooterComponent,
    BtnBuyComponent,
    BtnAddToCartComponent,
    AboutComponent,
    AuthComponent,
    FormRegisterComponent,
    FormLoginComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
  ],
  providers: [
    // Habilito las peticiones fetch
    provideHttpClient( withFetch() )
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
