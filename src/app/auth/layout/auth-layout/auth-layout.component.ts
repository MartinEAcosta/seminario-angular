import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ModalErrorMessageComponent } from "src/app/shared/components/modal-error-message/modal-error-message.component";

@Component({
  selector: 'app-auth-layout',
  imports: [RouterOutlet, ModalErrorMessageComponent],
  templateUrl: './auth-layout.component.html',
  styleUrl: './auth-layout.component.scss'
})
export class AuthLayoutComponent {

}
