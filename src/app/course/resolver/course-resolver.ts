import { inject, Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from "@angular/router";
import { catchError, map, Observable, of } from "rxjs";

import { Course } from "@interfaces/course.interfaces";
import { CourseService } from "../services/course.service";

@Injectable({ providedIn: 'root' })
export class CourseResolver implements Resolve<Course> {

    router = inject(Router);
    service = inject(CourseService);

    resolve(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<Course> {
        const courseId = route.paramMap.get('id');
        return this.service.getById(courseId!).pipe(
            map( course =>{
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
