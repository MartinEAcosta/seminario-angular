import { Component, computed, effect, ElementRef, inject, input, viewChild } from '@angular/core';
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

  cart = computed( () => this.cartService.cart());
  item = input.required<CartItem>();

  private cardRef = viewChild<ElementRef<HTMLElement>>('cardRef');
  private quantityRef = viewChild<ElementRef<HTMLElement>>('quantityRef');

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

  constructor () {
    // Pulso táctil en el número de cupos cada vez que cambia, para que subir/bajar
    // la cantidad se sienta como una respuesta y no como un valor que simplemente cambió.
    // `lastQuantity` arranca indefinido a propósito: el input `item` todavía no está
    // disponible en el constructor (NG0950), así que la primera lectura real de
    // `quantity()` ocurre recién dentro del effect, cuando Angular ya lo asignó.
    let lastQuantity : number | undefined = undefined;
    effect( () => {
      const current = this.quantity();
      const target = this.quantityRef()?.nativeElement;

      if( lastQuantity !== undefined && target && current !== lastQuantity && !window.matchMedia(REDUCED_MOTION_QUERY).matches ){
        target.animate(
          [
            { transform: 'scale(1)' },
            { transform: 'scale(1.35)' },
            { transform: 'scale(1)' },
          ],
          { duration: 280, easing: 'cubic-bezier(.34,1.56,.64,1)' }
        );
      }
      lastQuantity = current;
    });
  }

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
