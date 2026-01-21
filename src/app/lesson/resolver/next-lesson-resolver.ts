
import { inject, Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, Router } from '@angular/router';
import { catchError, EMPTY, map, Observable, of } from 'rxjs';

import { LessonPopulated } from '@lesson/models/lesson.interfaces';
import { LessonService } from '@lesson/services/lesson.service';
import { LessonState } from '@lesson/state/lesson-state';
import { UIService } from '@shared/services/ui/ui.service';
import { EnrollmentState } from '@enrollment/state/enrollment-state';

@Injectable({ providedIn: 'root' })
export class NextLessonResolver implements Resolve<LessonPopulated> {

    router = inject(Router);
    uiService = inject(UIService);
    lessonService = inject(LessonService);
    lessonState = inject(LessonState);
    enrollmentState = inject(EnrollmentState);

    resolve(route: ActivatedRouteSnapshot): Observable<LessonPopulated> | Promise<LessonPopulated> | LessonPopulated {
        const enrollmentId = route.paramMap.get('id_enrollment');
        if( !enrollmentId ) {
            this.uiService.showToastMessage('Hubo un error al recopilar la inscripción.');
            this.router.navigateByUrl('/');
            return of();
        }
        
        if( enrollmentId === this.enrollmentState.selectedEnrollment()?.id ) { 
            return this.lessonState.loadNextLesson( enrollmentId )
            .pipe(
                map( ( lesson ) => {
                    if( !lesson ) {
                        this.uiService.showToastMessage('No hay más lecciones disponibles en esta inscripción.');
                        this.router.navigateByUrl('/');
                    }
                    return lesson!;
                }),
                catchError( ( error ) => { 
                    return this.handleError( error.message );
                })
            );
        }
        else{
            return this.handleError( 'Hubo un error al recopilar la inscripción.');
        }

    }

    private handleError ( errorMessage : string ) {
        this.uiService.showToastMessage( errorMessage );
        this.router.navigateByUrl('/');
        return EMPTY
    }
}