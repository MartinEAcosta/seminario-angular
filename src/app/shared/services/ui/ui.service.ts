import { effect, Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UIService {

  _errorMessage = signal<string | null>(null);

  errorMessage = this._errorMessage.asReadonly();

  private timer : any ;

  setErrorMessage = ( message : string , duration : number = 3500 ) : void => {

    if( this.errorMessage() ) return;


    this._errorMessage.set( message );

    setTimeout(() => {
      this.clearErrorMessage();
    }, duration );
  }

  clearErrorMessage = () : void => {
    this._errorMessage.set( null );
  }

} 
