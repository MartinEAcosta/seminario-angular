import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import HomeComponent from './course/pages/home/home-page';
import { AboutComponent } from './course/pages/about/about-page';
import { AuthComponent } from './auth/pages/auth/auth-page';
import { NotAuthenticatedGuard } from './auth/guards/not-authenticated.guard';
import { CourseCreateComponent } from './course/pages/course-handler/course-handler-page';
import { AuthenticatedGuard } from './auth/guards/authenticated.guard';
import { CoursePage } from './course/pages/course-page/course-page';

export const routes: Routes = [
  { 
    path : '' , 
    loadComponent: () => 
      import('./course/pages/home/home-page'),
  },
  { 
    path : 'about' , 
    component: AboutComponent  
  },
  {
    path : 'course/:id',
    component : CoursePage,
  },
  {
    path : 'course/create',
    component: CourseCreateComponent ,
    canMatch : [ AuthenticatedGuard ]
  },
  {
    path : 'course/update/:id',
    component: CourseCreateComponent ,
    canMatch : [ AuthenticatedGuard ]
  },
  { 
    path : 'auth' ,
     component: AuthComponent ,
     canMatch: [ NotAuthenticatedGuard ]
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