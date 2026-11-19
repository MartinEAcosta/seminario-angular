import { Component, inject, input } from '@angular/core';

import { CourseFormState } from '@course/state/course-form/course-form-state';
import { UploadFolder } from '@file/models/file.interface';
import { LessonFormState } from '@lesson/state/lesson-form/lesson-form-state';

@Component({
  selector: 'app-thumbnail-selector',
  imports: [],
  templateUrl: './thumbnail-selector.component.html',
  styleUrl: './thumbnail-selector.component.scss'
})
export class ThumbnailSelectorComponent {

  courseFormState = inject(CourseFormState);
  lessonFormState = inject(LessonFormState);

  folder = input.required<Extract<UploadFolder, 'course' | 'lesson'>>();

  constructor() { }


}
