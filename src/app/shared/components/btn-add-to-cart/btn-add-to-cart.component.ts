import { Component, inject, Input, OnInit } from '@angular/core';
import { Course } from '../../../interfaces/course.interfaces';
import { CartService } from '../../../services/cart/cart.service';
import { NgClass } from '@angular/common';
@Component({
    selector: 'app-btn-add-to-cart',
    templateUrl: './btn-add-to-cart.component.html',
    styleUrl: './btn-add-to-cart.component.scss',
    imports : [ NgClass ],
})
export class BtnAddToCartComponent {

  @Input()
  course!: Course;

  private cartService = inject(CartService);
  
  constructor() { }

  onAddToCart = ( course : Course ) : void  => {
    console.log(course)
    if( course.capacity === undefined || course.capacity > 0  ){
      this.cartService.onAddToCart(course);
    } 
  }

}
