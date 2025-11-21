import { inject, Injectable, signal } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { LessonPopulated } from '../../models/lesson.interfaces';

@Injectable({
  providedIn: 'root'
})
export class LessonFormState {

  private fb = inject(FormBuilder);
  public lessonForm = this.fb.nonNullable.group({
      title : [ '' , [ Validators.required,  Validators.minLength(6) ] ],
      description : [ '' , [ Validators.required,  Validators.minLength(6) ] ],
      id_module : [ '' , [ Validators.required ] ],
      lesson_number : [ 0 , [ Validators.required , Validators.min(0) ] ],
  });

  public lessons = signal<LessonPopulated[]>([]);
  public lessonSelected = signal<LessonPopulated | null>( null );

  public mediaFile = signal<File | null>(null);
  public tempMedia = signal<string | null>(null);
  public isLessonFormVisible = signal<boolean>( false ); 
  public isModulePopUpVisible = signal<boolean>( false );
  
  public reset () : void  {
    this.lessons.set([]);
    this.lessonForm.reset();
    this.mediaFile.set(null);
    this.tempMedia.set(null);
    this.isLessonFormVisible.set(false);
  }

  public setLessons = ( lessons : LessonPopulated[] ) => {
    this.lessons.set(lessons);
  }

  public setLessonSelected = ( lesson : LessonPopulated | null ) => {
    this.lessonSelected.set( lesson );
    if( lesson ){
     this.patchValuesForm( lesson );
    }
  }

  public setIsLessonFormVisible = ( bol : boolean ) => {
    this.isLessonFormVisible.set( bol );
  }

  public setIsModulePopUpVisible = ( bol : boolean ) => {
    this.isModulePopUpVisible.set( bol );
  }

  public setTempMedia ( url : string | null ) : void {
    this.tempMedia.set( url );
  }

  public setMediaFile ( file : File | null ) : void {
    this.mediaFile.set( file );
  }
  
  public toggleVisibilityOfLessonForm = ( ) : void => {
    this.isLessonFormVisible.set( !this.isLessonFormVisible() );
    this.updateLesson( this.lessonSelected()! , this.lessonForm.value )
  }

  public toggleVisibilityOfModulePopUp = ( ) : void => {
    this.isModulePopUpVisible.set( !this.isModulePopUpVisible() );
  }

  public patchValuesForm = ( lesson : LessonPopulated  ) : void => {
    this.lessonForm.patchValue({
      title: lesson.title,
      description: lesson.description,
      id_module: lesson.id_module,
      lesson_number: lesson.lesson_number,
    });
  }

  public updateLesson = ( searched : LessonPopulated , value : Partial<{ title : string , description : string }> ) => {
      const lessonsCopy = this.lessons().map( lesson => lesson.id === searched.id ? { ...lesson , ...value } : {...lesson });
      this.setLessons( lessonsCopy )
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
      lesson_number: this.lessons().at(-1) ? +this.lessons().at(-1)!.lesson_number!+1 : 0,
      uploaded_at: new Date(),
    };
    this.setTempMedia(null);
    this.setMediaFile(null);
    this.setLessonSelected(newLesson);
    this.lessons.set([...this.lessons() , newLesson]);
    return newLesson;
  }

  public removeLesson = ( lessonToRemove : LessonPopulated ) : void => {
    const newLessonsArray = this.lessons().filter( lesson => 
      lesson.lesson_number !== lessonToRemove.lesson_number 
    );
    console.log(newLessonsArray)
    this.lessons.set( newLessonsArray );
  }

}
