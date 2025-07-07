import { Routes } from '@angular/router';
import { NotAuthenticatedGuard } from './auth/guards/not-authenticated.guard';
import { AuthenticatedGuard } from './auth/guards/authenticated.guard';
import HomeComponent from './shared/pages/home/home-page';

export const routes: Routes = [

  { 
    path : '' , 
    component: HomeComponent,
  },

  {

    path: 'course',
    loadChildren : () => 
      import('./course/course.routes'),
  },
  
  { 
    path : 'auth' ,
    loadChildren: () =>
      import('./auth/auth.routes'),
  },  

  { 
    path : 'about' , 
    loadComponent: () =>
      import('./shared/pages/about/about-page'),
  },

  {
    // En caso de no hacer match con ningun path regirige al home
    path : '**',
    redirectTo: ''
  }
  
];

