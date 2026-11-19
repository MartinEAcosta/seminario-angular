import { Component, computed, inject, input, OnDestroy, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';

import { AuthService } from '@auth/services/auth.service';
import { UserState } from '@user/state/user-state';
import { UIService } from '@shared/services/ui/ui.service';
import { getAuthErrorMessage, isServerError } from '@auth/utils/auth-error-message';

const RESEND_COOLDOWN_SECONDS = 60;

@Component({
    selector: 'app-email-verification-banner',
    templateUrl: './email-verification-banner.component.html',
    styleUrl: './email-verification-banner.component.scss',
    imports: []
})
export class EmailVerificationBannerComponent implements OnDestroy {

  public authService = inject(AuthService);
  public userState = inject(UserState);
  private uiService = inject(UIService);
  private router = inject(Router);

  // true cuando el banner vive embebido en otra card (user-profile-page) y debe
  // perder su propio borde/radio/margen para fundirse con el contenedor padre.
  public flush = input<boolean>(false);

  public isSending = signal<boolean>(false);
  public cooldown = signal<number>(0);
  private cooldownIntervalId : any;

  public isVerified = computed<boolean>( () => this.userState.user()?.isEmailVerified ?? false );

  constructor() {}
  
  ngOnDestroy(): void {
    clearInterval( this.cooldownIntervalId );
  }

  public onSendVerificationEmail = ( ) : void => {
    if( this.isSending() || this.cooldown() > 0 ) return;

    this.isSending.set(true);
    this.authService.sendVerificationEmail()
                      .subscribe({
                        next : () => {
                          this.isSending.set(false);
                          this.uiService.showToastMessage('Te enviamos un email para validar tu cuenta. Revisá tu bandeja de entrada.');
                          this.startCooldown();
                        },
                        error : ( error : HttpErrorResponse ) => {
                          this.isSending.set(false);
                          if( isServerError( error ) ){
                            this.router.navigateByUrl('/error');
                            return;
                          }
                          this.uiService.showToastMessage( getAuthErrorMessage( error , 'No pudimos enviar el email de validación.' ) );
                        },
                      });
  }

  private startCooldown = ( ) : void => {
    this.cooldown.set( RESEND_COOLDOWN_SECONDS );
    clearInterval( this.cooldownIntervalId );

    this.cooldownIntervalId = setInterval( () => {
      this.cooldown.update( ( seconds ) => {
        if( seconds <= 1 ){
          clearInterval( this.cooldownIntervalId );
          return 0;
        }
        return seconds - 1;
      });
    }, 1000 );
  }

}
