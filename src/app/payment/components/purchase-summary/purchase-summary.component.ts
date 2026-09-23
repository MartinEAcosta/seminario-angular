import { Component, input } from '@angular/core';
import { CurrencyPipe } from '@angular/common';

import { Cart } from '@cart/models/cart.model';

@Component({
  selector: 'app-purchase-summary',
  imports: [CurrencyPipe],
  templateUrl: './purchase-summary.component.html',
  styleUrl: './purchase-summary.component.scss'
})
export class PurchaseSummaryComponent {

  cart = input.required<Cart>();
  total = input.required<number>();

}
