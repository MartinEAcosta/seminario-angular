import { Component, inject } from '@angular/core';
import { NgClass } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { AuthService } from '@auth/services/auth.service';
import { FileService } from '@file/services/file.service';
import { UIService } from '@shared/services/ui/ui.service';
import { FormErrorLabelComponent } from '@shared/components/form-error-label/form-error-label.component';
import { BtnRemoveComponent } from '@shared/components/btns/btn-remove/btn-remove.component';
import { CategorySelectComponent } from '@category/components/category-select/category-select.component';
import { ThumbnailSelectorComponent } from '@course/components/thumbnail-selector/thumbnail-selector.component';
import { CourseFormState } from '@course/state/course-form/course-form-state';
import { CourseService } from '@course/services/course.service';
import { Course } from '@course/models/course.interfaces';
import { CourseMapper } from '@mappers/course.mapper';

@Component({
  selector: 'app-course-step-data',
  templateUrl: './course-step-data.component.html',
  styleUrl: './course-step-data.component.scss',
  imports: [
    ReactiveFormsModule, NgClass, FormErrorLabelComponent,
    ThumbnailSelectorComponent, BtnRemoveComponent, CategorySelectComponent,
  ],
})
export class CourseStepDataComponent {

  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private courseService = inject(CourseService);
  private uiService = inject(UIService);

  public fileService = inject(FileService);
  public courseFormState = inject(CourseFormState);

  onSubmit = ( ) : void => {
    this.courseFormState.courseForm.markAllAsTouched();
    if( !this.courseFormState.courseForm.valid ) return;

    const uid = this.authService.id();
    if( !uid ) return;

    const savedCourse = this.courseFormState.savedCourse();

    if( !savedCourse ){
      const createDto = CourseMapper.mapToCourseDto( this.courseFormState.courseForm , true );

      this.courseService.saveCourse( createDto , this.courseFormState.thumbnailFile() )
                          .subscribe(
                            ( created ) => {
                              this.courseFormState.setSavedCourse( created );
                              this.router.navigate( ['../content'] , { relativeTo : this.activatedRoute } );
                            },
                          );
    }
    else{
      const updateDto = CourseMapper.mapToCourseDto( this.courseFormState.courseForm , true );
      updateDto.id = savedCourse.id;

      if( !this.courseFormState.thumbnailFile() ){
        updateDto.id_file = savedCourse.id_file ?? undefined;
        updateDto.thumbnail_url = savedCourse.thumbnail_url ?? undefined;
      }

      this.courseService.saveCourse( updateDto , this.courseFormState.thumbnailFile() )
                          .subscribe(
                            ( updated ) => {
                              this.courseFormState.setSavedCourse( updated );
                              this.uiService.showToastMessage('Cambios guardados.');
                            },
                          );
    }
  }

  onRemoveCourse = ( course : Course ) : void  => {
    if( course.id_owner === this.authService.id() ){
      this.courseService.deleteCourse( course.id )
                            .subscribe( ( isCourseDeleted ) => {
                                if( isCourseDeleted ) {
                                  this.courseFormState.reset();
                                  this.router.navigateByUrl('/');
                                  return;
                                }
                            } );
    }
  }

  onCancel = ( ) : void => {
    if( this.courseFormState.courseForm.dirty ){
      if( !window.confirm('¿Salir sin guardar los cambios?') ) return;
    }
    this.router.navigateByUrl('/');
  }

}
