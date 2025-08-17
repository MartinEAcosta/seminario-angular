import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { Router } from '@angular/router';
import { NgClass } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { catchError, map, Subscription, tap, forkJoin } from 'rxjs';

import type { Course, CourseDTO } from '../../interfaces/course.interfaces';
import { AuthService } from '../../../auth/services/auth.service';
import { CourseService } from '../../services/course.service';
import { FormErrorLabelComponent } from "../../../shared/components/form-error-label/form-error-label.component";
import { FileService } from 'src/app/shared/services/file/file.service';

const folder = 'courses';

@Component({
  selector: 'app-form-course',
  templateUrl: './form-course.component.html',
  styleUrl: './form-course.component.scss',
  imports: [ReactiveFormsModule, NgClass, FormErrorLabelComponent],
})
export class FormCourseComponent {

  public course = input<Course | undefined >();
  public thumbnailImage = signal<string | undefined>( this.course()?.thumbnail_url );
  
  public tempMedia = signal<string[]>([]); 
  public mediaFileList : FileList | undefined =  undefined;

  private router = inject(Router);
  private authService = inject(AuthService);
  private courseService = inject(CourseService);
  private fileService = inject(FileService);

  private fb = inject(FormBuilder);
  public courseForm : FormGroup = this.fb.group({
    title : [ '' , [ Validators.required,  Validators.minLength(6) ] ],
    description : [ '' , [ Validators.required,  Validators.minLength(6) ] ],
    category : [ '' ],
    thumbnail_url : [ '' ],
    price : [ 0 , [ Validators.required , Validators.min(0) ] ],
    wantLimitedCapacity: [ true ],
    capacity : [ { value : 5 , disabled: false } , [ Validators.min(5) ] ], 
  });
  
  constructor ( ) { }

  ngOnInit () {
    if( this.course() != undefined ){
      this.courseForm.patchValue({
        title: this.course()?.title,
        description: this.course()?.description,
        thumbnail_url: this.course()?.thumbnail_url,
        price: this.course()?.price,
        capacity: this.course()?.capacity
      });
    }
  }

  onFormChanged = effect ( (onCleanup) => {
    const limitedCapacitySubscription = this.onWantLimitedCapacityChanged();
    
    // Es necesario una función de limpieza debido a que sino queda la referencia por algun lado
    onCleanup ( ( ) => {
      limitedCapacitySubscription?.unsubscribe();
    })
  });

  onWantLimitedCapacityChanged = ( ) : Subscription => {
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

  
  onFileChanged = ( event : Event ) => {
    const fileList = ( event.target as HTMLInputElement ).files;
    if( !fileList ) return;

    this.mediaFileList = fileList ?? undefined;
    // En caso de que el el fileList no sea undefined o vacio, permite generar url para utilizar de forma local
    const imageUrls = Array.from( fileList ?? [ ] )
                                                  .map( 
                                                        (file) => URL.createObjectURL(file)
                                                  );
    this.tempMedia.set(imageUrls);
  }

  onSubmit = ( ) : void => {
    
    this.courseForm.markAllAsTouched();
    const uid = this.authService.id();
    if( !uid ) return;

    // En caso de no tener una señal course la cual es inyectada por el componente course-handler-page
    // basada en la obtención de parametros y si es un id valida, en caso de pasar estas verificaciónes
    // se realiza el get y se inyecta, si no se encuentra queda como no definido, lo que siginificaria 
    // que el curso sera uno nuevo.
    const formValues = this.courseForm.getRawValue();
    if( this.course() === undefined && this.courseForm.valid ){

      const createCourseDTO : CourseDTO = {
        title         : formValues.title,
        description   : formValues.description,
        category      : formValues.category,
        // Igualmente el backend lo reemplaza por el usuario que se encuentre logueado.
        owner         : uid,
        thumbnail_url : formValues.thumbnail_url,
        price         : formValues.price ? formValues.price : 0,
        capacity      : formValues.wantLimitedCapacity ? formValues.capacity : undefined,
      }

      if( uid ){
        // console.log(createCourseDTO);
        this.courseService.createCourse( createCourseDTO ).subscribe();

      }
    }
    else{

      const updateCourseDTO : CourseDTO = {
        title         : formValues.title,
        description   : formValues.description,
        category      : formValues.category,
        // Igualmente el backend lo reemplaza por el usuario que se encuentre logueado.
        owner         : uid,
        thumbnail_url : formValues.thumbnail_url,
        price         : formValues.price ? formValues.price : 0,
        capacity      : formValues.wantLimitedCapacity ? formValues.capacity : undefined,
      }
      
      // Si el curso seleccionado no le corresponde al usuario registrado no permite el update.
      if( this.course()?.owner === uid ){
        
        updateCourseDTO._id = this.course()?.id!;

        if( this.mediaFileList != undefined ) {

          this.fileService.uploadImage( folder, this.mediaFileList[0] )
                            .subscribe( fileResponse => {
                              updateCourseDTO.thumbnail_url = fileResponse.public_id;
                              this.courseService.updateCourse( updateCourseDTO ).subscribe( res => console.log(res ) );
                            });
        }
      } 
    }
  }    

  onDeleteCourse = ( id : string )  => {
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
