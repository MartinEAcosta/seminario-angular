import { Routes } from "@angular/router";
import { AuthenticatedGuard } from "@guards/authenticated.guard";
import { BecomeTeacherPageComponent } from "./pages/become-teacher-page/become-teacher-page.component";

export const teacherRequestRoutes : Routes = [
    {
        path: '',
        component: BecomeTeacherPageComponent,
        canMatch: [ AuthenticatedGuard ],
    },
];

export default teacherRequestRoutes;
