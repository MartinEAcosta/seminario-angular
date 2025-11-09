import { Component, inject, input } from '@angular/core';
import { CurrencyPipe } from '@angular/common';

import { DiscountCodeInputComponent } from "../discount-code-input/discount-code-input.component";
import { CartItemCardComponent } from "@cart/components";
import { CartService } from '@cart/state/cart.service';
import { Cart } from '@cart/models/cart.model';

@Component({
  selector: 'app-cart-checkout',
  imports: [DiscountCodeInputComponent, CartItemCardComponent, CurrencyPipe],
  templateUrl: './cart-checkout.component.html',
  styleUrl: './cart-checkout.component.scss'
})
export class CartCheckoutComponent {
  
  cartService = inject(CartService);
  cart = input.required<Cart>();

  constructor() { }
  
}
