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
  private authService = inject(AuthService);

  courseForm =  new FormGroup({
    title : new FormControl( '' , 
                              [Validators.required , Validators.minLength(5)]
    ),
    description : new FormControl( '' , 
                                    [Validators.required , Validators.minLength(12)]
    ),
    imgURL : new FormControl( '' ),
    price : new FormControl( '' ),
    offer : new FormControl( '' ),
    capacity : new FormControl( '' , [ Validators.min(5) ] ),
  });


  onSumbit = ( ) : void => {
    console.log( this.courseForm.value );
    console.log(this.courseForm.valid)
    if( this.courseForm.valid ){
      const { title , description , imgURL , price = 0  , offer = false , capacity } = this.courseForm.value;
      const user = this.authService?.user();
      const userID = user()?._id;
      if( userID ){
        const numericPrice = price === null || price === undefined ? 0 : Number(price);
        const numericCapacity = capacity == null ? undefined : Number(capacity);
        this.courseService.createCourse( title! , description! , imgURL! , userID , numericPrice , !!offer , numericCapacity!)
                                        .subscribe( (isCourseCreated) => {
                                          if( isCourseCreated ) {
                                            this.router.navigateByUrl('/');
                                            return;
                                          }
                                        });
      }
      
    
    }    
  };




}
