import { Routes } from "@angular/router";
import { NotAuthenticatedGuard } from "@guards/not-authenticated.guard";
import { AuthenticatedGuard } from "@guards/authenticated.guard";
import { AuthLayoutComponent } from "./layout/auth-layout/auth-layout.component";
import { FormLoginComponent } from "./components/form-login/form-login.component";
import { FormRegisterComponent } from "./components/form-register/form-register.component";
import { VerifyEmailPageComponent } from "./pages/verify-email-page/verify-email-page.component";
import { UserProfilePageComponent } from "./pages/user-profile-page/user-profile-page.component";
import { ForgotPasswordPageComponent } from "./pages/forgot-password-page/forgot-password-page.component";
import { ResetPasswordPageComponent } from "./pages/reset-password-page/reset-password-page.component";

export const authRoutes : Routes = [

    // Antes del bloque "" de AuthLayoutComponent a propósito: ese bloque tiene
    // un '**' -> redirectTo 'login' entre sus children, que intercepta
    // cualquier segmento no listado ahí (incluido 'forgot-password' o
    // 'reset-password') antes de que el router llegue a probar estas rutas
    // hermanas. Puestas primero, se evalúan antes de que ese wildcard actúe.
    {
        path: 'forgot-password',
        component: ForgotPasswordPageComponent,
        canMatch: [ NotAuthenticatedGuard ],
    },
    {
        path: 'reset-password/:token',
        component: ResetPasswordPageComponent,
        canMatch: [ NotAuthenticatedGuard ],
    },
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
        path: 'verify-email/:token',
        component: VerifyEmailPageComponent,
    },
]

export default authRoutes;
