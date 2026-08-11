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
  title = input<string>('Recomendados para ti');

  track = viewChild<ElementRef<HTMLDivElement>>('track');

  canScrollPrev = signal(false);
  canScrollNext = signal(false);

  constructor() {
    afterNextRender(() => this.onScroll());
  }

  onScroll(): void {
    const el = this.track()?.nativeElement;
    if (!el) return;

    this.canScrollPrev.set(el.scrollLeft > 8);
    this.canScrollNext.set(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
  }

  scrollByCard(direction: 1 | -1): void {
    const el = this.track()?.nativeElement;
    if (!el) return;

    el.scrollBy({ left: el.clientWidth * 0.8 * direction, behavior: 'smooth' });
  }
}
