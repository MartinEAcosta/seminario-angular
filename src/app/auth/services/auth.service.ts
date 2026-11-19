import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, map, Observable, of, throwError } from 'rxjs';
import { rxResource } from '@angular/core/rxjs-interop';

import { environment } from '../../../environments/environment';
import { CartService } from '@cart/state/cart.service';
import { AuthResponse, PasswordDTO, User, UserDTO } from '@auth/models/auth.interface';
import { ApiResponse } from '@shared/models/api.interfaces';
import { AuthMapper } from '@mappers/auth.mapper';
import { UserState } from '@user/state/user-state';
import { AUTH_PROVIDER } from '@auth/auth.provider';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private http = inject(HttpClient);
  private baseURL : string = `${environment.apiURL}auth`;
  private router = inject(Router);
  private provider = inject(AUTH_PROVIDER);
  
  readonly googleReady = this.provider.ready;
  private cartService = inject(CartService);
  private userState = inject(UserState);

  // Se dispara ni bien el servicio es inyectado por primera vez.
  checkStatusResource = rxResource({
    stream: () => this.checkStatus()
  });

  constructor() {
    this.provider.onCode(
      code => this.exchangeCode(code).subscribe({
        error : err => console.warn('Login con Google fallido', err),
      }),
      err => console.warn('Login cancelado o fallido', err),
    );
  }

  private exchangeCode = ( code : string ) : Observable<User> => {
    return this.http
            .post<AuthResponse>(`${this.baseURL}/login/google`, { code })
              .pipe(
                map( ( authResponse : AuthResponse ) => {
                  this.router.navigateByUrl('');
                  return this.handleAuthSuccess( authResponse ) }),
                catchError( ( error : HttpErrorResponse ) => this.handleAuthError( error ) )
              );
  }

  public prepareGoogle() { return this.provider.prepare(); }
    
  public continueWithGoogle() {
    this.provider.signIn();
  }

  public registerUser = ( userRequest : UserDTO ) : Observable<User> => {
    return this.http
                  .post<AuthResponse>(`${this.baseURL}/register` , { ...userRequest } )
                    .pipe(
                      map( ( authResponse ) =>  this.handleAuthSuccess( authResponse )),
                      catchError( ( error : HttpErrorResponse ) => this.handleAuthError( error ) )
            );
  }

  public loginUser = ( userRequest : UserDTO ) : Observable<User> => {
    return this.http.post<AuthResponse>(`${this.baseURL}/login` , { ...userRequest } )
                      .pipe(
                        map( ( authResponse ) => this.handleAuthSuccess( authResponse ) ),
                        catchError( ( error : HttpErrorResponse ) => this.handleAuthError( error ) )
              );
  }

  public updateUser = ( userRequest :  Partial<UserDTO> ) : Observable<User> => {
    return this.http.put<AuthResponse>(`${this.baseURL}/update/user/${this.userState.user()?.id}` , { ...userRequest } )
                      .pipe(
                        map( ( authResponse ) => this.handleAuthSuccess( authResponse ) ),
                        catchError( ( error : HttpErrorResponse ) => this.handleAuthError( error ) )
                      );
  }

  // Los cinco métodos de abajo emiten `void` y propagan: el fallo real llega
  // siempre como status HTTP. El `ok` del body NO se chequea a propósito — el
  // backend contesta 200 neutro ("En caso de que el usuario exista, enviamos un
  // email") justamente para que el cliente no pueda deducir si la cuenta o el
  // token existen. Convertir ese 200 en error acá reintroduciría la fuga que la
  // respuesta neutra está tapando.

  public updatePassword = ( passwordDto : PasswordDTO ) : Observable<void> => {
    return this.http.put<AuthResponse>(`${this.baseURL}/password/` , { ...passwordDto } )
                      .pipe(
                        map( ( authResponse ) => {
                          // Solo refresca la sesión si la respuesta realmente trae una.
                          // `AuthResponse` tipa `user` y `token` como requeridos, pero este
                          // endpoint puede contestar sin ellos; sin la guarda, un cambio de
                          // contraseña exitoso borraría 'x-token' y desloguearía al usuario.
                          if( authResponse.user && authResponse.token ){
                            this.handleAuthSuccess( authResponse );
                          }
                        }),
                        catchError( ( error ) => throwError( () => error ) ),
                     );
  }

  // Envia (o reenvia) el email con el enlace de validación a la cuenta del usuario logueado.
  public sendVerificationEmail = ( ) : Observable<void> => {
    return this.http
                  .post<ApiResponse<boolean>>(`${this.baseURL}/send-validation-email`, {} )
                    .pipe(
                      map( () => undefined ),
                      catchError( ( error ) => throwError( () => error ) ),
                    );
  }

  // Confirma la validación del email a partir del token recibido por correo.
  public confirmEmailVerification = ( token : string ) : Observable<void> => {
    return this.http
                  .post<AuthResponse>(`${this.baseURL}/validate-email/${ token }`, {} )
                    .pipe(
                      map( ( authResponse ) => {
                        if( !authResponse.ok ){
                          throw new HttpErrorResponse({ status : 200 , statusText : 'OK' });
                        }
                        this.userState.setEmailVerified( true );
                      }),
                      catchError( ( error ) => throwError( () => error ) ),
                    );
  }

  public sendForgotPasswordEmail = ( email : string ) : Observable<void> => {
    return this.http
                .post<ApiResponse<boolean>>( `${this.baseURL}/forgot-password` , { email } )
                .pipe(
                  map( () => undefined ),
                  catchError( ( error ) => throwError( () => error ) ),
                );
  }

  // ResetPasswordPageComponent es el único consumidor y cubre el error con un estado
  // inline ("este enlace no es válido o expiró") en vez de un toast.
  public resetPassword = ( token : string, password : string ) : Observable<void> => {
    return this.http
                .post<ApiResponse<boolean>>( `${this.baseURL}/reset-password`, {  token , password } )
                .pipe(
                  map( () => undefined ),
                  catchError( ( error ) => throwError( () => error ) ),
                );
  }

  public singleUseTokenIsValid = ( token : string ) : Observable<boolean> =>  {
    return this.http.get<ApiResponse<{ valid : boolean }>>(`${this.baseURL}/reset-password/${token}/status`)
                    .pipe(
                      map( (res) => {
                        console.log(res);
                        return res.data.valid;
                      }),
                      catchError( ( error ) => {
                        console.log(error);
                        return of(true);
                      })
                    )
  }

  public logoutUser = ( ) : void => {
    const wasAuthenticated = this.userState.authStatus() === 'authenticated';

    this.userState.logout();
    this.cartService.clearCart();
    if( wasAuthenticated ){
      this.router.navigateByUrl('/');
    }
  }
  
  public checkStatus = ( ) : Observable<boolean> => {
    const token = localStorage.getItem('x-token');
    if( !token ){
      this.logoutUser();
      return of(false);
    }
    return this.http.get<AuthResponse>(`${this.baseURL}/renew`)
                      .pipe(
                        map( ( authResponse ) => {
                            if( authResponse.ok ){
                              this.handleAuthSuccess( authResponse );
                              return true;
                            }
                            // 200 con `ok : false`: no es un error HTTP, así que nadie
                            // destrabaría authStatus y los guards quedarían colgados.
                            this.settleCheckingStatus();
                            return false;
                        } ),
                        // Absorbe el error en vez de propagarlo, pero corre igual las dos
                        // responsabilidades estructurales que `handleAuthError` haría.
                        catchError( ( error : HttpErrorResponse ) => {
                          this.settleAuthState( error );
                          return of(false);
                        }),
    );
  }
  
  private handleAuthSuccess = ( authResponse : AuthResponse ) : User  => {
    this.userState.setUser( authResponse.user );
    this.userState.setToken( authResponse.token );
    this.userState.setAuthStatus( 'authenticated' );

    return AuthMapper.mapResponseToUser( authResponse );
  }
  
  // Destraba `authStatus` sin tocar el token. Los guards esperan una transición
  // fuera de 'checking' con `firstValueFrom`, así que si nadie la emite se cuelgan
  // para siempre (ver SPEC 06). Tiene que correr en TODOS los finales del chequeo
  // inicial, no solo en los errores.
  private settleCheckingStatus = ( ) : void => {
    if( this.userState.authStatus() === 'checking' ) {
      this.userState.setAuthStatus('not-authenticated');
    }
  }

  // Las dos responsabilidades estructurales que corren pase lo que pase con el
  // error, lo propague quien lo propague. `checkStatus` las necesita sin el throw.
  private settleAuthState = ( error : HttpErrorResponse ) : void => {
    // Solo cierra sesión ante un error real de autenticación (token inválido o
    // expirado) y solo si había algo que invalidar: un 401 de login de alguien que
    // no estaba logueado no tiene sesión, y `logoutUser()` le vaciaría el carrito
    // de invitado. Un 400 de validación y un 404 tampoco deslogean.
    const hadSession = this.userState.token() !== null || this.userState.user() !== null;
    if( ( error.status === 401 || error.status === 403 ) && hadSession ) {
      this.logoutUser();
    }

    this.settleCheckingStatus();
  }

  // Re-lanza el HttpErrorResponse crudo en vez de un Error con el mensaje: el
  // status es lo que decide el canal (banda inline, toast o navegación a
  // /error), así que envolverlo tiraría el único dato con el que el componente
  // puede ramificar (ver SPEC 16).
  private handleAuthError = ( error : HttpErrorResponse ) : Observable<never>  => {
    this.settleAuthState( error );
    return throwError( () => error );
  }

}
