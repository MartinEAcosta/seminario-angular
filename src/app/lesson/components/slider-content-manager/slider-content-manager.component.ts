import { Component, inject, input, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { FormGroup } from '@angular/forms';
import { rxResource } from '@angular/core/rxjs-interop';
import { catchError, of, tap } from 'rxjs';

import { LessonService } from '../../services/lesson.service';
import { LessonFormState } from '../../state/lesson/lesson-form-state';
import { Lesson, LessonPopulated } from '../../models/lesson.interfaces';
import { ThumbnailSelectorComponent } from 'src/app/course/components/thumbnail-selector/thumbnail-selector.component';
import { LoaderComponent } from "src/app/shared/components/loader/loader.component";
import { FormLessonComponent } from "../form-lesson/form-lesson.component";

@Component({
  selector: 'app-slider-content-manager',
  imports: [ThumbnailSelectorComponent, NgClass, FormLessonComponent, LoaderComponent],
  templateUrl: './slider-content-manager.component.html',
  styleUrl: './slider-content-manager.component.scss'
})
export class SliderContentManagerComponent {

  public courseId = input<string | null>();

  public lessonService = inject(LessonService);
  public lessonFormState = inject(LessonFormState);

  public lessonForm : FormGroup = this.lessonFormState.createForm();
  
  public lessonsResource = rxResource<LessonPopulated[],string>({
    request: () => this.courseId()!,
    loader: ({request}) => { 
      return this.lessonService
                  .getAllLessonFromCourse( request )
                  .pipe(
                    tap( res => this.lessonFormState.lessons.set(res)),
                    catchError( error => {
                      return of([]);
                    })
                  )
    },
  });

  constructor( ) { }

  onExpandSlider = ( ) => {
    if( this.lessonFormState.isLessonFormVisible() ){
        this.lessonFormState.toggleVisibilityOfLessonForm();
    }
    else{
      if( this.lessonFormState.lessons().length === 0 ){
        const newLesson = this.lessonFormState.createEmptyLesson();
        this.onSelectLesson( newLesson );
      }
      else{
        const firstLesson = this.lessonFormState.lessons()[0];
        this.onSelectLesson( firstLesson );
      }
    }
  }

  onSelectLesson = ( lesson : LessonPopulated ) => {
    this.lessonFormState.patchValuesForm( lesson , this.lessonForm );
    this.lessonFormState.setIsLessonFormVisible( true );
  }

  public onAddLesson = ( ) => {
    this.lessonFormState.setIsLessonFormVisible( true );
    const emptyLesson = this.lessonFormState.createEmptyLesson();
    this.lessonForm = this.lessonFormState.patchValuesForm( emptyLesson , this.lessonForm );
  }



}
