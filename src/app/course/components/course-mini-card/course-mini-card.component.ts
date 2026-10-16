import { CurrencyPipe } from '@angular/common';
import { Component, OnDestroy, computed, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Course } from '@interfaces/course.interfaces';
import { CartService } from '@cart/state/cart.service';

const ADDED_FEEDBACK_MS = 2200;

@Component({
  selector: 'app-course-mini-card',
  imports: [CurrencyPipe, RouterLink],
  templateUrl: './course-mini-card.component.html',
  styleUrls: ['../../../shared/styles/mini-card-component.scss' ,'./course-mini-card.component.scss']
})
export class CourseMiniCardComponent implements OnDestroy {

  cartService = inject(CartService);

  course = input.required<Course>();
  id_course = computed( () => {
    return this.course().id;
  });

  // Agregar al carrito no navega ni abre nada: sin confirmación en el propio
  // control, el único acuse es el badge del carrito en la esquina opuesta.
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
