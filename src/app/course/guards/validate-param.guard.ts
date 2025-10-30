import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from "@angular/router";

const idPattern = /^[0-9a-fA-F]{24}$/;

export const ValidateParamIdGuard : CanActivateFn = (
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
) => {
    
    const router = inject(Router);

    const paramId = route.paramMap?.get('id');
    
    if( !paramId ||  !idPattern.test( paramId ) ) {
        router.navigateByUrl('/');
        return false;
    }

    return true;
}