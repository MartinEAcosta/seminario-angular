import { Component, inject, OnDestroy, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';

import { AuthService } from '@auth/services/auth.service';
import { UIService } from '@shared/services/ui/ui.service';
import { FormErrorLabelComponent } from '@shared/components/form-error-label/form-error-label.component';
import { userFieldsValidators } from '@auth/forms/user-form-factory';

const RESEND_COOLDOWN_SECONDS = 60;

@Component({
  selector: 'app-forgot-password-page',
  templateUrl: './forgot-password-page.component.html',
  styleUrls: ['../../form-global.scss', './forgot-password-page.component.scss'],
  imports: [ReactiveFormsModule, FormErrorLabelComponent, NgClass, RouterLink],
})
export class ForgotPasswordPageComponent implements OnDestroy {

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private uiService = inject(UIService);

  // Bloquean el botón mientras hay una request en vuelo o un reenvío en cooldown,
  // mismo patrón que email-verification-banner.component.ts.
  public isSending = signal<boolean>(false);
  public cooldown = signal<number>(0);
  private cooldownIntervalId : any;

  public forgotForm : FormGroup = this.fb.group({
    email : [ '', userFieldsValidators.email ],
  });

  public onSendLink = () : void => {
    this.forgotForm.markAllAsTouched();
    if( !this.forgotForm.valid || this.isSending() || this.cooldown() > 0 ) return;

    this.isSending.set(true);
    const email = this.forgotForm.value.email;

    this.authService.sendForgotPasswordEmail( email )
                      .subscribe( ( ok ) => {
                        this.isSending.set(false);
                        if( ok ){
                          this.uiService.showToastMessage('Te enviamos un enlace para recuperar tu contraseña. Revisá tu bandeja de entrada.');
                          this.startCooldown();
                        }
                      });
  }

  private startCooldown = () : void => {
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
