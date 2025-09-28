import { Component, inject, input, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { FormGroup } from '@angular/forms';
import { rxResource } from '@angular/core/rxjs-interop';
import { catchError, of, tap } from 'rxjs';

import { LessonService } from '../../services/lesson.service';
import { LessonFormState } from '../../state/lesson/lesson-form-state';
import { Lesson } from '../../models/lesson.interfaces';
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

  public lessonService = inject(LessonService);
  public lessonFormState = inject(LessonFormState);
  public lessonForm : FormGroup = this.lessonFormState.createForm();
  public courseId = input<string | null>();
  
  public lessonsResource = rxResource<Lesson[],string>({
    request: () => this.courseId()!,
    loader: ({request}) => { 
      return this.lessonService
                  .getAllLessonFromCourse( request )
                  .pipe(
                    tap( res => this.lessonArray.set(res)),
                    catchError( error => {
                      return of([]);
                    })
                  )
    },
  });

  public lessonArray = signal<Lesson[]>([]);

  constructor( ) { }

  onExpandSlider = ( ) => {
    if( this.lessonArray().length === 0){
      this.createEmptyLesson();
    }
    this.lessonFormState.toggleVisibilityOfLessonForm();
  }

  onSelectLesson = ( lesson : Lesson ) => {
    this.lessonFormState.patchValuesForm( lesson , this.lessonForm );
    this.lessonFormState.setIsLessonFormVisible( true );
  }

  public onAddLesson = ( ) => {
    this.lessonFormState.setIsLessonFormVisible( true );
    const emptyLesson = this.createEmptyLesson();
    this.lessonForm = this.lessonFormState.patchValuesForm( emptyLesson , this.lessonForm );
  }

  createEmptyLesson = ( ) => {
    const newLesson : Lesson ={
      id_course: '',
      title: '',
      description: '',
      id_file: '',
      unit: 0,
      chapter: 0,
      lesson_number: 0,
      uploaded_at: new Date(),
    };
    this.lessonArray.set([...this.lessonArray() , newLesson]);
    return newLesson;
  }

}
