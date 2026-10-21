import { Component, effect, inject, input, signal, untracked } from '@angular/core';
import { CurrencyPipe } from '@angular/common';

import { DiscountCodeInputComponent } from "../discount-code-input/discount-code-input.component";
import { CartItemCardComponent } from "@cart/components";
import { CartService } from '@cart/state/cart.service';
import { Cart } from '@cart/models/cart.model';
import { animateNumber } from '@utils/animate-number';

@Component({
  selector: 'app-cart-checkout',
  imports: [DiscountCodeInputComponent, CartItemCardComponent, CurrencyPipe],
  templateUrl: './cart-checkout.component.html',
  styleUrl: './cart-checkout.component.scss'
})
export class CartCheckoutComponent {

  cartService = inject(CartService);
  cart = input.required<Cart>();

  // Mismo contador animado que el panel del carrito: el total "cuenta" hacia
  // el nuevo valor en vez de saltar al cambiar cantidad o cupón.
  public animatedTotal = signal<number>( this.cartService.total() );

  constructor() {
    effect( () => {
      const target = this.cartService.total();
      const from = untracked( this.animatedTotal );
      animateNumber( from , target , value => this.animatedTotal.set( value ) );
    });
  }

}
