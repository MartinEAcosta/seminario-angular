/*
  Path:PORT/
*/
import { Component, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';

import { CourseService } from '../../../course/services/course.service';
import { CartService } from '../../../cart/state/cart.service';
import { UIService } from '../../services/ui/ui.service';
import { CourseListComponent } from "../../../course/components/course-list/course-list.component";
import { ModalErrorMessageComponent } from '../../components/modal-error-message/modal-error-message.component';
import { CartComponent } from 'src/app/cart/components/cart/cart.component';

@Component({
    selector: 'app-home',
    templateUrl: './home-page.html',
    styleUrl: './home-page.scss',
    imports: [CourseListComponent, ModalErrorMessageComponent, CartComponent]
})
export default class HomeComponent {
  
  courseService = inject(CourseService);
  cartService = inject(CartService);
  uiService = inject(UIService);
  
  coursesResource = rxResource({
    loader: () => { return this.courseService.getAll() },
  });

}
