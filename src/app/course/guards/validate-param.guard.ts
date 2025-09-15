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

    const courseId = route.paramMap?.get('id');
    
    if( !courseId ||  !idPattern.test( courseId ) ) {
        router.navigateByUrl('/');
        return false;
    }

    return true;
}