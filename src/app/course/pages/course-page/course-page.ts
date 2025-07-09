import { CourseDetailComponent } from '../../components/course-detail/course-detail.component';
import { Component, effect, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CourseService } from '../../services/course.service';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../auth/services/auth.service';
import { rxResource } from '@angular/core/rxjs-interop';
import { catchError, map, of } from 'rxjs';
import { ReactiveFormsModule } from '@angular/forms';
import { LoaderComponent } from "../../../shared/components/loader/loader.component";

@Component({
  selector: 'app-course-page',
  templateUrl: './course-page.html',
  styleUrl: './course-page.scss',
  imports: [
    CourseDetailComponent,
    ReactiveFormsModule,
    LoaderComponent,
]
})
export default class CoursePage {

  activatedRoute = inject(ActivatedRoute);
  router = inject(Router);

  courseService = inject(CourseService);
  authService = inject(AuthService);

  courseId = this.activatedRoute.snapshot.params['id'] || '';
  
  courseResource = rxResource({
    request : ( ) => ( { id : this.courseId } ),
    loader : ( { request  } ) => {
      if( request.id === '' ) return of();
        
      return this.courseService.getById( request.id );
    },
  });

}
