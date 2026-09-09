import { inject } from '@angular/core';
import { CanMatchFn, Route, Router } from '@angular/router';
import { filter, firstValueFrom } from 'rxjs';

import { AuthService } from '@auth/services/auth.service';
import { toObservable } from '@angular/core/rxjs-interop';

export const AuthenticatedGuard: CanMatchFn = async () => {
    const router = inject(Router);
    const authService = inject(AuthService);

    const status = await firstValueFrom(
        toObservable(authService.authStatus).pipe(filter(s => s !== 'checking'))
    );

    if (status !== 'authenticated') {
        router.navigateByUrl('/');
        return false;
    }
    return true;
}