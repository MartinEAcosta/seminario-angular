/*
  Path:PORT/
*/
import { Component, computed, inject, input } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';

import { CourseService } from '../../../course/services/course.service';
import { CartService } from '../../services/cart/cart.service';
import { CartComponent } from '../../components/cart/cart.component';
import { CourseListComponent } from "../../../course/components/course-list/course-list.component";

@Component({
    selector: 'app-home',
    templateUrl: './home-page.html',
    styleUrl: './home-page.scss',
    imports: [CartComponent, CourseListComponent]
})
export default class HomeComponent {
  
  courseService = inject(CourseService);
  cartService = inject(CartService);
  
  coursesResource = rxResource({
    loader: () => { return this.courseService.getAll() },
  });

}
