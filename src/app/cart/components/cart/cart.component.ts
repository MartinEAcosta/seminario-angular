import { Component, computed, inject, input, signal } from '@angular/core';
import { CartService } from '../../state/cart.service';
import { NgClass } from '@angular/common';
import { CartItemCardComponent } from "../cart-item-card/cart-item-card.component";

@Component({
    selector: 'app-cart',
    templateUrl: './cart.component.html',
    styleUrl: './cart.component.scss',
    imports: [NgClass, CartItemCardComponent],
})
export class CartComponent {
  
  private cartService = inject(CartService);
  public cart = computed( () => this.cartService.cart());
  
  public isCartOpen = signal<boolean>(false);

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
