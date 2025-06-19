import { Component, inject, input } from '@angular/core';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { Course } from '../../interfaces/course.interfaces';
import { ActivatedRoute, Router } from '@angular/router';
import { CourseService } from '../../services/course/course.service';
import { rxResource } from '@angular/core/rxjs-interop';
import { of } from 'rxjs';

@Component({
  selector: 'app-course-detail',
  imports: [ HeaderComponent , FooterComponent ],
  templateUrl: './course-detail.component.html',
  styleUrl: './course-detail.component.scss'
})
export class CourseDetailComponent {

  activatedRoute = inject(ActivatedRoute);
  router = inject(Router);

  courseService = inject(CourseService);

  courseId = this.activatedRoute.snapshot.params['id'] || '';

  courseResource = rxResource({
    request: () => ( { id : this.courseId } ),
    loader: ( { request } ) => {
      if( request.id === '' ) return of();

      return this.courseService.getById( request.id );
    },
  }); 





}
