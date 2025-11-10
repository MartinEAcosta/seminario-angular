import { Component, Output, EventEmitter, inject, input } from '@angular/core';
import { NgClass } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { AuthService } from 'src/app/auth/services/auth.service';
import { FileService } from 'src/app/shared/services/file/file.service';
import { FormErrorLabelComponent } from "../../../shared/components/form-error-label/form-error-label.component";
import { CategorySelectComponent } from "src/app/category/components/category-select/category-select.component";
import { ThumbnailSelectorComponent } from "../thumbnail-selector/thumbnail-selector.component";
import { CourseFormState } from '../../state/course/course-form-state';
import { SliderContentManagerComponent } from 'src/app/lesson/components/slider-content-manager/slider-content-manager.component';
import { BtnRemoveComponent } from "src/app/shared/components/btn-remove/btn-remove.component";
import { Course } from '@course/models/course.interfaces';

@Component({
  selector: 'app-form-course',
  templateUrl: './form-course.component.html',
  styleUrl: './form-course.component.scss',
  imports: [
            ReactiveFormsModule, NgClass, FormErrorLabelComponent,
            CategorySelectComponent, ThumbnailSelectorComponent, 
            SliderContentManagerComponent, BtnRemoveComponent
          ],
})
export class FormCourseComponent {

  private authService = inject(AuthService);

  public fileService = inject(FileService);
  public courseFormState = inject(CourseFormState);

  course = input.required<Course | null>();

  @Output() 
  public submitForm = new EventEmitter<Course | null>();
  @Output()
  public removeCourse = new EventEmitter();

  constructor ( ) { }

  ngOnInit(): void {
    const course = this.course();
    if (course) {
      this.courseFormState.patchValuesForm(course);
    }
    else{
      this.courseFormState.reset();
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
      
      this.submitForm.emit( this.course() );
    }
  }

  onRemoveCourse = ( course : Course ) : void  => {
    if( course?.id_owner === this.authService.id() ){
      this.removeCourse.emit( course );
    }
  }

}
