import { CurrencyPipe } from '@angular/common';
import { Component, OnDestroy, computed, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Course } from '@course/models/course.model';
import { CartState } from '@cart/state/cart-state';

const ADDED_FEEDBACK_MS = 2200;

// Vitrina del home: un solo curso tratado como ticket, la pieza de firma del
// sistema (DESIGN.md) que hasta ahora vivía solo en /about. Es presentacional
// puro: el nombre de categoría llega resuelto desde el home, que ya es dueño
// del resource de categorías.
@Component({
  selector: 'app-course-featured',
  imports: [CurrencyPipe, RouterLink],
  templateUrl: './course-featured.component.html',
  styleUrl: './course-featured.component.scss'
})
export class CourseFeaturedComponent implements OnDestroy {

  private cartState = inject(CartState);

  course = input.required<Course>();
  // `capacity` es la capacidad total del curso, no los lugares que quedan:
  // la etiqueta dice "cupos" y nunca insinúa escasez.
  capacity = computed(() => this.course().capacity ?? null);

  justAdded = signal(false);
  private feedbackTimeoutId?: ReturnType<typeof setTimeout>;

  onAddToCart(): void {
    this.cartState.onAddToCart( this.course() );

    this.justAdded.set(true);
    clearTimeout(this.feedbackTimeoutId);
    this.feedbackTimeoutId = setTimeout(() => this.justAdded.set(false), ADDED_FEEDBACK_MS);
  }

  ngOnDestroy(): void {
    clearTimeout(this.feedbackTimeoutId);
  }
}
