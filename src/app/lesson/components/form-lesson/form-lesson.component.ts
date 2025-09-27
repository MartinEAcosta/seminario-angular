import { Component, inject, Input } from '@angular/core';
import { LessonService } from 'src/app/lesson/services/lesson.service';
import { LessonFormState } from '../../state/lesson/lesson-form-state';
import { FormGroup } from '@angular/forms';
import { Lesson } from '../../models/lesson.interfaces';

@Component({
  selector: 'app-form-lesson',
  imports: [],
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
