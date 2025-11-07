import { Component, inject, input } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { LessonService } from 'src/app/lesson/services/lesson.service';
import { LessonFormState } from '../../state/lesson/lesson-form-state';
import { FormErrorLabelComponent } from "src/app/shared/components/form-error-label/form-error-label.component";
import { BtnNavigationComponent } from "src/app/shared/components/btn-navigation/btn-navigation.component";
import { AuthService } from 'src/app/auth/services/auth.service';
import { LessonMapper } from '@mappers/lesson.mapper';
import { CourseService } from 'src/app/course/services/course.service';
import { FileService } from 'src/app/shared/services/file/file.service';
import { BtnRemoveComponent } from "src/app/shared/components/btn-remove/btn-remove.component";
import { Router } from '@angular/router';
import { LessonPopulated } from '../../models/lesson.interfaces';
import { Course } from '@course/models/course.interfaces';

@Component({
  selector: 'app-form-lesson',
  imports: [ReactiveFormsModule, FormErrorLabelComponent, BtnNavigationComponent, BtnRemoveComponent],
  templateUrl: './form-lesson.component.html',
  styleUrls:['../../../shared/components/btn-navigation/btn-rounded.scss' ,'./form-lesson.component.scss']
})
export class FormLessonComponent {
  folder = 'lessons';

  private router = inject(Router);

  public authService = inject(AuthService);
  public courseService = inject(CourseService);
  public lessonService = inject(LessonService);
  public lessonFormState = inject(LessonFormState);
  public fileService = inject(FileService);

  course = input.required<Course | null>();

  constructor() { }
  
  // formChanges = toSignal(
  //   this.lessonFormState.lessonForm.valueChanges.pipe(debounceTime(1000)),
  //   { initialValue : this.lessonFormState.lessonForm.value }
  // );
  // onFormChanged = effect(() => {
  //   const form = this.lessonFormState.lessonForm;
  //   const value = this.formChanges();

  //   if( !this.lessonFormState.lessonSelected() ) return
  //   if (form.dirty && form.valid) {
  //     this.lessonFormState.updateLesson( this.lessonFormState.lessonSelected()! , value );
  //   }
  // });

  public onSaveLesson = () => {
    
    this.lessonFormState.lessonForm.markAllAsTouched();

    if( this.lessonFormState.lessonForm.valid ){

      const uid = this.authService.id();
      if( !uid ) return;

      const dto = LessonMapper.mapToCreateLessonDto( this.lessonFormState.lessonForm );
      const lessonDto = {
        id: this.lessonFormState.lessonSelected()?.id,
        ...dto,
        id_course : this.course()?.id!,
      };
      lessonDto.lesson_number = this.lessonFormState.lessons().at(-1)?.lesson_number ?? 0;
    
      return this.lessonService.saveLesson( lessonDto , this.lessonFormState.mediaFile() ).subscribe();
    }
    return;
  }

  public onDeleteLesson = ( lesson : LessonPopulated ) => {
    if( lesson.id ){
        if( this.course()?.id_owner === this.authService.id() ){
          if( this.lessonFormState.lessonSelected()?.file.id_file ){
            this.fileService.deleteCourseThumbnail( this.course()?.id! ).subscribe()
          }
          this.lessonService.deleteLesson( lesson.id )
                                .subscribe( ( isLessonDeleted ) => {
                                    if( isLessonDeleted ) {
                                      this.router.navigateByUrl('/');
                                      return;
                                    }     
                                } );
        }
    }
    else{
      this.lessonFormState.removeLesson( lesson );
    }
    this.lessonFormState.setLessonSelected(null);
    this.lessonFormState.setIsLessonFormVisible(false);
  }    


}
