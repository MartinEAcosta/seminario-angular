import { Component, effect, input, signal } from '@angular/core';

@Component({
  selector: 'app-modal-error-message',
  imports: [ ],
  templateUrl: './modal-error-message.component.html',
  styleUrl: './modal-error-message.component.scss'
})
export class ModalErrorMessageComponent {

  showError = signal<boolean>(false);
  errorMessage = input.required<string | unknown>();

}
