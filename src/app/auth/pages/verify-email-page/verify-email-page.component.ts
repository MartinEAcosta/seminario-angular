/*
    Path:PORT/auth/verify-email
    Path:PORT/auth/verify-email/:token
*/
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { AuthService } from '@auth/services/auth.service';
import { EmailVerificationBannerComponent } from '@auth/components/email-verification-banner/email-verification-banner.component';

type ConfirmState = 'idle' | 'confirming' | 'success' | 'error';

@Component({
    selector: 'app-verify-email-page',
    templateUrl: './verify-email-page.component.html',
    styleUrl: './verify-email-page.component.scss',
    imports: [EmailVerificationBannerComponent, RouterLink]
})
export class VerifyEmailPageComponent {

  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);

  // Si la ruta trae un token ( /auth/verify-email/:token ) se confirma la validación automáticamente.
  public confirmState = signal<ConfirmState>('idle');

  constructor() {
    const token = this.route.snapshot.paramMap.get('token');

    if( token ){
      this.confirmState.set('confirming');
      this.authService.confirmEmailVerification( token )
                        .subscribe( ( ok ) => {
                          this.confirmState.set( ok ? 'success' : 'error' );
                        });
    }
  }

}
