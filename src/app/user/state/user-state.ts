import { computed, inject, Injectable, linkedSignal, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { FormUtils } from '@utils/form-utils';
import { AuthStatus, User } from '@interfaces/auth.interfaces';

@Injectable({
  providedIn: 'root'
})
export class UserState {
  avatarFile = signal<File | null>( null );
  tempAvatar = signal<string | null>( null );

  private _user = signal<User | null>( null );
  private _token = signal<string | null>( localStorage.getItem('x-token') );
  private _authStatus = signal<AuthStatus>( 'checking' );

  user = computed( this._user );
  token = computed( this._token );
  id = computed( () => this._user()?.id ?? null );
  authStatus = computed<AuthStatus>( () => {
    if ( this._authStatus() === 'checking' ) return 'checking';
    return this._user() ? 'authenticated' : 'not-authenticated';
  });

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

    user.avatar_url ? this.setTempAvatar( user.avatar_url ) : this.setTempAvatar(null);

    return this.profileForm;
  }

  public setTempAvatar ( url : string | null ) : void {
    this.tempAvatar.set( url );
  }

  public setAvatarFile ( file : File | null ) : void {
    this.avatarFile.set( file );
  }

  public setUser ( user : User | null ) : void {
    this._user.set( user );
  }

  public setToken ( token : string | null ) : void {
    this._token.set( token );
    if ( token ) localStorage.setItem('x-token', token);
    else localStorage.removeItem('x-token');
  }

  public setAuthStatus ( status : AuthStatus ) : void {
    this._authStatus.set( status );
  }

  public setEmailVerified ( verified : boolean ) : void {
    this._user.update( user => user ? { ...user, isEmailVerified: verified } : user );
  }

  public logout ( ) : void {
    this.reset();
    this.setUser(null);
    this.setToken(null);
    this.setAuthStatus('not-authenticated');
  }

}
