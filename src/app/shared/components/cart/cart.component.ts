import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { CartService } from '../../services/cart/cart.service';
import { NgClass } from '@angular/common';

@Component({
    selector: 'app-cart',
    templateUrl: './cart.component.html',
    styleUrl: './cart.component.scss',
    imports: [ NgClass ],
    changeDetection: ChangeDetectionStrategy.OnPush,
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

}
