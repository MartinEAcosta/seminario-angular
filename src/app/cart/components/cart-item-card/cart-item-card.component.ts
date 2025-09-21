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

  
  private cartService = inject(CartService);

  @Input( )
  public item! : CartItem;
  public cart = computed( () => this.cartService.cart());

  constructor () { }

    onUpQuantity = ( item : CartItem ) : Map<string,CartItem> => {
    const course = item.course;
    const currentReserved = this.cart().get( course.id )?.quantity || 0;

    if (
      (course.capacity !== undefined && course.capacity <= 0) ||
      (course.capacity !== undefined && currentReserved >= course.capacity)
    ) return new Map<string,CartItem>(this.cart());

    return this.cartService.upQuantity( item.course , currentReserved);
  }

  onDownQuantity = ( item : CartItem ) : Map<string,CartItem> => {
    const course = item.course;
    const currentReserved = this.cart().get(course.id)?.quantity || 1;

    if( currentReserved <= 1 ) return new Map<string,CartItem>(this.cart());

    return this.cartService.downQuantity( item.course , currentReserved );
  }

}
