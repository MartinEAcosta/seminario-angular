import { Router } from '@angular/router';
import { Component, inject } from '@angular/core';

import { CourseService } from 'src/app/course/services/course.service';
import { CourseMapper } from '@mappers/course.mapper';
import { FormCourseComponent } from "src/app/course/components/form-course/form-course.component";
import { CourseFormState } from '../../state/course/course-form-state';

@Component({
  selector: 'app-update-course-page',
  imports: [FormCourseComponent],
  templateUrl: './update-course-page.html',
  styleUrl: './update-course-page.scss'
})


export class UpdateCoursePageComponent {
  
  private router = inject(Router);
  private courseService = inject(CourseService);
  public courseFormState = inject(CourseFormState);
  
  constructor (  ) { }

  public onUpdateCourse = ( ) : void => {

    const updateCourseDTO = CourseMapper.mapToCourseDto( this.courseFormState.courseForm , this.courseFormState.limitedCapacity() );

    updateCourseDTO.id = this.courseFormState.selectedCourse()?.id!;

    if( !this.courseFormState.thumbnailFile() ){
      updateCourseDTO.id_file = this.courseFormState.selectedCourse()?.id_file!;
      updateCourseDTO.thumbnail_url = this.courseFormState.selectedCourse()?.thumbnail_url!;
    }
    
    this.courseService.saveCourse( updateCourseDTO , this.courseFormState.thumbnailFile() )
                        .subscribe(
                          ( course ) => {
                            this.courseFormState.reset();
                            this.router.navigate([`/courses/${ course.id }`]);
                          },
                        );
  }


}
