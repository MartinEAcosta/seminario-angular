import { Component, inject, Input, OnInit } from '@angular/core';
import { Course } from '../../../interfaces/course.interfaces';
import { CartService } from '../../../services/cart/cart.service';
@Component({
  selector: 'app-btn-add-to-cart',
  standalone: false,
  templateUrl: './btn-add-to-cart.component.html',
  styleUrl: './btn-add-to-cart.component.scss'
})
export class BtnAddToCartComponent {

  @Input()
  course!: Course;

  private cartService = inject(CartService);
  
  constructor() { }

  onAddToCart = ( course : Course ) : void  => {
    if( course.capacity === undefined || course.capacity > 0  ){
      this.cartService.onAddToCart(course);
    } 
  }

}
