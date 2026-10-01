import { Component, computed, effect, inject, input } from '@angular/core';

import { EnrollmentState } from '@enrollment/state/enrollment-state';
import { ListOfContentComponent } from "@lesson/components/list-of-content/list-of-content.component";
import { LoaderComponent } from "@shared/components/loader/loader.component";
import { LessonState } from '@lesson/state/lesson-state';
import { ActivatedRoute } from '@angular/router';
import { VjsPlayerComponent } from '@shared/components/vjs-player/vjs-player.component';

@Component({
  selector: 'app-lesson-viewer-page',
  templateUrl: './lesson-viewer-page.component.html',
  styleUrl: './lesson-viewer-page.component.scss',
  imports: [ListOfContentComponent, LoaderComponent, VjsPlayerComponent]
})
export class LessonViewerPageComponent {

  activatedRoute = inject(ActivatedRoute);
  enrollmentState = inject(EnrollmentState);
  lessonState = inject(LessonState);

  // debido al withInputBinding() toma desde los params de la url el campo ':id_enrollment <- /lesson:id_lesson'
  id_enrollment = input<string>();
  id_lesson = input<string | undefined>();

  selectedLesson = computed( () =>
    this.id_lesson() ? this.lessonState.lessonResource.value() : this.lessonState.nextLessonResource.value()
  );
  isLoadingLesson = computed( () =>
    this.id_lesson() ? this.lessonState.lessonResource.isLoading() : this.lessonState.nextLessonResource.isLoading()
  );

  constructor( ) {
    effect( () => this.enrollmentState.loadEnrollment( this.id_enrollment()! ));
    effect( () => {
      if( this.id_lesson() ) this.lessonState.loadLesson( this.id_lesson()! );
      else this.lessonState.loadNextLesson( this.id_enrollment()! );
    });
  }

}
