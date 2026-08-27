import { Component, computed, inject, OnDestroy, signal } from '@angular/core';

import { AuthService } from '@auth/services/auth.service';
import { UIService } from '@shared/services/ui/ui.service';

const RESEND_COOLDOWN_SECONDS = 60;

@Component({
    selector: 'app-email-verification-banner',
    templateUrl: './email-verification-banner.component.html',
    styleUrl: './email-verification-banner.component.scss',
    imports: []
})
export class EmailVerificationBannerComponent implements OnDestroy {

  public authService = inject(AuthService);
  private uiService = inject(UIService);

  public isSending = signal<boolean>(false);
  public cooldown = signal<number>(0);

  private cooldownIntervalId : any;

  public isVerified = computed<boolean>( () => this.authService.user()?.isEmailVerified ?? false );

  onSendVerificationEmail = ( ) : void => {
    if( this.isSending() || this.cooldown() > 0 ) return;

    this.isSending.set(true);
    this.authService.sendVerificationEmail()
                      .subscribe( ( ok ) => {
                        this.isSending.set(false);
                        if( ok ){
                          this.uiService.showToastMessage('Te enviamos un email para validar tu cuenta. Revisá tu bandeja de entrada.');
                          this.startCooldown();
                        }
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

  ngOnDestroy(): void {
    clearInterval( this.cooldownIntervalId );
  }

}
