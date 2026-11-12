import { Component, computed, inject, OnDestroy, Signal, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { FormBuilder, FormControl, ReactiveFormsModule } from '@angular/forms';

import { AuthService } from '@auth/services/auth.service';
import { UIService } from '@shared/services/ui/ui.service';
import { FileService } from '@file/services/file.service';
import { UserState } from '@user/state/user-state';
import { AuthMapper } from '@mappers/auth.mapper';
import { applyFileControlChange, clearFileControlChange } from '@file/utils/file-control-change';
import { FormErrorLabelComponent } from '@shared/components/form-error-label/form-error-label.component';
import { EmailVerificationBannerComponent } from '@auth/components/email-verification-banner/email-verification-banner.component';
import { RoleLabelPipe } from '@auth/pipes/role-label.pipe';
import { buildPasswordForm, buildProfileForm, getPasswordStrength, patchProfileForm } from '@auth/forms/user-form-factory';
import { toSignal } from '@angular/core/rxjs-interop';
import { FilePreviewControl } from '@file/models/file-preview-control';
import { PasswordDTO } from '@auth/models/auth.interfaces';

@Component({
  selector: 'app-user-profile-page',
  imports: [ ReactiveFormsModule, FormErrorLabelComponent, NgClass, EmailVerificationBannerComponent, RoleLabelPipe ],
  templateUrl: './user-profile-page.component.html',
  styleUrls: ['../../form-global.scss', './user-profile-page.component.scss'],
})
export class UserProfilePageComponent implements OnDestroy {

  private fb = inject(FormBuilder);
  private fileService = inject(FileService);
  private uiService = inject(UIService);
  private userState = inject(UserState);
  private authService = inject(AuthService);

  user = computed( () => this.userState.user() );
  avatarUrl = computed( () => this.userState.avatarUrl() );
  avatarSrc = computed( () => {
    if( this.avatarPreview.preview() ) return this.avatarPreview.preview();
    if( this.avatarRemoved() ) return this.userState.defaultAvatarUrl;
    return this.avatarUrl();
  });
  profileForm = buildProfileForm(this.fb);
  passwordForm = buildPasswordForm(this.fb);

  isEmailVerified = computed<boolean>( () => this.userState.user()?.isEmailVerified ?? false );
  // Collapsed by default: the password fields only mount once the user asks to change it.
  isChangingPassword = signal<boolean>(false);
  // Drives the submit button's loading state and blocks a second submit while the request is in flight.
  isSavingProfile = signal<boolean>(false);

  avatarRemoved = signal<boolean>(false);
  avatarValue : Signal<FormControl<File | null>> = computed( () => {
    return this.profileForm.get('avatar') as FormControl<File | null>;
  });
  avatarPreview = new FilePreviewControl( );

  newPasswordValue = toSignal(
    this.passwordForm.controls['newPassword'].valueChanges,
    { initialValue : '' },
  );
  newPasswordStrength = computed( () => getPasswordStrength( this.newPasswordValue() ?? '' ) );

  constructor() {
    if( this.user() ) patchProfileForm(this.profileForm, this.user()! );
  }

  ngOnDestroy () {
    this.avatarPreview.reset();
  }

  onAvatarSelected( event: Event ): void {
    const selected = this.fileService.onFileChanged(event);
    if( !selected ) return;
    this.avatarRemoved.set(false);
    applyFileControlChange( this.avatarValue(), this.avatarPreview, selected );
  }

  onRemoveAvatar( input: HTMLInputElement ): void {
    clearFileControlChange( this.avatarValue(), this.avatarPreview );
    // Let the same file be picked again right after removing it.
    this.avatarRemoved.set(true);
    input.value = '';
  }

  onSaveProfile(): void {
    this.profileForm.markAllAsTouched();

    if( !this.profileForm.valid || this.isSavingProfile() ) return;

    this.isSavingProfile.set(true);
    const userDto = AuthMapper.mapFormToUserDTO( this.profileForm );
    const file = this.avatarValue()?.value;

    let userToUpdate = userDto;
    if( this.avatarRemoved() && this.user()?.id_file ) { 
        this.fileService.deleteFile( this.user()?.id_file! ).subscribe( () => {
          this.uiService.showToastMessage('Avatar eliminado.')
          this.avatarRemoved.set(false);
        });
        userToUpdate = {
          ...userDto,
        };
    }

    this.authService.updateUser(userToUpdate, file).subscribe( ( user ) => {
      this.isSavingProfile.set(false);
      if( !user ) return; // AuthService ya mostró el error vía handleAuthError.
      this.userState.setUser(user);
      this.avatarPreview.reset();
      patchProfileForm(this.profileForm, user);
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
    }
  }

  onChangePassword(): void {
    this.passwordForm.markAllAsTouched();
    if( !this.passwordForm.valid ) return;

    const passwordDto : PasswordDTO = AuthMapper.mapFormToPasswordDTO( this.passwordForm );
    this.authService.updatePassword( passwordDto ).subscribe( () => {
      this.uiService.showToastMessage('Contraseña actualizada.');
    });
    this.passwordForm.reset();
    this.isChangingPassword.set(false);
  }

}
