import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NotAuthenticatedGuard } from './auth/guards/not-authenticated.guard';
import { AuthenticatedGuard } from './auth/guards/authenticated.guard';

export const routes: Routes = [
  { 
    path : '' , 
    loadComponent: () => 
      import('./course/pages/home/home-page'),
  },
  { 
    path : 'about' , 
    loadComponent: () =>
      import('./course/pages/about/about-page')
  },
  {
    path : 'course/:id',
    loadComponent: () =>
      import('./course/pages/course-page/course-page'),
  },
  {
    path : 'course/create',
    loadComponent: () =>
      import('./course/pages/course-handler/course-handler-page'),
    canMatch : [ AuthenticatedGuard ]
  },
  {
    path : 'course/update/:id',
    loadComponent: () =>
      import('./course/pages/course-handler/course-handler-page'),
    canMatch : [ AuthenticatedGuard ],
  },
  { 
    path : 'auth' ,
    loadComponent: () =>
      import('./auth/pages/auth/auth-page'),
     canMatch: [ NotAuthenticatedGuard ],
  },
  {
    // En caso de no hacer match con ningun path regirige al home
    path : '**',
    loadComponent: () =>  
      import('./course/pages/home/home-page'),
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule { }