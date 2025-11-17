import { Component, inject, input } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Course } from '@course/models/course.interfaces';
import { ModuleMapper } from '@mappers/module.mapper';
import { ModuleService } from '@module/services/module.service';

@Component({
  selector: 'app-save-module',
  imports: [ReactiveFormsModule],
  templateUrl: './save-module.component.html',
  styleUrls: ['./save-module.component.scss']
})
export class SaveModuleComponent {

  private fb = inject(FormBuilder);
  public moduleService = inject(ModuleService);

  course = input.required<Course | null >();

  moduleForm = this.fb.nonNullable.group({
    title : [ '' , [ Validators.required,  Validators.minLength(6) ] ],
    unit  : [ 1  , [ Validators.required, Validators.min(1) ] ],
  });

  constructor() { }

  onSaveModule = () => {
    this.moduleForm.markAllAsTouched();
    if( this.moduleForm.valid ){
      
      const id_course = this.course()?.id;
      if( !id_course ) return;
      // Mensaje error se podria lanzar
      
      const formValues = {
        ...this.moduleForm.value,
        id_course,
      }
      console.log( this.moduleForm.value );

      const moduleDto = ModuleMapper.mapToModuleDto( formValues );
      this.moduleService.saveModule( moduleDto )
                          .subscribe(
                            (module) => {
                              console.log(module);
                            }
                          );

    }
  }


}
