import { Component } from '@angular/core';
import { FormLoginComponent } from "../../components/form-login/form-login.component";

@Component({
  selector: 'app-login-page',
  imports: [FormLoginComponent],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.scss'
})
export class LoginPageComponent {

}
