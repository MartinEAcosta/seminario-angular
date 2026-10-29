import { Component, computed, effect, inject, input } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { of } from 'rxjs';

import { EnrollmentState } from '@enrollment/state/enrollment-state';
import { ListOfContentComponent } from "@lesson/components/list-of-content/list-of-content.component";
import { LoaderComponent } from "@shared/components/loader/loader.component";
import { LessonState } from '@lesson/state/lesson-state';
import { ActivatedRoute } from '@angular/router';
import { VjsPlayerComponent } from '@shared/components/vjs-player/vjs-player.component';
import { ModuleService } from '@module/services/module.service';

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
  private moduleService = inject(ModuleService);

  // debido al withInputBinding() toma desde los params de la url el campo ':id_enrollment <- /lesson:id_lesson'
  id_enrollment = input<string>();
  id_lesson = input<string | undefined>();

  selectedLesson = computed( () =>
    this.id_lesson() ? this.lessonState.lessonResource.value() : this.lessonState.nextLessonResource.value()
  );
  isLoadingLesson = computed( () =>
    this.id_lesson() ? this.lessonState.lessonResource.isLoading() : this.lessonState.nextLessonResource.isLoading()
  );

  // Temario de la izquierda: list-of-content recibe los módulos ya cargados
  // (mismo patrón que course-page), en vez de cargarlos él mismo.
  modulesResource = rxResource({
    params : ( ) => ( { id_course : this.enrollmentState.selectedEnrollment()?.course.id_course } ),
    stream : ( { params } ) => {
      if ( !params.id_course ) return of([]);

      return this.moduleService.getModulesByCourseId( params.id_course );
    },
  });

  constructor( ) {
    effect( () => this.enrollmentState.loadEnrollment( this.id_enrollment()! ));
    effect( () => {
      if( this.id_lesson() ) this.lessonState.loadLesson( this.id_lesson()! );
      else this.lessonState.loadNextLesson( this.id_enrollment()! );
    });
  }

}
