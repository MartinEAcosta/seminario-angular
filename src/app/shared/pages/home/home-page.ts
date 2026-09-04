import { Component, computed, effect, inject, OnDestroy, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { rxResource } from '@angular/core/rxjs-interop';

import { CourseService } from '@course/services/course.service';
import { CartService } from '@cart/state/cart.service';
import { UIService } from '../../services/ui/ui.service';
import { CourseListComponent } from "../../../course/components/course-list/course-list.component";
import { CourseCarouselComponent } from "@course/components/course-carousel/course-carousel.component";
import { ModalErrorMessageComponent } from '../../components/modal-error-message/modal-error-message.component';
import { CartComponent } from '@cart/components/cart/cart.component';
import { defaultCourses } from '@utils/defaultCourses';
import { PageTitleComponent } from "@shared/components/page-title/page-title.component";
import { HeroCanvasBackgroundDirective } from './hero-canvas-background.directive';

@Component({
    selector: 'app-home',
    templateUrl: './home-page.html',
    styleUrl: './home-page.scss',
    imports: [CourseListComponent, CourseCarouselComponent, ModalErrorMessageComponent, CartComponent, PageTitleComponent, RouterLink, HeroCanvasBackgroundDirective]
})
export class HomeComponent implements OnDestroy {

  courseService = inject(CourseService);
  cartService = inject(CartService);
  uiService = inject(UIService);

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

  coursesToShow = computed(() => {
    const value = this.coursesResource.value();
    if (!value || value.items.length === 0) {
      return this.emptyCoursesValue;
    }
    return value;
  });

  carouselCourses = computed(() => this.coursesToShow().items.slice(0, 10));

  constructor() {
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