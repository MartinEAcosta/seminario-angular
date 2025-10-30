import { Component, computed, effect, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { rxResource } from '@angular/core/rxjs-interop';

import { CourseService } from '../../services/course.service';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../auth/services/auth.service';
import { CourseDetailComponent } from '../../components/course-detail/course-detail.component';
import { LoaderComponent } from "../../../shared/components/loader/loader.component";
import { LessonService } from 'src/app/lesson/services/lesson.service';
import { ListOfContentComponent } from "src/app/lesson/components/list-of-content/list-of-content.component";
import { UserState } from 'src/app/auth/state/user-state';

@Component({
  selector: 'app-course-page',
  templateUrl: './course-page.html',
  styleUrl: './course-page.scss',
  imports: [
    CourseDetailComponent,
    ReactiveFormsModule,
    LoaderComponent,
    ListOfContentComponent
]
})
export class CoursePage {

  activatedRoute = inject(ActivatedRoute);
  router = inject(Router);
  userState = inject(UserState);

  courseService = inject(CourseService);
  lessonService = inject(LessonService);
  authService = inject(AuthService);

  courseId = this.activatedRoute.snapshot.params['id'] || '';
  
  courseResource = rxResource({
    request : ( ) => ( { id : this.courseId } ),
    loader : ( { request  } ) => {
      if( request.id === '' ) return of();
      
      return this.courseService.getById( request.id )
                                .pipe(
                                  map( (courseResponse) => {
                                    this.userState.setCourse(courseResponse);
                                    return courseResponse;
                                  }),
                                  catchError( (error) => {
                                    this.router.navigateByUrl('/');
                                    this.userState.setCourse(null);
                                    throw error;
                                  })
                                );
    },
  });


}
