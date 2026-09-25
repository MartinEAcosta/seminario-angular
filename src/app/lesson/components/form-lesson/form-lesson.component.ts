import { Component, inject, input, output } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { LessonService } from '@lesson/services/lesson.service';
import { FormErrorLabelComponent } from "@shared/components/form-error-label/form-error-label.component";
import { UserState } from '@user/state/user-state';
import { LessonMapper } from '@mappers/lesson.mapper';
import { CourseService } from '@course/services/course.service';
import { FileService } from '@file/services/file.service';
import { LessonFormState } from '@lesson/state/lesson-form/lesson-form-state';

@Component({
  selector: 'app-form-lesson',
  imports: [ReactiveFormsModule, FormErrorLabelComponent],
  templateUrl: './form-lesson.component.html',
  styleUrl: './form-lesson.component.scss'
})
export class FormLessonComponent {

  private router = inject(Router);

  public userState = inject(UserState);
  public courseService = inject(CourseService);
  public lessonService = inject(LessonService);
  public lessonFormState = inject(LessonFormState);
  public fileService = inject(FileService);

  idCourse = input.required<string>();

  saved = output<void>();
  cancelled = output<void>();

  constructor() { }

  public onSaveLesson = () => {
    this.lessonFormState.lessonForm.markAllAsTouched();

    if( this.lessonFormState.lessonForm.valid ){
      const uid = this.userState.id();
      if( !uid ) return;

      const dto = LessonMapper.mapToCreateLessonDto( this.lessonFormState.lessonForm );
      let lessonDto = {
        ...dto,
        id : this.lessonFormState.lessonSelected()?.id,
        id_course : this.idCourse(),
      };
      return this.lessonService.saveLesson( lessonDto , this.lessonFormState.mediaFile() ).subscribe( () => {
        this.saved.emit();
      });
    }
    return;
  }

  onCancel = () => {
    this.cancelled.emit();
  }

}
