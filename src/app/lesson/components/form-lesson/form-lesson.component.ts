import { Component, inject } from '@angular/core';
import { LessonService } from 'src/app/lesson/services/lesson.service';
import { FormErrorLabelComponent } from "src/app/shared/components/form-error-label/form-error-label.component";

@Component({
  selector: 'app-form-lesson',
  imports: [],
  templateUrl: './form-lesson.component.html',
  styleUrl: './form-lesson.component.scss'
})
export class FormLessonComponent {

  public lessonService = inject(LessonService);

}
