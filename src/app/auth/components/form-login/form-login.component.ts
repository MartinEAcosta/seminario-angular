import { Router, RouterLink } from '@angular/router';
import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { NgClass } from '@angular/common';

import { AuthService } from '@auth/services/auth.service';
import { FormErrorLabelComponent } from '@shared/components/form-error-label/form-error-label.component';
import { FormUtils } from '@utils/form-utils';
import { GoogleAuthButtonComponent } from '@auth/components/google-auth-button/google-auth-button.component';
import { AuthMapper } from '@mappers/auth.mapper';
import { getAuthErrorMessage, INVALID_CREDENTIALS_MESSAGE, isServerError } from '@auth/utils/auth-error-message';

@Component({
    selector: 'app-form-login',
    templateUrl: './form-login.component.html',
    styleUrls: ['../../form-global.scss', './form-login.component.scss'],
    imports: [ReactiveFormsModule, FormErrorLabelComponent, NgClass , RouterLink, GoogleAuthButtonComponent]
})
export class FormLoginComponent {
  
  private router = inject(Router);
  private authService = inject(AuthService);

  private fb = inject(FormBuilder);
    
  public showPassword = signal(false);

  // Error del formulario entero (credenciales, conexión, validación del backend).
  // Se muestra en una banda inline arriba del submit en vez de un toast: el error
  // pertenece al formulario que el usuario está mirando (ver SPEC 16).
  public formError = signal<string | null>(null);
  public isSubmitting = signal<boolean>(false);

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
  
  constructor( ) {
    // Cualquier edición limpia la banda, para no dejar un mensaje viejo
    // contradiciendo lo que el usuario está escribiendo.
    this.loginForm.valueChanges
                    .pipe( takeUntilDestroyed() )
                    .subscribe( () => this.formError.set(null) );
  }

  toggleShowPassword = () => {
    this.showPassword.update((shown) => !shown);
  }

  onLogin = () => {
    this.loginForm.markAllAsTouched();
    if( !this.loginForm.valid || this.isSubmitting() ) return;

    this.isSubmitting.set(true);
    const loginUserDTO = AuthMapper.mapFormToUserDTO( this.loginForm );
    this.authService.loginUser( loginUserDTO )
                      .subscribe({
                        next  : () => {
                          this.isSubmitting.set(false);
                          this.router.navigateByUrl('');
                        },
                        error : ( error : HttpErrorResponse ) => {
                          this.isSubmitting.set(false);
                          // Un 5xx no se arregla desde el formulario.
                          if( isServerError( error ) ){
                            this.router.navigateByUrl('/error');
                            return;
                          }
                          this.formError.set( getAuthErrorMessage( error , INVALID_CREDENTIALS_MESSAGE ) );
                        },
                      });
  }

}
