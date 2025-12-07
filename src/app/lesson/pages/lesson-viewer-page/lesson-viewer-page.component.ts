import { LessonService } from 'src/app/lesson/services/lesson.service';
import { Component, effect, inject, input, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';

import { AuthService } from '@auth/services/auth.service';
import { Course } from '@course/models/course.interfaces';
import { EnrollmentService } from '@enrollment/services/enrollment.service';
import { ListOfContentComponent } from "@lesson/components/list-of-content/list-of-content.component";
import { LessonPopulated } from '@lesson/models/lesson.interfaces';
import { ModuleService } from '@module/services/module.service';
import { VjsPlayerComponent } from "@shared/components/vjs-player/vjs-player.component";
import { LoaderComponent } from "@shared/components/loader/loader.component";
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-lesson-viewer-page',
  imports: [ListOfContentComponent, VjsPlayerComponent, LoaderComponent, NgClass],
  templateUrl: './lesson-viewer-page.component.html',
  styleUrl: './lesson-viewer-page.component.scss'
})
export class LessonViewerPageComponent {
  
  resolvedCourse = input.required<Course>();
  
  router = inject(Router);
  authService = inject(AuthService);
  moduleService = inject(ModuleService);
  enrollmentService = inject(EnrollmentService);
  lessonService = inject(LessonService);

  lessonSelected = signal<LessonPopulated | null>( null );
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
      const lesson = this.lessonSelected();
      if( !lesson ){
        if( this.enrollmentResource.hasValue() && this.isLessonLoading()) {
          const enrollment = this.enrollmentResource.value();
          this.lessonService
          .getNextLesson(enrollment.id)
          .subscribe(( nextLesson => {
            this.lessonSelected.set(nextLesson);
            this.isLessonLoading.set(false);
            return nextLesson;
          }));
        };
      }
    });
  }
}
