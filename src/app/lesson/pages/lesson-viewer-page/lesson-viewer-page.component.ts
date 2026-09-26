import { Component, effect, inject, input } from '@angular/core';

import { EnrollmentState } from '@enrollment/state/enrollment-state';
import { ListOfContentComponent } from "@lesson/components/list-of-content/list-of-content.component";
import { LoaderComponent } from "@shared/components/loader/loader.component";
import { LessonState } from '@lesson/state/lesson-state';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-lesson-viewer-page',
  templateUrl: './lesson-viewer-page.component.html',
  styleUrl: './lesson-viewer-page.component.scss',
  imports: [ListOfContentComponent, LoaderComponent]
})
export class LessonViewerPageComponent {

  activatedRoute = inject(ActivatedRoute);
  enrollmentState = inject(EnrollmentState);
  lessonState = inject(LessonState);

  // debido al withInputBinding() toma desde los params de la url el campo ':id_enrollment <- /lesson:id_lesson'
  id_enrollment = input<string>();

  constructor( ) {
    effect( () => this.enrollmentState.loadEnrollment( this.id_enrollment()! )) 
  }

}
