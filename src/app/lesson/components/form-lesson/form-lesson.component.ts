import { Component, inject, input, output } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { LessonService } from '@lesson/services/lesson.service';
import { FormErrorLabelComponent } from "@shared/components/form-error-label/form-error-label.component";
import { AuthService } from '@auth/services/auth.service';
import { LessonMapper } from '@mappers/lesson.mapper';
import { CourseService } from '@course/services/course.service';
import { FileService } from '@file/services/file.service';
import { BtnRemoveComponent } from "@shared/components/btns/btn-remove/btn-remove.component";
import { LessonPopulated } from '@lesson/models/lesson.interfaces';
import { LessonFormState } from '@lesson/state/lesson-form/lesson-form-state';

@Component({
  selector: 'app-form-lesson',
  imports: [ReactiveFormsModule, FormErrorLabelComponent, BtnRemoveComponent],
  templateUrl: './form-lesson.component.html',
  styleUrl: './form-lesson.component.scss'
})
export class FormLessonComponent {
  folder = 'lessons';

  private router = inject(Router);

  public authService = inject(AuthService);
  public courseService = inject(CourseService);
  public lessonService = inject(LessonService);
  public lessonFormState = inject(LessonFormState);
  public fileService = inject(FileService);

  idCourse = input.required<string>();

  saved = output<void>();
  cancelled = output<void>();

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

  public onDeleteLesson = ( lesson : LessonPopulated ) => {
    if( lesson.id ){
      this.lessonService.deleteLesson( lesson.id )
                            .subscribe( ( isLessonDeleted ) => {
                                if( isLessonDeleted ) {
                                  // this.router.navigateByUrl('/');
                                  return;
                                }
                            } );
    }

    this.lessonFormState.removeLesson( lesson );
    this.lessonFormState.setLessonSelected(null);
    this.lessonFormState.setIsLessonFormVisible(false);
  }

  onCancel = () => {
    this.cancelled.emit();
  }

}
