import { Routes } from "@angular/router";
import AuthComponent from "./pages/auth/auth-page";
import { NotAuthenticatedGuard } from "@guards/not-authenticated.guard";

export const authRoutes : Routes = [

    {
        path : '',
        component : AuthComponent,
        canMatch: [ NotAuthenticatedGuard ],

    }
]

export default authRoutes;