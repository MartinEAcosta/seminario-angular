/*
  Path:PORT/
*/
import { Component, computed, inject, input } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';

import { CourseService } from '../../../course/services/course.service';
import { CartService } from '../../services/cart/cart.service';
import { CartComponent } from '../../components/cart/cart.component';
import { CourseListComponent } from "../../../course/components/course-list/course-list.component";
import { ModalErrorMessageComponent } from '../../components/modal-error-message/modal-error-message.component';
import { UIService } from '../../services/ui/ui.service';
import { NgIf } from '@angular/common';

@Component({
    selector: 'app-home',
    templateUrl: './home-page.html',
    styleUrl: './home-page.scss',
    imports: [ CartComponent, CourseListComponent , ModalErrorMessageComponent, NgIf ]
})
export default class HomeComponent {
  
  courseService = inject(CourseService);
  cartService = inject(CartService);
  uiService = inject(UIService);
  
  coursesResource = rxResource({
    loader: () => { return this.courseService.getAll() },
  });

}
