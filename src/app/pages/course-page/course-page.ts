import { CourseDetailComponent } from '../../course/components/course-detail/course-detail.component';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CourseService } from '../../course/services/course.service';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../auth/services/auth.service';
import { rxResource } from '@angular/core/rxjs-interop';
import { of } from 'rxjs';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { ReactiveFormsModule } from '@angular/forms';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { LoaderComponent } from "../../shared/components/loader/loader.component";

@Component({
  selector: 'app-course-page',
  templateUrl: './course-page.html',
  styleUrl: './course-page.scss',
  imports: [
    HeaderComponent, CourseDetailComponent, FooterComponent,
    ReactiveFormsModule,
    LoaderComponent
]
})
export class CoursePage {

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
