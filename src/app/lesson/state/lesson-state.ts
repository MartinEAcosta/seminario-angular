import { computed, inject, Injectable, signal } from '@angular/core';
import { Lesson, LessonPopulated } from '@lesson/models/lesson.interfaces';
import { LessonService } from '@lesson/services/lesson.service';

import { State } from '@shared/state/state';
import { catchError, Observable, of, tap } from 'rxjs';

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

  loadLesson ( id_lesson : string ) : Observable<LessonPopulated | null> {
    if( this.selectedLesson() && this.selectedLesson()?.id === id_lesson ) {
        return of( this.selectedLesson()! );
    }

    this.setIsLoading(true);
    return this.lessonService.getLessonPopulatedById( id_lesson )
                                .pipe(
                                    tap((lesson) => {
                                        this.state.update( (c) => 
                                            ({
                                                ...c,
                                                data : { selectedLesson : lesson }            
                                            }),
                                        )
                                    }),
                                    catchError( ( error ) => {
                                        this.handleError(error);
                                        return of(null);
                                    })
                                );
  }

}
