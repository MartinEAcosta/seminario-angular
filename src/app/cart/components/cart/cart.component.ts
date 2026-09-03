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
  cart = computed( () => this.cartService.cart());
  isCartOpen = signal<boolean>(false);

  constructor( ) { }

  // Abre el carrito. Detiene la propagación para que el click no llegue
  // al fondo (.cart-widget) y se vuelva a cerrar en el mismo evento.
  public onToggleCart = ( event: MouseEvent ) : void => {
    event.stopPropagation();
    this.isCartOpen.set(true);
  }

  // Sólo la llama el fondo/overlay: cualquier click dentro del panel
  // detiene su propagación antes de llegar acá.
  public onCloseCart = ( ) : void => {
    this.isCartOpen.set(false);
  }

  public closeCart = ( event: MouseEvent ) : void => {
    event.stopPropagation();
    this.isCartOpen.set(false);
  }

}
