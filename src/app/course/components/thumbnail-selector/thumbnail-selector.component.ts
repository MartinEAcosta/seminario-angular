import { Component, inject, input } from '@angular/core';

import { CourseFormState } from '@course/state/course-form/course-form-state';
import { FileService } from 'src/app/file/services/file.service';
import { LessonFormState } from '@lesson/state/lesson-form/lesson-form-state';

@Component({
  selector: 'app-thumbnail-selector',
  imports: [],
  templateUrl: './thumbnail-selector.component.html',
  styleUrl: './thumbnail-selector.component.scss'
})
export class ThumbnailSelectorComponent {

  fileService = inject(FileService);
  courseFormState = inject(CourseFormState);
  lessonFormState = inject(LessonFormState);

  folder = input.required<'lessons' | 'courses'>();

  constructor() { }


}
