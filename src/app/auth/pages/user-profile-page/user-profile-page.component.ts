import { Component, computed, inject, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';

import { FormUtils } from '@utils/form-utils';
import { AuthService } from '@auth/services/auth.service';
import { UserDTO } from '@auth/models/auth.interfaces';
import { UIService } from '@shared/services/ui/ui.service';
import { FormErrorLabelComponent } from '@shared/components/form-error-label/form-error-label.component';
import { FileService } from '@file/services/file.service';
import { UserState } from '@user/state/user-state';

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
  private fileService = inject(FileService);
  public userState = inject(UserState);

  activeSection = signal<SettingsSection>('perfil');

  // Local preview if a new avatar was picked, otherwise fall back to the persisted one.
  avatarPreview = computed<string | null>(
    () => this.userState.tempAvatar() ?? this.authService.user()?.avatar_url ?? null
  );

  isEmailVerified = computed<boolean>( () => this.authService.user()?.isEmailVerified ?? false );
  isSendingVerification = signal<boolean>(false);

  // Owned by UserState so FileService can write the picked avatar into it and
  // onSaveProfile can read it back without any effect() tying the two together.
  get profileForm() : FormGroup {
    return this.userState.profileForm;
  }

  // Never prefilled: always starts empty.
  public passwordForm : FormGroup = this.fb.group({
    currentPassword : [ '', [ Validators.required ] ],
    newPassword : [ '', [ Validators.required, Validators.minLength(6) ] ],
    confirmPassword : [ '', [ Validators.required ] ],
  }, { validators : passwordsMatchValidator });

  constructor() {
    // Único punto de sync user -> form: se ejecuta una sola vez acá, nunca
    // dentro de un effect(), así no hay forma de que un guardado dispare
    // un re-patch que a su vez dispare otro guardado.
    const user = this.authService.user();
    if( user ) this.userState.patchValuesForm(user);
  }

  onSelectSection( section: SettingsSection ): void {
    this.activeSection.set( section );
  }

  onAvatarSelected( event: Event ): void {
    this.fileService.onFileChanged(event, 'user');
  }

  onRemoveAvatar( input: HTMLInputElement ): void {
    this.userState.setTempAvatar( null );
    this.userState.setAvatarFile( null );
    // Let the same file be picked again right after removing it.
    input.value = '';
  }

  onSaveProfile(): void {
    this.profileForm.markAllAsTouched();

    if( !this.profileForm.valid ) return;

    const dto : Partial<UserDTO> = { ...this.profileForm.value };

    this.authService.updateUser(dto).subscribe( ( user ) => {
      if( !user ) return; // AuthService ya mostró el error vía handleAuthError.

      const file = this.userState.avatarFile();
      if( file ){
        this.fileService.uploadFile('user', user.id, file).subscribe();
      }

      this.uiService.showToastMessage('Perfil actualizado.');
      this.userState.setTempAvatar(null);
      this.userState.setAvatarFile(null);
    });
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
