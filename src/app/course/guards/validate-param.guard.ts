import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from "@angular/router";
import { CourseService } from "../services/course.service";
import { catchError, map, of } from "rxjs";

const idPattern = /^[0-9a-fA-F]{24}$/;


export const ValidateParamGuard : CanActivateFn = (
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
) => {
    
    const router = inject(Router);
    const courseService = inject(CourseService);

    const courseId = route.paramMap?.get('id');
    
    if( !courseId ||  !idPattern.test( courseId ) ) {
        console.log('Error al querer realizar el update de un curso sin dar un id.')
        router.navigateByUrl('/');
        return false;
    }
    else{
        return courseService.getById( courseId )
                                        .pipe( 
                                            map( response => {
                                                if( response.id ){
                                                    courseService.selectedCourse.set( response );
                                                    return true;
                                                }
                                                router.navigateByUrl('/');
                                                return false;
                                            } ),
                                            catchError( err => {
                                                router.navigateByUrl('/course/create');
                                                return of();
                                            }),
                                        );
        
    }
}