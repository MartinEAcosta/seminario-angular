import { inject } from '@angular/core';
import { CanMatchFn, Route, Router, UrlSegment } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { AuthService } from '@auth/services/auth.service';

export const AuthenticatedGuard: CanMatchFn = async(
    route: Route,
    segments: UrlSegment[]
) => {

    const router = inject(Router);
    const authService = inject(AuthService);
    const isAuthenticated = await firstValueFrom( authService.checkStatus() );

    if( !isAuthenticated ){
        router.navigateByUrl('/');
        return false;
    }

    return true;
}