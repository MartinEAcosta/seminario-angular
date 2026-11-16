import { inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { AuthService } from '@auth/services/auth.service';
import { catchError, map, of } from 'rxjs';

export const SingleUseTokenGuard: CanActivateFn = (
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
) => {
    const authService = inject(AuthService);
    const router = inject(Router);
    const token = route.paramMap.get('token')!;

    console.log(token)

    return authService.singleUseTokenIsValid( token )
                                .pipe(
                                    map( (res) => res ? true : router.createUrlTree(['/reset-password/expired']) ),
                                    catchError( (res) => of(router.createUrlTree(['/reset-password/expired'])),
                                ));
};