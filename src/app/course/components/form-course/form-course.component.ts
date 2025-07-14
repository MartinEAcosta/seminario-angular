import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { Router } from '@angular/router';
import { NgClass } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import type { Course, CourseDTO } from '../../interfaces/course.interfaces';
import { AuthService } from '../../../auth/services/auth.service';
import { CourseService } from '../../services/course.service';
import { FormErrorLabelComponent } from "../../../shared/components/form-error-label/form-error-label.component";
import { tap } from 'rxjs';


type Mode = 'creating' | 'updating' | 'loading';

@Component({
  selector: 'app-form-course',
  templateUrl: './form-course.component.html',
  styleUrl: './form-course.component.scss',
  imports: [ReactiveFormsModule, NgClass, FormErrorLabelComponent],
})
export class FormCourseComponent {

  course = input<Course | undefined >();
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
    price : [ 0 , [ Validators.required , Validators.min(0) ] ],
    wantLimitedCapacity: [ true ],
    capacity : [ { value : 5 , disabled: false } , [ Validators.min(5) ] ], 
  });

  ngOnInit () {
    const limitedCapacitySignal = computed( () => this.courseForm.get('wantLimitedCapacity')!.value);
    if( !this.course() ){
      return this.handleCreatingMode();
    }
    return this.handleUpdatingMode();
  }

  handleCreatingMode = () => {
    return this.router.navigateByUrl('/course/create');
  }
  
  onFormChanged = effect ( (onCleanup) => {
    const limitedCapacitySubscription = this.onWantLimitedCapacityChanged();
    
    // Es necesario una función de limpieza debido a que sino queda la referencia por algun lado
    onCleanup ( ( ) => {
      limitedCapacitySubscription?.unsubscribe();
    })
  });

  onWantLimitedCapacityChanged = ( ) => {
    return this.courseForm.get('wantLimitedCapacity')!.valueChanges
                                                    .pipe(
                                                      tap(( limited ) => {
                                                        if( !limited ){
                                                          this.courseForm.get('capacity')?.setValue(undefined);
                                                          this.courseForm.get('capacity')?.disable();
                                                          return;
                                                        }
                                                        this.courseForm.get('capacity')?.enable();
                                                        return;
                                                      }),
                                                    ).subscribe();
  }


  handleUpdatingMode = () => {
    if( this.course( )  ){
      this.router.navigate(['/course/update', this.course()?.id!]);
      this.courseForm.reset({
        title: this.course()?.title,
        description: this.course()?.description,
        imgURL: this.course()?.imgURL,
        price: this.course()?.price,
        capacity: this.course()?.capacity
      });
    }
  }

  onSumbit = ( ) : void => {
    
    this.courseForm.markAllAsTouched();
    const uid = this.authService.id();

    if( this.course() === undefined && this.courseForm.valid ){

      const createCourseDTO : CourseDTO = this.courseForm.value;

      if( uid ){
        createCourseDTO.owner = uid;
        console.log(createCourseDTO);
        this.courseService.createCourse( createCourseDTO );
      }
    }
    else{

      const updateCourseDTO : CourseDTO = this.courseForm.value;
      
      if( this.course()?.owner === uid ){

        // Debido a que son solo los valores del formulario debo añadir el id que lo contiene 
        // la señal pasada por componente padre.
        updateCourseDTO._id = this.course()?.id!;
        
        this.courseService.updateCourse( updateCourseDTO );
      } 
    }
  }    

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

  // onFileChanged = ( event : Event ) => {
  //   const fileList = ( event.target as HTMLInputElement ).files;
  //   this.mediaFileList = fileList ?? undefined;

  //   // En caso de que el el fileList no sea undefined o vacio, permite generar url para utilizar de forma local
  //   const imageUrls = Array.from( fileList ?? [ ] ).map( 
  //     (file) => URL.createObjectURL(file)
  //   );
  //   console.log(this.mediaFileList);
  //   this.tempMedia.set(imageUrls);
  // }

}
