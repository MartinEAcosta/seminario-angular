import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UIService {

  _errorMessage = signal<string | null>(null);

  errorMessage = this._errorMessage.asReadonly();

  private timer : any ;

  showToastMessage = ( message : string , duration : number = 3500 ) : void => {

    if( this.errorMessage() ) return;

    this._errorMessage.set( message );

    // El timer se guarda y se cancela al limpiar: si no, el temporizador del
    // mensaje anterior borraría el siguiente antes de que cumpla su duración.
    clearTimeout( this.timer );
    this.timer = setTimeout(() => {
      this.clearErrorMessage();
    }, duration );
  }

  clearErrorMessage = () : void => {
    clearTimeout( this.timer );
    this._errorMessage.set( null );
  }

} 
