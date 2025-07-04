/*
  Path:PORT/
*/
import { Component, computed, inject } from '@angular/core';
import { CourseService } from '../../../course/services/course.service';
import { rxResource } from '@angular/core/rxjs-interop';
import { CourseCardComponent } from '../../../course/components/course-card/course-card.component';
import { CartComponent } from '../../components/cart/cart.component';
import { CartService } from '../../services/cart/cart.service';
import { LoaderComponent } from "../../components/loader/loader.component";

@Component({
    selector: 'app-home',
    templateUrl: './home-page.html',
    styleUrl: './home-page.scss',
    imports: [ CourseCardComponent, CartComponent, CourseCardComponent, LoaderComponent]
})
export default class HomeComponent {

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
