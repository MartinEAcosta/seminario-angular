import { computed, effect, inject, Injectable, signal } from '@angular/core';
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
      capacity : [ 5 , [ Validators.min(5) ] ],
  });

  thumbnailFile = signal<File | null>( null );
  tempThumbnail = signal<string | null>( null );
  isFormCollapsed = signal<boolean>( false );

  // Última versión persistida del curso en esta sesión de wizard.
  // null hasta que create hace su primer POST, o hasta que update carga el resolver.
  savedCourse = signal<Course | null>( null );

  // Derivado: id del curso ya persistido, o null si todavía no existe.
  courseId = computed( () => this.savedCourse()?.id ?? null );


  public reset () : void {
    this.courseForm.reset();
    this.thumbnailFile.set(null);
    this.tempThumbnail.set(null);
    this.setSavedCourse(null);
  }

  public patchValuesForm = ( course : Course ) : FormGroup => {
    this.courseForm.patchValue({
      title: course.title,
      description: course.description,
      id_category: course.id_category,
      price: course.price,
      capacity: course.capacity,
    });

    course.thumbnail_url ? this.tempThumbnail.set( course.thumbnail_url ) : this.tempThumbnail.set( null );
    this.setSavedCourse(course);

    return this.courseForm;
  }

  public setTempThumbnail ( thumbnail_url : string  | null ) : void {
    this.tempThumbnail.set( thumbnail_url );
  }

  public setFileThumbnail ( file : File ) : void {
    this.thumbnailFile.set( file );
  }

  public setSavedCourse ( course : Course | null ) : void {
    this.savedCourse.set( course );
  }

  public setFormCollapsed ( collapsed : boolean ) : void {
    this.isFormCollapsed.set( collapsed );
  }

  public toggleFormCollapsed ( ) : void {
    this.isFormCollapsed.set( !this.isFormCollapsed() );
  }

}
