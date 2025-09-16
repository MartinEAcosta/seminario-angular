import { ActivatedRoute, Router } from '@angular/router';
import { Course } from 'src/app/course/models/course.interfaces';
import { Component, inject } from '@angular/core';

import { CourseService } from 'src/app/course/services/course.service';
import { FileService } from 'src/app/shared/services/file/file.service';
import { CourseMapper } from '@mappers/course.mapper';
import { FormCourseComponent } from "src/app/course/components/form-course/form-course.component";
import { LoaderComponent } from "src/app/shared/components/loader/loader.component";  
import { CourseFormState } from '../../state/course-form-state';

@Component({
  selector: 'app-update-course-page',
  imports: [FormCourseComponent, LoaderComponent],
  templateUrl: './update-course-page.html',
  styleUrl: './update-course-page.scss'
})


export class UpdateCoursePageComponent {
  folder = 'courses';
  
  public router = inject(Router);
  public courseService = inject(CourseService);
  public fileService = inject(FileService);
  private courseFormState = inject(CourseFormState);
  
  public course : Course | undefined;
  public courseForm = this.courseService.createForm();
  
  constructor ( private activatedRoute : ActivatedRoute ) {  }

  ngOnInit( ) {
    this.activatedRoute.data.subscribe(({ resolvedCourse }) => {
      this.course = resolvedCourse;
      this.courseForm = this.courseService.patchValuesForm( this.course! , this.courseForm );
    });
  }


  public onUpdateCourse = ( ) : void => {

    const updateCourseDTO = CourseMapper.mapToCourseDto( this.courseForm );
    
    // Si el curso seleccionado no le corresponde al usuario registrado no permite el update.
    // if( this.course()?.id_owner === uid ){
      
    updateCourseDTO.id = this.course?.id!;
    
    if( this.courseFormState.thumbnailFile() != null ){
      this.fileService
            .updateFile( this.folder , this.courseFormState.thumbnailFile()! )
              .subscribe( fileResponse => {
                updateCourseDTO.thumbnail_url = fileResponse.url!;
                updateCourseDTO.file_id = fileResponse.id;
                this.courseService.updateCourse( updateCourseDTO ).subscribe();
              });
    }
    else{
      this.courseService.updateCourse( updateCourseDTO ).subscribe();
    }

    this.courseFormState.reset();    
  }

}
