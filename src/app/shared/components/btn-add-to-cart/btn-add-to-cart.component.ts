import { Component, inject, input, InputSignal } from '@angular/core';
import { Course } from '../../../interfaces/course.interfaces';
import { CartService } from '../../../services/cart/cart.service';
import { NgClass } from '@angular/common';
@Component({
    selector: 'btn-add-to-cart',
    templateUrl: './btn-add-to-cart.component.html',
    styleUrl: './btn-add-to-cart.component.scss',
    imports : [ NgClass ],
})
export class BtnAddToCartComponent {

  // @Input()
  // course!: Course; 
  course = input.required<Course>();

  private cartService = inject(CartService);
  
  constructor() { }

  onAddToCart = ( course : InputSignal<Course> ) : void  => {
    const courseValue = this.course();
    if (courseValue && (courseValue.capacity === undefined || courseValue.capacity > 0)) {
      this.cartService.onAddToCart(course());
    } 
  }

}
