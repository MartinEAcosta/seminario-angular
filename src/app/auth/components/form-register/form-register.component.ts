import { Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { NgClass } from '@angular/common';
import { Validators, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';

import { FormUtils } from '@utils/form-utils';
import { AuthMapper } from '@mappers/auth.mapper';
import { AuthService } from '@auth/services/auth.service';
import { UserState } from '@user/state/user-state';
import { getAuthErrorMessage, isServerError, REGISTRATION_ERROR_MESSAGE } from '@auth/utils/auth-error-message';
import { FormErrorLabelComponent } from "../../../shared/components/form-error-label/form-error-label.component";
import { GoogleAuthButtonComponent } from '@auth/components/google-auth-button/google-auth-button.component';

@Component({
    selector: 'app-form-register',
    templateUrl: './form-register.component.html',
    styleUrls: ['../../form-global.scss', './form-register.component.scss'],
    imports: [ReactiveFormsModule, FormErrorLabelComponent , NgClass , RouterLink, GoogleAuthButtonComponent]
})
export class FormRegisterComponent {

  private router = inject(Router);
  private authService = inject(AuthService);
  private userState = inject(UserState);
  public isLoading = computed( () => this.userState.authStatus() );

  public passwordValue = signal('');

  // Tres segmentos que reflejan el validador real (minLength 6): vacío,
  // escribiendo y válido. Ningún segmento promete una regla que el form no
  // aplica.
  public passwordStrength = computed( () => {
    const value = this.passwordValue();
    return {
      started: value.length > 0,
      halfway: value.length >= 3,
      valid: value.length >= 6,
    };
  });

  private fb = inject(FormBuilder);

  public showPassword = signal(false);

  // Error del formulario entero (email duplicado, conexión, validación del
  // backend). Banda inline arriba del submit, no toast: el error pertenece al
  // formulario que el usuario está mirando (ver SPEC 16).
  public formError = signal<string | null>(null);
  public isSubmitting = signal<boolean>(false);

  public registerForm : FormGroup = this.fb.group({
    first_name : [
                '',
                [Validators.required, Validators.minLength(2) , Validators.pattern( FormUtils.notOnlySpacesPattern ) ]
              ],
    last_name : [
                '',
                [Validators.required, Validators.minLength(2) , Validators.pattern( FormUtils.notOnlySpacesPattern ) ]
              ],
    email : [
              '',
              [Validators.required, Validators.pattern( FormUtils.emailPattern ) ],
              // Validaciones asincronas
              // [FormUtils.checkingServerResponse]
            ],
    password : [
                '', 
                [Validators.required, Validators.minLength(6)]
              ],
  });

  constructor( ) {
    // Cualquier edición limpia la banda, para no dejar un mensaje viejo
    // contradiciendo lo que el usuario está escribiendo.
    this.registerForm.valueChanges
                      .pipe( takeUntilDestroyed() )
                      .subscribe( () => this.formError.set(null) );
  }

  toggleShowPassword = () => {
    this.showPassword.update((shown) => !shown);
  }

  onRegister = () : void => {
    this.registerForm.markAllAsTouched();
    if( !this.registerForm.valid || this.isSubmitting() ) return;

    this.isSubmitting.set(true);
    const registerUserDTO = AuthMapper.mapFormToUserDTO(this.registerForm);
    this.authService.registerUser( registerUserDTO )
                      .subscribe({
                        next  : () => {
                          this.isSubmitting.set(false);
                          this.router.navigateByUrl('/');
                        },
                        error : ( error : HttpErrorResponse ) => {
                          this.isSubmitting.set(false);
                          // Un 5xx no se arregla desde el formulario.
                          if( isServerError( error ) ){
                            this.router.navigateByUrl('/error');
                            return;
                          }
                          this.formError.set( getAuthErrorMessage( error , REGISTRATION_ERROR_MESSAGE ) );
                        },
                      });
  }

}
