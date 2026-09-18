import { inject, Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, Resolve, Router } from "@angular/router";
import { catchError, map, Observable, of } from "rxjs";

import { Course } from "@interfaces/course.interfaces";
import { CourseService } from "../services/course.service";
import { CourseFormState } from "@course/state/course-form/course-form-state";
import { UserState } from "@user/state/user-state";

@Injectable({ providedIn: 'root' })
export class CourseResolver implements Resolve<Course | null> {

    router = inject(Router);
    courseService = inject(CourseService);
    userState = inject(UserState)
    courseFormState = inject(CourseFormState);

    resolve( route : ActivatedRouteSnapshot ) : Observable<Course | null> {
        const courseId = route.paramMap.get('id');

        if( !courseId || !this.userState.id() ){
            // Setear error en el servicio de ui
            this.router.navigateByUrl('/');
            return of(null);
        }

        return this.courseService.getById( courseId! ).pipe(
            map( course => {
                if( course.id_owner === this.userState.id() ){
                    return course;
                }
                // No tienes los permisos suficientes para obtener el curso.
                this.router.navigateByUrl('/');
                return null;
            } ),
            catchError( (error)  => {
                // TODO : Manejar excepción mostrando una pagina de error.
                this.router.navigateByUrl('/');
                return of(null);
            })
        );
    }
}
