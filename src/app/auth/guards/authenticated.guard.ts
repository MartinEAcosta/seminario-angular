import { inject } from '@angular/core';
import { CanMatchFn, Route, Router } from '@angular/router';
import { filter, firstValueFrom } from 'rxjs';

import { UserState } from '@user/state/user-state';
import { toObservable } from '@angular/core/rxjs-interop';

export const AuthenticatedGuard: CanMatchFn = async () => {
    const router = inject(Router);
    const userState = inject(UserState);

    const status = await firstValueFrom(
        toObservable(userState.authStatus).pipe(filter(s => s !== 'checking'))
    );

    if (status !== 'authenticated') {
        router.navigateByUrl('/');
        return false;
    }
    return true;
}