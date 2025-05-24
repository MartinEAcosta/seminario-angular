import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CourseListComponent } from './course-list/course-list.component';
import { UdemixAboutComponent } from './udemix-about/udemix-about.component';
import { UdemixCartComponent } from './udemix-cart/udemix-cart.component';
import { HeaderComponent } from './shared/header/header.component';
import { HomeComponent } from './pages/home/home.component';
import { FooterComponent } from './shared/footer/footer.component';
import { BtnBuyComponent } from './shared/buttons/btn-buy/btn-buy.component';
import { BtnAddToCartComponent } from './shared/buttons/btn-add-to-cart/btn-add-to-cart.component';

@NgModule({
  declarations: [
    AppComponent,
    CourseListComponent,
    UdemixAboutComponent,
    UdemixCartComponent,
    HeaderComponent,
    HomeComponent,
    FooterComponent,
    BtnBuyComponent,
    BtnAddToCartComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
