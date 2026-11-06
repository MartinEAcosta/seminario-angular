import { Component, computed, inject, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';

import { AuthService } from '@auth/services/auth.service';
import { UIService } from '@shared/services/ui/ui.service';
import { FormErrorLabelComponent } from '@shared/components/form-error-label/form-error-label.component';
import { EmailVerificationBannerComponent } from '@auth/components/email-verification-banner/email-verification-banner.component';
import { FileService } from '@file/services/file.service';
import { UserState } from '@user/state/user-state';
import { AuthMapper } from '@mappers/auth.mapper';
import { FormUtils } from '@utils/form-utils';

// Group-level check: lives here rather than in FormUtils because only this page needs it.
const passwordsMatchValidator = ( group : AbstractControl ) : ValidationErrors | null => {
  const newPassword = group.get('newPassword')?.value;
  const confirmPassword = group.get('confirmPassword')?.value;

  return newPassword === confirmPassword ? null : { passwordsMismatch : true };
}

const ROLE_LABELS: Record<'student' | 'teacher' | 'admin', string> = {
  student: 'Estudiante',
  teacher: 'Profesor',
  admin: 'Administrador',
};

@Component({
  selector: 'app-user-profile-page',
  imports: [ ReactiveFormsModule, FormErrorLabelComponent, NgClass, EmailVerificationBannerComponent ],
  templateUrl: './user-profile-page.component.html',
  styleUrls: ['../../form-global.scss', './user-profile-page.component.scss'],
})
export class UserProfilePageComponent {

  readonly defaultAvatar = 'assets/user-profile.svg';

  private fileService = inject(FileService);
  private uiService = inject(UIService);
  public userState = inject(UserState);
  private fb = inject(FormBuilder);
  public authService = inject(AuthService);

  roleLabel = computed<string>( () => ROLE_LABELS[ this.userState.user()?.role ?? 'student' ] );
  isEmailVerified = computed<boolean>( () => this.userState.user()?.isEmailVerified ?? false );

  // Collapsed by default: the password fields only mount once the user asks to change it.
  isChangingPassword = signal<boolean>(false);

  // Drives the submit button's loading state and blocks a second submit while the request is in flight.
  isSavingProfile = signal<boolean>(false);

  // Owned by UserState so FileService can write the picked avatar into it and
  // onSaveProfile can read it back without any effect() tying the two together.
  get profileForm() : FormGroup {
    return this.userState.profileForm;
  }

  // Never prefilled: always starts empty.
  public passwordForm : FormGroup = this.fb.group({
    currentPassword : [ '', [ Validators.required ] ],
    newPassword : [ '', [ Validators.required, Validators.pattern( FormUtils.strongPasswordPattern ) ] ],
    confirmPassword : [ '', [ Validators.required ] ],
  }, { validators : passwordsMatchValidator });

  public newPasswordValue = signal('');

  private static strongPasswordRegex = new RegExp( FormUtils.strongPasswordPattern );

  // Cuatro escalones atados al validador real (FormUtils.strongPasswordPattern:
  // minLength 8 + al menos un dígito), mismo criterio que form-register.component.ts:
  // ningún segmento promete una regla que el form no aplica.
  public newPasswordStrength = computed( () => {
    const value = this.newPasswordValue();
    return {
      started: value.length > 0,
      halfway: value.length >= 4,
      minLength: value.length >= 8,
      valid: UserProfilePageComponent.strongPasswordRegex.test(value),
    };
  });

  constructor() {
    // Único punto de sync user -> form: se ejecuta una sola vez acá, nunca
    // dentro de un effect(), así no hay forma de que un guardado dispare
    // un re-patch que a su vez dispare otro guardado.
    const user = this.userState.user();
    if( user ) this.userState.patchValuesForm(user);
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

    if( !this.profileForm.valid || this.isSavingProfile() ) return;

    this.isSavingProfile.set(true);

    const userDto = AuthMapper.mapFormToUserDTO( this.profileForm );
    const file = this.userState.avatarFile();

    let userToUpdate = userDto;
    if( (this.userState.user()?.avatar_url! && this.userState.user()?.id_file! ) && this.userState.avatarFile() === null ){
      this.fileService.deleteFile( this.userState.user()?.id_file! ).subscribe( () => {
        this.uiService.showToastMessage('Avatar eliminado.')
      });
      userToUpdate = {
        ...userDto,
        id_file : undefined,
      };
      this.userState.setTempAvatar(null);
      this.userState.setAvatarFile(null);
    }

    this.authService.updateUser(userToUpdate, file).subscribe( ( user ) => {
      this.isSavingProfile.set(false);
      if( !user ) return; // AuthService ya mostró el error vía handleAuthError.
      this.userState.setUser(user);
      this.uiService.showToastMessage('Perfil actualizado.');
    });
  }

  // True once the group-level check fails and the user has reached the confirm field.
  get showPasswordsMismatch(): boolean {
    return this.passwordForm.hasError('passwordsMismatch')
            && ( this.passwordForm.get('confirmPassword')?.touched ?? false );
  }

  onTogglePasswordChange(): void {
    this.isChangingPassword.update( ( open ) => !open );

    if( !this.isChangingPassword() ){
      this.passwordForm.reset();
      this.newPasswordValue.set('');
    }
  }

  onChangePassword(): void {
    this.passwordForm.markAllAsTouched();

    if( !this.passwordForm.valid ) return;

    // Mock: no HTTP call yet. Swap this for the real endpoint when it exists.
    // Deliberately not logging passwordForm.value: even mock console output shouldn't carry plaintext passwords.
    console.log('[mock] Cambiar contraseña');
    this.uiService.showToastMessage('Contraseña actualizada.');
    this.passwordForm.reset();
    this.newPasswordValue.set('');
    this.isChangingPassword.set(false);
  }

}
