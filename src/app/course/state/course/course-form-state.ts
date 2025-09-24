import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CourseFormState {

  public thumbnailFile = signal<File | null>(null);
  public mediaFiles = signal<FileList | null>(null);

  public tempMedia = signal<string[] | null>([]); 
  public tempThumbnail = signal<string | null>( null );

  constructor( ) { }

  public reset () : void  {
    this.thumbnailFile.set(null);
    this.mediaFiles.set(null);
    this.tempThumbnail.set(null);
    this.tempMedia.set(null);
  }

  public setTempThumbnail ( thumbnail_url : string ) : void {
    this.tempThumbnail.set( thumbnail_url );
  }

  public setFileThumbnail ( file : File ) : void {
    this.thumbnailFile.set( file );
  }

  public onThumbnailChanged = ( event : Event ) => {
    const thumbnailChanged = ( event.target as HTMLInputElement ).files;
    if( !thumbnailChanged ) return;
    

    // En caso de que el el fileList no sea undefined o vacio, permite generar url para utilizar de forma local
    const imageUrl = Array.from( thumbnailChanged ?? [ ] )
                                                  .map( 
                                                        (file) => URL.createObjectURL(file)
                                                  );


    this.setTempThumbnail( imageUrl.shift()! );
    this.setFileThumbnail( thumbnailChanged[0] );
  }


  // TODO : SETTHHUMBNAILFILE CON EL FIN DE NO TENER QUE UTILIZAR THIS.COURSEFORMSTATE.THUMBNAILFILE.SET(FILE)
  //* AL IGUAL CON MEDIA
}
