import { CurrencyPipe } from '@angular/common';
import { Component, OnDestroy, computed, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Course } from '@interfaces/course.interfaces';
import { CartService } from '@cart/state/cart.service';

const ADDED_FEEDBACK_MS = 2200;

// Item propio de la estantería del home. Nace como copia de la mini-card de
// /explore, pero con hoja de estilos propia: antes el carrusel encogía esa
// tarjeta inyectándole custom properties, así que ninguno de los dos podía
// cambiar sin arrastrar al otro.
@Component({
  selector: 'app-course-carousel-item',
  imports: [CurrencyPipe, RouterLink],
  templateUrl: './course-carousel-item.component.html',
  styleUrl: './course-carousel-item.component.scss'
})
export class CourseCarouselItemComponent implements OnDestroy {

  cartService = inject(CartService);

  course = input.required<Course>();
  categoryName = input<string | null>(null);
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
