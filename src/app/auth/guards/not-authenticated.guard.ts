import { inject } from '@angular/core';
import { CanMatchFn } from '@angular/router';
import { filter, firstValueFrom } from 'rxjs';
import { toObservable } from '@angular/core/rxjs-interop';

import { UserState } from '@user/state/user-state';

export const NotAuthenticatedGuard: CanMatchFn = async() => {

    const userState = inject(UserState);
    // Mismo motivo que en AuthenticatedGuard: esperar a que AuthService termine
    // de resolver el authStatus en vez de volver a pedir /auth/renew acá.
    const status = await firstValueFrom(
        toObservable(userState.authStatus).pipe( filter( (s) => s !== 'checking' ) )
    );

    return status !== 'authenticated';
}