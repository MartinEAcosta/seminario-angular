import { inject } from '@angular/core';
import { CanMatchFn, Route, Router, UrlSegment } from '@angular/router';
import { UserState } from '@user/state/user-state';
import { filter, firstValueFrom } from 'rxjs';
import { toObservable } from '@angular/core/rxjs-interop';

export const NotAuthenticatedGuard: CanMatchFn = async() => {

    const userState = inject(UserState);
    // Mismo motivo que en AuthenticatedGuard: esperar a que AuthService termine
    // de resolver el authStatus en vez de volver a pedir /auth/renew acá.
    const status = await firstValueFrom(
        toObservable(userState.authStatus).pipe( filter( (s) => s !== 'checking' ) )
    );

    return status !== 'authenticated';
}