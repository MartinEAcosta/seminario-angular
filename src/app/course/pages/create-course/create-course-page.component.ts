import { AuthService } from './../../../auth/services/auth.service';
import { Router } from '@angular/router';
import { Component, inject } from '@angular/core';
import { CourseService } from '../../services/course.service';
import { CategoryService } from 'src/app/category/services/category.service';

import { FormCourseComponent } from "../../components/form-course/form-course.component";
import { rxResource } from '@angular/core/rxjs-interop';
import { FormGroup } from '@angular/forms';
import { CourseMapper } from '@mappers/course.mapper';

@Component({
  selector: 'app-create-course-page',
  imports: [FormCourseComponent],
  templateUrl: './create-course-page.component.html',
  styleUrl: './create-course-page.component.scss'
})
export class CreateCoursePageComponent {

  private router = inject(Router);
  private courseService = inject(CourseService);
  private categoryService = inject(CategoryService);
  private authService = inject(AuthService);
  
  public categoriesResource = rxResource({ 
    loader : () => { return this.categoryService.getAllCategories() }
  });

  public courseForm : FormGroup = this.courseService.createForm();

  constructor ( ) { }

  onSubmit = ( ) : void => {
    this.courseForm.markAllAsTouched();

    if( this.courseForm.valid ){
  
      const uid = this.authService.id();
      if( !uid ) return;
        
      const createCourseDto = CourseMapper.mapToCourseDto( this.courseForm );

      this.courseService.createCourse( createCourseDto ).subscribe();
      
    }
  } 
}
