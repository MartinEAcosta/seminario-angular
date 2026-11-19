import { Component, computed, inject, OnDestroy, Signal, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormBuilder, FormControl, ReactiveFormsModule } from '@angular/forms';

import { AuthService } from '@auth/services/auth.service';
import { UIService } from '@shared/services/ui/ui.service';
import { FileService } from '@file/services/file.service';
import { UserState } from '@user/state/user-state';
import { AuthMapper } from '@mappers/auth.mapper';
import { applyFileControlChange, clearFileControlChange } from '@file/utils/file-control-change';
import { INVALID_MEDIA_TYPE_MESSAGE, isAllowedMediaType } from '@file/utils/allowed-media-type';
import { FormErrorLabelComponent } from '@shared/components/form-error-label/form-error-label.component';
import { EmailVerificationBannerComponent } from '@auth/components/email-verification-banner/email-verification-banner.component';
import { RoleLabelPipe } from '@auth/pipes/role-label.pipe';
import { buildPasswordForm, buildProfileForm, getPasswordStrength, MAX_AVATAR_BYTES, patchProfileForm } from '@auth/forms/user-form-factory';
import { toSignal } from '@angular/core/rxjs-interop';
import { FilePreviewControl } from '@file/models/file-preview-control';
import { User } from '@auth/models/auth.interface';
import { getAuthErrorMessage, isServerError } from '@auth/utils/auth-error-message';

@Component({
  selector: 'app-user-profile-page',
  imports: [ ReactiveFormsModule, FormErrorLabelComponent, NgClass, EmailVerificationBannerComponent, RoleLabelPipe ],
  templateUrl: './user-profile-page.component.html',
  styleUrls: [
    '../../form-global.scss',
    './user-profile-page.component.scss',
    './user-profile-password.component.scss',
  ],
})
export class UserProfilePageComponent implements OnDestroy {

  private fb = inject(FormBuilder);
  private router = inject(Router);
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
  isChangingPassword = signal<boolean>(false);
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
    const input = event.target as HTMLInputElement;
    const selected = this.fileService.onFileChanged(event);
    if( !selected ) return;

    // `onFileChanged` ya creó el object URL, así que todo camino de rechazo tiene
    // que liberarlo (ver SPEC 16) y limpiar el input: sin eso, volver a elegir el
    // MISMO archivo no dispara 'change' y no habría un segundo mensaje, y el input
    // mostraría el nombre del archivo rechazado mientras el FormControl conserva
    // el anterior.
    const reject = ( message : string ) : void => {
      URL.revokeObjectURL( selected.previewURL );
      input.value = '';
      this.uiService.showToastMessage( message );
    };

    if( !isAllowedMediaType( selected.file ) ){
      reject( INVALID_MEDIA_TYPE_MESSAGE );
      return;
    }

    // El form tiene `fileMaxSizeValidator(2_000_000)`, pero un control inválido
    // solo deshabilita el botón: sin este mensaje el usuario no sabe por qué.
    if( selected.file.size > MAX_AVATAR_BYTES ){
      reject('La imagen supera los 2 MB. Elegí una más liviana.');
      return;
    }

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

    const file = this.avatarValue()?.value ?? null;
    const removingAvatar = this.avatarRemoved();
    const idFile = this.user()?.id_file;

    if( removingAvatar && idFile ){
      this.fileService.deleteFile( idFile ).subscribe({
        next  : () => this.saveProfileData( file , true ),
        error : () => {
          this.isSavingProfile.set(false);
          this.uiService.showToastMessage('No pudimos eliminar la foto. No guardamos los cambios.');
        },
      });
      return;
    }

    this.saveProfileData( file , removingAvatar );
  }

  private saveProfileData( file : File | null , avatarRemoved : boolean ) : void {
    const userDto = AuthMapper.mapFormToUserDTO( this.profileForm );

    this.authService.updateUser( userDto ).subscribe({
      next : ( user ) => {
        // `UserDTO` no tiene campos de avatar, así que el PUT devuelve el avatar
        // viejo. El borrado se refleja acá, no se toma de la respuesta. Cadena
        // vacía y no null porque `User` los tipa `string`, y `UserState.avatarUrl`
        // ya hace `|| defaultAvatarUrl`.
        const saved : User = avatarRemoved
          ? { ...user , avatar_url : '' , id_file : '' }
          : user;

        if( !file ){
          this.finishProfileSave( saved , 'Perfil actualizado.' );
          return;
        }

        this.fileService.uploadFile( 'user' , saved.id , file ).subscribe({
          next : ( uploadedFile ) => this.finishProfileSave(
            {
              ...saved,
              avatar_url : uploadedFile.url ?? saved.avatar_url,
              id_file : uploadedFile.id,
            },
            'Perfil actualizado.',
          ),
          error : () => this.finishProfileSave( saved , 'Perfil actualizado, pero no pudimos subir la foto.' ),
        });
      },
      error : ( error : HttpErrorResponse ) => {
        this.isSavingProfile.set(false);

        if( isServerError( error ) ){
          this.router.navigateByUrl('/error');
          return;
        }

        if( error.status === 401 || error.status === 403 ){
          this.uiService.showToastMessage('Tu sesión expiró. Ingresá de nuevo para guardar los cambios.');
          return;
        }

        this.uiService.showToastMessage( getAuthErrorMessage( error , 'No pudimos actualizar tu perfil.' ) );
      },
    });
  }

  private finishProfileSave( user : User , message : string ) : void {
    this.isSavingProfile.set(false);
    this.userState.setUser(user);
    this.avatarPreview.reset();
    this.avatarRemoved.set(false);
    patchProfileForm(this.profileForm, user);
    this.uiService.showToastMessage(message);
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

    const passwordDto = AuthMapper.mapFormToPasswordDTO( this.passwordForm );
    this.authService.updatePassword( passwordDto ).subscribe({
      // El reset y el colapso de la card van en el éxito: si la contraseña actual
      // estaba mal, el usuario conserva lo que escribió y el formulario sigue abierto.
      next  : () => {
        this.uiService.showToastMessage('Contraseña actualizada.');
        this.passwordForm.reset();
        this.isChangingPassword.set(false);
      },
      error : ( error : HttpErrorResponse ) => {
        if( isServerError( error ) ){
          this.router.navigateByUrl('/error');
          return;
        }
        // `trustBackendMessage`: el usuario ya está autenticado, así que no hay
        // cuentas que enumerar, y el 401 de "contraseña actual incorrecta" es
        // justamente lo que hay que poder distinguir de cualquier otro fallo.
        this.uiService.showToastMessage(
          getAuthErrorMessage( error , 'No pudimos actualizar la contraseña.' , { trustBackendMessage : true } )
        );
      },
    });
  }

}
