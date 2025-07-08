import { Routes } from "@angular/router";
import { NotAuthenticatedGuard } from "@guards/not-authenticated.guard";
import { AuthLayoutComponent } from "./layout/auth-layout/auth-layout.component";
import { LoginPageComponent } from "./pages/login-page/login-page.component";
import { RegisterPageComponent } from "./pages/register-page/register-page.component";

export const authRoutes : Routes = [

    {
        path : '',
        component : AuthLayoutComponent,
        canMatch: [ NotAuthenticatedGuard ],
        children: [
            {
                path: 'login',
                component: LoginPageComponent,
            },
            {
                path: 'register',
                component: RegisterPageComponent,
            },
            {
                path: '**',
                redirectTo: 'login'
            }
        ]
    }
    
]

export default authRoutes;