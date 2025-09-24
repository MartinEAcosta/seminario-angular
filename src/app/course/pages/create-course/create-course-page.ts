import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
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

  private router = inject(Router);
  private courseService = inject(CourseService);
  private fileService = inject(FileService);
  private authService = inject(AuthService);
  private courseFormState = inject(CourseFormState);
  
  public courseForm : FormGroup = this.courseFormState.createForm();

  constructor ( ) { }

  onCreateCourse = ( ) : void => {
    this.courseForm.markAllAsTouched();

    if( this.courseForm.valid ){
  
      const uid = this.authService.id();
      if( !uid ) return;
        
      const createCourseDto = CourseMapper.mapToCourseDto( this.courseForm );

      if( this.courseFormState.thumbnailFile() != null ){
        this.fileService.updateFile( this.folder , this.courseFormState.thumbnailFile()! )
                          .subscribe(
                            fileUploadedResponse => {
                              createCourseDto.file_id = fileUploadedResponse.id;
                              createCourseDto.thumbnail_url = fileUploadedResponse.url!
                              this.courseService.createCourse( createCourseDto ).subscribe();
                            }
                          );
      }
      else{
        this.courseService.createCourse( createCourseDto ).subscribe();
      }
      this.courseFormState.reset();
    }
  } 
}
