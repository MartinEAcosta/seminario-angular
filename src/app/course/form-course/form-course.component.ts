import { Component, inject, input, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth/auth.service';
import { CourseService } from '../../services/course/course.service';
import { JsonPipe, NgClass } from '@angular/common';
import { Router } from '@angular/router';
import { Course } from '../../interfaces/course.interfaces';
import { FormUtils } from '../../utils/form-utils';
import { FormErrorLabelComponent } from "../../shared/components/form-error-label/form-error-label.component";


type Mode = 'creating' | 'updating' | 'loading';

@Component({
  selector: 'app-form-course',
  templateUrl: './form-course.component.html',
  styleUrl: './form-course.component.scss',
  imports: [ReactiveFormsModule, NgClass, FormErrorLabelComponent],
})
export class FormCourseComponent {

  _mode = signal<Mode>('loading');
  course = input.required<Course>();
  
  router = inject(Router);

  authService = inject(AuthService);
  courseService = inject(CourseService);

  private fb = inject(FormBuilder);
  formUtils = FormUtils;

  courseForm : FormGroup = this.fb.group({
    title : [ '' , [ Validators.minLength(6) ] ],
    description : [ '' , [ Validators.minLength(6) ] ],
    imgURL : [ [''] ],
    price : [  , [ Validators.min(0) ] ],
    offer : [ false ],
    capacity : [  , [ Validators.min(5) ] ], 
  });

  ngOnInit () {
    if( !!this.course() ){
      this.courseForm.reset({
        title: this.course().title,
        description: this.course().description,
        imgURL: this.course().imgURL,
        price: this.course().price,
        offer: this.course().offer,
        capacity: this.course().capacity,
      });
      this._mode.set('updating');
    }
    else{
      this.router.navigateByUrl('course/create');
      this._mode.set('creating');
    }
  }

  onSumbit = ( ) : void => {
    
    this.courseForm.markAllAsTouched()

    if( this.courseForm.valid ){
      
      const { title , description , imgURL = [''] , price = 0  , offer = false , capacity } = this.courseForm.value;
      const user = this.authService?.user();
      const userID = user()?._id;
      
      if( userID ){
        
        const numericPrice = price === null || price === undefined ? 0 : Number(price);
        const numericCapacity = capacity == null ? undefined : Number(capacity);
        
        if( this._mode() === 'updating' ){
          this.courseService.updateCourse( this.course()._id , title! , description! , imgURL! , userID , numericPrice , !!offer , numericCapacity! )
                              .subscribe( (isCourseCreated) => {
                                if( isCourseCreated ) {
                                  this.router.navigateByUrl('/');
                                  return;
                                }     
                              });
        }
        else{
          this.courseService.createCourse( title! , description! , imgURL! , userID , numericPrice , !!offer , numericCapacity!)
                              .subscribe( (isCourseCreated) => {
                                if( isCourseCreated ) {
                                  this.router.navigateByUrl('/');
                                  return;
                                }     
                              });
        }

      }
    }    
  };

  onDeleteCourse = ( id : string ) => {
    if( this.course().owner === this.authService.id() ){
      this.courseService.deleteCourse( id )
                            .subscribe( (isCourseDeleted) => {
                                if( isCourseDeleted ) {
                                  this.router.navigateByUrl('/');
                                  return;
                                }     
                            } );
    }
  }
  
}
