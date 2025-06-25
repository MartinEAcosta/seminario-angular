import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { AuthResponse, User } from '../interfaces/auth.interfaces';
import { catchError, map, Observable, of } from 'rxjs';
import { rxResource } from '@angular/core/rxjs-interop';

type AuthStatus = 'checking' | 'authenticated' | 'not-authenticated';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private _authStatus = signal<AuthStatus>('checking');
  private _user = signal<User | null>(null);
  private _id = signal<string | null>(null);
  // Esto ayuda a que si se tiene una sesión ya iniciada y refrescar mantener la sesión.
  private _token = signal<string | null>( localStorage.getItem('x-token') );
  
  private http = inject(HttpClient);
  private baseURL : string = `${environment.apiURL}auth`;
  
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

  constructor() { }

  registerUser = ( username : string , email : string , password : string ) : Observable<boolean> => {
    return this.http.post<AuthResponse>(`${this.baseURL}/new` , { username , email ,password } )
                      .pipe( 
                        map( (resp) =>  this.handleAuthSuccess(resp) ),
                        // En caso de tener un error se captura y se toman las acciones de "limpieza"
                        catchError( (error : any ) => this.handleAuthError(error) )
              );
  }

  loginUser = ( email : string , password : string ) : Observable<boolean> => {
    return this.http.post<AuthResponse>(`${this.baseURL}` , { email : email , password : password } )
                      .pipe(
                        map( (resp) => this.handleAuthSuccess( resp ) ),
                        catchError( ( error : any ) =>  this.handleAuthError( error ) )
              );
  }

  logoutUser = ( ) => {
    this._user.set(null);
    this._token.set(null);
    this._authStatus.set('not-authenticated');

    localStorage.clear();
  }

  private handleAuthSuccess = ( { token , userRef } : AuthResponse )  => {
    this._user.set(userRef);
    this._id.set(userRef._id);
    this._token.set(token);
    this._authStatus.set('authenticated');

    localStorage.setItem('x-token' , token);
    return true;
  }

  private handleAuthError = ( error: any ) => {
    this.logoutUser();

    return of(false);
  }

  checkStatus = ( ) : Observable<boolean> => {
    
    const token = localStorage.getItem('x-token');
    if( !token ){
      this.logoutUser();
      return of(false);
    }

    return this.http.get<AuthResponse>(`${this.baseURL}/renew`, { } )
                      .pipe( 
                        map( ( resp ) => {
                          // console.log(resp); 
                          return this.handleAuthSuccess( resp )
                        } ),
                        catchError( (error : any ) => this.handleAuthError( error ) )
                      );
  }
  
}
