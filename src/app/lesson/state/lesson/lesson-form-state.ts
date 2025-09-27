import { inject, Injectable, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Lesson } from '../../models/lesson.interfaces';

@Injectable({
  providedIn: 'root'
})
export class LessonFormState {

  private fb = inject(FormBuilder);

  public lessonSelected = signal<Lesson | null>( null );
  public isLessonFormVisible = signal<boolean>( true ); 

  constructor() { }

  public toggleVisibilityOfLessonForm = ( ) : void => {
    this.isLessonFormVisible.set( !this.isLessonFormVisible() );
  }

  public onAddLesson = ( ) => {
    this.isLessonFormVisible.set( true );
    this.createForm();
  }

  public createForm = () : FormGroup => {
    return this.fb.group({
      title : [ '' , [ Validators.required,  Validators.minLength(6) ] ],
      description : [ '' , [ Validators.required,  Validators.minLength(6) ] ],
    });
  }


  public patchValuesForm = ( lesson : Lesson , form : FormGroup ) : FormGroup => {
    form.patchValue({
      title: lesson.title,
      description: lesson.description,
    });
    console.log(form.value);
    return form;
  }

}
