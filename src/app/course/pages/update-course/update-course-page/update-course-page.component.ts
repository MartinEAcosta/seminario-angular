import { Course } from 'src/app/course/models/course.interfaces';
import { Component, inject, input, signal } from '@angular/core';
import { FormCourseComponent } from "src/app/course/components/form-course/form-course.component";
import { CourseService } from 'src/app/course/services/course.service';
import { CourseMapper } from '@mappers/course.mapper';
import { FileService } from 'src/app/shared/services/file/file.service';

@Component({
  selector: 'app-update-course-page',
  imports: [FormCourseComponent],
  templateUrl: './update-course-page.component.html',
  styleUrl: './update-course-page.component.scss'
})


export class UpdateCoursePageComponent {
  folder = 'courses';
  
  public courseService = inject(CourseService);
  public fileService = inject(FileService);
  
  public course = input.required<Course>();
  public courseForm = this.courseService.createForm();
  
  constructor ( ) {
    this.courseForm = this.courseService.patchValuesForm( this.course() , this.courseForm );
  }


  public onUpdateCourse = ( ) : void => {

    const updateCourseDTO = CourseMapper.mapToCourseDto( this.courseForm );
    
    // Si el curso seleccionado no le corresponde al usuario registrado no permite el update.
    // if( this.course()?.id_owner === uid ){
      
    updateCourseDTO.id = this.course()?.id!;
    
    if( this.fileService.thumbnailFile() != null ){
      this.fileService
            .updateFile( this.folder , this.fileService.thumbnailFile()! , updateCourseDTO.id )
              .subscribe( fileResponse => {
                updateCourseDTO.thumbnail_url = fileResponse.url!;
                updateCourseDTO.file_id = fileResponse.id;
              });
    }

    this.courseService.updateCourse( updateCourseDTO ).subscribe();
  }

}
