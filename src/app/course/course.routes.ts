import { Routes } from "@angular/router";

import { AuthenticatedGuard } from "@auth/guards/authenticated.guard";
import { ValidateParamIdGuard } from "@course/guards/validate-param.guard";
import { courseContentGuard } from "@course/guards/course-content.guard";
import { CourseResolver } from "@course/resolver/course-resolver";
import { CoursePage , CreateCoursePageComponent , UpdateCoursePageComponent } from "@course/pages/";
import { CourseStepDataComponent } from "@course/components/form-course/steps/course-step-data/course-step-data.component";
import { CourseStepContentComponent } from "@course/components/form-course/steps/course-step-content/course-step-content.component";

export const courseRoutes : Routes = [
    {
        path : '',
        children : [
            {
                path : 'create',
                component : CreateCoursePageComponent,
                canMatch : [ AuthenticatedGuard ],
                children : [
                    { path : '' , redirectTo : 'data' , pathMatch : 'full' },
                    { path : 'data' , component : CourseStepDataComponent },
                    { path : 'content' , component : CourseStepContentComponent , canActivate : [ courseContentGuard ] },
                ]
            },
            {
                //Guard de propiedad
                path : 'update',
                component : UpdateCoursePageComponent,
                canActivate : [ ValidateParamIdGuard ],
                canMatch : [ AuthenticatedGuard ],
            },
            {
                //Guard de propiedad
                path : 'update/:id',
                component : UpdateCoursePageComponent,
                canActivate : [ ValidateParamIdGuard ],
                canMatch : [ AuthenticatedGuard ],
                resolve : {
                    resolvedCourse : CourseResolver
                },
                children : [
                    { path : '' , redirectTo : 'data' , pathMatch : 'full' },
                    { path : 'data' , component : CourseStepDataComponent },
                    { path : 'content' , component : CourseStepContentComponent },
                ]
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