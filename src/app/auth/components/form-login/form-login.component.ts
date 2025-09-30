import { Router, RouterLink } from '@angular/router';
import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { NgClass } from '@angular/common';
import { AuthService } from './../../services/auth.service';
import { FormErrorLabelComponent } from '../../../shared/components/form-error-label/form-error-label.component';
import { UserDTO } from 'src/app/auth/models/auth.interfaces';
import { FormUtils } from '@utils/form-utils';

@Component({
    selector: 'app-form-login',
    templateUrl: './form-login.component.html',
    styleUrls: ['../../form-global.scss', './form-login.component.scss'],
    imports: [ReactiveFormsModule, FormErrorLabelComponent, NgClass , RouterLink]
})
export class FormLoginComponent {
  
  
  router = inject(Router);
  authService = inject(AuthService);

  fb = inject(FormBuilder);
    
  loginForm : FormGroup = this.fb.group({
    email : [ 
              '' ,[ 
                    Validators.required , Validators.pattern( FormUtils.emailPattern )  
                  ]
            ],
    password : [ 
                '' ,[
                      Validators.required,  Validators.minLength(6) 
                    ]
              ],
  });

  onLogin = () => {
    this.loginForm.markAllAsTouched();
    if( this.loginForm.valid ){
      // * ESTANDARIZAR DTOS
      const loginUserDTO : UserDTO = this.loginForm.value;
      this.authService.loginUser( loginUserDTO )
                        .subscribe( (isAuthenticated) => {
                          if(isAuthenticated){
                            this.router.navigateByUrl('');
                            return;
                          }
                        }
                      );
    }
  }

}
