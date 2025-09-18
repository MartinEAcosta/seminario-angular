import { CourseDetailComponent } from '../../components/course-detail/course-detail.component';
import { Component, computed, effect, inject } from '@angular/core';
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

  // TODO : Manejo de excepción realizado, verificar si se puede optimizar via un Guard.
  errorResource = computed( () => this.courseResource.value() === undefined && !this.courseResource.isLoading() );
  hasErrorResource = effect( () => {
    if( this.errorResource() ){
      this.router.navigateByUrl('/');
    }
  });


}
