import { inject, Injectable, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LessonPopulated } from '../../models/lesson.interfaces';

@Injectable({
  providedIn: 'root'
})
export class LessonFormState {

  private fb = inject(FormBuilder);

  public lessons = signal<LessonPopulated[]>([]);
  public lessonForm : FormGroup;
  public lessonSelected = signal<LessonPopulated | null>( null );
  public isLessonFormVisible = signal<boolean>( false ); 
  
  public mediaFile = signal<File | null>(null);
  public tempMedia = signal<string | null>(null);

  constructor() { 
    this.lessonForm = this.createForm();
  }

  public reset () : void  {
    this.lessons.set([]);
    this.lessonForm = this.createForm();
    this.mediaFile.set(null);
    this.tempMedia.set(null);
    this.isLessonFormVisible.set(false);
  }

  public setLessonSelected = ( lesson : LessonPopulated | null ) => {
    this.lessonSelected.set( lesson );
  }

  public setIsLessonFormVisible = ( bol : boolean ) => {
    this.isLessonFormVisible.set( bol );
  }

  public setTempMedia ( url : string | null ) : void {
    this.tempMedia.set( url );
  }

  public setMediaFile ( file : File | null ) : void {
    this.mediaFile.set( file );
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

  public patchValuesForm = ( lesson : LessonPopulated  ) : void => {
    this.lessonForm.patchValue({
      title: lesson.title,
      description: lesson.description,
    });
  }

  public createEmptyLesson = ( ) => {
    const newLesson : LessonPopulated = {
      id_course: '',
      id_module: '',
      title: '',
      description: '',
      file: {
        id_file : null,
        url : null,
      },
      lesson_number: this.lessons().at(-1) ? this.lessons().at(-1)?.lesson_number! : 0,
      uploaded_at: new Date(),
    };
    this.lessons.set([...this.lessons() , newLesson]);
    return newLesson;
  }

  public removeLesson = ( lessonToRemove : LessonPopulated ) : void => {
    const newLessonsArray = this.lessons().filter( (lesson) => {
      lesson.lesson_number != lessonToRemove.lesson_number 
    });
    this.lessons.set( newLessonsArray );
  }

}
