import { Component, effect, Input, Output, EventEmitter, inject, input } from '@angular/core';
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
import { Course } from '@course/models/course.interfaces';

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
  public courseFormState = inject(CourseFormState);

  course = input.required<Course | null>();

  @Output() 
  public submitForm = new EventEmitter<void>();
  
  constructor ( ) { }

  ngOnInit(): void {
    this.courseFormState.createForm();
    const course = this.course();
    console.log(course);
    if (course) {
      this.courseFormState.patchValuesForm(course);
    }
  }

  ngOnDestroy() {
    this.courseFormState.reset();
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
    if( this.courseFormState.selectedCourse()?.id_owner === this.authService.id() ){
      if( this.courseFormState.selectedCourse()?.id_file ){
        this.fileService.deleteCourseThumbnail( this.courseFormState.selectedCourse()?.id! ).subscribe()
      }
      this.courseService.deleteCourse( id )
                            .subscribe( (isCourseDeleted) => {
                                if( isCourseDeleted ) {
                                  this.courseFormState.reset();
                                  this.router.navigateByUrl('/');
                                  return;
                                }     
                            } );
    }
  }

}
