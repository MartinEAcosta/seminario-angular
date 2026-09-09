import { inject } from '@angular/core';
import { CanMatchFn, Route, Router, UrlSegment } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { filter, firstValueFrom } from 'rxjs';
import { toObservable } from '@angular/core/rxjs-interop';

export const NotAuthenticatedGuard: CanMatchFn = async() => {

    const authService = inject(AuthService);
    // Mismo motivo que en AuthenticatedGuard: esperar a que AuthService termine
    // de resolver el authStatus en vez de volver a pedir /auth/renew acá.
    const status = await firstValueFrom(
        toObservable(authService.authStatus).pipe( filter( (s) => s !== 'checking' ) )
    );

    return status !== 'authenticated';
}