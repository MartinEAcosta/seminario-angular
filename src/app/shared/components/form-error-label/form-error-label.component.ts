import { Component, input,  } from '@angular/core';
import { FormUtils } from '../../../utils/form-utils';
import { AbstractControl, ValidationErrors } from '@angular/forms';

@Component({
  selector: 'app-form-error-label',
  imports: [],
  templateUrl: './form-error-label.component.html',
  styleUrl: './form-error-label.component.scss'
})
export class FormErrorLabelComponent {

  // Es pasado todo el objeto campo del formulario señalado con la información del mismo.
  control = input.required<AbstractControl>();

  // Permite consumir el error desde el html.
  get errorMessage () {
    // En caso de que se encuentren errores los almacena, sino es un objeto vacio
    const errors : ValidationErrors = this.control().errors || {};

    // Si el formulario fue tocado y contiene errores retorna el texto, sino null.
    return this.control().touched && Object.keys(errors).length > 0
                ? FormUtils.getTextError(errors)
                : null
    ;
  
  }

}
