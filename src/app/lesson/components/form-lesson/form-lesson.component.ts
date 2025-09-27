import { Component, inject, Input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

import { LessonService } from 'src/app/lesson/services/lesson.service';
import { LessonFormState } from '../../state/lesson/lesson-form-state';
import { FormErrorLabelComponent } from "src/app/shared/components/form-error-label/form-error-label.component";

@Component({
  selector: 'app-form-lesson',
  imports: [ReactiveFormsModule, FormErrorLabelComponent],
  templateUrl: './form-lesson.component.html',
  styleUrl: './form-lesson.component.scss'
})
export class FormLessonComponent {

  public lessonService = inject(LessonService);
  public lessonFormState = inject(LessonFormState);

  @Input()
  public lessonForm! : FormGroup;

  constructor() { }

}
