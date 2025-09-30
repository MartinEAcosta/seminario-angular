import { Component, inject, Input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

import { LessonService } from 'src/app/lesson/services/lesson.service';
import { LessonFormState } from '../../state/lesson/lesson-form-state';
import { FormErrorLabelComponent } from "src/app/shared/components/form-error-label/form-error-label.component";
import { BtnNavigationComponent } from "src/app/shared/components/btn-navigation/btn-navigation.component";
import { AuthService } from 'src/app/auth/services/auth.service';
import { LessonMapper } from '@mappers/lesson.mapper';
import { CourseService } from 'src/app/course/services/course.service';

@Component({
  selector: 'app-form-lesson',
  imports: [ReactiveFormsModule, FormErrorLabelComponent, BtnNavigationComponent],
  templateUrl: './form-lesson.component.html',
  styleUrls:['../../../shared/components/btn-navigation/btn-rounded.scss' ,'./form-lesson.component.scss']
})
export class FormLessonComponent {

  public lessonService = inject(LessonService);
  public lessonFormState = inject(LessonFormState);
  public courseService = inject(CourseService);
  public authService = inject(AuthService);

  @Input()
  public lessonForm! : FormGroup;

  constructor() { }

  public onSubmit = () => {
    
    this.lessonForm.markAllAsTouched();

    if( this.lessonForm.valid ){

      const uid = this.authService.id();
      if( !uid ) return;


      const dto = LessonMapper.mapToCreateLessonDto( this.lessonForm );
      const lessonDto = {
        ...dto,
        
      };

    }
  }

}
