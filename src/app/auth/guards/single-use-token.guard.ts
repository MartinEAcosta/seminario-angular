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

    const askForNewLink = () => router.createUrlTree(['/auth/forgot-password']);

    return authService.singleUseTokenIsValid( token )
                                .pipe(
                                    map( ( isValid ) => isValid ? true : askForNewLink() ),
                                    catchError( () => of( askForNewLink() ) ),
                                );
};