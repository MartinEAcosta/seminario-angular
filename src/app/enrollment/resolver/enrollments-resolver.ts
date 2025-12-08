import { inject, Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable} from 'rxjs';

import { EnrollmentService } from '@enrollment/services/enrollment.service';
import { AuthService } from '@auth/services/auth.service';
import { LessonService } from '@lesson/services/lesson.service';
import { UIService } from '@shared/services/ui/ui.service';
import { EnrollmentDetailed } from '@enrollment/models/enrollment.interfaces';
import { EnrollmentState } from '@enrollment/state/enrollment-state';

@Injectable({ providedIn: 'root' })
export class EnrollmentsResolver implements Resolve<EnrollmentDetailed[]> {

  router = inject(Router);
  uiService = inject(UIService);
  authService = inject(AuthService);
  enrollmentState = inject(EnrollmentState);
  lessonService = inject(LessonService);

  resolve(route: ActivatedRouteSnapshot): Observable<EnrollmentDetailed[]> | Promise<EnrollmentDetailed[]> | EnrollmentDetailed[] {
    const user = this.authService.user();

    if (!user) {
      this.uiService.showToastMessage(
        'Debes estar autenticado para acceder a este contenido.'
      );
      this.router.navigateByUrl('/');  
      return [];   
    }

    const enrollmentList = this.enrollmentState.obtainEnrollmentList( );
    return enrollmentList ? enrollmentList : [];
  }
}