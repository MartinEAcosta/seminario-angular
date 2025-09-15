import { Routes } from "@angular/router";
import { AuthenticatedGuard } from "@guards/authenticated.guard";
import { ValidateParamGuard } from "./guards/validate-param.guard";
import { CourseResolver } from "./resolver/course-resolver";
import { CoursePage } from "./pages/course-page/course-page";
import { UpdateCoursePageComponent } from "./pages/update-course/update-course-page";
import { CreateCoursePageComponent } from "./pages/create-course/create-course-page.";

export const courseRoutes : Routes = [
    {
        path : '',
        children : [
            {
                path : 'create',
                component : CreateCoursePageComponent,
                canMatch : [ AuthenticatedGuard ],
            },
            {
                path : 'update',
                component : UpdateCoursePageComponent,
                canActivate : [ ValidateParamGuard ],
                canMatch : [ AuthenticatedGuard ],
            },
            {
                path : 'update/:id',
                component : UpdateCoursePageComponent,
                canActivate : [ ValidateParamGuard ],
                canMatch : [ AuthenticatedGuard ],
                resolve : {
                    resolvedCourse : CourseResolver
                }
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