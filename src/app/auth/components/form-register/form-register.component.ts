import { Component, EventEmitter, inject, Output } from '@angular/core';
import { Validators, ReactiveFormsModule, FormBuilder } from '@angular/forms';
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

  @Output()
  onChangeMode = new EventEmitter<void>();
  
  router = inject(Router);
  authService = inject(AuthService);
  
  private fb = inject(FormBuilder);

  registerForm = this.fb.group({
    username : ['', [Validators.required, Validators.minLength(3)]],
    email : ['', [Validators.required, Validators.email ]],
    password : ['', [Validators.required, Validators.minLength(6)]],
  })

  constructor () {
  }

  onSumbit = () : void => {
    this.registerForm.markAllAsTouched();
    console.log(this.registerForm.get('username'));
    if( this.registerForm.valid ){
      const { username , email  , password } = this.registerForm.value;
      this.authService.registerUser(username!, email!, password!)
                        .subscribe( (isAuthenticated) => {
                          if( isAuthenticated ){
                            this.router.navigateByUrl('/');
                            return;
                          }
                        });
    };
  }
    
  onClick = () : void => {
    this.onChangeMode.emit();
  }

}
