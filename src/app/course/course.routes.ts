import { Routes } from "@angular/router";
import { AuthenticatedGuard } from "@guards/authenticated.guard";
import CourseHandlerComponent from "./pages/course-handler/course-handler-page";
import CoursePage from "./pages/course-page/course-page";
import { ValidateParamGuard } from "./guards/validate-param.guard";

export const courseRoutes : Routes = [
    {
        path : '',
        children : [
            {
                path : 'create',
                component : CourseHandlerComponent,
                canMatch : [ AuthenticatedGuard ],
            },
            {
                path : 'update/:id',
                component : CourseHandlerComponent,
                canActivate : [ ValidateParamGuard ],
                canMatch : [ AuthenticatedGuard ],
            },
            {
                path : ':id',
                component : CoursePage,
            },
            {
                path : '**',
                redirectTo : 'create'
            }
        ]
    }
];

export default courseRoutes;