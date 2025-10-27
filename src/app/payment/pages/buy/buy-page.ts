import { CartService } from '../../../cart/state/cart.service';
import { Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/auth/services/auth.service';
import { CourseService } from 'src/app/course/services/course.service';
import { PageTitleComponent } from "src/app/shared/components/page-title/page-title.component";
import { CartCheckoutComponent } from "src/app/cart/components/cart-checkout/cart-checkout.component";
import { CurrencyPipe } from '@angular/common';
import { PaymentService } from '../../services/payment.service';
import { rxResource } from '@angular/core/rxjs-interop';
import { FormCardCheckoutComponent } from "../../components/form-card-checkout/form-card-checkout.component";

@Component({
  selector: 'app-buy-page',
  imports: [PageTitleComponent, CartCheckoutComponent, CurrencyPipe, FormCardCheckoutComponent],
  templateUrl: './buy-page.html',
  styleUrl: './buy-page.scss'
})
export class BuyPage {

  private router = inject(Router);
  public cartService = inject(CartService);
  public paymentService = inject(PaymentService);

  public shoppingList = computed( () => this.cartService.cart()); 

  public paymentMethods = rxResource({
    loader: () => { 
      return this.paymentService.getAllPaymentMethods(); 
    }
  });

  constructor ( ) { }

}
