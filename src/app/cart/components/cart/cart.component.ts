import { Component, computed, effect, inject, signal, untracked } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurrencyPipe, NgClass } from '@angular/common';

import { CartService } from '../../state/cart.service';
import { CartItemCardComponent } from '../cart-item-card/cart-item-card.component';
import { animateNumber } from '@utils/animate-number';

@Component({
    selector: 'app-cart',
    templateUrl: './cart.component.html',
    styleUrl: './cart.component.scss',
    imports: [NgClass, CartItemCardComponent, RouterLink, CurrencyPipe],
})
export class CartComponent {

  private cartService = inject(CartService);
  cart = computed( () => this.cartService.cart());
  isCartOpen = signal<boolean>(false);

  // Muestra el total "contando" hacia el nuevo valor en vez de saltar, cada vez
  // que cambia la cantidad de un item o se aplica un cupón.
  public animatedTotal = signal<number>( this.cartService.total() );

  constructor( ) {
    effect( () => {
      const target = this.cartService.total();
      const from = untracked( this.animatedTotal );
      animateNumber( from , target , value => this.animatedTotal.set( value ) );
    });
  }

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
