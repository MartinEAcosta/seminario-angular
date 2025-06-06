import { Component, inject } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-form-login',
  standalone: false,
  templateUrl: './form-login.component.html',
  styleUrls: [ '../form-global.scss' ,'./form-login.component.scss' ]
})
export class FormLoginComponent {

  loginForm = new FormGroup({
    email : new FormControl(''),
    password : new FormControl(''),
  });

  private authService : AuthService = inject(AuthService);

  onSumbit = () => {
    this.authService
  }

}
