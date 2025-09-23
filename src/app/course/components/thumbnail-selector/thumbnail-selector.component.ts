import { Component, EventEmitter, inject, input } from '@angular/core';
import { CourseFormState } from '../../state/course-form-state';

@Component({
  selector: 'app-thumbnail-selector',
  imports: [],
  templateUrl: './thumbnail-selector.component.html',
  styleUrl: './thumbnail-selector.component.scss'
})
export class ThumbnailSelectorComponent {

  public courseFormState = inject(CourseFormState);

  constructor() { }


}
