/*
    Path:PORT/auth
*/
import { Component, Input, signal, WritableSignal } from '@angular/core';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { FormLoginComponent } from '../../auth/components/form-login/form-login.component';
import { FormRegisterComponent } from '../../auth/components/form-register/form-register.component';

@Component({
    selector: 'app-auth',
    templateUrl: './auth-page.html',
    styleUrl: './auth-page.scss',
    imports: [HeaderComponent, FormLoginComponent, FormRegisterComponent, FooterComponent]
})
export class AuthComponent {

  isLoginMode : WritableSignal<boolean> = signal(true);

  onChangeMode = ( ) : void  => {
    this.isLoginMode.update(value => !value);
  }

}
