import { Component, inject, input, output, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../auth/services/auth.service';
import { CourseService } from '../../services/course.service';
import { NgClass } from '@angular/common';
import { Router } from '@angular/router';
import { Course } from '../../interfaces/course.interfaces';
import { FormErrorLabelComponent } from "../../../shared/components/form-error-label/form-error-label.component";


type Mode = 'creating' | 'updating' | 'loading';

@Component({
  selector: 'app-form-course',
  templateUrl: './form-course.component.html',
  styleUrl: './form-course.component.scss',
  imports: [ReactiveFormsModule, NgClass, FormErrorLabelComponent],
})
export class FormCourseComponent {

  course = input<Course>();
  _mode = signal<Mode>('loading');
  tempMedia = signal<string[]>([]); 
  mediaFileList : FileList | undefined =  undefined;
  
  router = inject(Router);
  authService = inject(AuthService);
  courseService = inject(CourseService);

  private fb = inject(FormBuilder);

  courseForm : FormGroup = this.fb.group({
    title : [ '' , [ Validators.required,  Validators.minLength(6) ] ],
    description : [ '' , [ Validators.required,  Validators.minLength(6) ] ],
    imgURL : [ [''] ],
    price : [  , [ Validators.required , Validators.min(0) ] ],
    offer : [ false ],
    capacity : [  , [ Validators.min(5) ] ], 
  });

  ngOnInit () {
    if( !!this.course() ){
      this.courseForm.reset({
        title: this.course()?.title,
        description: this.course()?.description,
        imgURL: this.course()?.imgURL,
        price: this.course()?.price,
        offer: this.course()?.offer,
        capacity: this.course()?.capacity,
      });
      this._mode.set('updating');
    }
    else{
      this.router.navigateByUrl('course/create');
      this._mode.set('creating');
    }
  }

  onFileChanged = ( event : Event ) => {
    const fileList = ( event.target as HTMLInputElement ).files;
    this.mediaFileList = fileList ?? undefined;

    // En caso de que el el fileList no sea undefined o vacio, permite generar url para utilizar de forma local
    const imageUrls = Array.from( fileList ?? [ ] ).map( 
      (file) => URL.createObjectURL(file)
    );
    console.log(this.mediaFileList);
    this.tempMedia.set(imageUrls);
  }

  onSumbit = ( ) : void => {
    
    this.courseForm.markAllAsTouched()

    if( this.courseForm.valid ){
      
      const { title , description , imgURL = [''] , price = 0  , offer = false , capacity } = this.courseForm.value;
      const user = this.authService?.user();
      const userID = user()?._id;
      
      if( userID ){
    
        if( this._mode() === 'updating' ){
          this.courseService.updateCourse( this.course()?._id! , title! , description! , imgURL! , userID , price , !!offer , capacity! )
                              .subscribe( (isCourseCreated) => {
                                if( isCourseCreated ) {
                                  this.router.navigateByUrl('/');
                                  return;
                                }     
                              });
        }
        else{
          this.courseService.createCourse( title! , description! , imgURL! , userID , price , !!offer , capacity!)
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
    if( this.course()?.owner === this.authService.id() ){
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
