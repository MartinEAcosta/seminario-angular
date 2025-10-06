import { FormGroup } from '@angular/forms';
import { Component, inject } from '@angular/core';

import { AuthService } from '../../../auth/services/auth.service';
import { CourseService } from '../../services/course.service';
import { FileService } from 'src/app/shared/services/file/file.service';
import { CourseMapper } from '@mappers/course.mapper';
import { FormCourseComponent } from "../../components/form-course/form-course.component";
import { CourseFormState } from '../../state/course/course-form-state';

@Component({
  selector: 'app-create-course-page',
  imports: [FormCourseComponent],
  templateUrl: './create-course-page.html',
  styleUrl: './create-course-page.scss',
})
export class CreateCoursePageComponent {
  folder = "courses";

  private courseService = inject(CourseService);
  private fileService = inject(FileService);
  private authService = inject(AuthService);
  private courseFormState = inject(CourseFormState);
  
  constructor ( ) { }

  onCreateCourse = ( ) : void => {
    this.courseFormState.courseForm.markAllAsTouched();
    
    if( this.courseFormState.courseForm.valid ){
  
      const uid = this.authService.id();
      if( !uid ) return;
        
      const createCourseDto = CourseMapper.mapToCourseDto( this.courseFormState.courseForm );

      this.courseService.createCourse( createCourseDto , this.courseFormState.thumbnailFile() ).subscribe();

      // this.courseFormState.reset();
    }
  } 
}
