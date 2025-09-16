import { UploadedFile } from '../../../shared/models/file.interface';
import { AuthService } from '../../../auth/services/auth.service';
import { Router } from '@angular/router';
import { Component, inject } from '@angular/core';
import { CourseService } from '../../services/course.service';
import { CategoryService } from 'src/app/category/services/category.service';

import { rxResource } from '@angular/core/rxjs-interop';
import { FormGroup } from '@angular/forms';
import { CourseMapper } from '@mappers/course.mapper';
import { FileService } from 'src/app/shared/services/file/file.service';
import { of } from 'rxjs';
import { FormCourseComponent } from "../../components/form-course/form-course.component";

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

  public courseForm : FormGroup = this.courseService.createForm();

  constructor ( ) { }

  // TODO : Manejar imagenes thumbnail.
  onCreateCourse = ( ) : void => {
    this.courseForm.markAllAsTouched();

    if( this.courseForm.valid ){
  
      const uid = this.authService.id();
      if( !uid ) return;
        
      const createCourseDto = CourseMapper.mapToCourseDto( this.courseForm );
      //* Verificar si hay una mejor opción.
      this.courseService.createCourse( createCourseDto )
                          .subscribe(
                            courseResponse => {
                              const res = courseResponse;
                              if( this.fileService.thumbnailFile() != null ){
                                this.fileService.updateFile( this.folder , this.fileService.thumbnailFile()! , courseResponse.id )
                                                  .subscribe(
                                                    fileUploadedResponse => {
                                                      res.file_id = fileUploadedResponse.id;
                                                      res.thumbnail_url = fileUploadedResponse.url!
                                                      this.courseService.updateCourse( res ).subscribe();
                                                    }
                                                  );
                              }
                              return of(res);
                            }
                          );
      
    }
  } 
}
