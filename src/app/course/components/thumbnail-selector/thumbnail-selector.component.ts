import { Component, EventEmitter, inject, input } from '@angular/core';
import { CourseFormState } from '../../state/course/course-form-state';
import { FileService } from 'src/app/shared/services/file/file.service';
import { LessonFormState } from 'src/app/lesson/state/lesson/lesson-form-state';

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

  folder = input.required< 'lessons' | 'courses'>();

  constructor() { }


}
