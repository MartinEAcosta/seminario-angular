import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Category } from '@category/models/category.interfaces';

@Component({
  selector: 'app-category-marquee',
  imports: [RouterLink],
  templateUrl: './category-marquee.component.html',
  styleUrl: './category-marquee.component.scss'
})
export class CategoryMarqueeComponent {

  categories = input.required<Category[]>();

  // Duplicado para el loop infinito: el track se anima -50% y el segundo
  // set de items ocupa exactamente el hueco que deja el primero.
  loopCategories = computed(() => [...this.categories(), ...this.categories()]);
}
