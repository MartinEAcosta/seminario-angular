/*
    Path:PORT/auth/reset-password/:token
*/
import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';

import { AuthService } from '@auth/services/auth.service';
import { UIService } from '@shared/services/ui/ui.service';
import { FormErrorLabelComponent } from '@shared/components/form-error-label/form-error-label.component';
import { buildResetPasswordForm, getPasswordStrength } from '@auth/forms/user-form-factory';

type ResetPanelState = 'form' | 'invalid';

@Component({
  selector: 'app-reset-password-page',
  templateUrl: './reset-password-page.component.html',
  styleUrls: ['../../form-global.scss', './reset-password-page.component.scss'],
  imports: [ReactiveFormsModule, FormErrorLabelComponent, NgClass, RouterLink],
})
export class ResetPasswordPageComponent {

  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);
  private uiService = inject(UIService);

  private token = this.route.snapshot.paramMap.get('token')!;

  public panelState = signal<ResetPanelState>('form');
  public isSaving = signal<boolean>(false);
  public showPassword = signal<boolean>(false);

  public resetForm : FormGroup = buildResetPasswordForm(this.fb);

  private newPasswordValue = toSignal(
    this.resetForm.controls['newPassword'].valueChanges,
    { initialValue : '' },
  );
  public newPasswordStrength = computed( () => getPasswordStrength( this.newPasswordValue() ?? '' ) );

  public toggleShowPassword = () => {
    this.showPassword.update( ( shown ) => !shown );
  }

  // True once la validación de grupo falla y el usuario ya llegó al campo de confirmación.
  public get showPasswordsMismatch() : boolean {
    return this.resetForm.hasError('passwordsMismatch')
            && ( this.resetForm.get('confirmPassword')?.touched ?? false );
  }

  public onSavePassword = () : void => {
    this.resetForm.markAllAsTouched();
    if( !this.resetForm.valid || this.isSaving() ) return;

    this.isSaving.set(true);
    const newPassword = this.resetForm.value.newPassword;

    this.authService.resetPassword( this.token, newPassword )
                      .subscribe( ( ok ) => {
                        this.isSaving.set(false);
                        if( ok ){
                          this.uiService.showToastMessage('Contraseña actualizada. Ingresá con tu nueva contraseña.');
                          this.router.navigateByUrl('/auth/login');
                        } else {
                          this.panelState.set('invalid');
                        }
                      });
  }

}
