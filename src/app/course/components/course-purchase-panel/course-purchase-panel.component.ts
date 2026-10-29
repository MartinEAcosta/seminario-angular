import { CurrencyPipe } from '@angular/common';
import { Component, OnDestroy, computed, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Course } from '@course/models/course.interfaces';
import { CartService } from '@cart/state/cart.service';

const ADDED_FEEDBACK_MS = 2200;

// Panel de compra de /course/:id — mismo patrón de carrito que
// course-catalog-card (CartService.onAddToCart + isInCart/justAdded), pero
// agrega cupos y los bullets informativos del mock. Sticky en desktop, fijo
// abajo de la pantalla en mobile (ver .scss).
@Component({
  selector: 'app-course-purchase-panel',
  imports: [CurrencyPipe, RouterLink],
  templateUrl: './course-purchase-panel.component.html',
  styleUrl: './course-purchase-panel.component.scss'
})
export class CoursePurchasePanelComponent implements OnDestroy {

  cartService = inject(CartService);

  course = input.required<Course>();
  // Id de la inscripción del usuario en este curso, si existe — no solo un
  // booleano: el botón "Continuar" necesita linkear a /enrollment/:id.
  enrollmentId = input<string | null>(null);
  lessonsCount = input<number>(0);

  id_course = computed( () => this.course().id );
  isEnrolled = computed( () => !!this.enrollmentId() );
  isFree = computed( () => this.course().price === 0 );

  hasThumbnail = computed( () => !!this.course().thumbnail_url );

  hasCapacityInfo = computed( () => this.course().capacity != null );
  spotsText = computed( () => {
    const capacity = this.course().capacity;
    if ( capacity == null ) return null;

    const spotsRemaining = this.course().spots_remaining;
    if ( spotsRemaining != null ) return `Quedan ${spotsRemaining} lugares de ${capacity}`;

    return `${capacity} cupos`;
  });

  // Barra de cupos ocupados — solo tiene sentido cuando sabemos cuántos
  // quedan, no con el fallback neutro de "capacity cupos".
  spotsTakenPercent = computed( () => {
    const capacity = this.course().capacity;
    const spotsRemaining = this.course().spots_remaining;
    if ( capacity == null || !capacity || spotsRemaining == null ) return null;

    const takenPercent = ( ( capacity - spotsRemaining ) / capacity ) * 100;
    return Math.min( 100, Math.max( 0, takenPercent ) );
  });

  lessonsBullet = computed( () => {
    const count = this.lessonsCount();
    const suffix = 'en video y material';
    return count === 1 ? `1 lección ${suffix}` : `${count} lecciones ${suffix}`;
  });

  // "En el carrito" es un estado persistente (igual que en course-catalog-card).
  isInCart = computed( () => this.cartService.cart().items.has( this.id_course() ) );

  // Feedback inmediato del click, solo para el aria-live.
  justAdded = signal(false);
  private feedbackTimeoutId?: ReturnType<typeof setTimeout>;

  onAddToCart(): void {
    this.cartService.onAddToCart( this.course() );

    this.justAdded.set(true);
    clearTimeout(this.feedbackTimeoutId);
    this.feedbackTimeoutId = setTimeout(() => this.justAdded.set(false), ADDED_FEEDBACK_MS);
  }

  ngOnDestroy(): void {
    clearTimeout(this.feedbackTimeoutId);
  }
}
