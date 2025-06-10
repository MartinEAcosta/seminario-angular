import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { AboutComponent } from './pages/about/about.component';
import { AuthComponent } from './pages/auth/auth.component';
import { NotAuthenticatedGuard } from './auth/guards/not-authenticated.guard';
import { CourseCreateComponent } from './course-create/course-create.component';

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
    component: CourseCreateComponent
  },
  { 
    path : 'auth' ,
     component: AuthComponent ,
     canMatch: [ NotAuthenticatedGuard ]
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule { }