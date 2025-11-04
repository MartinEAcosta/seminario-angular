import { inject, Injectable, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Course } from '@interfaces/course.interfaces';
import { UserState } from 'src/app/auth/state/user-state';

@Injectable({
  providedIn: 'root'
})
export class CourseFormState {

  private fb = inject(FormBuilder);
  private userState = inject(UserState);

  public courseForm : FormGroup;
  
  public thumbnailFile = signal<File | null>( null );
  public tempThumbnail = signal<string | null>( null );
  
  constructor( ) {
    this.courseForm = this.createForm();
  }

  public reset () : void  {
    this.userState.setCourse(null);
    this.courseForm = this.createForm();
    this.thumbnailFile.set(null);
    this.tempThumbnail.set(null);
  }

  public setTempThumbnail ( thumbnail_url : string ) : void {
    this.tempThumbnail.set( thumbnail_url );
  }

  public setFileThumbnail ( file : File ) : void {
    this.thumbnailFile.set( file );
  }

  public createForm = ( ) : FormGroup => {
    return this.fb.group({
      title : [ '' , [ Validators.required,  Validators.minLength(6) ] ],
      description : [ '' , [ Validators.required,  Validators.minLength(6) ] ],
      id_category : [ '' , [ Validators.required ]],
      price : [ 0 , [ Validators.required , Validators.min(0) ] ],
      wantLimitedCapacity: [ true ],
      capacity : [ { value : 5 , disabled: false } , [ Validators.min(5) ] ], 
    });
  }

  public patchValuesForm = ( course : Course ) : FormGroup => {
    this.courseForm.patchValue({
      title: course.title,
      description: course.description,
      id_category: course.id_category,
      price: course.price,
      capacity: course.capacity
    });

    return this.courseForm;
  }
}
