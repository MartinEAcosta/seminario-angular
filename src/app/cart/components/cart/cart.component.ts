import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgClass } from '@angular/common';

import { CartService } from '../../state/cart.service';
import { CartItemCardComponent } from '../cart-item-card/cart-item-card.component';
import { DiscountCodeInputComponent } from '../discount-code-input/discount-code-input.component';

@Component({
    selector: 'app-cart',
    templateUrl: './cart.component.html',
    styleUrl: './cart.component.scss',
    imports: [NgClass, CartItemCardComponent, RouterLink, DiscountCodeInputComponent],
})
export class CartComponent {
  
  private cartService = inject(CartService);
  public cart = computed( () => this.cartService.cart());
  
  public isCartOpen = signal<boolean>(false);

  constructor( ) { }
  
  public onOpenCart = ( ) : void => {
    if( this.isCartOpen() ) {
      return;
    }
    this.isCartOpen.set(!this.isCartOpen());
  }

  public onCloseCart = ( ) : void => {
    const clickedContainer = event?.target as HTMLElement;
    if( clickedContainer.classList.contains('overlay') || clickedContainer.classList.contains('btn-continue') ){
      this.isCartOpen.set(false);
    }
  }



}
