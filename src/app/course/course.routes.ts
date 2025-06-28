import { Routes } from "@angular/router";
import { AuthenticatedGuard } from "@guards/authenticated.guard";
import CourseHandlerComponent from "./pages/course-handler/course-handler-page";
import CoursePage from "./pages/course-page/course-page";

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
                path : ':id',
                component : CoursePage,
            },
            {
                path : 'update/:id',
                component: CourseHandlerComponent,
                canMatch : [ AuthenticatedGuard ],
            },
        ]
    }
];

export default courseRoutes;