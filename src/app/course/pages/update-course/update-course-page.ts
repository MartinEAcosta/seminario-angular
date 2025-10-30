import { ActivatedRoute, Router } from '@angular/router';
import { Component, inject } from '@angular/core';

import { CourseService } from 'src/app/course/services/course.service';
import { FileService } from 'src/app/shared/services/file/file.service';
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
    this.activatedRoute.data.subscribe(({ resolvedCourse }) => {
      if( resolvedCourse ) this.courseFormState.patchValuesForm( this.userState.courseSelected()! );
    });
  }

  public onUpdateCourse = ( ) : void => {

    const updateCourseDTO = CourseMapper.mapToCourseDto( this.courseFormState.courseForm );
    
    // Si el curso seleccionado no le corresponde al usuario registrado no permite el update.
    // if( this.course()?.id_owner === uid ){
      
    updateCourseDTO.id = this.userState.courseSelected()?.id!;
    
    this.courseService.updateCourse( updateCourseDTO , this.courseFormState.thumbnailFile() )
                        .subscribe(
                          ( course ) => {
                            this.courseFormState.reset( );
                            this.router.navigate([`/courses/${ course.id }`]);
                          },
                        );
  }


}
