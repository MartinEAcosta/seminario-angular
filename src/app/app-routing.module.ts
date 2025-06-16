import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { AboutComponent } from './pages/about/about.component';
import { AuthComponent } from './pages/auth/auth.component';
import { NotAuthenticatedGuard } from './auth/guards/not-authenticated.guard';
import { CourseCreateComponent } from './course-create/course-create.component';
import { AuthenticatedGuard } from './auth/guards/authenticated.guard';

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