import { Routes } from "@angular/router";

import { AuthenticatedGuard } from "@guards/authenticated.guard";
import EnrollmentsPage from "@enrollment/pages/enrollment-page";

export const enrollmentRoutes : Routes = [
    {
        path : '',
        children : [
            {
                path : '',
                component : EnrollmentsPage,
                canMatch : [ AuthenticatedGuard ],
            }
        ]
    }
]

export default enrollmentRoutes;