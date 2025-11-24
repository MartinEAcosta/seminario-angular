import { Router, RouterLink } from '@angular/router';
import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { NgClass } from '@angular/common';

import { AuthService } from '@auth/services/auth.service';
import { FormErrorLabelComponent } from '../../../shared/components/form-error-label/form-error-label.component';
import { UserDTO } from '@auth/models/auth.interfaces';
import { FormUtils } from '@utils/form-utils';
import { UIService } from '@shared/services/ui/ui.service';

@Component({
    selector: 'app-form-login',
    templateUrl: './form-login.component.html',
    styleUrls: ['../../form-global.scss', './form-login.component.scss'],
    imports: [ReactiveFormsModule, FormErrorLabelComponent, NgClass , RouterLink]
})
export class FormLoginComponent {
  
  private router = inject(Router);
  private authService = inject(AuthService);
  private uiService = inject(UIService);

  private fb = inject(FormBuilder);
    
  public loginForm : FormGroup = this.fb.group({
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
  
  constructor( ) { }

  onLogin = () => {
    this.loginForm.markAllAsTouched();
    if( this.loginForm.valid ){
      // * ESTANDARIZAR DTOS
      const loginUserDTO : UserDTO = this.loginForm.value;
      this.authService.loginUser( loginUserDTO )
                        .subscribe( (isAuthenticated) => {
                          if(isAuthenticated){
                            this.router.navigateByUrl('');
                          }
                        }
                      );
    }
  }

}
