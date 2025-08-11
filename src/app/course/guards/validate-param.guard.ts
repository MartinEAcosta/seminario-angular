import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from "@angular/router";
import { CourseService } from "../services/course.service";

const idPattern = /^[0-9a-fA-F]{24}$/;


export const ValidateParamGuard : CanActivateFn = async (
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
) => {
    
    const router = inject(Router);
    const courseId = route.paramMap?.get('id');
    
    if( !courseId ||  !idPattern.test( courseId ) ) {
        console.log('Error al querer realizar el update de un curso sin dar un id.')
        router.navigateByUrl('/');
        return false;
    }

    return true;
}