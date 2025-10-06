import { ActivatedRoute, Router } from '@angular/router';
import { Component, inject } from '@angular/core';

import { CourseService } from 'src/app/course/services/course.service';
import { FileService } from 'src/app/shared/services/file/file.service';
import { CourseMapper } from '@mappers/course.mapper';
import { FormCourseComponent } from "src/app/course/components/form-course/form-course.component";
import { LoaderComponent } from "src/app/shared/components/loader/loader.component";  
import { CourseFormState } from '../../state/course/course-form-state';

@Component({
  selector: 'app-update-course-page',
  imports: [FormCourseComponent],
  templateUrl: './update-course-page.html',
  styleUrl: './update-course-page.scss'
})


export class UpdateCoursePageComponent {
  folder = 'courses';
  
  public router = inject(Router);
  public courseService = inject(CourseService);
  public fileService = inject(FileService);
  private courseFormState = inject(CourseFormState);
  
  constructor ( private activatedRoute : ActivatedRoute ) {  }

  ngOnInit( ) {
    this.activatedRoute.data.subscribe(({ resolvedCourse }) => {
      if( resolvedCourse ) this.courseFormState.patchValuesForm( this.courseFormState.course()! );
    });
  }

  public onUpdateCourse = ( ) : void => {

    const updateCourseDTO = CourseMapper.mapToCourseDto( this.courseFormState.courseForm );
    
    // Si el curso seleccionado no le corresponde al usuario registrado no permite el update.
    // if( this.course()?.id_owner === uid ){
      
    updateCourseDTO.id = this.courseFormState.course()?.id!;
    
    this.courseService.updateCourse( updateCourseDTO , this.courseFormState.thumbnailFile() ).subscribe();

    // this.courseFormState.reset();    
  }

}
