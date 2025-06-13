import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../services/auth/auth.service';
import { Router } from '@angular/router';
import { CourseService } from '../services/course/course.service';

@Component({
  selector: 'app-course-create',
  standalone: false,
  templateUrl: './course-create.component.html',
  styleUrl: './course-create.component.scss'
})
export class CourseCreateComponent {

  router = inject(Router);

  private courseService = inject(CourseService);

  courseForm =  new FormGroup({
    title : new FormControl( '' , 
                              [Validators.required , Validators.minLength(5)]
    ),
    description : new FormControl( '' , 
                                    [Validators.required , Validators.minLength(12)]
    ),
    price : new FormControl( '' ,
                              [Validators.required , Validators.min(0)] 
    ),
    capacity : new FormControl( '' ),
  });


  onSumbit = ( ) : void => {
    console.log( this.courseForm.value );
    console.log(this.courseForm.valid)
    if( this.courseForm.valid ){
      const { title , description , price , capacity } = this.courseForm.value;
      
    
    }    
  };




}
