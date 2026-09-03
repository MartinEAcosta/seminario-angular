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

  public quantity = computed<number>( () =>
    this.cart().items.get( this.item().course.id )?.quantity ?? 0
  );

  public capacity = computed<number | null>( () => this.item().course.capacity ?? null );

  public remainingSeats = computed<number | null>( () => {
    const capacity = this.capacity();
    return capacity == null ? null : Math.max( capacity - this.quantity() , 0 );
  });

  public isAtCapacity = computed<boolean>( () => {
    const capacity = this.capacity();
    return capacity != null && this.quantity() >= capacity;
  });

  public onRemove = ( ) : void => {
    this.cartService.removeFromCart( this.item().course );
  }

  constructor () { }

}
