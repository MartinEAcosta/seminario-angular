/*
  Path:PORT/
*/
import { Component, computed, inject } from '@angular/core';
import { CourseService } from '../../course/services/course.service';
import { rxResource } from '@angular/core/rxjs-interop';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { CourseCardComponent } from '../../course/components/course-card/course-card.component';
import { CartComponent } from '../../shared/components/cart/cart.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { CartService } from '../../services/cart/cart.service';
import { LoaderComponent } from "../../shared/components/loader/loader.component";

@Component({
    selector: 'app-home',
    templateUrl: './home-page.html',
    styleUrl: './home-page.scss',
    imports: [HeaderComponent, CourseCardComponent, CartComponent, FooterComponent, CourseCardComponent, LoaderComponent]
})
export class HomeComponent {

  courseService = inject(CourseService);
  cartService = inject(CartService);

  // Permite tratar de manera asincronica las respuestas de los observables
  coursesResource = rxResource({
    loader: (() => {
      return this.courseService.getAll();
    })
  });

  readonly coursesSignal = computed( () => this.coursesResource.value()?.courses ?? [] );
  
}
