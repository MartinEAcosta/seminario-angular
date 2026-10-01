import { inject, Injectable, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { LessonService } from '@lesson/services/lesson.service';

@Injectable({
  providedIn: 'root',
})
export class LessonState {

  private lessonService = inject(LessonService);

  private requestedLessonId = signal<string | undefined>(undefined);
  private enrollmentId = signal<string | undefined>(undefined);

  lessonResource = rxResource({
    params: () => this.requestedLessonId(),
    stream: ( { params : id } ) => this.lessonService.getLessonPopulatedById( id ),
  });

  nextLessonResource = rxResource({
    params: () => this.enrollmentId(),
    stream: ( { params : id_enrollment } ) => this.lessonService.getNextLesson(id_enrollment),
  });

  constructor() {}

  loadNextLesson(id_enrollment: string) {
    this.enrollmentId.set( id_enrollment );
  }

  loadLesson(id_lesson : string ){
    this.requestedLessonId.set( id_lesson );
  }
}
