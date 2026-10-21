import { Component, ElementRef, inject, input, viewChild } from '@angular/core';
import { CartItem } from '../../models/cart.interface';
import { CartService } from '../../state/cart.service';

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

@Component({
  selector: 'app-cart-item-card',
  imports: [],
  templateUrl: './cart-item-card.component.html',
  styleUrl: './cart-item-card.component.scss'
})
export class CartItemCardComponent {

  cartService = inject(CartService);

  item = input.required<CartItem>();

  private cardRef = viewChild<ElementRef<HTMLElement>>('cardRef');

  // Anima la salida de la tarjeta (colapso de alto + fade) y sólo quita el item
  // del estado cuando la animación termina, para que no desaparezca de un salto.
  public onRemove = ( ) : void => {
    const card = this.cardRef()?.nativeElement;

    if( !card || window.matchMedia(REDUCED_MOTION_QUERY).matches ){
      this.cartService.removeFromCart( this.item().course );
      return;
    }

    const { height } = card.getBoundingClientRect();
    const cardStyle = getComputedStyle(card);

    const animation = card.animate(
      [
        {
          opacity: 1,
          transform: 'translateX(0)',
          maxHeight: `${height}px`,
          paddingTop: cardStyle.paddingTop,
          paddingBottom: cardStyle.paddingBottom,
        },
        {
          opacity: 0,
          transform: 'translateX(28px)',
          maxHeight: '0px',
          paddingTop: '0px',
          paddingBottom: '0px',
        },
      ],
      { duration: 300, easing: 'cubic-bezier(.4,0,.2,1)', fill: 'forwards' }
    );

    animation.finished
      .then( () => this.cartService.removeFromCart( this.item().course ) )
      .catch( () => this.cartService.removeFromCart( this.item().course ) );
  }

}
