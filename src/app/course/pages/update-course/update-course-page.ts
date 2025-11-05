import { ActivatedRoute, Router } from '@angular/router';
import { Component, inject } from '@angular/core';

import { CourseService } from 'src/app/course/services/course.service';
import { CourseMapper } from '@mappers/course.mapper';
import { FormCourseComponent } from "src/app/course/components/form-course/form-course.component";
import { CourseFormState } from '../../state/course/course-form-state';
import { UserState } from 'src/app/auth/state/user-state';

@Component({
  selector: 'app-update-course-page',
  imports: [FormCourseComponent],
  templateUrl: './update-course-page.html',
  styleUrl: './update-course-page.scss'
})


export class UpdateCoursePageComponent {
  
  private router = inject(Router);
  private courseService = inject(CourseService);
  private courseFormState = inject(CourseFormState);
  private userState = inject(UserState);
  
  constructor ( private activatedRoute : ActivatedRoute ) {  }

  ngOnInit( ) {
    // Arreglar debido a que si se vuelve atras se pierde el estado
    this.activatedRoute.data.subscribe(({ resolvedCourse }) => {
      if( resolvedCourse ) this.courseFormState.patchValuesForm( this.userState.courseSelected()! );
    });
  }

  public onUpdateCourse = ( ) : void => {

    const updateCourseDTO = CourseMapper.mapToCourseDto( this.courseFormState.courseForm , this.courseFormState.limitedCapacity() );

    updateCourseDTO.id = this.userState.courseSelected()?.id!;

    if( !this.courseFormState.thumbnailFile() ){
      updateCourseDTO.id_file = this.userState.courseSelected()?.id_file!;
      updateCourseDTO.thumbnail_url = this.userState.courseSelected()?.thumbnail_url!;
    }
    
    this.courseService.saveCourse( updateCourseDTO , this.courseFormState.thumbnailFile() )
                        .subscribe(
                          ( course ) => {
                            this.courseFormState.reset( );
                            this.router.navigate([`/courses/${ course.id }`]);
                          },
                        );
  }


}
