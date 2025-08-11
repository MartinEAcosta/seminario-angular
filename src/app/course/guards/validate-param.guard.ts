import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from "@angular/router";

export const ValidateParamGuard : CanActivateFn = async (
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
) => {
    
    const router = inject(Router);
    const courseId = route.paramMap.get('id');
    
    if( !courseId ) {
        console.log('Error al querer realizar el update de un curso sin dar un id.')
        router.navigateByUrl('/');
        return false;
    }
    return true;
}