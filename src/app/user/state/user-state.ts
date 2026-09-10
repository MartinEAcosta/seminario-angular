import { inject, Injectable, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { FormUtils } from '@utils/form-utils';
import { User } from '@interfaces/auth.interfaces';

@Injectable({
  providedIn: 'root'
})
export class UserState {

  private fb = inject(FormBuilder);

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

  avatarFile = signal<File | null>( null );
  tempAvatar = signal<string | null>( null );

  public reset ( ) : void {
    this.profileForm.reset();
    this.avatarFile.set(null);
    this.tempAvatar.set(null);
  }

  // Sync EXPLÍCITO y unidireccional: se llama una sola vez desde el componente
  // (nunca dentro de un effect() que también dispare un guardado), para no
  // terminar en un ciclo valueChanges -> guardar -> re-patch -> valueChanges.
  public patchValuesForm = ( user : User ) : FormGroup => {
    this.profileForm.patchValue({
      username: user.username,
      email: user.email,
    });

    return this.profileForm;
  }

  public setTempAvatar ( url : string | null ) : void {
    this.tempAvatar.set( url );
  }

  public setAvatarFile ( file : File | null ) : void {
    this.avatarFile.set( file );
  }

}
