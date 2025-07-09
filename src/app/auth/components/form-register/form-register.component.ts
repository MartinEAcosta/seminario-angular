import { Component, EventEmitter, inject, Output } from '@angular/core';
import { Validators, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { FormErrorLabelComponent } from "../../../shared/components/form-error-label/form-error-label.component";
import { NgClass } from '@angular/common';

@Component({
    selector: 'app-form-register',
    templateUrl: './form-register.component.html',
    styleUrls: ['../../form-global.scss', './form-register.component.scss'],
    imports: [ReactiveFormsModule, FormErrorLabelComponent, NgClass]
})
export class FormRegisterComponent {

  router = inject(Router);
  authService = inject(AuthService);
  
  private fb = inject(FormBuilder);

  registerForm : FormGroup = this.fb.group({
    username : ['', [Validators.required, Validators.minLength(3)]],
    email : ['', [Validators.required, Validators.email ]],
    password : ['', [Validators.required, Validators.minLength(6)]],
  })


  onRegister = () : void => {
    this.registerForm.markAllAsTouched();
    console.log(this.registerForm.get('username'));
    if( this.registerForm.valid ){
      const registerUserDTO = this.registerForm.value;
      this.authService.registerUser( registerUserDTO )
                        .subscribe( (isAuthenticated) => {
                          if( isAuthenticated ){
                            this.router.navigateByUrl('/');
                            return;
                          }
                        });
    };
  }
    
}
