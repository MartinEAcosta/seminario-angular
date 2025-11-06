import { effect, inject, Injectable, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Course } from '@interfaces/course.interfaces';


@Injectable({
  providedIn: 'root'
})
export class CourseFormState {

  private fb = inject(FormBuilder);

  public courseForm : FormGroup = this.fb.group({
      title : [ '' , [ Validators.required,  Validators.minLength(6) ] ],
      description : [ '' , [ Validators.required,  Validators.minLength(6) ] ],
      id_category : [ '' , [ Validators.required ]],
      price : [ 0 , [ Validators.required , Validators.min(0) ] ],
      capacity : [ { value : 5 } , [ Validators.min(5) ] ], 
  });

  public limitedCapacity = signal<boolean>( true );
  public thumbnailFile = signal<File | null>( null );
  public tempThumbnail = signal<string | null>( null );
  
  onLimitedCapacityChange = effect(() => {
    const limited = this.limitedCapacity();

    limited ? this.courseForm.get('capacity')?.disable() : this.courseForm.get('capacity')?.enable();
  });

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

}
