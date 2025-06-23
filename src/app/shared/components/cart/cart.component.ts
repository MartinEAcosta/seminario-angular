import { Component, computed, inject, OnInit, signal, Signal } from '@angular/core';
import { CartService } from '../../../services/cart/cart.service';
import { Course } from '../../../interfaces/course.interfaces';
import { NgClass } from '@angular/common';
@Component({
    selector: 'app-cart',
    templateUrl: './cart.component.html',
    styleUrl: './cart.component.scss',
    imports: [ NgClass ]
})
export class CartComponent {

  isCartOpen = signal<boolean>(false);

  cartService = inject(CartService);

  readonly courses = this.cartService.courses();

  constructor( ) { }
  
  onOpenCart = ( ) : void => {
    if( this.isCartOpen() ) {
      return;
    }
    this.isCartOpen.set(!this.isCartOpen());

  }

  onCloseCart = ( ) : void => {
    const clickedContainer = event?.target as HTMLElement;
    if( clickedContainer.classList.contains('overlay') || clickedContainer.classList.contains('btn-continue') ){
      this.isCartOpen.set(false);
    }

  }

  

}
