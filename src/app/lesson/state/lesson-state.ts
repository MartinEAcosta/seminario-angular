import { computed, inject, Injectable } from '@angular/core';
import { LessonPopulated } from '@lesson/models/lesson.interfaces';
import { LessonService } from '@lesson/services/lesson.service';

import { State } from '@shared/state/state';
import { catchError, map, Observable, of, tap } from 'rxjs';

interface LessonStateProps {
  selectedLesson: LessonPopulated | null;
}

@Injectable({
  providedIn: 'root',
})
export class LessonState extends State<LessonStateProps> {
  private lessonService = inject(LessonService);

  selectedLesson = computed(() => this.state().data?.selectedLesson);
  constructor() {
    super();
  }

  loadLesson(id_lesson: string): Observable<LessonPopulated | null> {
    if (this.selectedLesson() && this.selectedLesson()?.id === id_lesson) {
      return of(this.selectedLesson()!);
    }

    this.setIsLoading(true);
    return this.lessonService
      .getLessonPopulatedById(id_lesson)
      .pipe(
        tap((lesson) => {
          this.state.set(({
            isLoading : false,
            error : null,
            data: { selectedLesson: lesson },
          }));
          console.log(this.state());
        }),
        catchError((error) => {
          this.handleError(error);
          return of(null);
        })
      );
  }

  loadNextLesson(id_enrollment: string): Observable<LessonPopulated | null> {
    this.setIsLoading(true);
    return this.lessonService
      .getNextLesson(id_enrollment)
      .pipe(
        tap((lesson) => {
          console.log(lesson)
          this.state.set({
              isLoading: false,
              error: null,
              data: { selectedLesson: lesson },
          });
        }),
        catchError((error) => {
          this.handleError(error);
          return of(null);
        })
      );
  }
}
