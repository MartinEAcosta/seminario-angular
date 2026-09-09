import { computed, inject, Injectable, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { LessonService } from '@lesson/services/lesson.service';

@Injectable({
  providedIn: 'root',
})
export class LessonState {

  private lessonService = inject(LessonService);

  private requestedLessonId = signal<string | undefined>(undefined);

  lessonResource = rxResource({
    params: () => this.requestedLessonId(),
    stream: ( { params : id } ) => this.lessonService.getAllLessonPopulatedFromCourse( id ),
  });

  constructor() {}

  // loadLesson(id_lesson: string): Observable<LessonPopulated | null> {
  //   if (this.selectedLesson() && this.selectedLesson()?.id === id_lesson) {
  //     return of(this.selectedLesson()!);
  //   }

  //   this.setIsLoading(true);
  //   return this.lessonService
  //     .getLessonPopulatedById(id_lesson)
  //     .pipe(
  //       tap((lesson) => {
  //         this.state.set(({
  //           isLoading : false,
  //           error : null,
  //           data: { selectedLesson: lesson },
  //         }));
  //         console.log(this.state());
  //       }),
  //       catchError((error) => {
  //         this.handleError(error);
  //         return of(null);
  //       })
  //     );
  // }

  // loadNextLesson(id_enrollment: string): Observable<LessonPopulated | null> {
  //   this.setIsLoading(true);
  //   return this.lessonService
  //     .getNextLesson(id_enrollment)
  //     .pipe(
  //       tap((lesson) => {
  //         console.log(lesson)
  //         this.state.set({
  //             isLoading: false,
  //             error: null,
  //             data: { selectedLesson: lesson },
  //         });
  //       }),
  //       catchError((error) => {
  //         this.handleError(error);
  //         return of(null);
  //       })
  //     );
  // }
}
