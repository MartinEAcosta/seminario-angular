import { Component, EventEmitter, inject, Output } from '@angular/core';
import { FormControl, FormGroup, Validators, ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-form-register',
    templateUrl: './form-register.component.html',
    styleUrls: ['../../form-global.scss', './form-register.component.scss'],
    imports: [ReactiveFormsModule]
})
export class FormRegisterComponent {

  @Output()
  onChangeMode = new EventEmitter<void>();
  
  router = inject(Router);
  authService = inject(AuthService);
  
  fb = inject(FormBuilder);


  registerForm = new FormGroup({
    username : new FormControl('', 
                              [Validators.required, Validators.minLength(3)] 
    ),
    email : new FormControl('',
                              [Validators.required, Validators.email]
    ),
    password : new FormControl('',
                                [Validators.required, Validators.minLength(6)]
    ),
  })

  onSumbit = () : void => {
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
