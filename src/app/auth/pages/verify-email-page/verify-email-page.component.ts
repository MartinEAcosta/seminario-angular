/*
    Path:PORT/auth/verify-email/:token
*/
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import { AuthService } from '@auth/services/auth.service';
import { EmailVerificationBannerComponent } from '@auth/components/email-verification-banner/email-verification-banner.component';
import { isConnectionError, isServerError } from '@auth/utils/auth-error-message';

type ConfirmState = 'confirming' | 'success' | 'error' | 'offline';

@Component({
    selector: 'app-verify-email-page',
    templateUrl: './verify-email-page.component.html',
    styleUrl: './verify-email-page.component.scss',
    imports: [EmailVerificationBannerComponent, RouterLink]
})
export class VerifyEmailPageComponent {

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);

  public confirmState = signal<ConfirmState>('confirming');

  constructor() {
    const token = this.route.snapshot.paramMap.get('token')!;
    this.authService.confirmEmailVerification( token )
                      .subscribe({
                        next  : () => this.confirmState.set('success'),
                        error : ( error : HttpErrorResponse ) => {
                          if( isServerError( error ) ){
                            this.router.navigateByUrl('/error');
                            return;
                          }
                          // Sin respuesta del servidor no se sabe nada del enlace:
                          // decir que expiró sería inventar un diagnóstico.
                          this.confirmState.set( isConnectionError( error ) ? 'offline' : 'error' );
                        },
                      });
  }

}
