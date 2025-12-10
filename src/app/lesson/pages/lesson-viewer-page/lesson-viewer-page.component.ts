import { Router } from '@angular/router';
import { Component, computed, inject} from '@angular/core';

import { AuthService } from '@auth/services/auth.service';
import { EnrollmentService } from '@enrollment/services/enrollment.service';
import { ModuleService } from '@module/services/module.service';
import { LessonService } from '@lesson/services/lesson.service';
import { EnrollmentState } from '@enrollment/state/enrollment-state';

@Component({
  selector: 'app-lesson-viewer-page',
  templateUrl: './lesson-viewer-page.component.html',
  styleUrl: './lesson-viewer-page.component.scss'
})
export class LessonViewerPageComponent {

  router = inject(Router);
  authService = inject(AuthService);
  moduleService = inject(ModuleService);
  enrollmentService = inject(EnrollmentService);
  lessonService = inject(LessonService);

  enrollmentState = inject(EnrollmentState);

  selectedEnrollment = computed( () => this.enrollmentState.selectedEnrollment());

  constructor( ) {
    console.log(this.selectedEnrollment())
  }
}
