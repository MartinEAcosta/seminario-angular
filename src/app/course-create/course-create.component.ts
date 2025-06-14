import { Component, computed, inject, signal } from '@angular/core';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../services/auth/auth.service';
import { Router } from '@angular/router';
import { CourseService } from '../services/course/course.service';
import { HeaderComponent } from '../shared/components/header/header.component';
import { NgClass } from '@angular/common';
import { FooterComponent } from '../shared/components/footer/footer.component';
import { rxResource } from '@angular/core/rxjs-interop';

@Component({
    selector: 'app-course-create',
    templateUrl: './course-create.component.html',
    styleUrl: './course-create.component.scss',
    imports: [HeaderComponent, ReactiveFormsModule, NgClass, FooterComponent]
})
export class CourseCreateComponent {

  
  router = inject(Router);
  _isCreatingMode = signal<boolean | null>(null);


  constructor () {

    if(this.router.url.includes('create')){
      this._isCreatingMode.set(true);
      return;
    }
    this._isCreatingMode.set(false);
    console.log(this._isCreatingMode())
  }

  courseService = inject(CourseService);
  authService = inject(AuthService);

  mediaFileList : FileList | undefined =  undefined;
  tempMedia = signal<string[]>([]); 

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

  onFileChanged = ( event : Event ) => {
    const fileList = ( event.target as HTMLInputElement ).files;
    this.mediaFileList = fileList ?? undefined;

    // En caso de que el el fileList no sea undefined o vacio, permite generar url para utilizar de forma local
    const imageUrls = Array.from( fileList ?? [ ] ).map( 
      (file) => URL.createObjectURL(file)
    );
    this.tempMedia.set(imageUrls);
    console.log(this.tempMedia());
  }




}
