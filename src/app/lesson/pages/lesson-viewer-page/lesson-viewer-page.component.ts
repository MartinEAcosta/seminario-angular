import { ActivatedRoute } from '@angular/router';
import { Component, effect, inject, input } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

import { EnrollmentState } from '@enrollment/state/enrollment-state';
import { ListOfContentComponent } from "@lesson/components/list-of-content/list-of-content.component";
import { LoaderComponent } from "@shared/components/loader/loader.component";
import { LessonState } from '@lesson/state/lesson-state';

@Component({
  selector: 'app-lesson-viewer-page',
  templateUrl: './lesson-viewer-page.component.html',
  styleUrl: './lesson-viewer-page.component.scss',
  imports: [ListOfContentComponent, LoaderComponent]
})
export class LessonViewerPageComponent {

  private activatedRoute = inject(ActivatedRoute);

  // Llega por `withComponentInputBinding()` desde el parámetro de ruta :id_enrollment.
  id_enrollment = input.required<string>();

  lessonId = toSignal<string>(this.activatedRoute.params.pipe( map( (p) => p['id_lesson'] )));
  enrollmentState = inject(EnrollmentState);
  lessonState = inject(LessonState);

  constructor( ) {
    effect( () => this.enrollmentState.loadEnrollment( this.id_enrollment() ) );
  }

}
