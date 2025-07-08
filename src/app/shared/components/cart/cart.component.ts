import { Component, computed, inject, input, signal } from '@angular/core';
import { CartService } from '../../../shared/services/cart/cart.service';
import { NgClass } from '@angular/common';
import { CartItem } from '@interfaces/cart.interface';

@Component({
    selector: 'app-cart',
    templateUrl: './cart.component.html',
    styleUrl: './cart.component.scss',
    imports: [ NgClass ],
})
export class CartComponent {
  
  cartService = inject(CartService);
  cart = computed( () => this.cartService.cart());
  
  isCartOpen = signal<boolean>(false);

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

  onUpQuantity = ( item : CartItem ) : Map<string,CartItem> => {
    const course = item.course;
    const currentReserved = this.cart().get( course.id )?.quantity || 0;

    if (
      (course.capacity !== undefined && course.capacity <= 0) ||
      (course.capacity !== undefined && currentReserved >= course.capacity)
    ) return new Map<string,CartItem>(this.cart());

    return this.cartService.upQuantity( item.course , currentReserved);
  }

  onDownQuantity = ( item : CartItem ) : Map<string,CartItem> => {
    const course = item.course;
    const currentReserved = this.cart().get(course.id)?.quantity || 1;

    if( currentReserved <= 1 ) return new Map<string,CartItem>(this.cart());

    return this.cartService.downQuantity( item.course , currentReserved );
  }

}
