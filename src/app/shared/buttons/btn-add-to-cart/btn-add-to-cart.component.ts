import { Component, Input, OnInit } from '@angular/core';
import { Course } from '../../../course-list/Course';
import { CartService } from '../../../cart.service';
@Component({
  selector: 'app-btn-add-to-cart',
  standalone: false,
  templateUrl: './btn-add-to-cart.component.html',
  styleUrl: './btn-add-to-cart.component.scss'
})
export class BtnAddToCartComponent {

  @Input()
  course!: Course;

  constructor(private cartService : CartService) { }


  onAddToCart = ( course : Course ) : void  => {
    if( course.capacity > 0 ){
      this.cartService.onAddToCart(course);
    } 
  }

}
