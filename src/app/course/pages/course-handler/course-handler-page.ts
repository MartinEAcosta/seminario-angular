/*
  Path:PORT/course/create
  Path:PORT/course/update/:id
*/
import { Component, inject, signal  } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../auth/services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CourseService } from '../../services/course.service';
import { rxResource } from '@angular/core/rxjs-interop';
import { of } from 'rxjs';
import { FormCourseComponent } from "../../components/form-course/form-course.component";
import { LoaderComponent } from "../../../shared/components/loader/loader.component";

@Component({
    selector: 'app-course-create',
    templateUrl: './course-handler-page.html',
    styleUrl: './course-handler-page.scss',
    imports: [ReactiveFormsModule, FormCourseComponent, LoaderComponent]
})
export default class CourseHandlerComponent {

  activatedRoute = inject(ActivatedRoute);
  router = inject(Router);

  courseService = inject(CourseService);
  courseId = this.activatedRoute.snapshot.params['id'] || '';
  
  courseResource = rxResource({
    request : ( ) => ( { id : this.courseId } ),
    loader : ({ request } ) => {

      if( request.id === '' ) return of();
        
      return this.courseService.getById( request.id );
    },
  });

}
