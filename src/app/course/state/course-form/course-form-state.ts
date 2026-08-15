import { effect, inject, Injectable, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Course } from '@interfaces/course.interfaces';

@Injectable({
  providedIn: 'root'
})
export class CourseFormState {

  private fb = inject(FormBuilder);

  courseForm : FormGroup = this.fb.group({
      title : [ '' , [ Validators.required,  Validators.minLength(6) ] ],
      description : [ '' , [ Validators.required,  Validators.minLength(6) ] ],
      id_category : [ '' , [ Validators.required ]],
      price : [ 0 , [ Validators.required , Validators.min(0) ] ],
      capacity : [ { value : 5 } , [ Validators.min(5) ] ], 
  });

  limitedCapacity = signal<boolean>( true );
  thumbnailFile = signal<File | null>( null );
  tempThumbnail = signal<string | null>( null );
  isFormCollapsed = signal<boolean>( false );
  

  public reset () : void {
    this.courseForm.reset();
    this.thumbnailFile.set(null);
    this.tempThumbnail.set(null);
  }
  
  public patchValuesForm = ( course : Course ) : FormGroup => {
    this.courseForm.patchValue({
      title: course.title,
      description: course.description,
      id_category: course.id_category,
      price: course.price,
      capacity: course.capacity
    });

    course.thumbnail_url ? this.tempThumbnail.set( course.thumbnail_url ) : this.tempThumbnail.set( null ); 
    course.capacity ? this.limitedCapacity.set(true) : this.limitedCapacity.set(false);

    return this.courseForm;
  }

  public setTempThumbnail ( thumbnail_url : string  | null ) : void {
    this.tempThumbnail.set( thumbnail_url );
  }

  public setFileThumbnail ( file : File ) : void {
    this.thumbnailFile.set( file );
  }

  public toggleLimitedCapacity ( ) : void {
    this.limitedCapacity.set( !this.limitedCapacity() );
  }

  public setFormCollapsed ( collapsed : boolean ) : void {
    this.isFormCollapsed.set( collapsed );
  }

  public toggleFormCollapsed ( ) : void {
    this.isFormCollapsed.set( !this.isFormCollapsed() );
  }

}
