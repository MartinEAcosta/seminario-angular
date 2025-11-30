import { Component, effect, inject, input, signal } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';

import { AuthService } from '@auth/services/auth.service';
import { Course } from '@course/models/course.interfaces';
import { EnrollmentService } from '@enrollment/services/enrollment.service';
import { ListOfContentComponent } from "@lesson/components/list-of-content/list-of-content.component";
import { LessonPopulated } from '@lesson/models/lesson.interfaces';
import { ModuleService } from '@module/services/module.service';
import { VjsPlayerComponent } from "@shared/components/vjs-player/vjs-player.component";
import { LoaderComponent } from "@shared/components/loader/loader.component";
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-lesson-viewer-page',
  imports: [ListOfContentComponent, VjsPlayerComponent, LoaderComponent],
  templateUrl: './lesson-viewer-page.component.html',
  styleUrl: './lesson-viewer-page.component.scss'
})
export class LessonViewerPageComponent {
  
  router = inject(Router);

  authService = inject(AuthService);
  moduleService = inject(ModuleService);
  enrollmentService = inject(EnrollmentService);
  resolvedCourse = input.required<Course>();

  lessonSelected = signal<LessonPopulated | null>(null);
  isLessonLoading = signal<boolean>(true);

  modulesResource = rxResource({
    request : () => ({ courseId : this.resolvedCourse().id }),
    loader  : ( {request} ) => {
      return this.moduleService.getModulesByCourseId( request.courseId );
    },
  });

  enrollmentResource = rxResource({
    request : () => ({ 
      id_user : this.authService.id(),
      id_course : this.resolvedCourse().id,
     }),
    loader : ( { request } ) => {
      if( !request.id_user ) throw this.router.navigateByUrl('/');
      return this.enrollmentService.getEnrollmentByUserIdAndCourseId( request.id_user , request.id_course );
    }
  });

  constructor () {
    effect( () => {
      if( this.enrollmentResource.hasValue() ) {
        const enrollment = this.enrollmentResource.value();
        
        this.isLessonLoading.set(false);
        this.enrollmentService
          .getNextLesson(enrollment.id)
          .subscribe(( lessonPopulated  => {
            this.lessonSelected.set(lessonPopulated);
            return lessonPopulated;
          }))
      };
      return;
    });
  }

}
