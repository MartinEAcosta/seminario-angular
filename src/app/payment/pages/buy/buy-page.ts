import { Component, computed, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { PageTitleComponent } from "@shared/components/page-title/page-title.component";
import { CartService } from '@cart/state/cart.service';
import { CheckoutStepsComponent } from "../../components/checkout-steps/checkout-steps.component";

@Component({
  selector: 'app-buy-page',
  imports: [PageTitleComponent, CheckoutStepsComponent, RouterOutlet],
  templateUrl: './buy-page.html',
  styleUrl: './buy-page.scss'
})
export class BuyPage {

  cartService = inject(CartService);

  shoppingList = computed( () => this.cartService.cart());

  isEmpty = computed(() => this.shoppingList().items.size === 0);

  constructor ( ) { }

}
