import { Routes } from "@angular/router";
import { NotAuthenticatedGuard } from "@guards/not-authenticated.guard";
import { AuthenticatedGuard } from "@guards/authenticated.guard";
import { AuthLayoutComponent } from "./layout/auth-layout/auth-layout.component";
import { FormLoginComponent } from "./components/form-login/form-login.component";
import { FormRegisterComponent } from "./components/form-register/form-register.component";
import { VerifyEmailPageComponent } from "./pages/verify-email-page/verify-email-page.component";
import { UserProfilePageComponent } from "./pages/user-profile-page/user-profile-page.component";

export const authRoutes : Routes = [

    {
        path : '',
        component : AuthLayoutComponent,
        canMatch: [ NotAuthenticatedGuard ],
        children: [
            {
                path: 'login',
                component: FormLoginComponent,
            },
            {
                path: 'register',
                component: FormRegisterComponent,
            },
            {
                path: '**',
                redirectTo: 'login'
            }
        ]
    },
    {
        path: 'me',
        component: UserProfilePageComponent,
        canMatch: [ AuthenticatedGuard ],
    },
    {
        path: 'verify-email',
        component: VerifyEmailPageComponent,
        canMatch: [ AuthenticatedGuard ],
    },
    {
        path: 'verify-email/:token',
        component: VerifyEmailPageComponent,
    },
]

export default authRoutes;
