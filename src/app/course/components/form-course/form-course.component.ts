import { Component, effect, inject, input, signal } from '@angular/core';
import { Router } from '@angular/router';
import { NgClass } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Subscription, tap } from 'rxjs';

import type { Course } from '../../interfaces/course.interfaces';
import { AuthService } from '../../../auth/services/auth.service';
import { CourseService } from '../../services/course.service';
import { FormErrorLabelComponent } from "../../../shared/components/form-error-label/form-error-label.component";
import { FileService } from 'src/app/shared/services/file/file.service';
import { CourseMapper } from '@mappers/course.mapper';

const folder = 'courses';

@Component({
  selector: 'app-form-course',
  templateUrl: './form-course.component.html',
  styleUrl: './form-course.component.scss',
  imports: [ReactiveFormsModule, NgClass, FormErrorLabelComponent],
})
export class FormCourseComponent {

  public course = input<Course | undefined >();
  public tempMedia = signal<string[]>([]); 
  public tempThumbnail = signal<string | undefined>( undefined );
  public thumbnailFile : File | undefined = undefined;
  public mediaFileList : FileList | undefined =  undefined;

  private router = inject(Router);
  private authService = inject(AuthService);
  private courseService = inject(CourseService);
  private fileService = inject(FileService);

  public courseForm : FormGroup = this.courseService.createForm();
  
  constructor ( ) { }

  ngOnInit () {
    if( this.course() != undefined ){
      this.courseService.patchValuesForm( this.course()! , this.courseForm );
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

  
  onThumbnailChanged = ( event : Event ) => {
    const thumbnailChanged = ( event.target as HTMLInputElement ).files;
    if( !thumbnailChanged ) return;

    // En caso de que el el fileList no sea undefined o vacio, permite generar url para utilizar de forma local
    const imageUrl = Array.from( thumbnailChanged ?? [ ] )
                                                  .map( 
                                                        (file) => URL.createObjectURL(file)
                                                  );

    this.tempThumbnail.set( imageUrl.shift() );
    this.thumbnailFile = thumbnailChanged[0];
  }

  onSubmit = ( ) : void => {
    this.courseForm.markAllAsTouched();

    if( this.courseForm.valid ){
  
      const uid = this.authService.id();
      if( !uid ) return;
      
      // En caso de no tener una señal course la cual es inyectada por el componente course-handler-page
      // basada en la obtención de parametros y si es un id valida, en caso de pasar estas verificaciónes
      // se realiza el get y se inyecta, si no se encuentra queda como no definido, lo que siginificaria 
      // que el curso sera uno nuevo.
      if( this.course() === undefined ){
        
        const createCourseDto = CourseMapper.mapToCourseDto( this.courseForm );

        if( uid ){
          // console.log(createCourseDTO);
          this.courseService.createCourse( createCourseDto ).subscribe();
        }
      }
      else {
        const updateCourseDTO = CourseMapper.mapToCourseDto( this.courseForm );
        
        // Si el curso seleccionado no le corresponde al usuario registrado no permite el update.
        if( this.course()?.id_owner === uid ){
          
          updateCourseDTO.id = this.course()?.id!;

          // if( this.mediaFileList != undefined ) {
          //   this.fileService
          //         .uploadImage( folder, this.mediaFileList[0] )
          //           .subscribe( fileResponse => {
          //             updateCourseDTO.thumbnail_url = fileResponse.public_id;
          //             this.courseService.updateCourse( updateCourseDTO ).subscribe( res => console.log( res ) );
          //           });
          // }
          // else 
          if( this.thumbnailFile != undefined ) {
            this.fileService
                  .uploadImage( folder, this.thumbnailFile , updateCourseDTO.id )
                    .subscribe( fileResponse => {
                      updateCourseDTO.thumbnail_url = fileResponse.url ?? null;
                      updateCourseDTO.thumbnail_id = fileResponse.public_id ?? null;
                      
                      console.log(updateCourseDTO)
                      this.courseService.updateCourse( updateCourseDTO ).subscribe( res => console.log( res ) );
                    });
          }
          else{
            this.courseService.updateCourse( updateCourseDTO ).subscribe();
          }
          
        } 
      }
    }
    
  }    

  onDeleteCourse = ( id : string )  => {
    if( this.course()?.id_owner === this.authService.id() ){
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
