import { Component, EventEmitter, inject, Output } from '@angular/core';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth/auth.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-form-login',
    templateUrl: './form-login.component.html',
    styleUrls: ['../form-global.scss', './form-login.component.scss'],
    imports: [ReactiveFormsModule]
})
export class FormLoginComponent {
  
  router = inject(Router);
  authService = inject(AuthService);

  @Output()
  onChangeMode = new EventEmitter<void>()
  
  loginForm = new FormGroup({
    email : new FormControl('',
                              [Validators.required, Validators.email]
    ),
    password : new FormControl('',
                                [Validators.required, Validators.minLength(6)]
    ),
  });


  onSumbit = () => {
    if( this.loginForm.valid ){
      const { email , password } = this.loginForm.value;
      this.authService.loginUser( email! , password! )
                        .subscribe( (isAuthenticated) => {
                          if(isAuthenticated){
                            this.router.navigateByUrl('');
                            return
                          }

                          
                        });
    }
  }

  onClick = ( ) : void => {
    this.onChangeMode.emit();
  }

}
