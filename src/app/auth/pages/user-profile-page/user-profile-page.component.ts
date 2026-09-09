import { Component, computed, inject, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';

import { FormUtils } from '@utils/form-utils';
import { AuthService } from '@auth/services/auth.service';
import { UIService } from '@shared/services/ui/ui.service';
import { FormErrorLabelComponent } from '@shared/components/form-error-label/form-error-label.component';

type SettingsSection = 'perfil' | 'cuenta';

// Group-level check: lives here rather than in FormUtils because only this page needs it.
const passwordsMatchValidator = ( group : AbstractControl ) : ValidationErrors | null => {
  const newPassword = group.get('newPassword')?.value;
  const confirmPassword = group.get('confirmPassword')?.value;

  return newPassword === confirmPassword ? null : { passwordsMismatch : true };
}

@Component({
  selector: 'app-user-profile-page',
  imports: [ ReactiveFormsModule, FormErrorLabelComponent, NgClass ],
  templateUrl: './user-profile-page.component.html',
  styleUrls: ['../../form-global.scss', './user-profile-page.component.scss'],
})
export class UserProfilePageComponent {

  readonly defaultAvatar = 'assets/user-profile.svg';

  public authService = inject(AuthService);
  private uiService = inject(UIService);
  private fb = inject(FormBuilder);

  activeSection = signal<SettingsSection>('perfil');

  // Data URL of the image picked by the user. null = show the default avatar.
  avatarPreview = signal<string | null>(null);

  isEmailVerified = computed<boolean>( () => this.authService.user()?.isEmailVerified ?? false );
  isSendingVerification = signal<boolean>(false);

  public profileForm : FormGroup = this.fb.group({
    username : [
                '',
                [ Validators.required, Validators.minLength(3), Validators.pattern( FormUtils.notOnlySpacesPattern ) ]
              ],
    email : [
              '',
              [ Validators.required, Validators.pattern( FormUtils.emailPattern ) ]
            ],
  });

  // Never prefilled: always starts empty.
  public passwordForm : FormGroup = this.fb.group({
    currentPassword : [ '', [ Validators.required ] ],
    newPassword : [ '', [ Validators.required, Validators.minLength(6) ] ],
    confirmPassword : [ '', [ Validators.required ] ],
  }, { validators : passwordsMatchValidator });

  constructor() {
    const user = this.authService.user();

    this.profileForm.patchValue({
      username : user?.username ?? '',
      email : user?.email ?? '',
    });
  }

  onSelectSection( section: SettingsSection ): void {
    this.activeSection.set( section );
  }

  onAvatarSelected( event: Event ): void {
    
  }

  onRemoveAvatar( input: HTMLInputElement ): void {
    this.avatarPreview.set( null );
    // Let the same file be picked again right after removing it.
    input.value = '';
  }

  onSaveProfile(): void {
    this.profileForm.markAllAsTouched();

    if( !this.profileForm.valid ) return;

    // Mock: no HTTP call yet. Swap this log for the real endpoint when it exists.
    console.log('[mock] Actualizar perfil', this.profileForm.value);
    this.uiService.showToastMessage('Perfil actualizado.');
  }

  // True once the group-level check fails and the user has reached the confirm field.
  get showPasswordsMismatch(): boolean {
    return this.passwordForm.hasError('passwordsMismatch')
            && ( this.passwordForm.get('confirmPassword')?.touched ?? false );
  }

  onChangePassword(): void {
    this.passwordForm.markAllAsTouched();

    if( !this.passwordForm.valid ) return;

    // Mock: no HTTP call yet. Swap this log for the real endpoint when it exists.
    console.log('[mock] Cambiar contraseña', this.passwordForm.value);
    this.uiService.showToastMessage('Contraseña actualizada.');
    this.passwordForm.reset();
  }

  // The one real write on this page: the endpoint already exists and verify-email-page uses it.
  onResendVerificationEmail(): void {
    if( this.isSendingVerification() ) return;

    this.isSendingVerification.set(true);
    this.authService.sendVerificationEmail()
                      .subscribe( ( ok ) => {
                        this.isSendingVerification.set(false);

                        if( ok ){
                          this.uiService.showToastMessage('Te enviamos el email de validación. Revisá tu bandeja de entrada.');
                        }
                      });
  }

}
