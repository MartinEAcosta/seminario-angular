import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CourseFormState {

  public thumbnailFile = signal<File | null>(null);
  public mediaFiles = signal<FileList | null>(null);

  constructor( ) { }

  public reset () : void  {
    this.thumbnailFile.set(null);
    this.mediaFiles.set(null);
  }

  // TODO : SETTHHUMBNAILFILE CON EL FIN DE NO TENER QUE UTILIZAR THIS.COURSEFORMSTATE.THUMBNAILFILE.SET(FILE)
  //* AL IGUAL CON MEDIA
}
