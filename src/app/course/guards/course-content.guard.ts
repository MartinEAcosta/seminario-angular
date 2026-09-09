import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";

import { CourseFormState } from "@course/state/course-form/course-form-state";

export const courseContentGuard : CanActivateFn = ( ) => {

    const courseFormState = inject(CourseFormState);

    if( courseFormState.courseId() ) return true;

    inject(Router).navigate( ['/course/create/data'] );
    return false;
}
