import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { rxResource } from '@angular/core/rxjs-interop';

import { CourseService } from '../../services/course.service';
import { CourseDetailComponent } from '../../components';
import { LoaderComponent } from "../../../shared/components/loader/loader.component";
import { ListOfContentComponent } from "@lesson/components/list-of-content/list-of-content.component";

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

  private activatedRoute = inject(ActivatedRoute);
  private courseService = inject(CourseService);

  private courseId = this.activatedRoute.snapshot.params['id'] || '';
  
  courseResource = rxResource({
    params : ( ) => ( { id : this.courseId } ),
    stream : ( { params  } ) => {
      if( params.id === '' ) return of();
      
      return this.courseService.getById( params.id )
    },
  });

  constructor() { }


}
