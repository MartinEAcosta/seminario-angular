import { Component, inject, input } from '@angular/core';
import { DiscountCodeInputComponent } from "../discount-code-input/discount-code-input.component";
import { CartItemCardComponent } from "../cart-item-card/cart-item-card.component";
import { CartItem } from '../../models/cart.interface';
import { CurrencyPipe } from '@angular/common';
import { CartService } from '../../state/cart.service';

@Component({
  selector: 'app-cart-checkout',
  imports: [DiscountCodeInputComponent, CartItemCardComponent, CurrencyPipe],
  templateUrl: './cart-checkout.component.html',
  styleUrl: './cart-checkout.component.scss'
})
export class CartCheckoutComponent {
  
  public cartService = inject(CartService);

  cart = input.required<Map<string, CartItem>>();
  
}
