import { Component, EventEmitter, inject, Output } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth/auth.service';
import { Router } from '@angular/router';
import { NgClass } from '@angular/common';
import { FormErrorLabelComponent } from "../../shared/components/form-error-label/form-error-label.component";

@Component({
    selector: 'app-form-login',
    templateUrl: './form-login.component.html',
    styleUrls: ['../form-global.scss', './form-login.component.scss'],
    imports: [ReactiveFormsModule, FormErrorLabelComponent , NgClass]
})
export class FormLoginComponent {
  
  @Output()
  onChangeMode = new EventEmitter<void>()
  
  router = inject(Router);
  authService = inject(AuthService);

  fb = inject(FormBuilder);
    
  loginForm = this.fb.group({
    email : [ '' , [ Validators.required , Validators.email] ],
    password : [ '' , [ Validators.minLength(6) ]],
  });

  constructor () { }
  
  onSumbit = () => {
    if( this.loginForm.valid ){
      const { email , password } = this.loginForm.value;
      this.authService.loginUser( email! , password! )
                        .subscribe( (isAuthenticated) => {
                          if(isAuthenticated){
                            this.router.navigateByUrl('');
                            return
                          }
                        }
                      );
    }
  }

  onClick = ( ) : void => {
    this.onChangeMode.emit();
  }

}
