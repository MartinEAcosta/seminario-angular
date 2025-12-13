import { Component, inject } from '@angular/core';

import { AuthService } from '../../../auth/services/auth.service';
import { CourseService } from '../../services/course.service';
import { CourseMapper } from '@mappers/course.mapper';
import { FormCourseComponent } from "../../components/form-course/form-course.component";
import { CourseFormState } from '../../state/course-form/course-form-state';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-course-page',
  imports: [FormCourseComponent],
  templateUrl: './create-course-page.html',
  styleUrl: './create-course-page.scss',
})
export class CreateCoursePageComponent {

  private router = inject(Router);
  private courseService = inject(CourseService);
  private authService = inject(AuthService);
  private courseFormState = inject(CourseFormState);
  
  constructor ( ) { }

  public onCreateCourse = ( ) : void => {
      const uid = this.authService.id();
      if( !uid ) return;
        
      const createCourseDto = CourseMapper.mapToCourseDto( this.courseFormState.courseForm );

      this.courseService.saveCourse( createCourseDto , this.courseFormState.thumbnailFile() )
                          .subscribe(
                            ( course ) => {
                                        this.courseFormState.reset( );
                                        this.router.navigate([`/courses/${ course.id }`]);
                            },
                          );
  } 
  
}
