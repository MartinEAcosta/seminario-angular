import { computed, signal } from '@angular/core';

// Guarda solo el preview (object URL) de un archivo. El File en sí vive en un
// FormControl del feature (ej. UserState.profileForm.get('avatar')) para que
// la validación y el dirty/touched los maneje el form, no esta clase.
export class FilePreviewControl {

  private _preview = signal<string | null>( null );

  preview = computed( this._preview );

  setPreview = ( url : string | null ) : void => {
    if ( this._preview() ) URL.revokeObjectURL( this._preview()! );
    this._preview.set( url );
  }

  reset = ( ) : void => {
    this.setPreview( null );
  }

}
