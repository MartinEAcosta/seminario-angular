import { Routes } from "@angular/router";

import { AuthenticatedGuard } from "@guards/authenticated.guard";
import EnrollmentsPage from "@enrollment/pages/enrollments-page";
import { LessonViewerPageComponent } from "@lesson/pages/lesson-viewer-page/lesson-viewer-page.component";

export const enrollmentRoutes : Routes = [
    {
        path : '',
        children : [
            {
                path : '',
                component : EnrollmentsPage,
                canMatch : [ AuthenticatedGuard ],
            },
            {
                path : ':id_enrollment',
                canMatch : [ AuthenticatedGuard ],
                component : LessonViewerPageComponent
            },
            {
                path : ':id_enrollment/lesson/:id_lesson',
                canMatch : [ AuthenticatedGuard ],
                component : LessonViewerPageComponent
            },
        ]
    }
]

export default enrollmentRoutes;
