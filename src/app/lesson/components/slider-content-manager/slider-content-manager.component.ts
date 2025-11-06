import { Component, effect, inject, input } from '@angular/core';
import { NgClass } from '@angular/common';
import { rxResource } from '@angular/core/rxjs-interop';
import { catchError, debounceTime, of, tap } from 'rxjs';

import { LessonService } from '../../services/lesson.service';
import { LessonFormState } from '../../state/lesson/lesson-form-state';
import { LessonPopulated } from '../../models/lesson.interfaces';
import { ThumbnailSelectorComponent } from 'src/app/course/components/thumbnail-selector/thumbnail-selector.component';
import { FormLessonComponent } from "../form-lesson/form-lesson.component";
import { FileService } from 'src/app/shared/services/file/file.service';
import { Course } from '@course/models/course.interfaces';

@Component({
  selector: 'app-slider-content-manager',
  imports: [ThumbnailSelectorComponent, NgClass, FormLessonComponent],
  templateUrl: './slider-content-manager.component.html',
  styleUrl: './slider-content-manager.component.scss'
})
export class SliderContentManagerComponent {

  public lessonService = inject(LessonService);
  public fileService = inject(FileService);
  
  public lessonFormState = inject(LessonFormState);

  course = input.required<Course | null>();
  
  public lessonsResource = rxResource<LessonPopulated[],string | null>({
    request: () => this.course()?.id ?? null,
    loader: ({request}) => { 
      if( request ){
        return this.lessonService
        .getAllLessonPopulatedFromCourse( request )
        .pipe(
          tap( res => this.lessonFormState.lessons.set(res)),
          catchError( error => {
            // * No se han podido cargar...
            return of([]);
          })
        )
      }
      return of([]);
    },
  });

  constructor( ) { 
    effect( () => {
        if( this.lessonFormState.lessonSelected() != undefined && this.lessonFormState.lessonSelected()?.file.url != null ){
          this.lessonFormState.setTempMedia( this.lessonFormState.lessonSelected()!.file.url! );
        }
    })
   }

  ngOnDestroy( ) {
    this.lessonFormState.reset();
  }

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
    this.lessonFormState.setLessonSelected( lesson );
    this.lessonFormState.patchValuesForm( lesson );
    this.lessonFormState.setTempMedia( this.lessonFormState.lessonSelected()!.file.url! );
    this.lessonFormState.setIsLessonFormVisible( true );
  }

  public onAddLesson = ( ) => {
    this.lessonFormState.setIsLessonFormVisible( true );

    if( this.lessonFormState.lessonSelected() && !this.lessonFormState.lessonSelected()?.id ) return;
    
    this.lessonFormState.createEmptyLesson();
  }



}
