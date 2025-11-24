
import { inject, Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, Router } from '@angular/router';
import { catchError, map, Observable, of } from 'rxjs';
import { Lesson } from '../models/lesson.interfaces';
import { LessonService } from '../services/lesson.service';

@Injectable({ providedIn: 'root' })
export class LessonResolver implements Resolve<Lesson> {

    router = inject(Router);
    lessonService = inject(LessonService);

    resolve(route: ActivatedRouteSnapshot): Observable<Lesson> | Promise<Lesson> | Lesson {
        const lessonId = route.paramMap.get('id_lesson');
        if( !lessonId ){
            // Setear error en el servicio de ui 
            this.router.navigateByUrl('/');
        }
        return this.lessonService.getLessonById( lessonId! ).pipe(
            map( lesson => {
                return lesson;
            }),
            catchError( (error)  => {
                // TODO : Manejar excepción mostrando una pagina de error.
                this.router.navigateByUrl('/');
                return of();
            })
        )
    }
}