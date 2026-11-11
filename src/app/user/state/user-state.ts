import { computed, Injectable, signal } from '@angular/core';

import { AuthStatus, User } from '@interfaces/auth.interfaces';

@Injectable({
  providedIn: 'root'
})
export class UserState {
  
  private _user = signal<User | null>( null );
  private _token = signal<string | null>( localStorage.getItem('x-token') );
  private _authStatus = signal<AuthStatus>( 'checking' );

  readonly defaultAvatarUrl = 'assets/user-profile.svg';

  user = computed( this._user );
  token = computed( this._token );
  id = computed( () => this._user()?.id ?? null );
  avatarUrl = computed<string>( () => this._user()?.avatar_url || this.defaultAvatarUrl );
  authStatus = computed<AuthStatus>( () => {
    if ( this._authStatus() === 'checking' ) return 'checking';
    return this._user() ? 'authenticated' : 'not-authenticated';
  });

  // Sync EXPLÍCITO y unidireccional: se llama una sola vez desde el componente
  // (nunca dentro de un effect() que también dispare un guardado), para no
  // terminar en un ciclo valueChanges -> guardar -> re-patch -> valueChanges.

  public setUser ( user : User | null ) : void {
    this._user.set( user );
  }

  public setToken ( token : string | null ) : void {
    console.log(token)
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
    this.setUser(null);
    this.setToken(null);
    this.setAuthStatus('not-authenticated');
  }

}
