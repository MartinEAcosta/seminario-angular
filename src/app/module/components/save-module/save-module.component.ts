import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ModuleService } from 'module/services/module.service';

@Component({
  selector: 'app-save-module',
  imports: [ReactiveFormsModule],
  templateUrl: './save-module.component.html',
  styleUrls: ['./save-module.component.scss']
})
export class SaveModuleComponent {

  private fb = inject(FormBuilder);
  public moduleService = inject(ModuleService);

  public moduleForm = this.fb.nonNullable.group({
    title : [ '' , [ Validators.required,  Validators.minLength(6) ] ],
    unit  : [ 1  , [ Validators.required, Validators.min(1) ] ],
  });

  constructor() { }

  onSaveModule = () => {
    this.moduleForm.markAllAsTouched();
    console.log('enviado');
  }


}
