import { Routes } from "@angular/router";

import { AuthenticatedGuard } from "@auth/guards/authenticated.guard";
import { ValidateParamIdGuard } from "@course/guards/validate-param.guard";
import { CourseResolver } from "@course/resolver/course-resolver";
import { CoursePage , CreateCoursePageComponent , UpdateCoursePageComponent } from "@course/pages/";
import { LessonViewerPageComponent } from "@lesson/pages/lesson-viewer-page/lesson-viewer-page.component";

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
                //Guard de propiedad 
                path : 'update',
                component : UpdateCoursePageComponent,
                canActivate : [ ValidateParamIdGuard ],
                canMatch : [ AuthenticatedGuard ],
            },
            {
                path : 'update/:id',
                component : UpdateCoursePageComponent,
                canActivate : [ ValidateParamIdGuard ],
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