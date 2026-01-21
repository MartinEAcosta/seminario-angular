
import { inject, Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, Router } from '@angular/router';
import { catchError, filter, map, Observable, of } from 'rxjs';
import { LessonPopulated } from '../models/lesson.interfaces';
import { LessonService } from '../services/lesson.service';
import { UIService } from '@shared/services/ui/ui.service';
import { LessonState } from '@lesson/state/lesson-state';

@Injectable({ providedIn: 'root' })
export class LessonResolver implements Resolve<LessonPopulated | null> {

    router = inject(Router);
    lessonService = inject(LessonService);
    lessonState = inject(LessonState);
    uiService = inject(UIService);

    resolve(route: ActivatedRouteSnapshot): Observable<LessonPopulated | null> | Promise<LessonPopulated> | LessonPopulated {
        const lessonId = route.paramMap.get('id_lesson');
        if( !lessonId ){
            // Setear error en el servicio de ui 
            this.router.navigateByUrl('/');
            return of();
        }
        const lesson = this.lessonState.loadLesson( lessonId! );
        return lesson.pipe(
              filter((value) => {
                console.log(value)
                if (!value) {
                  this.uiService.showToastMessage(
                    'Hubo un error al recopilar la lección.'
                  );
                  this.router.navigateByUrl('/');
                  return false;
                }
                return true;
              })
            );
    }
}