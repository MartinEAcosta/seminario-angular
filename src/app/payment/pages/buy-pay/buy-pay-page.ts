import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { PageTitleComponent } from "@shared/components/page-title/page-title.component";
import { PurchaseSummaryComponent } from "../../components/purchase-summary/purchase-summary.component";
import { FormCardCheckoutComponent } from "../../components/form-card-checkout/form-card-checkout.component";
import { CartState } from '@cart/state/cart-state';

@Component({
  selector: 'app-buy-pay-page',
  imports: [PageTitleComponent, PurchaseSummaryComponent, FormCardCheckoutComponent, RouterLink],
  templateUrl: './buy-pay-page.html',
  styleUrl: './buy-pay-page.scss'
})
export class BuyPayPage {

  cartState = inject(CartState);

  isEmpty = computed(() => this.cartState.cart().items.size === 0);

}
