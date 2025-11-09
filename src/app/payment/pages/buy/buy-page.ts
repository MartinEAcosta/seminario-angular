import { Component, computed, inject } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { rxResource } from '@angular/core/rxjs-interop';

import { PageTitleComponent } from "src/app/shared/components/page-title/page-title.component";
import { CartCheckoutComponent } from "src/app/cart/components/cart-checkout/cart-checkout.component";
import { PaymentService } from '../../services/payment.service';
import { CartService } from '../../../cart/state/cart.service';
import { FormCardCheckoutComponent } from "../../components/form-card-checkout/form-card-checkout.component";

@Component({
  selector: 'app-buy-page',
  imports: [PageTitleComponent, CartCheckoutComponent,  CurrencyPipe, FormCardCheckoutComponent],
  templateUrl: './buy-page.html',
  styleUrl: './buy-page.scss'
})
export class BuyPage {

  cartService = inject(CartService);
  paymentService = inject(PaymentService);

  shoppingList = computed( () => this.cartService.cart()); 

  paymentMethodsResource = rxResource({
    loader: () => { 
      return this.paymentService.getAllPaymentMethods(); 
    }
  });

  constructor ( ) { }

}
