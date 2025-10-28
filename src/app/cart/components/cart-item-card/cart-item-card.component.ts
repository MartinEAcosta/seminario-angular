import { Component, computed, inject, Input, input } from '@angular/core';
import { CartItem } from '../../models/cart.interface';
import { CartService } from '../../state/cart.service';

@Component({
  selector: 'app-cart-item-card',
  imports: [],
  templateUrl: './cart-item-card.component.html',
  styleUrl: './cart-item-card.component.scss'
})
export class CartItemCardComponent {

  
  public cartService = inject(CartService);

  @Input( )
  public item! : CartItem;
  public cart = computed( () => this.cartService.cart());

  constructor () { }


}
