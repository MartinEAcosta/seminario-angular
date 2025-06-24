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

  course = input.required<Course>();

  private cartService = inject(CartService);
  
  constructor() {
    // setTimeout(() => {
    
    //   console.log(this.course());
    // }, 3000);
   }

  onAddToCart = ( course : InputSignal<Course> ) : void  => {
    console.log(course());
    if( course().capacity != undefined && course()?.capacity! <= 0 ) return;
    this.cartService.onAddToCart( course() );
  }

}
