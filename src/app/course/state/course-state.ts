import { computed, inject, Injectable, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { CourseService } from '@course/services/course.service';

@Injectable({
  providedIn: 'root',
})
export class CourseState {
  private courseService = inject(CourseService);

  private requestedCourseId = signal<string | undefined>(undefined);
  
  private courseResource = rxResource({
    params: () => this.requestedCourseId(),
    stream: ({ params: id }) => this.courseService.getById(id),
  });

  selectedCourse = computed(() => this.courseResource.value() ?? null);
  isLoading = computed(() => this.courseResource.isLoading());
  error = computed(() => this.courseResource.error());

  constructor() {}

  loadCourse(id: string) {
    this.requestedCourseId.set(id);
  }
}
