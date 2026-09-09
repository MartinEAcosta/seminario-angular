import { Component, computed, effect, inject, input, output } from '@angular/core';
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
  existingModules = input<ModulePopulated[]>([]);

  saved = output<Module>();
  cancelled = output<void>();

  moduleForm = this.fb.nonNullable.group({
    title : [ '' , [ Validators.required,  Validators.minLength(6) ] ],
  });

  // Nro de módulo calculado: max(unit existentes) + 1 al crear, fijo al editar.
  nextUnit = computed( () => {
    const modules = this.existingModules();
    return modules.length ? Math.max( ...modules.map( m => m.unit ) ) + 1 : 1;
  });

  displayUnit = computed( () => this.moduleToEdit()?.unit ?? this.nextUnit() );

  constructor() {
    effect( () => {
      const moduleToEdit = this.moduleToEdit();
      if( moduleToEdit ){
        this.moduleForm.patchValue({
          title: moduleToEdit.title,
        });
      }
    });
  }

  onSaveModule = () => {
    this.moduleForm.markAllAsTouched();
    if( this.moduleForm.valid ){

      const formValues = {
        ...this.moduleForm.value,
        unit: this.displayUnit(),
        id_course: this.idCourse(),
        id: this.moduleToEdit()?.id,
      }

      const moduleDto = ModuleMapper.mapToModuleDto( formValues );
      this.moduleService.saveModule( moduleDto )
                          .subscribe(
                            (module) => {
                              this.saved.emit(module);
                              this.moduleForm.reset({ title: '' });
                            }
                          );

    }
  }

  onCancel = () => {
    this.cancelled.emit();
  }

}
