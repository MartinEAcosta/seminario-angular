import { Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { LessonService } from 'src/app/lesson/services/lesson.service';
import { LessonFormState } from '../../state/lesson/lesson-form-state';
import { FormErrorLabelComponent } from "src/app/shared/components/form-error-label/form-error-label.component";
import { BtnNavigationComponent } from "src/app/shared/components/btn-navigation/btn-navigation.component";
import { AuthService } from 'src/app/auth/services/auth.service';
import { LessonMapper } from '@mappers/lesson.mapper';
import { CourseService } from 'src/app/course/services/course.service';
import { CourseFormState } from 'src/app/course/state/course/course-form-state';
import { FileService } from 'src/app/shared/services/file/file.service';
import { BtnRemoveComponent } from "src/app/shared/components/btn-remove/btn-remove.component";
import { Router } from '@angular/router';

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
  public courseFormState = inject(CourseFormState);
  public courseService = inject(CourseService);
  public lessonService = inject(LessonService);
  public lessonFormState = inject(LessonFormState);
  public fileService = inject(FileService);

  constructor() { }

  public onSubmit = () => {
    
    this.lessonFormState.lessonForm.markAllAsTouched();

    if( this.lessonFormState.lessonForm.valid ){

      const uid = this.authService.id();
      if( !uid ) return;

      const dto = LessonMapper.mapToCreateLessonDto( this.lessonFormState.lessonForm );
      const lessonDto = {
        id: this.lessonFormState.lessonSelected()?.id,
        ...dto,
        id_course : this.courseFormState.course()?.id!,
      };
      
      lessonDto.lesson_number = this.lessonFormState.lessons().at(-1)?.lesson_number ?? 0;

      if( this.lessonFormState.mediaFile() != null ){
        this.fileService.updateFile( this.folder, this.lessonFormState.mediaFile()! )
                          .subscribe( response => {
                              console.log(response);
                              lessonDto.id_file = response.id;
                              console.log(lessonDto);
                              return this.lessonService.saveLesson( lessonDto ).subscribe();
                          });
      }
      return this.lessonService.saveLesson( lessonDto ).subscribe();
    }
    return;
  }

  public onDeleteLesson = ( id : string ) => {
    if( this.courseFormState.course()?.id_owner === this.authService.id() ){
      if( this.lessonFormState.lessonSelected()?.file.id_file ){
        this.fileService.deleteCourseThumbnail( this.courseFormState.course()?.id! ).subscribe()
      }
      this.lessonService.deleteLesson( id )
                            .subscribe( ( isLessonDeleted ) => {
                                if( isLessonDeleted ) {
                                  this.router.navigateByUrl('/');
                                  return;
                                }     
                            } );
    }
  }
    


}
