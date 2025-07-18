import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { rxResource } from '@angular/core/rxjs-interop';

import { environment } from '../../../environments/environment';
import { UIService } from 'src/app/shared/services/ui/ui.service';
import { AuthResponse, User, UserDTO } from '@interfaces/auth.interfaces';
import { AuthMapper } from '@mappers/auth.mapper';

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
    loader: () => this.checkStatus()
  });
  
  user = computed( () => this._user );
  id = computed( this._id );
  token = computed(this._token);

  authStatus = computed<AuthStatus>(() => {
    if( this._authStatus() === 'checking' ) return 'checking';

    if( this._user() ){
      return 'authenticated';
    }

    return 'not-authenticated';
  });

  registerUser = ( userRequest : UserDTO ) : Observable<User | false> => {
    return this.http
                  .post<AuthResponse>(`${this.baseURL}/new` , { ...userRequest } )
                    .pipe( 
                      map( ( authResponse ) =>  this.handleAuthSuccess( authResponse )),
                      // En caso de tener un error se captura y se toman las acciones de "limpieza"
                      catchError( (error : any ) => this.handleAuthError( error.error ) )
            );
  }

  loginUser = ( userRequest : UserDTO ) : Observable<User | false> => {
    return this.http.post<AuthResponse>(`${this.baseURL}` , { ...userRequest } )
                      .pipe(
                        map( ( authResponse ) => this.handleAuthSuccess( authResponse ) ),
                        catchError( ( error : any ) =>  this.handleAuthError( error.error ) )
              );
  }

  logoutUser = ( ) : void => {
    this._user.set(null);
    this._token.set(null);
    this._authStatus.set('not-authenticated');

    localStorage.clear();
  }
  
  checkStatus = ( ) : Observable<boolean> => {
    const token = localStorage.getItem('x-token');
    
    if( !token ){
      this.logoutUser();
      return of(false);
    }
    return this.http.get<AuthResponse>(`${this.baseURL}/renew`, { } )
                      .pipe( 
                        map( ( authResponse ) => {
                          return this.handleAuthSuccess( authResponse )?.username ? true : false;
                        } ),
                        catchError( (error : any ) => this.handleAuthError( error.error ) )
    );
  }
  
  private handleAuthSuccess = ( authResponse : AuthResponse ) : User  => {
    this._user.set( authResponse.userRef );
    this._id.set( authResponse.userRef._id );
    this._token.set( authResponse.token );
    this._authStatus.set( 'authenticated' );
  
    localStorage.setItem('x-token' , authResponse.token);
    return AuthMapper.mapResponseToUser( authResponse );
  }
  
  private handleAuthError = ( error: any ) : Observable<false>  => {
    this.logoutUser();
    console.log(error);
    this.uiService.setErrorMessage( error.errorMessage );
    console.log(this.uiService.errorMessage());
    
    return of(false);
  }

}
