import { CurrencyPipe } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartService } from '@cart/state/cart.service';
import { Course } from '@interfaces/course.interfaces';

@Component({
  selector: 'app-course-mini-card',
  imports: [CurrencyPipe, RouterLink],
  templateUrl: './course-mini-card.component.html',
  styleUrls: ['../../../shared/styles/mini-card-component.scss' ,'./course-mini-card.component.scss']
})
export class CourseMiniCardComponent {

  cartService = inject(CartService);

  course = input.required<Course>();
  id_course = computed( () => {
    return this.course().id;
  });

  constructor( ) { }
}
