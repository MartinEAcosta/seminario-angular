import { inject, Injectable, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Course } from '@interfaces/course.interfaces';

@Injectable({
  providedIn: 'root'
})
export class CourseFormState {

  private fb = inject(FormBuilder);

  public course = signal<Course | null>( null );

  public thumbnailFile = signal<File | null>( null );
  public tempThumbnail = signal<string | null>( null );
  
  constructor( ) { }

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

  public reset () : void  {
    this.thumbnailFile.set(null);
    this.tempThumbnail.set(null);
  }

  public setTempThumbnail ( thumbnail_url : string ) : void {
    this.tempThumbnail.set( thumbnail_url );
  }

  public setFileThumbnail ( file : File ) : void {
    this.thumbnailFile.set( file );
  }

// Verificar si es necesario quitar atributos.
  public createForm = ( ) : FormGroup => {
    return this.fb.group({
      title : [ '' , [ Validators.required,  Validators.minLength(6) ] ],
      description : [ '' , [ Validators.required,  Validators.minLength(6) ] ],
      id_category : [ '' ],
      thumbnail_url : [ '' ],
      price : [ 0 , [ Validators.required , Validators.min(0) ] ],
      wantLimitedCapacity: [ true ],
      capacity : [ { value : 5 , disabled: false } , [ Validators.min(5) ] ], 
    });
  }

  public patchValuesForm = ( course : Course , form : FormGroup ) : FormGroup => {
    form.patchValue({
      title: course.title,
      description: course.description,
      id_category: course.id_category,
      thumbnail_url: course.thumbnail_url,
      price: course.price,
      capacity: course.capacity
    });

    return form;
  }
}
