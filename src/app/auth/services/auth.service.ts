import { HttpClient } from '@angular/common/http';
import { effect, inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { rxResource } from '@angular/core/rxjs-interop';

import { environment } from '../../../environments/environment';
import { UIService } from '@shared/services/ui/ui.service';
import { AuthResponse, AuthStatus, User, UserDTO } from '@auth/models/auth.interfaces';
import { AuthMapper } from '@mappers/auth.mapper';
import { ErrorResponse, VerificationEmailResponse } from '@shared/models/api.interfaces';
import { CartService } from '@cart/state/cart.service';
import { Router } from '@angular/router';
import { FileService } from '@file/services/file.service';
import { UserState } from '@user/state/user-state';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private http = inject(HttpClient);
  private baseURL : string = `${environment.apiURL}auth`;
  private router = inject(Router);
  private uiService = inject(UIService);
  private cartService = inject(CartService);
  private fileService = inject(FileService);
  private userState = inject(UserState);

  // Se dispara ni bien el servicio es inyectado por primera vez.
  checkStatusResource = rxResource({
    stream: () => this.checkStatus()
  });

  constructor( ) {
    let previousStatus : AuthStatus = this.userState.authStatus();
    effect( () => {
      const status = this.userState.authStatus();
      if( previousStatus === 'authenticated' && status === 'not-authenticated' ){
        this.router.navigateByUrl('/');
      }
      previousStatus = status;
    });
  }

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
                        map( ( authResponse ) => {
                          console.log(authResponse);
                          return this.handleAuthSuccess( authResponse )} ),
                        catchError( ( { error } ) => {
                          return this.handleAuthError( error )
                        } )
              );
  }

  public updateUser = ( userRequest :  Partial<UserDTO> , file : File | null ) : Observable<User | false> => {
    return this.http.put<AuthResponse>(`${this.baseURL}/update/user/${this.userState.user()?.id}` , { ...userRequest } )
                      .pipe(
                        map( ( authResponse ) => {
                          console.log(authResponse);
                          if( file ){
                            this.fileService.uploadFile( 'user' , this.userState.user()?.id! , file ).subscribe()
                          }
                          return this.handleAuthSuccess( authResponse )
                        } ),
                        catchError( ( { error } ) => {
                          return this.handleAuthError( error )
                        })
                      );
  }

  // Envia (o reenvia) el email con el enlace de validación a la cuenta del usuario logueado.
  public sendVerificationEmail = ( ) : Observable<boolean> => {
    return this.http
                  .post<VerificationEmailResponse>(`${this.baseURL}/send-validation-email`, {} )
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
                  .post<AuthResponse>(`${this.baseURL}/validate-email/${ token }`, {} )
                    .pipe(
                      map( ( authResponse ) => {
                        if( authResponse.ok ){
                          // Actualiza el flag en la señal de usuario sin necesidad de re-loguear.
                          this.userState.setEmailVerified( true );
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
    this.userState.logout();
    this.cartService.clearCart();

    localStorage.clear();
  }
  
  public checkStatus = ( ) : Observable<boolean> => {
    const token = localStorage.getItem('x-token');
    // console.log(token);
    if( !token ){
      this.logoutUser();
      return of(false);
    }
    return this.http.get<AuthResponse>(`${this.baseURL}/renew`)
                      .pipe( 
                        map( ( authResponse ) => {
                            if( authResponse.ok ) this.handleAuthSuccess( authResponse );
                            return authResponse.ok;
                        } ),
                        catchError( (error : any ) => { console.log(error); return this.handleAuthError( error.error )} )
    );
  }
  
  private handleAuthSuccess = ( authResponse : AuthResponse ) : User  => {
    this.userState.setUser( authResponse.user );
    this.userState.setToken( authResponse.token );
    this.userState.setAuthStatus( 'authenticated' );

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
