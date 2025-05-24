import { Component, Input } from '@angular/core';
import { Course } from '../../../course-list/Course';

@Component({
  selector: 'app-btn-add-to-cart',
  standalone: false,
  templateUrl: './btn-add-to-cart.component.html',
  styleUrl: './btn-add-to-cart.component.scss'
})
export class BtnAddToCartComponent {

  @Input()
  course!: Course;

  onAddToCart = ( course : Course ) : void  => {
    console.log(course.capacity);
    if( course.capacity > 0 )
      course.capacity -= 1;    
    console.log(course.capacity);
  }

}
