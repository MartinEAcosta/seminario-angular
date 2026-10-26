import { Component, inject, input, output } from '@angular/core';
import { FormArray, FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { rxResource } from '@angular/core/rxjs-interop';
import { NgClass } from '@angular/common';

import { CategoryService } from '@category/services/category.service';
import { Category } from '@category/models/category.interfaces';
import { FormErrorLabelComponent } from '@shared/components/form-error-label/form-error-label.component';
import { FormUtils } from '@utils/form-utils';
import { TeacherExperienceLevel, TeacherRequestDTO } from '@teacher-request/models/teacher-request.interfaces';
import { CategoryMultiselectDropdownComponent } from '../category-multiselect-dropdown/category-multiselect-dropdown.component';

@Component({
    selector: 'app-teacher-request-form',
    templateUrl: './teacher-request-form.component.html',
    styleUrl: './teacher-request-form.component.scss',
    imports: [ReactiveFormsModule, NgClass, FormErrorLabelComponent, CategoryMultiselectDropdownComponent]
})
export class TeacherRequestFormComponent {

  private fb = inject(FormBuilder);
  private categoryService = inject(CategoryService);

  public submitRequest = output<TeacherRequestDTO>();
  public isSubmitting = input<boolean>( false );

  public categoriesResource = rxResource({
    stream: () => this.categoryService.getAllCategories()
  });

  public experienceLevelOptions : { value : TeacherExperienceLevel; label : string; subtitle : string }[] = [
    { value : 'none', label : 'Ninguna', subtitle : 'Sería mi primera vez' },
    { value : 'informal', label : 'Informal', subtitle : 'Tutorías, charlas' },
    { value : 'teacher', label : 'Profesor', subtitle : 'Enseño formalmente' },
  ];

  public teacherRequestForm = this.fb.group({
    categoryIds : this.fb.nonNullable.array<string>( [] , [ Validators.required , Validators.minLength(1) ] ),
    aboutYou : this.fb.nonNullable.control(
                  '',
                  [ Validators.required, Validators.minLength(50), Validators.maxLength(500) ]
                ),
    experienceLevel : this.fb.control<TeacherExperienceLevel | null>( null, [ Validators.required ] ),
    courseTitle : this.fb.nonNullable.control(
                  '',
                  [ Validators.required, Validators.minLength(5) ]
                ),
    courseSummary : this.fb.nonNullable.control(
                  '',
                  [ Validators.required, Validators.minLength(10) ]
                ),
    portfolioUrl : this.fb.nonNullable.control(
                  '',
                  [ Validators.pattern( FormUtils.urlPattern ) ]
                ),
    agreesToGuidelines : this.fb.nonNullable.control( false, [ Validators.requiredTrue ] ),
  });

  get categoryIdsControl () : FormArray<FormControl<string>> {
    return this.teacherRequestForm.controls.categoryIds;
  }

  get aboutYouLength () : number {
    return this.teacherRequestForm.controls.aboutYou.value.length;
  }

  onToggleCategory = ( category : Category , checked : boolean ) : void => {
    if( checked ){
      this.categoryIdsControl.push( this.fb.nonNullable.control( category.id ) );
    }
    else{
      const index = this.categoryIdsControl.value.indexOf( category.id );
      if( index >= 0 ) this.categoryIdsControl.removeAt( index );
    }
    this.categoryIdsControl.markAsTouched();
  }

  onSubmit = ( ) : void => {
    if( this.isSubmitting() ) return;
    this.teacherRequestForm.markAllAsTouched();
    if( this.teacherRequestForm.valid ){
      const { portfolioUrl , experienceLevel , ...rest } = this.teacherRequestForm.getRawValue();
      const teacherRequestDTO : TeacherRequestDTO = {
        ...rest,
        // La validación de `valid` ya garantiza que experienceLevel no sea null.
        experienceLevel : experienceLevel!,
        // Se omite si quedó vacío para no mandar un string vacío al backend.
        ...( portfolioUrl ? { portfolioUrl } : {} ),
      };
      this.submitRequest.emit( teacherRequestDTO );
    }
  }

}
