/*
    Path:PORT/auth
*/
import { Component, Input, signal, WritableSignal } from '@angular/core';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { FormLoginComponent } from '../../components/form-login/form-login.component';
import { FormRegisterComponent } from '../../components/form-register/form-register.component';

@Component({
    selector: 'app-auth',
    templateUrl: './auth-page.html',
    styleUrl: './auth-page.scss',
    imports: [ FormLoginComponent, FormRegisterComponent ]
})
export default class AuthComponent {

  isLoginMode : WritableSignal<boolean> = signal(true);

  onChangeMode = ( ) : void  => {
    this.isLoginMode.update(value => !value);
  }

}
