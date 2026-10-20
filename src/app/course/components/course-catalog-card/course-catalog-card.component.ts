import { CurrencyPipe } from '@angular/common';
import { Component, OnDestroy, computed, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Course } from '@course/models/course.interfaces';
import { CartService } from '@cart/state/cart.service';

const ADDED_FEEDBACK_MS = 2200;

// Card única de curso, usada tanto en la grilla de /explore como en el
// carrusel del home. Reemplaza a las dos cards que existían antes
// (course-mini-card y course-carousel-item), que habían nacido separadas
// a propósito y terminaron duplicando el mismo diseño con pequeñas
// diferencias de tema (oscuro/claro) que ya no se justificaban.
@Component({
  selector: 'app-course-catalog-card',
  imports: [CurrencyPipe, RouterLink],
  templateUrl: './course-catalog-card.component.html',
  styleUrl: './course-catalog-card.component.scss'
})
export class CourseCatalogCardComponent implements OnDestroy {

  cartService = inject(CartService);

  course = input.required<Course>();
  // Id de la inscripción del usuario en este curso, si existe — no solo un
  // booleano: el botón "Continuar" necesita linkear a /enrollment/:id, que
  // es un id de inscripción, distinto del id del curso.
  enrollmentId = input<string | null>(null);

  id_course = computed( () => this.course().id );
  isEnrolled = computed( () => !!this.enrollmentId() );
  hasThumbnail = computed( () => !!this.course().thumbnail_url );
  hasDescription = computed( () => !!this.course().description?.trim() );

  // "En el carrito" es un estado persistente (el curso sigue en el carrito
  // hasta que se saque), no el feedback de 2.2s de haber tocado el botón
  // recién — por eso se deriva directo del carrito, no de `justAdded`.
  isInCart = computed( () => this.cartService.cart().items.has( this.id_course() ) );

  // Feedback inmediato del click, solo para el aria-live — el label/estado
  // visible del botón ya lo decide `isInCart()`.
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
