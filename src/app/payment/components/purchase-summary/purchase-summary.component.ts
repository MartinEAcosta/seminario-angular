import { Component, computed, input, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';

import { Cart } from '@cart/models/cart.model';
import { CartPanelItemComponent } from '@cart/components/cart-panel-item/cart-panel-item.component';

@Component({
  selector: 'app-purchase-summary',
  imports: [CurrencyPipe, CartPanelItemComponent],
  templateUrl: './purchase-summary.component.html',
  styleUrl: './purchase-summary.component.scss'
})
export class PurchaseSummaryComponent {

  cart = input.required<Cart>();
  total = input.required<number>();

  items = computed(() => Array.from(this.cart().items.values()));
  itemCount = computed(() => this.items().length);

  // Colapsado por default: en mobile el pedido arranca cerrado para no empujar
  // el formulario de pago fuera del viewport inicial. En desktop el CSS
  // ignora esta señal y el contenido queda siempre visible (ver scss).
  collapsed = signal(true);

  toggleCollapsed = () => this.collapsed.update((value) => !value);

}
