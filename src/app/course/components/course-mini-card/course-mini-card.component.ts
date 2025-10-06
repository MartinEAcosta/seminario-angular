import { CurrencyPipe } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Course } from '@interfaces/course.interfaces';
import { CartService } from 'src/app/cart/state/cart.service';

@Component({
  selector: 'app-course-mini-card',
  imports: [CurrencyPipe, RouterLink],
  templateUrl: './course-mini-card.component.html',
  styleUrls: ['../../../shared/styles/mini-card-component.scss' ,'./course-mini-card.component.scss']
})
export class CourseMiniCardComponent {

  public cartService = inject(CartService);

  course = input.required<Course>();
  id_course = computed( () => {
    return this.course().id;
  });

  constructor( ) { }
}
