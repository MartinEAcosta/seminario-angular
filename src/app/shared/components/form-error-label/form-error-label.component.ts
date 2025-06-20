import { Component, input,  } from '@angular/core';
import { FormUtils } from '../../../utils/form-utils';

@Component({
  selector: 'app-form-error-label',
  imports: [],
  templateUrl: './form-error-label.component.html',
  styleUrl: './form-error-label.component.scss'
})
export class FormErrorLabelComponent {

  message = input.required<string | null>();

  formUtils = FormUtils;


}
