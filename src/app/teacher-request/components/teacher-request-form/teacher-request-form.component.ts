import { Component, EventEmitter, inject, Output } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { rxResource } from '@angular/core/rxjs-interop';
import { NgClass } from '@angular/common';

import { CategoryService } from '@category/services/category.service';
import { Category } from '@category/models/category.interfaces';
import { FormErrorLabelComponent } from '@shared/components/form-error-label/form-error-label.component';
import { FormUtils } from '@utils/form-utils';
import { TeacherRequestDTO } from '@teacher-request/models/teacher-request.interfaces';

@Component({
    selector: 'app-teacher-request-form',
    templateUrl: './teacher-request-form.component.html',
    styleUrl: './teacher-request-form.component.scss',
    imports: [ReactiveFormsModule, NgClass, FormErrorLabelComponent]
})
export class TeacherRequestFormComponent {

  private fb = inject(FormBuilder);
  private categoryService = inject(CategoryService);

  @Output()
  public submitRequest = new EventEmitter<TeacherRequestDTO>();

  // Temas/categorías disponibles para que el usuario elija en qué le gustaría dictar cursos.
  public categoriesResource = rxResource({
    stream: () => this.categoryService.getAllCategories()
  });

  public teacherRequestForm : FormGroup = this.fb.group({
    categoryIds : this.fb.array( [] , [ Validators.required , Validators.minLength(1) ] ),
    experience : [
                  '',
                  [ Validators.required, Validators.minLength(50) ]
                ],
    motivation : [
                  '',
                  [ Validators.required, Validators.minLength(30) ]
                ],
    courseIdea : [
                  '',
                  [ Validators.required, Validators.minLength(20) ]
                ],
    portfolioUrl : [
                  '',
                  [ Validators.pattern( FormUtils.urlPattern ) ]
                ],
    agreesToGuidelines : [ false, [ Validators.requiredTrue ] ],
  });

  get categoryIdsControl () : FormArray {
    return this.teacherRequestForm.get('categoryIds') as FormArray;
  }

  isCategorySelected = ( category : Category ) : boolean => {
    return this.categoryIdsControl.value.includes( category.id );
  }

  onToggleCategory = ( category : Category , checked : boolean ) : void => {
    if( checked ){
      this.categoryIdsControl.push( new FormControl( category.id ) );
    }
    else{
      const index = this.categoryIdsControl.value.indexOf( category.id );
      if( index >= 0 ) this.categoryIdsControl.removeAt( index );
    }
    this.categoryIdsControl.markAsTouched();
  }

  onSubmit = ( ) : void => {
    this.teacherRequestForm.markAllAsTouched();
    if( this.teacherRequestForm.valid ){
      const { portfolioUrl , ...rest } = this.teacherRequestForm.value;
      const teacherRequestDTO : TeacherRequestDTO = {
        ...rest,
        // Se omite si quedó vacío para no mandar un string vacío al backend.
        ...( portfolioUrl ? { portfolioUrl } : {} ),
      };
      this.submitRequest.emit( teacherRequestDTO );
    }
  }

}
