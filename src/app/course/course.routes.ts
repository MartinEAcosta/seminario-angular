import { Routes } from "@angular/router";
import { AuthenticatedGuard } from "@guards/authenticated.guard";
import { ValidateParamIdGuard } from "./guards/validate-param.guard";
import { CourseResolver } from "./resolver/course-resolver";
import { CoursePage } from "./pages/course-detail/course-page";
import { UpdateCoursePageComponent } from "./pages/update-course/update-course-page";
import { CreateCoursePageComponent } from "./pages/create-course/create-course-page";
import { LessonViewerPageComponent } from "../lesson/pages/lesson-viewer-page/lesson-viewer-page.component";
import { LessonResolver } from "../lesson/resolver/lesson-resolver";

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
                path : ':id/lesson/:id_lesson',
                canMatch : [ AuthenticatedGuard ],
                canActivate : [ ValidateParamIdGuard ],
                resolve : {
                    resolvedCourse : CourseResolver,
                    resolvedLesson : LessonResolver,
                },
                component : LessonViewerPageComponent
            },
            {
                path : '**',
                redirectTo : 'create'
            }
        ]
    }
];

export default courseRoutes;