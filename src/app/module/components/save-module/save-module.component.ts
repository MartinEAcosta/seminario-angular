import { Component, effect, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ModuleMapper } from '@mappers/module.mapper';
import { Module, ModulePopulated } from '@module/models/module.interfaces';
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

  idCourse = input.required<string>();
  moduleToEdit = input<ModulePopulated | null>(null);

  saved = output<Module>();
  cancelled = output<void>();

  moduleForm = this.fb.nonNullable.group({
    title : [ '' , [ Validators.required,  Validators.minLength(6) ] ],
    unit  : [ 1  , [ Validators.required, Validators.min(1) ] ],
  });

  constructor() {
    effect( () => {
      const moduleToEdit = this.moduleToEdit();
      if( moduleToEdit ){
        this.moduleForm.patchValue({
          title: moduleToEdit.title,
          unit: moduleToEdit.unit,
        });
      }
    });
  }

  onSaveModule = () => {
    this.moduleForm.markAllAsTouched();
    if( this.moduleForm.valid ){

      const formValues = {
        ...this.moduleForm.value,
        id_course: this.idCourse(),
        id: this.moduleToEdit()?.id,
      }

      const moduleDto = ModuleMapper.mapToModuleDto( formValues );
      this.moduleService.saveModule( moduleDto )
                          .subscribe(
                            (module) => {
                              this.saved.emit(module);
                              this.moduleForm.reset({ title: '', unit: 1 });
                            }
                          );

    }
  }

  onCancel = () => {
    this.cancelled.emit();
  }

}
