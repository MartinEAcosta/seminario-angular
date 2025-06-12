import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../services/auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-course-create',
  standalone: false,
  templateUrl: './course-create.component.html',
  styleUrl: './course-create.component.scss'
})
export class CourseCreateComponent {

  router = inject(Router);

  private authService = inject(AuthService);

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
    console.log(this.courseForm.valid)
    if( this.courseForm.valid ){

    }    
  };




}
