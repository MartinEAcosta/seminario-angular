import { computed, inject, Injectable, signal } from '@angular/core';
import { Course } from '@course/models/course.interfaces';
import { CourseService } from '@course/services/course.service';

import { State } from '@shared/state/state';
import { catchError, Observable, of, tap } from 'rxjs';

interface CourseStateProps {
  selectedCourse: Course | null;
}

@Injectable({
  providedIn: 'root',
})
export class CourseState extends State<CourseStateProps> {
  private courseService = inject(CourseService);

  selectedCourse = computed(() => this.state().data?.selectedCourse);

  constructor() {
    super();
  }

  loadCourse ( id_course : string ) : Observable<Course | null> {
    if( this.selectedCourse() && this.selectedCourse()?.id === id_course ) {
        return of( this.selectedCourse()! );
    }

    this.setIsLoading(true);
    return this.courseService.getById( id_course )
                              .pipe(
                                tap((course) => {
                                  this.state.update( (c) => 
                                    ({ 
                                      ...c , 
                                      data : { selectedCourse : course },
                                    }),
                                  )
                                }),
                                catchError( ( error ) => {
                                  this.handleError( error );
                                  return of(null);
                                })
                              );
  }

}
