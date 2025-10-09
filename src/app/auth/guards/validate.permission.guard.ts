import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from "@angular/router";
import { AuthService } from "../services/auth.service";

export const ValidatePermissionGuard : CanActivateFn = (
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
) => {
    
    const expectedRoles: string[] = route.data['roles'] || [];
    const authService = inject( AuthService );
    const router = inject( Router );

    if( !authService.user() ) return false;

    if( expectedRoles.includes( authService.user()?.role! ) ) {
        return true;
    }
    else{ 
        router.navigate(['/forbidden']);
        return false;
    }
}