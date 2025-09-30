import { inject, Injectable, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LessonPopulated } from '../../models/lesson.interfaces';

@Injectable({
  providedIn: 'root'
})
export class LessonFormState {

  private fb = inject(FormBuilder);

  public lessons = signal<LessonPopulated[]>([]);

  public lessonSelected = signal<LessonPopulated | null>( null );
  public isLessonFormVisible = signal<boolean>( false ); 

  public mediaFiles = signal<FileList | null>(null);
  public tempMedia = signal<string[] | null>([]);

  constructor() { }

  public onMediaChanged = ( event : Event ) => {
    
  }

  public setLessonSelected = ( lesson : LessonPopulated ) => {
    this.lessonSelected.set( lesson );
  }

  public setIsLessonFormVisible = ( bol : boolean ) => {
    this.isLessonFormVisible.set( bol );
  }

  public toggleVisibilityOfLessonForm = ( ) : void => {
    this.isLessonFormVisible.set( !this.isLessonFormVisible() );
  }

  public createForm = () : FormGroup => {
    return this.fb.group({
      title : [ '' , [ Validators.required,  Validators.minLength(6) ] ],
      description : [ '' , [ Validators.required,  Validators.minLength(6) ] ],
    });
  }

  public patchValuesForm = ( lesson : LessonPopulated , form : FormGroup ) : FormGroup => {
    form.patchValue({
      title: lesson.title,
      description: lesson.description,
    });
    return form;
  }

  public createEmptyLesson = ( ) => {
    const newLesson : LessonPopulated = {
      id_course: '',
      title: '',
      description: '',
      file: {
        id_file : null,
        url : null,
      },
      unit: 0,
      chapter: 0,
      lesson_number: 0,
      uploaded_at: new Date(),
    };
    this.lessons.set([...this.lessons() , newLesson]);
    return newLesson;
  }

}
