import { Component, ElementRef, afterNextRender, input, signal, viewChild } from '@angular/core';
import { Course } from '@interfaces/course.interfaces';
import { CourseMiniCardComponent } from '../course-mini-card/course-mini-card.component';
import { LoaderComponent } from '@shared/components/loader/loader.component';

@Component({
  selector: 'app-course-carousel',
  imports: [CourseMiniCardComponent, LoaderComponent],
  templateUrl: './course-carousel.component.html',
  styleUrl: './course-carousel.component.scss'
})
export class CourseCarouselComponent {

  courses = input.required<Course[]>();
  isLoading = input<boolean>(false);

  track = viewChild<ElementRef<HTMLDivElement>>('track');

  canScrollPrev = signal(false);
  canScrollNext = signal(false);

  // Abajo de 640px los botones de navegación se esconden: el riel de progreso
  // es la única pista de que la estantería scrollea, así que no es decorativo.
  scrollProgress = signal(0);

  constructor() {
    afterNextRender(() => this.onScroll());
  }

  onScroll(): void {
    const el = this.track()?.nativeElement;
    if (!el) return;

    this.canScrollPrev.set(el.scrollLeft > 8);
    this.canScrollNext.set(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);

    const visibleRatio = el.scrollWidth > 0 ? el.clientWidth / el.scrollWidth : 1;
    const scrollable = el.scrollWidth - el.clientWidth;
    const travelled = scrollable > 0 ? el.scrollLeft / scrollable : 0;

    this.scrollProgress.set(Math.min(100, (visibleRatio + travelled * (1 - visibleRatio)) * 100));
  }

  scrollByCard(direction: 1 | -1): void {
    const el = this.track()?.nativeElement;
    if (!el) return;

    el.scrollBy({ left: el.clientWidth * 0.8 * direction, behavior: 'smooth' });
  }
}
