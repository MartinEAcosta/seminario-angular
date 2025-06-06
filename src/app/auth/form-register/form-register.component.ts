import { Component, inject } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-form-register',
  standalone: false,
  templateUrl: './form-register.component.html',
  styleUrls: [ '../form-global.scss' , './form-register.component.scss' ]
})
export class FormRegisterComponent {

  registerForm = new FormGroup({
    username : new FormControl(''),
    email : new FormControl(''),
    password : new FormControl(''),
  })

  private authService = inject(AuthService);

  onSumbit = () : void => {

    
  }
}
