import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { rxResource } from '@angular/core/rxjs-interop';

import { environment } from '../../../environments/environment';
import { UIService } from '@shared/services/ui/ui.service';
import { AuthResponse, User, UserDTO } from '@auth/models/auth.interfaces';
import { AuthMapper } from '@mappers/auth.mapper';
import { ErrorResponse, VerificationEmailResponse } from '@shared/models/api.interfaces';

type AuthStatus = 'checking' | 'authenticated' | 'not-authenticated';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private _authStatus = signal<AuthStatus>('checking');
  private _user = signal<User | null>(null);
  private _id = signal<string | null>(null);
  // Esto ayuda a que si se tiene una sesión ya iniciada y se refresca, se puede mantener la sesión.
  private _token = signal<string | null>( localStorage.getItem('x-token') );

  private http = inject(HttpClient);
  private baseURL : string = `${environment.apiURL}auth`;
  private uiService = inject(UIService);

  // Se dispara ni bien el servicio es inyectado por primera vez.
  checkStatusResource = rxResource({
    stream: () => this.checkStatus()
  });
  
  user = computed( this._user );
  id = computed( this._id );
  token = computed(this._token);

  authStatus = computed<AuthStatus>(() => {
    if( this._authStatus() === 'checking' ) return 'checking';

    if( this._user() ){
      return 'authenticated';
    }

    return 'not-authenticated';
  });

  constructor( ) { }

  public registerUser = ( userRequest : UserDTO ) : Observable<User | false> => {
    return this.http
                  .post<AuthResponse>(`${this.baseURL}/register` , { ...userRequest } )
                    .pipe( 
                      map( ( authResponse ) =>  this.handleAuthSuccess( authResponse )),
                      // En caso de tener un error se captura y se toman las acciones de "limpieza"
                      catchError( (error : any ) => this.handleAuthError( error ) )
            );
  }

  public loginUser = ( userRequest : UserDTO ) : Observable<User | false> => {
    return this.http.post<AuthResponse>(`${this.baseURL}/login` , { ...userRequest } )
                      .pipe(
                        map( ( authResponse ) => this.handleAuthSuccess( authResponse ) ),
                        catchError( ( { error } ) => {
                          return this.handleAuthError( error )
                        } )
              );
  }

  // Envia (o reenvia) el email con el enlace de validación a la cuenta del usuario logueado.
  public sendVerificationEmail = ( ) : Observable<boolean> => {
    return this.http
                  .post<VerificationEmailResponse>(`${this.baseURL}/verify-email/send`, {} )
                    .pipe(
                      map( ( response ) => response.ok ),
                      catchError( ( { error } : { error : ErrorResponse } ) => {
                        this.uiService.showToastMessage( error?.error ?? 'No pudimos enviar el email de validación.' );
                        return of(false);
                      })
                    );
  }

  // Confirma la validación del email a partir del token recibido por correo.
  public confirmEmailVerification = ( token : string ) : Observable<boolean> => {
    return this.http
                  .patch<AuthResponse>(`${this.baseURL}/verify-email/${ token }`, {} )
                    .pipe(
                      map( ( authResponse ) => {
                        if( authResponse.ok ){
                          // Actualiza el flag en la señal de usuario sin necesidad de re-loguear.
                          this._user.update( ( user ) => user ? { ...user, isEmailVerified : true } : user );
                        }
                        return authResponse.ok;
                      }),
                      catchError( ( { error } : { error : ErrorResponse } ) => {
                        this.uiService.showToastMessage( error?.error ?? 'El enlace de validación no es válido o expiró.' );
                        return of(false);
                      })
                    );
  }

  public logoutUser = ( ) : void => {
    this._user.set(null);
    this._token.set(null);
    this._authStatus.set('not-authenticated');

    localStorage.clear();
  }
  
  public checkStatus = ( ) : Observable<boolean> => {
    const token = localStorage.getItem('x-token');
    // console.log(token);
    if( !token ){
      this.logoutUser();
      return of(false);
    }
    return this.http.get<AuthResponse>(`${this.baseURL}/renew`, { } )
                      .pipe( 
                        map( ( authResponse ) => {
                            if( authResponse.ok ) this.handleAuthSuccess( authResponse );
                            return authResponse.ok;
                        } ),
                        catchError( (error : any ) => { console.log(error); return this.handleAuthError( error.error )} )
    );
  }
  
  private handleAuthSuccess = ( authResponse : AuthResponse ) : User  => {
    this._user.set( authResponse.user );
    this._id.set( authResponse.user.id );
    this._token.set( authResponse.token );
    this._authStatus.set( 'authenticated' );
  
    localStorage.setItem('x-token' , authResponse.token);
    return AuthMapper.mapResponseToUser( authResponse );
  }
  
  private handleAuthError = ( error : any | ErrorResponse ) : Observable<false>  => {
    this.logoutUser();
    console.log( error);
    if( error.status === 400 ) {
      this.uiService.showToastMessage( error.error );
    }
    console.log(this.uiService.errorMessage());
    
    return of(false);
  }

}
