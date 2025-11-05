import { inject, Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, Resolve, Router } from "@angular/router";
import { catchError, map, Observable, of } from "rxjs";

import { Course } from "@interfaces/course.interfaces";
import { CourseService } from "../services/course.service";
import { UserState } from 'src/app/auth/state/user-state';
import { CourseFormState } from "@course/state/course/course-form-state";

@Injectable({ providedIn: 'root' })
export class CourseResolver implements Resolve<Course> {

    router = inject(Router);
    service = inject(CourseService);
    courseFormState = inject(CourseFormState); 

    resolve(
        route: ActivatedRouteSnapshot,
    ): Observable<Course> {
        const courseId = route.paramMap.get('id');

        if( !courseId ){
            // Setear error en el servicio de ui 
            this.router.navigateByUrl('/');
        }
        return this.service.getById( courseId! ).pipe(
            map( course => {
                this.courseFormState.selectedCourse.set( course );
                return course;
            } ),
            catchError( (error)  => {
                // TODO : Manejar excepción mostrando una pagina de error.
                this.router.navigateByUrl('/');
                return of();
            })
        );
    }
}
