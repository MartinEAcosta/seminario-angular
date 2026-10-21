import { Component, ElementRef, inject, input, viewChild } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { CartItem } from '../../models/cart.interface';
import { CartService } from '../../state/cart.service';

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

@Component({
  selector: 'app-cart-panel-item',
  imports: [CurrencyPipe],
  templateUrl: './cart-panel-item.component.html',
  styleUrl: './cart-panel-item.component.scss'
})
export class CartPanelItemComponent {

  private cartService = inject(CartService);

  item = input.required<CartItem>();

  private cardRef = viewChild<ElementRef<HTMLElement>>('cardRef');

  // Misma animación de salida que cart-item-card: colapso de alto + fade,
  // y sólo saca el item del estado cuando la animación termina.
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
          marginBottom: cardStyle.marginBottom,
        },
        {
          opacity: 0,
          transform: 'translateX(28px)',
          maxHeight: '0px',
          marginBottom: '0px',
        },
      ],
      { duration: 300, easing: 'cubic-bezier(.4,0,.2,1)', fill: 'forwards' }
    );

    animation.finished
      .then( () => this.cartService.removeFromCart( this.item().course ) )
      .catch( () => this.cartService.removeFromCart( this.item().course ) );
  }

}
