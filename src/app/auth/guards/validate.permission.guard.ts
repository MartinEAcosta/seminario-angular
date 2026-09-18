import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from "@angular/router";
import { UserState } from "@user/state/user-state";

export const ValidatePermissionGuard : CanActivateFn = (
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
) => {

    const expectedRoles: string[] = route.data['roles'] || [];
    const userState = inject( UserState );
    const router = inject( Router );

    if( !userState.user() ) return false;

    if( expectedRoles.includes( userState.user()?.role! ) ) {
        return true;
    }
    else{ 
        router.navigate(['/forbidden']);
        return false;
    }
}