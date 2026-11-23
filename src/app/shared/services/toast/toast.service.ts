import { Injectable, signal } from '@angular/core';

export type ToastSeverity = 'error' | 'success' | 'warning';

export interface Toast {
  message  : string;
  severity : ToastSeverity;
}

// `Record` sobre la unión y no un objeto suelto: agregar una severidad obliga a
// declararle su duración acá en vez de caer en un default silencioso.
// Un error dura más porque el usuario necesita leerlo entero —a veces copiarlo—
// mientras un 'Cambios guardados.' se confirma de un vistazo.
const DEFAULT_DURATION : Record<ToastSeverity, number> = {
  success : 3000,
  warning : 4500,
  error   : 6000,
};

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  private _toast = signal<Toast | null>(null);

  public toast = this._toast.asReadonly();

  private timer ?: ReturnType<typeof setTimeout>;

  showSuccess = ( message : string , duration ?: number ) : void => this.show( message , 'success' , duration );

  showWarning = ( message : string , duration ?: number ) : void => this.show( message , 'warning' , duration );

  showError = ( message : string , duration ?: number ) : void => this.show( message , 'error' , duration );

  clear = () : void => {
    clearTimeout( this.timer );
    this._toast.set( null );
  }

  // Privado a propósito: los tres métodos de arriba son la única entrada, así
  // que no existe forma de emitir un toast sin declarar su severidad.
  private show = ( message : string , severity : ToastSeverity , duration ?: number ) : void => {

    this._toast.set({ message , severity });

    clearTimeout( this.timer );
    this.timer = setTimeout(() => {
      this.clear();
    }, duration ?? DEFAULT_DURATION[severity] );
  }

}
