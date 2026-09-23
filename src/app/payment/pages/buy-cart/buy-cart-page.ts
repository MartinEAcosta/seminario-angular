import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { CartCheckoutComponent } from "@cart/components/cart-checkout/cart-checkout.component";
import { PurchaseSummaryComponent } from "../../components/purchase-summary/purchase-summary.component";
import { CartService } from '@cart/state/cart.service';

@Component({
  selector: 'app-buy-cart-page',
  imports: [CartCheckoutComponent, PurchaseSummaryComponent, RouterLink],
  templateUrl: './buy-cart-page.html',
  styleUrl: './buy-cart-page.scss'
})
export class BuyCartPage {

  cartService = inject(CartService);

  shoppingList = computed( () => this.cartService.cart());

  isEmpty = computed(() => this.shoppingList().items.size === 0);

  constructor ( ) { }

}
