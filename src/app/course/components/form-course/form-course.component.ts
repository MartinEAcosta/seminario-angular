import { Component, effect, Input, Output, signal, EventEmitter, Signal, inject } from '@angular/core';
import { NgClass } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Subscription, tap } from 'rxjs';

import type { Course } from '../../models/course.interfaces';
import { FormErrorLabelComponent } from "../../../shared/components/form-error-label/form-error-label.component";
import { AuthService } from 'src/app/auth/services/auth.service';
import { rxResource } from '@angular/core/rxjs-interop';
import { CategoryService } from 'src/app/category/services/category.service';
import { FileService } from 'src/app/shared/services/file/file.service';
import { CourseService } from '../../services/course.service';
import { Router } from '@angular/router';

const folder = 'courses';

@Component({
  selector: 'app-form-course',
  templateUrl: './form-course.component.html',
  styleUrl: './form-course.component.scss',
  imports: [ReactiveFormsModule, NgClass, FormErrorLabelComponent],
})
export class FormCourseComponent {

  @Input()
  public course! : Course | undefined;
  @Input()
  public courseForm! : FormGroup;
  @Output() 
  public submitForm = new EventEmitter<void>();
  
  // public course = input<Course | undefined >();
  @Output()
  public tempMedia = signal<string[]>([]); 
  public tempThumbnail = signal<string | undefined>( undefined );
  // public thumbnailFile : File | undefined = undefined;
  // public mediaFileList : FileList | undefined =  undefined;
  
  private router = inject(Router);
  private authService = inject(AuthService);
  private courseService = inject(CourseService)
  private categoryService = inject(CategoryService);
  private fileService = inject(FileService);
  
  public categoriesResource = rxResource({ 
    loader : () => { return this.categoryService.getAllCategories() }
  });
  
  constructor ( ) { }

  ngOnDestroy() {
    // TODO: PROVISORIO
    this.fileService.thumbnailFile.set(null);
  }

  // TODO: Buscar alternativa, no estoy seguro si es lo mejor trabajar con subscripciones,
  // *buscar alternativa en signals.
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
    this.fileService.thumbnailFile.set( thumbnailChanged[0] );
  }

  onSubmit = ( ) : void => {
    this.courseForm.markAllAsTouched();

    if( this.courseForm.valid ){
  
      const uid = this.authService.id();
      // Imposible asignar un curso con un owner vació
      if( !uid ) return;
      
      this.submitForm.emit();

    }
  }

  onDeleteCourse = ( id : string )  => {
    if( this.course?.id_owner === this.authService.id() ){
      if( this.course?.file_id ){
        this.fileService.deleteCourseThumbnail( this.course?.id! ).subscribe()
      }
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
