import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CourseListComponent } from './course-list/course-list.component';
import { UdemixAboutComponent } from './udemix-about/udemix-about.component';
import { UdemixCartComponent } from './udemix-cart/udemix-cart.component';

@NgModule({
  declarations: [
    AppComponent,
    CourseListComponent,
    UdemixAboutComponent,
    UdemixCartComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
