import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { AboutComponent } from './pages/about/about.component';
import { AuthComponent } from './pages/auth/auth.component';
import { NotAuthenticatedGuard } from './auth/guards/not-authenticated.guard';
import { CourseCreateComponent } from './pages/course-handler/course-handler-page';
import { AuthenticatedGuard } from './auth/guards/authenticated.guard';
import { CourseDetailComponent } from './course/course-detail/course-detail.component';
import { CoursePage } from './pages/course-page/course-page';

const routes: Routes = [
  { 
    path : '' , 
    component: HomeComponent  
  },
  { 
    path : 'about' , 
    component: AboutComponent  
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
    path : 'course/:id',
    component : CoursePage,
  },
  { 
    path : 'auth' ,
     component: AuthComponent ,
     canMatch: [ NotAuthenticatedGuard ]
  },
  {
    // En caso de no hacer match con ningun path regirige al home
    path : '**',
    component: HomeComponent,
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule { }