import { Component, computed, inject, input } from '@angular/core';
import { CartItem } from '../../models/cart.interface';
import { CartService } from '../../state/cart.service';

@Component({
  selector: 'app-cart-item-card',
  imports: [],
  templateUrl: './cart-item-card.component.html',
  styleUrl: './cart-item-card.component.scss'
})
export class CartItemCardComponent {

  
  cartService = inject(CartService);

  cart = computed( () => this.cartService.cart());
  item = input.required<CartItem>();

  constructor () { }


}
