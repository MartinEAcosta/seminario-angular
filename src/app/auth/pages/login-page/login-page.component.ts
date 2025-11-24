import { Component } from '@angular/core';
import { FormLoginComponent } from "../../components/form-login/form-login.component";
import { ModalErrorMessageComponent } from "@shared/components/modal-error-message/modal-error-message.component";

@Component({
  selector: 'app-login-page',
  imports: [FormLoginComponent, ModalErrorMessageComponent],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.scss'
})
export class LoginPageComponent {

}
