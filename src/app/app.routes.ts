import { Routes } from '@angular/router';
import HomeComponent from './shared/pages/home/home-page';
import { ExplorePage } from './shared/pages/explore/explore-page';

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
    path : 'enrollments',
    loadChildren: () => 
      import('./enrollment/enrollment.routes'),
  },

  {
    path : 'payment',
    loadChildren: () => 
      import('./payment/payment.routes'),
  },

  {
    path : 'explore',
    component : ExplorePage,
  },

  {
    // En caso de no hacer match con ningun path regirige al home
    path : '**',
    redirectTo: ''
  }
  
];

