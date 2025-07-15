import { Component, computed, EventEmitter, inject, Output } from '@angular/core';
import { Validators, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { FormErrorLabelComponent } from "../../../shared/components/form-error-label/form-error-label.component";
import { NgClass } from '@angular/common';
import { FormUtils } from '@utils/form-utils';

@Component({
    selector: 'app-form-register',
    templateUrl: './form-register.component.html',
    styleUrls: ['../../form-global.scss', './form-register.component.scss'],
    imports: [ReactiveFormsModule, FormErrorLabelComponent , NgClass , RouterLink ]
})
export class FormRegisterComponent {

  router = inject(Router);
  authService = inject(AuthService);
  isLoading = computed( () => this.authService.authStatus() );

  
  private fb = inject(FormBuilder);

  registerForm : FormGroup = this.fb.group({
    username : [
                '', 
                [Validators.required, Validators.minLength(3) , Validators.pattern( FormUtils.notOnlySpacesPattern ) ] 
              ],
    email : [
              '',
              // Validacion sincrona
              [Validators.required, Validators.pattern( FormUtils.emailPattern ) ],
              // Validaciones asincronas
              // [FormUtils.checkingServerResponse]
            ],
    password : [
                '', 
                [Validators.required, Validators.minLength(6)]
              ],
  });


  onRegister = () : void => {
    this.registerForm.markAllAsTouched();
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
