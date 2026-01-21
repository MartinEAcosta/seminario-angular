import { inject, Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable, of} from 'rxjs';
import { filter } from 'rxjs/operators';

import { UIService } from '@shared/services/ui/ui.service';
import { EnrollmentDetailed } from '@enrollment/models/enrollment.interfaces';
import { EnrollmentState } from '@enrollment/state/enrollment-state';

@Injectable({ providedIn: 'root' })
export class EnrollmentResolver implements Resolve<EnrollmentDetailed | null> {

  router = inject(Router);
  uiService = inject(UIService);
  enrollmentState = inject(EnrollmentState);

  resolve( route : ActivatedRouteSnapshot ) : Observable<EnrollmentDetailed | null> | Promise<EnrollmentDetailed> | EnrollmentDetailed {
    const enrollmentId = route.paramMap.get('id_enrollment');
    if( !enrollmentId ) {
        this.uiService.showToastMessage('Hubo un error al recopilar la inscripción.');
        this.router.navigateByUrl('/');
        return of();
    }

    const enrollment = this.enrollmentState.loadEnrollment( enrollmentId! );
    return enrollment.pipe(
      filter((value) => {
        console.log(value)
        if (!value) {
          this.uiService.showToastMessage(
            'Hubo un error al recopilar la inscripción.'
          );
          this.router.navigateByUrl('/');
          return false;
        }
        return true;
      })
    );
  }
}