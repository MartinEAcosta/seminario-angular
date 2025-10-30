import { Component, effect, inject } from '@angular/core';
import { NgClass } from '@angular/common';
import { FormGroup } from '@angular/forms';
import { rxResource } from '@angular/core/rxjs-interop';
import { catchError, of, tap } from 'rxjs';

import { LessonService } from '../../services/lesson.service';
import { LessonFormState } from '../../state/lesson/lesson-form-state';
import { LessonPopulated } from '../../models/lesson.interfaces';
import { ThumbnailSelectorComponent } from 'src/app/course/components/thumbnail-selector/thumbnail-selector.component';
import { FormLessonComponent } from "../form-lesson/form-lesson.component";
import { CourseFormState } from 'src/app/course/state/course/course-form-state';
import { FileService } from 'src/app/shared/services/file/file.service';
import { UserState } from 'src/app/auth/state/user-state';

@Component({
  selector: 'app-slider-content-manager',
  imports: [ThumbnailSelectorComponent, NgClass, FormLessonComponent],
  templateUrl: './slider-content-manager.component.html',
  styleUrl: './slider-content-manager.component.scss'
})
export class SliderContentManagerComponent {

  public lessonService = inject(LessonService);
  public lessonFormState = inject(LessonFormState);
  public fileService = inject(FileService);
  public courseFormState = inject(CourseFormState);
  public userState = inject(UserState);

  public lessonForm : FormGroup = this.lessonFormState.createForm();
  
  public lessonsResource = rxResource<LessonPopulated[],string | null>({
    request: () => this.userState.courseSelected()?.id ?? null,
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
    
    const emptyLesson = this.lessonFormState.createEmptyLesson();
    this.lessonFormState.setLessonSelected( emptyLesson );
    this.lessonFormState.setTempMedia(null);
    this.lessonFormState.setMediaFile(null);

    this.lessonFormState.patchValuesForm( emptyLesson );
  }



}
