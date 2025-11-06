import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { NgClass } from '@angular/common';
import { Validators, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';

import { FormUtils } from '@utils/form-utils';
import { AuthService } from '@auth/services/auth.service';
import { FormErrorLabelComponent } from "../../../shared/components/form-error-label/form-error-label.component";

@Component({
    selector: 'app-form-register',
    templateUrl: './form-register.component.html',
    styleUrls: ['../../form-global.scss', './form-register.component.scss'],
    imports: [ReactiveFormsModule, FormErrorLabelComponent , NgClass , RouterLink ]
})
export class FormRegisterComponent {

  private router = inject(Router);
  private authService = inject(AuthService);
  public isLoading = computed( () => this.authService.authStatus() );

  private fb = inject(FormBuilder);

  public registerForm : FormGroup = this.fb.group({
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

  constructor( ) { }

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
                        } );
    };
  }
    
}
