import { Router } from '@angular/router';
import { Component, inject} from '@angular/core';

import { EnrollmentState } from '@enrollment/state/enrollment-state';
import { VjsPlayerComponent } from "@shared/components/vjs-player/vjs-player.component";
import { ListOfContentComponent } from "@lesson/components/list-of-content/list-of-content.component";
import { LoaderComponent } from "@shared/components/loader/loader.component";
import { CourseState } from '@course/state/course/course-state';

@Component({
  selector: 'app-lesson-viewer-page',
  templateUrl: './lesson-viewer-page.component.html',
  styleUrl: './lesson-viewer-page.component.scss',
  imports: [VjsPlayerComponent, ListOfContentComponent, LoaderComponent]
})
export class LessonViewerPageComponent {

  router = inject(Router);

  enrollmentState = inject(EnrollmentState);
  courseState = inject(CourseState);

  constructor( ) {  }

}
