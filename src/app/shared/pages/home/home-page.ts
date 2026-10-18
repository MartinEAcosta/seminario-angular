import { Component, computed, inject, OnDestroy, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { rxResource } from '@angular/core/rxjs-interop';

import { CourseService } from '@course/services/course.service';
import { CategoryService } from '@category/services/category.service';
import { resolveCategoryName } from '@category/utils/resolve-category-name';
import { CourseCarouselComponent } from "@course/components/course-carousel/course-carousel.component";
import { CourseFeaturedComponent } from '@course/components/course-featured/course-featured.component';
import { CategoryMarqueeComponent } from "@category/components/category-marquee/category-marquee.component";
import { ModalErrorMessageComponent } from '../../components/modal-error-message/modal-error-message.component';
import { CartComponent } from '@cart/components/cart/cart.component';
import { defaultCourses } from '@utils/defaultCourses';
import { defaultCategories } from '@utils/defaultCategories';
import { HeroCanvasBackgroundDirective } from './hero-canvas-background.directive';

@Component({
    selector: 'app-home',
    templateUrl: './home-page.html',
    styleUrl: './home-page.scss',
    imports: [CourseCarouselComponent, CourseFeaturedComponent, CategoryMarqueeComponent, ModalErrorMessageComponent, CartComponent, RouterLink, HeroCanvasBackgroundDirective]
})
export class HomeComponent implements OnDestroy {

  courseService = inject(CourseService);
  categoryService = inject(CategoryService);

  private readonly heroPhrases: string[] = [
    'a tu ritmo, sin excusas',
    'con profesores reales',
    'y una comunidad que suma',
  ];

  typewriterText = signal('');

  private phraseIndex = 0;
  private charIndex = 0;
  private isDeleting = false;
  private typewriterTimeoutId?: ReturnType<typeof setTimeout>;

  private readonly emptyCoursesValue = {
    items: [...defaultCourses],
    pages: 1,
    current_page: 1,
    limit: defaultCourses.length,
    total: defaultCourses.length,
    next: null,
    prev: null,
  };

  coursesResource = rxResource({
    stream: () => this.courseService.getAll(),
  });

  // El reemplazo por datos mockeados tiene que ser visible: si el backend no
  // responde, la página lo dice en vez de disfrazar el ejemplo de catálogo real.
  isUsingFallbackData = computed(() => {
    if (this.coursesResource.isLoading()) return false;
    const value = this.coursesResource.value();
    return !value || value.items.length === 0;
  });

  coursesToShow = computed(() => {
    const value = this.coursesResource.value();
    if (!value || value.items.length === 0) {
      return this.emptyCoursesValue;
    }
    return value;
  });

  // El destacado no se elige: es el primero del catálogo. Sin un flag en el
  // backend, cualquier otro criterio sería una promesa que el dato no sostiene.
  // Durante la carga devuelve null: `coursesToShow()` ya cae al mock de
  // respaldo, y mostrar un curso para pisarlo un segundo después es peor que
  // el hueco.
  featuredCourse = computed(() => {
    if (this.coursesResource.isLoading()) return null;
    return this.coursesToShow().items[0] ?? null;
  });

  // El destacado sale de la estantería: mostrarlo dos veces parte al medio el
  // catálogo percibido y hace que las dos secciones parezcan relleno.
  carouselCourses = computed(() => this.coursesToShow().items.slice(1, 11));

  categoriesResource = rxResource({
    stream: () => this.categoryService.getAllCategories(),
  });

  categoriesToShow = computed(() => {
    const value = this.categoriesResource.value();
    if (!value || value.length === 0) {
      return defaultCategories;
    }
    return value;
  });

  constructor() {
    // WCAG 2.2.2: con movimiento reducido la frase se muestra entera y quieta.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.typewriterText.set(this.heroPhrases[0]);
      return;
    }
    this.runTypewriter();
  }

  private runTypewriter(): void {
    const currentPhrase = this.heroPhrases[this.phraseIndex];
    let delay: number;

    if (!this.isDeleting) {
      this.charIndex++;
      this.typewriterText.set(currentPhrase.slice(0, this.charIndex));
      delay = 70;

      if (this.charIndex === currentPhrase.length) {
        this.isDeleting = true;
        delay = 2000;
      }
    } else {
      this.charIndex--;
      this.typewriterText.set(currentPhrase.slice(0, this.charIndex));
      delay = 35;

      if (this.charIndex === 0) {
        this.isDeleting = false;
        this.phraseIndex = (this.phraseIndex + 1) % this.heroPhrases.length;
        delay = 300;
      }
    }

    this.typewriterTimeoutId = setTimeout(() => this.runTypewriter(), delay);
  }

  ngOnDestroy(): void {
    if (this.typewriterTimeoutId) {
      clearTimeout(this.typewriterTimeoutId);
    }
  }

}
