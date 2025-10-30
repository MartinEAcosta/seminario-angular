import { Component, effect, Input, Output, EventEmitter, inject } from '@angular/core';
import { Router } from '@angular/router';
import { NgClass } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { Subscription, tap } from 'rxjs';

import { AuthService } from 'src/app/auth/services/auth.service';
import { FileService } from 'src/app/shared/services/file/file.service';
import { CourseService } from '../../services/course.service';
import { FormErrorLabelComponent } from "../../../shared/components/form-error-label/form-error-label.component";
import { CategorySelectComponent } from "src/app/category/components/category-select/category-select.component";
import { ThumbnailSelectorComponent } from "../thumbnail-selector/thumbnail-selector.component";
import { CourseFormState } from '../../state/course/course-form-state';
import { SliderContentManagerComponent } from 'src/app/lesson/components/slider-content-manager/slider-content-manager.component';
import { BtnRemoveComponent } from "src/app/shared/components/btn-remove/btn-remove.component";
import { UserState } from 'src/app/auth/state/user-state';

@Component({
  selector: 'app-form-course',
  templateUrl: './form-course.component.html',
  styleUrl: './form-course.component.scss',
  imports: [ReactiveFormsModule, NgClass, FormErrorLabelComponent,
    CategorySelectComponent, ThumbnailSelectorComponent, SliderContentManagerComponent, BtnRemoveComponent],
})
export class FormCourseComponent {

  private router = inject(Router);
  private authService = inject(AuthService);
  private courseService = inject(CourseService);
  public fileService = inject(FileService);

  @Output() 
  public submitForm = new EventEmitter<void>();
  
  public courseFormState = inject(CourseFormState);
  public userState = inject(UserState);

  constructor ( ) {
    effect( () => {
      if( this.userState.courseSelected() != undefined && this.userState.courseSelected()?.thumbnail_url ){
        this.courseFormState.setTempThumbnail( this.userState.courseSelected()!.thumbnail_url! );
      }
    });
  }

  ngOnDestroy() {
    this.courseFormState.reset();
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
    return this.courseFormState.courseForm.get('wantLimitedCapacity')!.valueChanges
                                                    .pipe(
                                                      tap(( limited ) => {
                                                        if( !limited ){
                                                          this.courseFormState.courseForm.get('capacity')?.setValue(undefined);
                                                          this.courseFormState.courseForm.get('capacity')?.disable();
                                                          return;
                                                        }
                                                        this.courseFormState.courseForm.get('capacity')?.enable();
                                                        return;
                                                      }),
                                                    ).subscribe();
  }


  onSubmit = ( ) : void => {

    this.courseFormState.courseForm.markAllAsTouched();
    if( this.courseFormState.courseForm.valid ){
      
      const uid = this.authService.id();
      if( !uid ) return;
      
      this.submitForm.emit();

    }
  }

  onDeleteCourse = ( id : string )  => {
    if( this.userState.courseSelected()?.id_owner === this.authService.id() ){
      if( this.userState.courseSelected()?.id_file ){
        this.fileService.deleteCourseThumbnail( this.userState.courseSelected()?.id! ).subscribe()
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
