import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LessonFormState {

  // Va false
  public isLessonFormVisible = signal<boolean>( true ); 

  constructor() { }

  public toggleVisibilityOfLessonForm = ( ) : void => {
    this.isLessonFormVisible.set( !this.isLessonFormVisible() );
  }

}
