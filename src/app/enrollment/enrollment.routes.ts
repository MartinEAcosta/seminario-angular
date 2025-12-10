import { Routes } from "@angular/router";

import { AuthenticatedGuard } from "@guards/authenticated.guard";
import EnrollmentsPage from "@enrollment/pages/enrollments-page";
import { LessonViewerPageComponent } from "@lesson/pages/lesson-viewer-page/lesson-viewer-page.component";
import { EnrollmentsResolver } from "@enrollment/resolver/enrollments-resolver";
import { EnrollmentResolver } from "./resolver/enrollment-resolver";

export const enrollmentRoutes : Routes = [
    {
        path : '',
        children : [
            {
                path : '',
                component : EnrollmentsPage,
                resolve : {
                    resolvedEnrollments : EnrollmentsResolver
                },
                canMatch : [ AuthenticatedGuard ],
            },
            {
                path : ':id_enrollment',
                canMatch : [ AuthenticatedGuard ],
                resolve : {
                    resolvedEnrollment : EnrollmentResolver,
                },
                component : LessonViewerPageComponent
            },

        ]
    }
]

export default enrollmentRoutes;