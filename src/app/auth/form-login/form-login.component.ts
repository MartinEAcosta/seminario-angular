import { Component, EventEmitter, inject, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-form-login',
  standalone: false,
  templateUrl: './form-login.component.html',
  styleUrls: [ '../form-global.scss' ,'./form-login.component.scss' ]
})
export class FormLoginComponent {

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

  private authService = inject(AuthService);

  onSumbit = () => {
    if( this.loginForm.valid ){
      const { email , password } = this.loginForm.value;
      this.authService.loginUser( email! , password! )
                        .subscribe( (isAuthenticated) => {
                          if(isAuthenticated)
                            console.log("autenticado")
                        });
    }
  }

  onClick = ( ) : void => {
    this.onChangeMode.emit();
  }

}
