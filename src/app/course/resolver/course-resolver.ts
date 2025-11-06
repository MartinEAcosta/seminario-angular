import { inject, Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, Resolve, Router } from "@angular/router";
import { catchError, map, Observable, of } from "rxjs";

import { Course } from "@interfaces/course.interfaces";
import { CourseService } from "../services/course.service";
import { CourseFormState } from "@course/state/course/course-form-state";
import { AuthService } from "@auth/services/auth.service";

@Injectable({ providedIn: 'root' })
export class CourseResolver implements Resolve<Course | null> {

    router = inject(Router);
    service = inject(CourseService);
    authService = inject(AuthService)
    courseFormState = inject(CourseFormState); 

    resolve( route : ActivatedRouteSnapshot ) : Observable<Course | null> {
        const courseId = route.paramMap.get('id');

        if( !courseId || !this.authService.id() ){
            // Setear error en el servicio de ui 
            this.router.navigateByUrl('/');
            return of(null);
        }

        return this.service.getById( courseId! ).pipe(
            map( course => {
                if( course.id_owner === this.authService.id() ){
                    return course;
                }
                // No tienes los permisos suficientes para obtener el curso.
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
